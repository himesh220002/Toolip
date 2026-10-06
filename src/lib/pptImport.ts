import { PptElement, PptSlide, uid } from './pptTypes';

export interface PptImportResult {
  slides: PptSlide[];
  themeId?: string;
  fileName?: string;
  warnings: string[];
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error('Could not read file.'));
    r.readAsDataURL(file);
  });
}

// Render any loadable image URL (incl. SVG) into a PNG dataURL so canvas,
// PDF and PPTX all treat it identically. Throws when the source taints.
export async function rasterizeImageUrl(url: string, maxDim = 1200): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('Image failed to load.'));
    im.src = url;
  });
  let w = img.naturalWidth || 800;
  let h = img.naturalHeight || 600;
  const k = Math.min(1, maxDim / Math.max(w, h));
  w = Math.max(1, Math.round(w * k));
  h = Math.max(1, Math.round(h * k));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return c.toDataURL('image/png'); // throws if canvas is tainted
}

// Local files: SVGs become PNGs (PowerPoint/canvas <img> can't size raw SVG
// reliably); png/jpg/webp/gif pass through as dataURLs.
export async function fileToImageSrc(file: File): Promise<string> {
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  if (!isSvg) return readFileAsDataUrl(file);
  const text = await file.text();
  const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    return await rasterizeImageUrl(url, 1400);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ─── Deck JSON (our own prebuilt format) ───

export async function importDeckJsonFile(file: File): Promise<PptImportResult> {
  const raw = await file.text();
  const parsed = JSON.parse(raw);
  const slides = Array.isArray(parsed.slides) ? parsed.slides : Array.isArray(parsed) ? parsed : null;
  if (!slides || !slides.length) throw new Error('No slides array found in this JSON.');
  // light validation
  for (const s of slides) {
    if (!s || !Array.isArray((s as PptSlide).elements)) throw new Error('Invalid deck JSON: each slide needs an elements array.');
  }
  return {
    slides: slides as PptSlide[],
    themeId: typeof parsed.themeId === 'string' ? parsed.themeId : undefined,
    fileName: typeof parsed.fileName === 'string' ? parsed.fileName : file.name.replace(/\.ppt\.json$/i, '').replace(/\.json$/i, ''),
    warnings: [],
  };
}

// ─── PPTX (.pptx) → editable slides ───

const EMU_PER_INCH = 914400;
const DEFAULT_CX = 12192000; // 13.33in
const DEFAULT_CY = 6858000; // 7.5in

const SCHEME_HEX: Record<string, string> = {
  dk1: '1A1A1A', lt1: 'FFFFFF', dk2: '333333', lt2: 'E7E6E6',
  accent1: 'E85D3D', accent2: '1A1A1A', accent3: 'ED7D31', accent4: 'FFC000',
  accent5: '00B0F0', accent6: '70AD47', hlink: '0563C1', folHlink: '954F72',
};

function xmlDoc(text: string): Document {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Could not parse pptx XML.');
  return doc;
}

function kids(el: Element | Document, local: string): Element[] {
  return Array.from(el.getElementsByTagNameNS('*', local)) as Element[];
}

function first(el: Element | Document, local: string): Element | null {
  const all = el.getElementsByTagNameNS('*', local);
  return all.length ? (all[0] as Element) : null;
}

function firstChild(el: Element, local: string): Element | null {
  for (const c of Array.from(el.childNodes)) {
    if (c.nodeType === 1 && (c as Element).localName === local) return c as Element;
  }
  return null;
}

function childElements(el: Element): Element[] {
  return Array.from(el.childNodes).filter((n) => n.nodeType === 1) as Element[];
}

function hexOfFill(fillEl: Element | null): string | null {
  if (!fillEl) return null;
  const srgb = firstChild(fillEl, 'srgbClr');
  if (srgb?.getAttribute('val')) return srgb.getAttribute('val')!.toUpperCase();
  const sys = firstChild(fillEl, 'sysClr');
  if (sys?.getAttribute('lastClr')) return sys.getAttribute('lastClr')!.toUpperCase();
  const scheme = firstChild(fillEl, 'schemeClr');
  if (scheme?.getAttribute('val') && SCHEME_HEX[scheme.getAttribute('val')!]) return SCHEME_HEX[scheme.getAttribute('val')!];
  return null;
}

interface Box { x: number; y: number; w: number; h: number; }

// proper EMU→px conversion relative to slide size
function emuBox(o: Element | null, e: Element | null, sldCx: number, sldCy: number, parent: Box): Box | null {
  if (!o || !e) return null;
  const fx = 960 / sldCx;
  const fy = 540 / sldCy;
  return {
    x: Math.round(parent.x + Number(o.getAttribute('x') || 0) * fx),
    y: Math.round(parent.y + Number(o.getAttribute('y') || 0) * fy),
    w: Math.max(10, Math.round(Number(e.getAttribute('cx') || 0) * fx)),
    h: Math.max(10, Math.round(Number(e.getAttribute('cy') || 0) * fy)),
  };
}

interface Ctx {
  zip: any;
  rels: Record<string, string>; // rId -> ppt/media path
  sldCx: number;
  sldCy: number;
  themeId: string;
  textColor: string;
  warnings: string[];
  mediaCache: Record<string, string>; // ppt path -> dataURL
}

function mimeOf(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'bmp') return 'image/bmp';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'tif' || ext === 'tiff') return 'image/tiff';
  if (ext === 'emf' || ext === 'wmf') return 'image/png'; // not browser-renderable; will fail gracefully
  return 'image/png';
}

