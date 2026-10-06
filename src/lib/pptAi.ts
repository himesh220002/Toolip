import { robustParseJson } from './nvidiaAi';
import { generateGeminiCompletion } from './geminiAi';
import { generateNvidiaCompletion } from './nvidiaAi';
import { PptLayoutId, SlideContentItem } from './pptTypes';

export type PptAiProvider = 'gemini' | 'nvidia' | 'ollama';

export interface PptGenInput {
  topic: string;
  numPages: number;
  pageTypes: PptLayoutId[];
  contextText?: string; // pasted web/github text
  webUrl?: string;
  githubUrl?: string;
  tone?: string;
}

export async function tryFetchUrlText(url: string): Promise<string> {
  const clean = url.trim();
  if (!clean) return '';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(clean, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // crude html -> text, cap 6k chars
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);
    return text;
  } catch (e: any) {
    throw new Error(`Could not fetch ${clean} (CORS/blocked?). Paste the text manually instead. ${e?.message || ''}`);
  }
}

const LAYOUT_LIST = 'title-hero, split-bullets, stats-3, team-grid, timeline, data-table, quote-image, closing, mindmap, org-chart, tech-stack, mindmap-radial, sdlc, fullstack';

const LAYOUT_NEEDS: Record<string, string> = {
  'title-hero': 'title (≤8 words), subtitle (≤16 words), kicker (2-3 words)',
  'split-bullets': 'title, kicker, bullets (3-4 items, each ≤14 words)',
  'stats-3': 'title, kicker, stats (exactly 3; value ≤8 chars like +128% or 48K)',
  'team-grid': 'title, subtitle, team (exactly 4 realistic name + role pairs)',
  'timeline': 'title, steps (exactly 4; label ≤3 words, desc ≤8 words)',
  'data-table': 'title, subtitle, table (3 short headers + 4 rows of short cells)',
  'quote-image': 'kicker, quote (1-2 sentences), bullets (2-3 short)',
  'closing': 'title (≤6 words), subtitle (contact line)',
  'mindmap': 'title (central idea ≤4 words), steps (exactly 4; label ≤3 words, desc ≤6 words)',
  'org-chart': 'kicker, team (exactly 4: head + 3 reports, realistic names+roles)',
  'tech-stack': 'title, subtitle, bullets (6 tool/platform names) or stats (6 label+value)',
  'mindmap-radial': 'title (hub ≤3 words), subtitle (1 line), bullets (4 short intro lines), steps (exactly 4 branch labels ≤3 words)',
  'sdlc': 'title, subtitle, steps (exactly 5 phases; label ≤2 words, desc ≤10 words)',
  'fullstack': 'title, subtitle, steps (exactly 4 layers; label = layer name, desc = 3-4 techs comma-separated)',
};

function buildPrompt(inp: PptGenInput): { system: string; user: string } {
  const plan = inp.pageTypes.slice(0, inp.numPages).map((l, i) => `Slide ${i + 1} [${l}] needs: ${LAYOUT_NEEDS[l] || 'title, subtitle'}`).join('\n');
  const system = `You are a senior pitch-deck copywriter. Output ONLY valid JSON, no markdown fences.
Schema: {"slides":[{"layout":"<one of ${LAYOUT_LIST}>","title":"...","subtitle":"...","kicker":"...","bullets":["..."],"description":"...","stats":[{"label":"...","value":"...","desc":"..."}],"team":[{"name":"...","role":"..."}],"steps":[{"label":"...","desc":"..."}],"table":{"headers":["..."],"rows":[["..."]]},"quote":"..."}]}
Rules:
- Exactly ${inp.numPages} slides in this exact layout order, matching the plan below.
- Every slide MUST include ALL fields its layout needs — never leave required fields empty or with placeholder text.
- Keep titles under 8 words, bullets under 14 words each, stat values under 8 characters, table cells under 5 words.
- NEVER use double quotes inside string values; use single quotes.
- Tone: ${inp.tone || 'modern, confident, minimal'}.`;

  const ctx = inp.contextText ? `\nSOURCE CONTEXT (web/github pasted or fetched, ground content in this):\n${inp.contextText.slice(0, 6000)}` : '';
  const user = `Create a ${inp.numPages}-slide deck about: "${inp.topic}".\nSLIDE PLAN (follow exactly):\n${plan}${ctx}`;
  return { system, user };
}

