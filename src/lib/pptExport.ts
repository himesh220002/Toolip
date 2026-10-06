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

export async function exportSlidesToPptx(slides: PptSlide[], fileName: string): Promise<void> {
  const mod = await import('pptxgenjs');
  const PptxGen = (mod as any).default || mod;
  const pptx = new PptxGen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Toolip PPT Generator';
  pptx.title = fileName;

  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: hex(s.bg) };
    // shapes first, then images, then text on top — same paint order as canvas
    const ordered = [...s.elements].sort((a, b) => {
      const rank = (t: string) => (t === 'shape' ? 0 : t === 'image' ? 1 : 2);
      return rank(a.type) - rank(b.type);
    });
    for (const el of ordered) {
      const x = +(el.x * SX).toFixed(3);
      const y = +(el.y * SY).toFixed(3);
      const w = +(el.w * SX).toFixed(3);
      const h = +(el.h * SY).toFixed(3);
      try {
        if (el.type === 'shape') {
          const transparency = el.opacity !== undefined ? Math.round((1 - el.opacity) * 100) : 0;
          if (el.shape === 'line') {
            slide.addShape('rect' as any, { x, y, w, h: 0.03, fill: { color: hex(el.bg), transparency }, line: { color: hex(el.bg) } });
          } else if (el.shape === 'circle') {
            slide.addShape('ellipse' as any, { x, y, w, h, fill: { color: hex(el.bg), transparency } });
          } else {
            // pill / rounded rect: map px radius to pptx rectRadius (0..0.5 of half min-side)
            const r = Math.min(0.5, Math.max(0, (el.borderRadius || 0) / Math.max(1, Math.min(el.w, el.h) / 2) / 2));
            slide.addShape('roundRect' as any, { x, y, w, h, fill: { color: hex(el.bg), transparency }, rectRadius: +r.toFixed(3) });
          }
        } else if (el.type === 'image' && el.src) {
          // cover = canvas object-fit:cover, so framing matches the preview
          slide.addImage({ path: el.src, x, y, w, h, sizing: { type: 'cover', w, h } } as any);
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
          });
        }
      } catch (e) {
        console.warn('pptx element skipped', e);
      }
    }
  }
  await pptx.writeFile({ fileName: fileName.endsWith('.pptx') ? fileName : `${fileName}.pptx` });
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
        const pos = `position:absolute;left:${pct(el.x, 960)};top:${pct(el.y, 540)};width:${pct(el.w, 960)};height:${pct(el.h, 540)};`;
        if (el.type === 'text') return `<div class="el" style="${pos}font-size:${((el.fontSize || 16) * 72 / 96).toFixed(1)}pt;font-weight:${el.bold ? 800 : 400};font-style:${el.italic ? 'italic' : 'normal'};color:${el.color};text-align:${el.align || 'left'};font-family:${el.fontFamily || 'Arial,sans-serif'};letter-spacing:${(el.letterSpacing || 0) * 72 / 96}pt;white-space:pre-wrap;line-height:1.25;">${escapeHtml(el.text || '')}</div>`;
        if (el.type === 'image') return `<img src="${el.src}" style="${pos}object-fit:cover;border-radius:${el.borderRadius || 0}px;" />`;
        if (el.shape === 'line') return `<div style="${pos}background:${el.bg};"></div>`;
        if (el.shape === 'circle') return `<div style="${pos}background:${el.bg};border-radius:9999px;"></div>`;
        return `<div style="${pos}background:${el.bg};border-radius:${el.borderRadius || 0}px;"></div>`;
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
