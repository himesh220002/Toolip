import { PptElement, PptLayoutId, PptSlide, PptTheme, SlideContentItem, PPT_W, PPT_H, uid } from './pptTypes';

export const PPT_THEMES: PptTheme[] = [
  {
    id: 'cream-modern',
    name: 'Cream Modern',
    category: 'Modern',
    bg: '#F4F1EA',
    surface: '#FFFFFF',
    accent: '#E85D3D',
    accent2: '#1A1A1A',
    text: '#1A1A1A',
    muted: '#7A7671',
    headingFont: "'Anton','Arial Black',sans-serif",
    bodyFont: "'Inter',system-ui,sans-serif",
  },
  {
    id: 'dark-neon',
    name: 'Dark Neon',
    category: 'Modern',
    bg: '#1E0A3C',
    surface: '#2A0E50',
    accent: '#00E5FF',
    accent2: '#FF2E63',
    text: '#FFFFFF',
    muted: '#B9A8D9',
    headingFont: "'Space Grotesk','Arial Black',sans-serif",
    bodyFont: "'Inter',system-ui,sans-serif",
  },
  {
    id: 'teal-exec',
    name: 'Teal Executive',
    category: 'Business',
    bg: '#07332F',
    surface: '#0A4A44',
    accent: '#FFFFFF',
    accent2: '#F5C518',
    text: '#FFFFFF',
    muted: '#A8CFCB',
    headingFont: "'Archivo','Arial Black',sans-serif",
    bodyFont: "'Inter',system-ui,sans-serif",
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    category: 'Minimal',
    bg: '#FFFFFF',
    surface: '#F6F6F4',
    accent: '#111111',
    accent2: '#E85D3D',
    text: '#111111',
    muted: '#6B6B6B',
    headingFont: "'Oswald','Arial Narrow',sans-serif",
    bodyFont: "'Inter',system-ui,sans-serif",
  },
  {
    id: 'amber-play',
    name: 'Amber Playful',
    category: 'Creative',
    bg: '#FFD84D',
    surface: '#FFFFFF',
    accent: '#111111',
    accent2: '#FFFFFF',
    text: '#111111',
    muted: '#5C5433',
    headingFont: "'Archivo Black','Arial Black',sans-serif",
    bodyFont: "'Inter',system-ui,sans-serif",
  },
];

export const PPT_LAYOUTS: Array<{ id: PptLayoutId; name: string; desc: string }> = [
  { id: 'title-hero', name: 'Title Hero', desc: 'Big title + subtitle + image right' },
  { id: 'split-bullets', name: 'Bullets + Image', desc: 'Title, bullet list, side image' },
  { id: 'stats-3', name: '3 Stats / Features', desc: 'Three columns with values' },
  { id: 'team-grid', name: 'Team Grid', desc: '4 profile cards with photo + role' },
  { id: 'timeline', name: 'Timeline', desc: '4 milestones on a line' },
  { id: 'data-table', name: 'Data Table', desc: 'Title + clean table grid' },
  { id: 'quote-image', name: 'Quote / Welcome', desc: 'Big statement + portrait image' },
  { id: 'closing', name: 'Closing / CTA', desc: 'Centered thank-you + contact' },
];

export function getTheme(id: string): PptTheme {
  return PPT_THEMES.find((t) => t.id === id) || PPT_THEMES[0];
}

const T = (o: Partial<PptElement> & { x: number; y: number; w: number; h: number }): PptElement => ({
  id: uid('t'),
  type: 'text',
  fontSize: 16,
  color: '#111',
  align: 'left',
  ...o,
} as PptElement);

const IMG = (src: string, x: number, y: number, w: number, h: number, r = 4): PptElement => ({
  id: uid('img'),
  type: 'image',
  src,
  x, y, w, h,
  borderRadius: r,
});

const BOX = (bg: string, x: number, y: number, w: number, h: number, r = 12): PptElement => ({
  id: uid('box'),
  type: 'shape',
  shape: 'rect',
  bg,
  x, y, w, h,
  borderRadius: r,
});