export async function generatePptContent(
  inp: PptGenInput,
  opts: { provider: PptAiProvider; apiKey?: string; modelId?: string; signal?: AbortSignal; onLog?: (m: string) => void }
): Promise<SlideContentItem[]> {
  const { system, user } = buildPrompt(inp);
  const budget = inp.numPages > 10 ? 8000 : 5000; // 15-page decks carry far more JSON
  opts.onLog?.(`Composing ${inp.numPages}-slide outline with ${opts.provider}...`);
  let raw = '';
  if (opts.provider === 'gemini') {
    raw = await generateGeminiCompletion({
      apiKey: opts.apiKey,
      modelId: opts.modelId || 'gemini-3.8-flash',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.7,
      maxTokens: budget,
      signal: opts.signal,
    });
  } else if (opts.provider === 'ollama') {
    const { generateOllamaCompletion } = await import('./nvidiaAi');
    raw = await generateOllamaCompletion({
      model: (opts.modelId || 'ollama/qwen2.5-coder:7b').replace(/^ollama\//, ''),
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      signal: opts.signal,
      onLog: opts.onLog,
    });
  } else {
    raw = await generateNvidiaCompletion({
      apiKey: opts.apiKey,
      modelId: opts.modelId,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.7,
      maxTokens: budget,
      signal: opts.signal,
    });
  }
  const parsed = robustParseJson(raw);
  const arr: any[] = Array.isArray(parsed.slides) ? parsed.slides : Array.isArray(parsed.nodes) ? parsed.nodes : [];
  if (!arr.length) throw new Error('AI returned no slides. Try again with fewer pages.');
  const valid: PptLayoutId[] = ['title-hero', 'split-bullets', 'stats-3', 'team-grid', 'timeline', 'data-table', 'quote-image', 'closing', 'mindmap', 'org-chart', 'tech-stack', 'mindmap-radial', 'sdlc', 'fullstack'];
  const wantAt = (i: number): PptLayoutId => {
    const w = inp.pageTypes[i] || inp.pageTypes[inp.pageTypes.length - 1];
    if (valid.includes(w)) return w;
    return i === 0 ? 'title-hero' : i === inp.numPages - 1 ? 'closing' : 'split-bullets';
  };
  const slides: SlideContentItem[] = arr.slice(0, inp.numPages).map((s: any, i: number) => ({
    // structure comes from the user's pre-structure plan; AI supplies the words
    layout: wantAt(i),
    title: String(s.title || `Slide ${i + 1}`).slice(0, 90),
    subtitle: s.subtitle ? String(s.subtitle).slice(0, 200) : undefined,
    kicker: s.kicker ? String(s.kicker).slice(0, 60) : undefined,
    bullets: Array.isArray(s.bullets) ? s.bullets.map((b: any) => String(b).slice(0, 160)).slice(0, 5) : undefined,
    description: s.description ? String(s.description).slice(0, 400) : undefined,
    stats: Array.isArray(s.stats) ? s.stats.slice(0, 3).map((st: any) => ({ label: String(st.label || ''), value: String(st.value || ''), desc: st.desc ? String(st.desc) : undefined })) : undefined,
    team: Array.isArray(s.team) ? s.team.slice(0, 4).map((m: any) => ({ name: String(m.name || 'Member'), role: String(m.role || 'Role') })) : undefined,
    steps: Array.isArray(s.steps) ? s.steps.slice(0, 4).map((st: any) => ({ label: String(st.label || ''), desc: st.desc ? String(st.desc) : undefined })) : undefined,
    table: s.table?.headers ? { headers: s.table.headers.map((h: any) => String(h)).slice(0, 4), rows: (s.table.rows || []).slice(0, 5).map((r: any) => (Array.isArray(r) ? r.map((c: any) => String(c)) : [String(r)])) } : undefined,
    quote: s.quote ? String(s.quote).slice(0, 300) : undefined,
  }));
  opts.onLog?.(`Parsed ${slides.length} slides from AI.`);
  return slides;
}
