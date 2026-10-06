import { PptSlide, PPT_W, PPT_H } from './pptTypes';

// Canvas is 960x540 px. PPTX layout is 10 x 5.625 in (same 16:9) so the
// mapping is a uniform scale — positions/sizes land exactly where the canvas shows them.
const IN_W = 10;
const IN_H = 5.625;
const SX = IN_W / PPT_W;
const SY = IN_H / PPT_H;
const PX_TO_PT = 72 / 96;

function hex(c?: string): string {
  let h = (c || '#111111').trim().replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((ch) => ch + ch).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return '111111';
  return h.toUpperCase();
}

// Theme display fonts rarely exist on viewers' machines — map to the closest
// universally-installed faces so downloaded slides keep their look.
function fontFaceFor(fontFamily?: string): string {
  const f = (fontFamily || '').toLowerCase();
  if (f.includes('anton') || f.includes('archivo black')) return 'Arial Black';
  if (f.includes('oswald') || f.includes('arial narrow')) return 'Arial Narrow';
  if (f.includes('space grotesk') || f.includes('archivo')) return 'Verdana';
  return 'Arial';
}

export async function exportSlidesToPptx(slides: PptSlide[], fileName: string): Promise<string[]> {
  const warnings: string[] = [];
  const mod = await import('pptxgenjs');
  const PptxGen = (mod as any).default || mod;
  const pptx = new PptxGen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Toolip PPT Generator';
  pptx.title = fileName;

  // Pre-embed remote images as base64: PowerPoint cannot reliably fetch pasted
  // URLs (hosts block it), so downloads came out blank while PDFs looked fine.
  const remote = new Map<string, string>();
  const failedHosts = new Set<string>();
  const urls = Array.from(new Set(
    slides.flatMap((s) => s.elements).filter((e) => e.src && /^https?:\/\//i.test(e.src)).map((e) => e.src as string)
  ));
  await Promise.all(urls.map(async (u) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(u, { signal: ctrl.signal, mode: 'cors' });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error('URL is not an image');
      if (blob.size > 8 * 1024 * 1024) throw new Error('image over 8 MB');
      const dataUrl = await new Promise<string>((res2, rej) => {
        const r = new FileReader();
        r.onload = () => res2(String(r.result));
        r.onerror = () => rej(new Error('read failed'));
        r.readAsDataURL(blob);
      });
      remote.set(u, dataUrl);
    } catch {
      try { failedHosts.add(new URL(u).hostname); } catch { failedHosts.add(u); }
    }
  }));
  if (failedHosts.size) {
    warnings.push(`Pictures from: ${Array.from(failedHosts).join(', ')} block downloads, so they are left out of the PPTX (they would export blank). They still show fine in the PDF — or Upload (base64) the image for guaranteed PPTX output.`);
  }

  let skipped = 0;
  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: hex(s.bg) };
    // array order = canvas paint order (later = on top), honoring layer controls
    for (const el of s.elements) {
      const x = +(el.x * SX).toFixed(3);
      const y = +(el.y * SY).toFixed(3);
      const w = +(el.w * SX).toFixed(3);
      const h = +(el.h * SY).toFixed(3);
      try {
        if (el.type === 'shape') {
          // picture fill: rasterize the photo masked to the shape so PPTX matches canvas/PDF
          if (el.src && el.shape !== 'line') {
            const base = remote.get(el.src) || (/^data:/i.test(el.src || '') ? el.src : null);
            if (base) {
              const key = `${base.length}::${base.slice(32, 96)}::${el.shape}::${Math.round(el.w)}x${Math.round(el.h)}`;
              try {
                let png = maskCache.get(key);
                if (!png) {
                  png = await maskedShapePng(base, el.shape || 'rect', el.w, el.h, el.borderRadius || 0);
                  if (maskCache.size > 60) maskCache.clear();
                  maskCache.set(key, png);
                }
                slide.addImage({ path: png, x, y, w, h, sizing: { type: 'cover', w, h }, ...(el.rotation ? { rotate: el.rotation } : {}) } as any);
                continue;
              } catch {
                warnings.push('A shape photo could not be embedded (blocked source) — shape kept its fill color.');
              }
            }
          }
          const transparency = el.opacity !== undefined ? Math.round((1 - el.opacity) * 100) : 0;
          const fill = { color: hex(el.bg), transparency };
          const rot = el.rotation ? { rotate: el.rotation } : {};
          if (el.shape === 'line') {
            slide.addShape('rect' as any, { x, y, w, h: 0.03, fill, line: { color: hex(el.bg) }, ...rot });
          } else if (el.shape === 'circle') {
            slide.addShape('ellipse' as any, { x, y, w, h, fill, ...rot });
          } else if (el.shape === 'triangle') {
            slide.addShape('triangle' as any, { x, y, w, h, fill, ...rot });
          } else if (el.shape === 'pentagon') {
            slide.addShape('pentagon' as any, { x, y, w, h, fill, ...rot });
          } else if (el.shape === 'hexagon') {
            slide.addShape('hexagon' as any, { x, y, w, h, fill, ...rot });
          } else if (el.shape === 'star') {
            slide.addShape('star5' as any, { x, y, w, h, fill, ...rot });
          } else {
            // rect + pill: map px radius to pptx rectRadius (0..0.5 of half min-side)
            const r = Math.min(0.5, Math.max(0, (el.borderRadius || 0) / Math.max(1, Math.min(el.w, el.h) / 2) / 2));
            slide.addShape('roundRect' as any, { x, y, w, h, fill, rectRadius: +r.toFixed(3), ...rot });
          }
        } else if (el.type === 'image' && el.src) {
          // Remote images the host refused to serve are skipped entirely —
          // letting pptxgenjs attempt them aborts the whole download.
          if (/^https?:\/\//i.test(el.src) && !remote.has(el.src)) { skipped++; continue; }
          // cover = canvas object-fit:cover, so framing matches the preview
          const path = remote.get(el.src) || el.src;
          slide.addImage({ path, x, y, w, h, sizing: { type: 'cover', w, h }, ...(el.rotation ? { rotate: el.rotation } : {}) } as any);
        } else if (el.type === 'text') {
          const pt = Math.max(6, Math.round((el.fontSize || 16) * PX_TO_PT * 2) / 2);
          slide.addText(el.text || '', {
            x, y, w, h,
            fontSize: pt,
            bold: !!el.bold,
            italic: !!el.italic,
            color: hex(el.color),
            align: (el.align as any) || 'left',
            fontFace: fontFaceFor(el.fontFamily),
            valign: 'top',
            wrap: true,
            margin: 0,
            lineSpacing: Math.round(pt * 1.25 * 2) / 2, // canvas line-height: 1.25
            ...(el.letterSpacing ? { charSpacing: Math.round(el.letterSpacing * PX_TO_PT * 2) / 2 } : {}),
            ...(el.rotation ? { rotate: el.rotation } : {}),
          });
        }
      } catch (e) {
        console.warn('pptx element skipped', e);
      }
    }
  }
  await pptx.writeFile({ fileName: fileName.endsWith('.pptx') ? fileName : `${fileName}.pptx` });
  if (skipped) warnings.unshift(`${skipped} picture(s) skipped in PPTX (blocked by their hosts — see above). PDF includes everything.`);
  return warnings;
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Rasterize an image masked to a designer-kit shape (circle/triangle/pentagon/
// hexagon/star/rounded-rect) so PPTX — which has no "picture fill" for autoshapes —
// still shows the photo cropped exactly like canvas/PDF do.
function tracePoly(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, n: number, rot: number) {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const px = cx + rx * Math.cos(a);
    const py = cy + ry * Math.sin(a);
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

function traceStar(g: CanvasRenderingContext2D, cx: number, cy: number, outer: number) {
  const inner = outer * 0.42;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

function traceRoundRect(g: CanvasRenderingContext2D, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(rr, 0);
  g.arcTo(w, 0, w, h, rr);
  g.arcTo(w, h, 0, h, rr);
  g.arcTo(0, h, 0, 0, rr);
  g.arcTo(0, 0, w, 0, rr);
  g.closePath();
}

async function maskedShapePng(src: string, shape: string, w: number, h: number, radius: number): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('img load failed'));
    im.src = src;
  });
  const iw = img.naturalWidth || 800;
  const ih = img.naturalHeight || 600;
  const k = Math.min(2, 1024 / Math.max(w, h));
  const cw = Math.max(2, Math.round(w * k));
  const ch = Math.max(2, Math.round(h * k));
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const g = c.getContext('2d')!;
  // cover-fit source rect
  const sRatio = iw / ih;
  const dRatio = cw / ch;
  let sw: number;
  let sh: number;
  let sx: number;
  let sy: number;
  if (sRatio > dRatio) { sh = ih; sw = sh * dRatio; sx = (iw - sw) / 2; sy = 0; }
  else { sw = iw; sh = sw / dRatio; sx = 0; sy = (ih - sh) / 2; }
  g.save();
  if (shape === 'circle') { g.beginPath(); g.arc(cw / 2, ch / 2, Math.min(cw, ch) / 2, 0, Math.PI * 2); g.closePath(); }
  else if (shape === 'triangle') { g.beginPath(); g.moveTo(cw / 2, 0); g.lineTo(cw, ch); g.lineTo(0, ch); g.closePath(); }
  else if (shape === 'pentagon') tracePoly(g, cw / 2, ch / 2, cw / 2, ch / 2, 5, -Math.PI / 2);
  else if (shape === 'hexagon') tracePoly(g, cw / 2, ch / 2, cw / 2, ch / 2, 6, 0);
  else if (shape === 'star') traceStar(g, cw / 2, ch / 2, Math.min(cw, ch) / 2);
  else traceRoundRect(g, cw, ch, radius * k);
  g.clip();
  g.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  g.restore();
  return c.toDataURL('image/png');
}