const phImg = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

function avatarSeed(name: string) {
  return `https://i.pravatar.cc/300?u=${encodeURIComponent(name)}`;
}

export function buildSlide(layout: PptLayoutId, themeId: string, c: SlideContentItem, idx: number): PptSlide {
  const th = getTheme(themeId);
  const id = uid('slide');
  const img = c.image || phImg(`${c.title}-${idx}`);
  const bullets = (c.bullets || []).slice(0, 5);
  const els: PptElement[] = [];

  switch (layout) {
    case 'title-hero': {
      const heroTitle = c.title || 'Presentation Title';
      const heroFs = heroTitle.length > 60 ? 38 : heroTitle.length > 38 ? 50 : 64;
      els.push(T({ text: c.kicker || 'PRESENTATION', x: 70, y: 60, w: 500, h: 24, fontSize: 13, color: th.muted, bold: true, letterSpacing: 3 }));
      els.push(T({ text: heroTitle, x: 65, y: 130, w: 470, h: 170, fontSize: heroFs, bold: true, color: th.id === 'cream-modern' ? th.accent : th.accent === '#FFFFFF' ? '#FFFFFF' : th.text, fontFamily: th.headingFont, align: 'left' }));
      els.push(T({ text: c.subtitle || c.description || 'Presentation subtitle — edit me', x: 70, y: 400, w: 440, h: 60, fontSize: 16, color: th.muted, bold: true }));
      els.push(T({ text: String(idx + 1).padStart(2, '0'), x: 880, y: 470, w: 40, h: 24, fontSize: 12, color: th.muted, align: 'right' }));
      els.push(IMG(img, 560, 100, 300, 340, 2));
      break;
    }
    case 'split-bullets': {
      els.push(T({ text: c.kicker || `0${idx + 1} — OVERVIEW`, x: 70, y: 48, w: 500, h: 24, fontSize: 12, color: th.muted, bold: true, letterSpacing: 2 }));
      const sbTitle = c.title || 'Why it matters';
      els.push(T({ text: sbTitle, x: 65, y: 78, w: 500, h: 70, fontSize: sbTitle.length > 40 ? 30 : 40, bold: true, color: th.text, fontFamily: th.headingFont }));
      // never leave the column empty: fall back to description sentences, then placeholders
      let list = bullets;
      if (!list.length && c.description) list = c.description.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
      if (!list.length) list = ['First key point — double-click to edit', 'Second key point — double-click to edit', 'Third key point — double-click to edit'];
      const n = list.length;
      const gap = n > 1 ? Math.min(64, Math.floor((486 - 170 - 56) / (n - 1))) : 0;
      const bfs = Math.max(...list.map((b) => b.length)) > 90 ? 13 : 15;
      list.forEach((b, i) => {
        const by = 170 + i * gap;
        els.push(T({ text: b, x: 90, y: by, w: 430, h: 56, fontSize: bfs, color: th.text }));
        els.push({ id: uid('dot'), type: 'shape', shape: 'circle', bg: th.accent, x: 70, y: by + 6, w: 10, h: 10, borderRadius: 99 } as PptElement);
      });
      els.push(IMG(img, 580, 90, 280, 360, 4));
      break;
    }
    case 'stats-3': {
      els.push(T({ text: c.kicker || 'HIGHLIGHTS', x: 70, y: 48, w: 820, h: 24, fontSize: 12, color: th.muted, bold: true, letterSpacing: 3, align: 'center' }));
      els.push(T({ text: c.title || 'By the numbers', x: 70, y: 76, w: 820, h: 60, fontSize: 38, bold: true, color: th.text, align: 'center', fontFamily: th.headingFont }));
      const stats = (c.stats?.length ? c.stats : [{ label: 'Growth', value: '+128%', desc: 'Year over year' }, { label: 'Users', value: '48K', desc: 'Active monthly' }, { label: 'Rating', value: '4.9★', desc: 'Customer score' }]).slice(0, 3);
      stats.forEach((s, i) => {
        const x = 100 + i * 260;
        els.push(BOX(th.surface, x, 180, 220, 260, 18));
        els.push(T({ text: s.value, x, y: 205, w: 220, h: 60, fontSize: s.value.length > 7 ? 30 : 40, bold: true, color: th.accent === '#FFFFFF' ? th.text : th.accent, align: 'center', fontFamily: th.headingFont }));
        els.push(T({ text: s.label, x, y: 265, w: 220, h: 30, fontSize: 16, bold: true, color: th.text, align: 'center' }));
        els.push(T({ text: s.desc || '', x: x + 15, y: 300, w: 190, h: 90, fontSize: 13, color: th.muted, align: 'center' }));
      });
      break;
    }
    case 'team-grid': {
      els.push(T({ text: c.title || 'Our Team', x: 70, y: 50, w: 820, h: 56, fontSize: 38, bold: true, color: th.text, align: 'center', fontFamily: th.headingFont }));
      els.push(T({ text: c.subtitle || 'The people behind the work', x: 70, y: 106, w: 820, h: 28, fontSize: 14, color: th.muted, align: 'center' }));
      const team = (c.team?.length ? c.team : [{ name: 'Aarav Mehta', role: 'CEO' }, { name: 'Sara Khan', role: 'Designer' }, { name: 'John Carter', role: 'Engineer' }, { name: 'Mira Rao', role: 'Marketing' }]).slice(0, 4);
      team.forEach((m, i) => {
        const x = 95 + i * 200;
        els.push({ id: uid('av'), type: 'image', src: avatarSeed(m.name + idx + i), x: x + 40, y: 165, w: 110, h: 110, borderRadius: 99 } as PptElement);
        els.push(T({ text: m.name, x, y: 285, w: 190, h: 30, fontSize: m.name.length > 14 ? 12 : 14, bold: true, color: th.text, align: 'center' }));
        els.push(T({ text: m.role, x, y: 316, w: 190, h: 24, fontSize: 12, color: th.muted, align: 'center' }));
      });
      break;
    }
    case 'timeline': {
      els.push(T({ text: c.title || 'Roadmap', x: 70, y: 50, w: 820, h: 56, fontSize: 38, bold: true, color: th.text, align: 'left', fontFamily: th.headingFont }));
      els.push({ id: uid('ln'), type: 'shape', shape: 'line', bg: th.accent, x: 90, y: 250, w: 780, h: 4, borderRadius: 2 } as PptElement);
      const steps = (c.steps?.length ? c.steps : [{ label: 'Phase 1', desc: 'Research & discovery' }, { label: 'Phase 2', desc: 'Design & prototype' }, { label: 'Phase 3', desc: 'Build & launch' }, { label: 'Phase 4', desc: 'Scale & grow' }]).slice(0, 4);
      const stepFs = Math.max(...steps.map((s) => (s.desc || '').length)) > 60 ? 11 : 12;
      steps.forEach((s, i) => {
        const x = 100 + i * 200;
        els.push({ id: uid('nd'), type: 'shape', shape: 'circle', bg: th.accent, x: x + 55, y: 232, w: 20, h: 20, borderRadius: 99 } as PptElement);
        els.push(T({ text: s.label, x, y: 270, w: 130, h: 30, fontSize: 16, bold: true, color: th.text, align: 'center' }));
        els.push(T({ text: s.desc || '', x: x - 15, y: 302, w: 160, h: 80, fontSize: stepFs, color: th.muted, align: 'center' }));
      });
      break;
    }
    case 'data-table': {
      els.push(T({ text: c.title || 'Key Data', x: 70, y: 50, w: 820, h: 56, fontSize: 38, bold: true, color: th.text, fontFamily: th.headingFont }));
      els.push(T({ text: c.subtitle || c.description || 'Edit table cells by selecting them', x: 70, y: 110, w: 820, h: 28, fontSize: 14, color: th.muted }));
      const tbl = c.table || { headers: ['Metric', 'Value', 'Source'], rows: [['Activation', '+64%', 'Analytics'], ['Retention', '3.2x', 'Survey'], ['NPS', '72', 'Report'], ['Growth', '+128%', 'Dashboard']] };
      const cols = tbl.headers.length;
      const colW = Math.floor(800 / Math.max(cols, 1));
      // tall rows when cells carry long text so nothing clips
      const longestCell = Math.max(0, ...tbl.rows.flat().map((r) => String(r).length));
      const tall = longestCell > 32;
      const rowH = tall ? 58 : 46;
      const cellFs = tall ? 11 : 12;
      const rows = tbl.rows.slice(0, tall ? 4 : 5);
      tbl.headers.forEach((h, ci) => {
        els.push(BOX(th.accent2 === '#FFFFFF' ? '#111111' : th.accent2, 70 + ci * colW, 160, colW, 44, 0));
        els.push(T({ text: h, x: 70 + ci * colW, y: 168, w: colW, h: 30, fontSize: 13, bold: true, color: '#FFFFFF', align: 'center' }));
      });
      rows.forEach((row, ri) => {
        row.slice(0, cols).forEach((cell, ci) => {
          els.push(BOX(ri % 2 ? th.surface : '#FFFFFF', 70 + ci * colW, 204 + ri * rowH, colW, rowH, 0));
          els.push(T({ text: cell, x: 70 + ci * colW + 6, y: 210 + ri * rowH, w: colW - 12, h: rowH - 10, fontSize: cellFs, color: '#111111', align: 'center' }));
        });
      });
      break;
    }
    case 'quote-image': {
      els.push(IMG(img, 540, 60, 340, 420, 4));
      const qKick = c.kicker || 'WELCOME';
      els.push(T({ text: qKick, x: 70, y: 90, w: 420, h: 50, fontSize: qKick.length > 14 ? 34 : 46, bold: true, color: th.text, fontFamily: th.headingFont }));
      const qText = c.quote || c.subtitle || c.description || 'A big idea deserves a big slide. Replace this text with your story.';
      els.push(T({ text: qText, x: 70, y: 160, w: 420, h: 130, fontSize: qText.length > 220 ? 15 : 17, color: th.text }));
      const qBullets = (c.bullets || ['Point one you can edit', 'Point two you can move']).slice(0, 4);
      const qGap = qBullets.length > 1 ? Math.min(44, Math.floor((492 - 300 - 36) / (qBullets.length - 1))) : 0;
      qBullets.forEach((b, i) => {
        els.push(T({ text: '•  ' + b, x: 70, y: 300 + i * qGap, w: 420, h: 40, fontSize: 14, color: th.text }));
      });
      break;
    }
    case 'closing': {
      els.push(T({ text: c.kicker || 'THANK YOU', x: 70, y: 120, w: 820, h: 28, fontSize: 14, bold: true, color: th.accent === '#FFFFFF' ? th.muted : th.accent, align: 'center', letterSpacing: 4 }));
      const clTitle = c.title || 'Let’s build together';
      els.push(T({ text: clTitle, x: 130, y: 155, w: 700, h: 110, fontSize: clTitle.length > 40 ? 40 : clTitle.length > 24 ? 48 : 56, bold: true, color: th.text, align: 'center', fontFamily: th.headingFont }));
      els.push(T({ text: c.subtitle || c.description || 'hello@yourstudio.com  •  yoursite.com', x: 180, y: 280, w: 600, h: 40, fontSize: 16, color: th.muted, align: 'center' }));
      els.push(BOX(th.accent, 380, 350, 200, 52, 99));
      els.push(T({ text: c.bullets?.[0] || 'Get Started', x: 380, y: 360, w: 200, h: 34, fontSize: 16, bold: true, color: th.bg === '#FFD84D' ? '#111' : '#fff', align: 'center' }));
      break;
    }
  }

  return { id, layout, themeId, bg: th.bg, title: c.title?.slice(0, 32) || `${layout} ${idx + 1}`, elements: els };
}