function normMedia(target: string): string {
  if (target.startsWith('../media/')) return 'ppt/media/' + target.slice('../media/'.length);
  return 'ppt/slides/' + target.replace(/^\.\.\//, '').replace(/^slides\//, '');
}

async function mediaUrl(ctx: Ctx, pptPath: string): Promise<string | null> {
  if (ctx.mediaCache[pptPath]) return ctx.mediaCache[pptPath];
  const f = ctx.zip.file(pptPath);
  if (!f) return null;
  const bytes: Uint8Array = await f.async('uint8array');
  if (bytes.length > 5 * 1024 * 1024) {
    ctx.warnings.push(`Skipped large image ${pptPath} (${(bytes.length / 1048576).toFixed(1)} MB).`);
    return null;
  }
  let bin = '';
  const CH = 8192;
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode(...bytes.subarray(i, i + CH));
  const url = `data:${mimeOf(pptPath)};base64,${btoa(bin)}`;
  ctx.mediaCache[pptPath] = url;
  return url;
}

function paraAlign(p: Element): 'left' | 'center' | 'right' {
  const pPr = firstChild(p, 'pPr');
  const a = pPr?.getAttribute('algn');
  if (a === 'ctr') return 'center';
  if (a === 'r') return 'right';
  return 'left';
}

function extractTextBody(txBody: Element): { text: string; fontSize: number; bold: boolean; italic: boolean; color: string | null; align: 'left' | 'center' | 'right' } {
  // only direct paragraphs of this txBody
  const direct = childElements(txBody).filter((c) => c.localName === 'p');
  const lines: string[] = [];
  let fontSize = 18;
  let bold = false;
  let italic = false;
  let color: string | null = null;
  let align: 'left' | 'center' | 'right' = 'left';
  let sized = false;
  direct.forEach((p, pi) => {
    if (pi === 0) align = paraAlign(p);
    const parts: string[] = [];
    for (const c of childElements(p)) {
      if (c.localName === 'r') {
        const rPr = firstChild(c, 'rPr');
        const t = firstChild(c, 't');
        if (t?.textContent) parts.push(t.textContent);
        if (rPr && !sized) {
          const sz = rPr.getAttribute('sz');
          if (sz) { fontSize = Math.max(8, Math.min(72, Math.round(Number(sz) / 100))); sized = true; }
          if (rPr.getAttribute('b') === '1') bold = true;
          if (rPr.getAttribute('i') === '1') italic = true;
          if (!color) color = hexOfFill(firstChild(rPr, 'solidFill'));
        }
      } else if (c.localName === 'br') {
        parts.push('\n');
      } else if (c.localName === 'fld') {
        const t = firstChild(c, 't');
        if (t?.textContent) parts.push(t.textContent);
      }
    }
    // endParaRPr sizing fallback
    const endPr = first(p, 'endParaRPr');
    if (endPr && !sized) {
      const sz = endPr.getAttribute('sz');
      if (sz) { fontSize = Math.max(8, Math.min(72, Math.round(Number(sz) / 100))); sized = true; }
    }
    const line = parts.join('').replace(/\n{3,}/g, '\n\n').trimEnd();
    lines.push(line);
  });
  return { text: lines.join('\n').trim(), fontSize, bold, italic, color, align };
}

function extractTableText(gFrame: Element): string {
  const tbl = first(gFrame, 'tbl');
  if (!tbl) return '';
  const rows: string[] = [];
  for (const tr of childElements(tbl).filter((c) => c.localName === 'tr')) {
    const cells: string[] = [];
    for (const tc of childElements(tr).filter((c) => c.localName === 'tc')) {
      const tx = firstChild(tc, 'txBody');
      cells.push(tx ? extractTextBody(tx).text.replace(/\n/g, ' ') : '');
    }
    rows.push(cells.join('   |   '));
  }
  return rows.join('\n');
}

async function parseSpTree(spTree: Element, ctx: Ctx, parent: Box, out: PptElement[]): Promise<void> {
  for (const child of childElements(spTree)) {
    if (out.length > 80) { ctx.warnings.push('Slide had 80+ elements — extras skipped.'); break; }
    const name = child.localName;
    if (name === 'sp') {
      const spPr = firstChild(child, 'spPr');
      const xfrm = spPr ? firstChild(spPr, 'xfrm') : null;
      const box = emuBox(xfrm ? firstChild(xfrm, 'off') : null, xfrm ? firstChild(xfrm, 'ext') : null, ctx.sldCx, ctx.sldCy, parent);
      const txBody = firstChild(child, 'txBody');
      const t = txBody ? extractTextBody(txBody) : { text: '', fontSize: 18, bold: false, italic: false, color: null, align: 'left' as const };
      if (!t.text) {
        // autoshape without text (rect/circle/triangle/...) — keep geometry + fill
        const geom = spPr ? firstChild(spPr, 'prstGeom') : null;
        const prst = geom?.getAttribute('prst') || '';
        const kindMap: Record<string, string> = {
          rect: 'rect', roundRect: 'pill', ellipse: 'circle', triangle: 'triangle',
          pentagon: 'pentagon', hexagon: 'hexagon', star5: 'star', star4: 'star', star6: 'star', diamond: 'rect',
        };
        const kind = kindMap[prst];
        if (!kind) continue; // textboxes/connectors without text are skipped
        const fillHex = hexOfFill(spPr ? firstChild(spPr, 'solidFill') : null);
        // PowerPoint picture-fill on the autoshape itself
        let shapeSrc: string | undefined;
        const spBlipFill = spPr ? firstChild(spPr, 'blipFill') : null;
        const spBlip = spBlipFill ? firstChild(spBlipFill, 'blip') : null;
        const spEmbed = spBlip?.getAttribute('r:embed') || spBlip?.getAttribute('embed');
        const spTarget = spEmbed ? ctx.rels[spEmbed] : null;
        if (spTarget) shapeSrc = (await mediaUrl(ctx, normMedia(spTarget))) || undefined;
        out.push({
          id: uid('box'), type: 'shape', shape: kind as any, bg: fillHex ? `#${fillHex}` : '#E5E5E5',
          x: box?.x ?? 60, y: box?.y ?? 60, w: box?.w ?? 200, h: box?.h ?? 100,
          borderRadius: kind === 'pill' ? 99 : 8,
          ...(shapeSrc ? { src: shapeSrc } : {}),
        });
        continue;
      }
      out.push({
        id: uid('t'), type: 'text',
        x: box?.x ?? 60, y: box?.y ?? 60, w: box?.w ?? 600, h: box?.h ?? 80,
        text: t.text.slice(0, 1200),
        fontSize: Math.round(t.fontSize * 1.25),
        bold: t.bold, italic: t.italic,
        color: t.color ? `#${t.color}` : ctx.textColor,
        align: t.align,
      });
    } else if (name === 'pic') {
      const spPr = firstChild(child, 'spPr');
      const xfrm = spPr ? firstChild(spPr, 'xfrm') : null;
      const box = emuBox(xfrm ? firstChild(xfrm, 'off') : null, xfrm ? firstChild(xfrm, 'ext') : null, ctx.sldCx, ctx.sldCy, parent);
      if (!box) continue;
      const blipFill = firstChild(child, 'blipFill');
      const blip = blipFill ? firstChild(blipFill, 'blip') : null;
      const embed = blip?.getAttribute('r:embed') || blip?.getAttribute('embed');
      const target = embed ? ctx.rels[embed] : null;
      if (!target) continue;
      const pptPath = 'ppt/slides/' + target.replace(/^\.\.\//, '').replace(/^slides\//, '');
      const norm = target.startsWith('../media/') ? 'ppt/media/' + target.slice('../media/'.length) : pptPath;
      const url = await mediaUrl(ctx, norm);
      if (!url) continue;
      out.push({ id: uid('img'), type: 'image', src: url, x: box.x, y: box.y, w: box.w, h: box.h, borderRadius: 4 });
    } else if (name === 'grpSp') {
      const grpSpPr = firstChild(child, 'grpSpPr');
      const xfrm = grpSpPr ? firstChild(grpSpPr, 'xfrm') : null;
      const box = emuBox(xfrm ? firstChild(xfrm, 'off') : null, xfrm ? firstChild(xfrm, 'ext') : null, ctx.sldCx, ctx.sldCy, parent) || parent;
      await parseSpTree(child, ctx, box, out);
    } else if (name === 'graphicFrame') {
      const tr = firstChild(child, 'xfrm');
      const box = emuBox(tr ? firstChild(tr, 'off') : null, tr ? firstChild(tr, 'ext') : null, ctx.sldCx, ctx.sldCy, parent);
      const txt = extractTableText(child);
      if (!txt) { ctx.warnings.push('Skipped a chart/smart-graphic (import text only for tables).'); continue; }
      out.push({
        id: uid('t'), type: 'text',
        x: box?.x ?? 60, y: box?.y ?? 200, w: box?.w ?? 840, h: box?.h ?? 200,
        text: txt.slice(0, 1200), fontSize: 13, color: ctx.textColor, align: 'left',
      });
    } else if (name === 'cxnSp') {
      continue; // connectors skipped
    }
  }
}

export async function importPptxFile(file: File, themeId: string, textColor = '#1A1A1A', onLog?: (m: string) => void): Promise<PptImportResult> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(file);
  const warnings: string[] = [];
  onLog?.('Unzipped .pptx, reading presentation order...');

  const presXml = await zip.file('ppt/presentation.xml')?.async('text');
  if (!presXml) throw new Error('Not a valid .pptx (missing ppt/presentation.xml).');
  const pres = xmlDoc(presXml);
  const sldSz = first(pres, 'sldSz');
  const sldCx = Number(sldSz?.getAttribute('cx') || DEFAULT_CX);
  const sldCy = Number(sldSz?.getAttribute('cy') || DEFAULT_CY);

  const presRelsXml = await zip.file('ppt/_rels/presentation.xml.rels')?.async('text');
  const relMap: Record<string, string> = {};
  if (presRelsXml) {
    const rels = xmlDoc(presRelsXml);
    for (const r of kids(rels, 'Relationship')) {
      const id = r.getAttribute('Id') || '';
      const tgt = r.getAttribute('Target') || '';
      relMap[id] = tgt.startsWith('slides/') ? `ppt/${tgt}` : tgt;
    }
  }

  const sldIds = kids(pres, 'sldId');
  if (!sldIds.length) throw new Error('No slides found in this .pptx.');
  const order = sldIds.map((s) => relMap[s.getAttribute('r:id') || ''] || '').filter(Boolean).slice(0, 30);
  if (!order.length) throw new Error('Could not resolve slide files (broken rels).');
  onLog?.(`Found ${order.length} slide(s). Parsing shapes, text & images...`);

  const slides: PptSlide[] = [];
  for (let i = 0; i < order.length; i++) {
    const path = order[i]; // ppt/slides/slideN.xml
    const slideXml = await zip.file(path)?.async('text');
    if (!slideXml) { warnings.push(`Skipped unreadable ${path}.`); continue; }
    const doc = xmlDoc(slideXml);
    const cSld = first(doc, 'cSld');
    const spTree = cSld ? firstChild(cSld, 'spTree') : null;

    // rels for images
    const rels: Record<string, string> = {};
    const base = path.split('/').pop() || '';
    const relsFile = await zip.file(`ppt/slides/_rels/${base}.rels`)?.async('text');
    if (relsFile) {
      const rd = xmlDoc(relsFile);
      for (const r of kids(rd, 'Relationship')) rels[r.getAttribute('Id') || ''] = r.getAttribute('Target') || '';
    }

    let bg = '#FFFFFF';
    if (cSld) {
      const bgEl = firstChild(cSld, 'bg');
      const bgPr = bgEl ? firstChild(bgEl, 'bgPr') : null;
      const fill = bgPr ? firstChild(bgPr, 'solidFill') : null;
      const hex = hexOfFill(fill);
      if (hex) bg = `#${hex}`;
    }

    const ctx: Ctx = { zip, rels, sldCx, sldCy, themeId, textColor, warnings, mediaCache: {} };
    const els: PptElement[] = [];
    if (spTree) await parseSpTree(spTree, ctx, { x: 0, y: 0, w: 960, h: 540 }, els);
    const firstText = els.find((e) => e.type === 'text')?.text?.split('\n')[0]?.slice(0, 32);
    slides.push({
      id: uid('slide'), layout: i === 0 ? 'title-hero' : i === order.length - 1 ? 'closing' : 'split-bullets',
      themeId, bg, title: firstText || `Imported ${i + 1}`, elements: els,
    });
    onLog?.(`Slide ${i + 1}/${order.length}: ${els.length} element(s).`);
  }
  if (!slides.length) throw new Error('No importable content found in this .pptx.');
  return { slides, themeId, fileName: file.name.replace(/\.pptx$/i, ''), warnings };
}

// ─── PDF → slides (each page becomes an editable slide background image) ───

let workerSet = false;

export async function importPdfFile(
  file: File, themeId: string, onLog?: (m: string) => void, maxPages = 20
): Promise<PptImportResult> {
  const pdfjs: any = await import('pdfjs-dist');
  if (!workerSet) {
    try { pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'; workerSet = true; }
    catch { /* worker falls back to main thread */ }
  }
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const n = Math.min(pdf.numPages, maxPages);
  const warnings: string[] = [];
  if (pdf.numPages > maxPages) warnings.push(`PDF has ${pdf.numPages} pages — imported first ${maxPages}.`);
  onLog?.(`Rendering ${n} PDF page(s) to slide images...`);
  const slides: PptSlide[] = [];
  for (let p = 1; p <= n; p++) {
    const page = await pdf.getPage(p);
    const raw = page.getViewport({ scale: 1 });
    const s = Math.min(960 / raw.width, 540 / raw.height);
    const vp = page.getViewport({ scale: s * 2 }); // 2x for crispness
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
    // letterbox onto 960x540 white
    const out = document.createElement('canvas');
    out.width = 960; out.height = 540;
    const g = out.getContext('2d')!;
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 960, 540);
    const dw = 960, dh = Math.round((vp.height / vp.width) * 960);
    if (dh <= 540) g.drawImage(c, 0, Math.round((540 - dh) / 2), dw, dh);
    else {
      const dh2 = 540, dw2 = Math.round((vp.width / vp.height) * 540);
      g.drawImage(c, Math.round((960 - dw2) / 2), 0, dw2, dh2);
    }
    const url = out.toDataURL('image/jpeg', 0.85);
    slides.push({
      id: uid('slide'), layout: 'quote-image', themeId, bg: '#FFFFFF',
      title: `PDF p.${p}`,
      elements: [{ id: uid('img'), type: 'image', src: url, x: 0, y: 0, w: 960, h: 540, borderRadius: 0 }],
    });
    onLog?.(`Page ${p}/${n} rendered.`);
    page.cleanup();
  }
  try { await pdf.destroy(); } catch { /* noop */ }
  warnings.push('PDF pages import as background images — add editable text boxes over them.');
  return { slides, themeId, fileName: file.name.replace(/\.pdf$/i, ''), warnings };
}