const maskCache = new Map<string, string>();

// same designer-kit geometry as the canvas (clip-path mirrors pptx autoshapes)
const SHAPE_CLIP: Record<string, string> = {
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
};

const GOOGLE_FONTS = [
  'Anton', 'Oswald:wght@500;700', 'Space+Grotesk:wght@500;700',
  'Archivo:wght@500;700;800', 'Archivo+Black', 'Inter:wght@400;600;700;800',
].join('&family=');

export function openSlidesPrintWindow(slides: PptSlide[], title: string): void {
  const win = window.open('', '_blank', 'width=1200,height=800');
  if (!win) { window.print(); return; }
  // Exact 16:9 page = zero scaling deformation. Coordinates use % so the
  // printed page is proportionally identical to the 960x540 canvas.
  const pct = (v: number, base: number) => `${((v / base) * 100).toFixed(3)}%`;
  const page = (s: PptSlide) => `
    <div class="slide" style="background:${s.bg};">
      ${s.elements.map((el) => {
        const rot = el.rotation ? `transform:rotate(${el.rotation}deg);` : '';
        const pos = `position:absolute;left:${pct(el.x, 960)};top:${pct(el.y, 540)};width:${pct(el.w, 960)};height:${pct(el.h, 540)};${rot}`;
        if (el.type === 'text') return `<div class="el" style="${pos}font-size:${((el.fontSize || 16) * 72 / 96).toFixed(1)}pt;font-weight:${el.bold ? 800 : 400};font-style:${el.italic ? 'italic' : 'normal'};color:${el.color};text-align:${el.align || 'left'};font-family:${el.fontFamily || 'Arial,sans-serif'};letter-spacing:${(el.letterSpacing || 0) * 72 / 96}pt;white-space:pre-wrap;line-height:1.25;">${escapeHtml(el.text || '')}</div>`;
        if (el.type === 'image') return `<img src="${el.src}" style="${pos}object-fit:cover;border-radius:${el.borderRadius || 0}px;" />`;
        if (el.shape === 'line') return `<div style="${pos}background:${el.bg};"></div>`;
        const pic = el.src ? `background-image:url("${el.src}");background-size:cover;background-position:center;` : '';
        if (el.shape === 'circle') return `<div style="${pos}background:${el.bg};${pic}border-radius:9999px;"></div>`;
        const clip = SHAPE_CLIP[el.shape || ''];
        if (clip) return `<div style="${pos}background:${el.bg};${pic}clip-path:${clip};"></div>`;
        return `<div style="${pos}background:${el.bg};${pic}border-radius:${el.borderRadius || 0}px;"></div>`;
      }).join('')}
    </div>`;
  win.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS}&display=swap" rel="stylesheet">
    <style>
      @page{size:13.333in 7.5in;margin:0;}
      html,body{margin:0;padding:0;background:#fff;}
      body{display:flex;flex-direction:column;align-items:center;}
      .slide{position:relative;overflow:hidden;width:13.333in;height:7.5in;page-break-after:always;break-inside:avoid;}
      .slide:last-child{page-break-after:auto;}
      .el{position:absolute;overflow:hidden;}
      img{position:absolute;display:block;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}
    </style>
    </head><body>${slides.map(page).join('')}
    <script>window.onload=()=>{setTimeout(()=>{window.print();},700);};</script></body></html>`);
  win.document.close();
}