/** Blank pre-structure content for the manual (no-AI) builder — every field editable after creation. */
export function blankContent(layout: PptLayoutId, title: string, idx: number): SlideContentItem {
  const t = title.trim() || 'Untitled slide';
  const base: SlideContentItem = { layout, title: t };
  switch (layout) {
    case 'title-hero':
      return { ...base, kicker: 'PRESENTATION', subtitle: 'Double-click any text to rewrite it' };
    case 'split-bullets':
      return { ...base, kicker: `0${idx + 1} — OVERVIEW`, bullets: ['First key point — edit me', 'Second key point — edit me', 'Third key point — edit me'] };
    case 'stats-3':
      return { ...base, kicker: 'HIGHLIGHTS', stats: [{ label: 'Metric one', value: '100%', desc: 'Description here' }, { label: 'Metric two', value: '48K', desc: 'Description here' }, { label: 'Metric three', value: '4.9', desc: 'Description here' }] };
    case 'team-grid':
      return { ...base, subtitle: 'The people behind the work', team: [{ name: 'Member One', role: 'Founder' }, { name: 'Member Two', role: 'Designer' }, { name: 'Member Three', role: 'Engineer' }, { name: 'Member Four', role: 'Marketing' }] };
    case 'timeline':
      return { ...base, steps: [{ label: 'Phase 1', desc: 'What happens first' }, { label: 'Phase 2', desc: 'What happens next' }, { label: 'Phase 3', desc: 'What follows' }, { label: 'Phase 4', desc: 'The outcome' }] };
    case 'data-table':
      return { ...base, subtitle: 'Select any cell to edit its text', table: { headers: ['Column A', 'Column B', 'Column C'], rows: [['Row 1 A', 'Row 1 B', 'Row 1 C'], ['Row 2 A', 'Row 2 B', 'Row 2 C'], ['Row 3 A', 'Row 3 B', 'Row 3 C']] } };
    case 'quote-image':
      return { ...base, kicker: 'HIGHLIGHT', quote: 'Your big statement goes here — double-click to edit.', bullets: ['Supporting point one', 'Supporting point two'] };
    case 'closing':
      return { ...base, kicker: 'THANK YOU', subtitle: 'hello@yoursite.com  •  yoursite.com', bullets: ['Get Started'] };
  }
}

export function demoDecks(themeId: string): PptSlide[] {
  const seeds: SlideContentItem[] = [
    { layout: 'title-hero', title: 'Quarterly Growth Review', subtitle: 'Q3 results, learnings & next bets', kicker: 'ACME • Q3 2026', image: phImg('hero-office', 800, 900) },
    { layout: 'stats-3', title: 'By the numbers', kicker: 'PERFORMANCE', stats: [{ label: 'Revenue', value: '+128%', desc: 'YoY growth' }, { label: 'Active users', value: '48K', desc: 'Monthly active' }, { label: 'NPS', value: '72', desc: 'Customer love' }] },
    { layout: 'split-bullets', title: 'What worked', kicker: '02 — WINS', bullets: ['Checkout conversion up 34% after redesign', 'Onboarding drop-off cut in half', 'New pricing page doubled trials'], image: phImg('team-whiteboard', 700, 900) },
    { layout: 'timeline', title: 'Next 90 days', steps: [{ label: 'Oct', desc: 'Ship v2 onboarding' }, { label: 'Nov', desc: 'Launch referrals' }, { label: 'Dec', desc: 'Scale paid + SEO' }, { label: 'Jan', desc: 'Enterprise pilot' }] },
  ];
  return seeds.map((s, i) => buildSlide(s.layout, themeId, s, i));
}

export { PPT_W, PPT_H };
