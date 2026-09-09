import { robustParseJson } from './nvidiaAi';
import { mergeIncrementalMindMap } from './mindMapMerger';

export const getGeminiApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('toolip_gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('toolip_gemini_api_key', key.trim());
};

export interface GeminiModelItem {
  id: string;
  name: string;
  badge: string;
  type: 'text' | 'vision';
  provider: 'gemini';
  description: string;
}

export const CLOUD_GEMINI_MODELS: GeminiModelItem[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Latest SOTA Flash)',
    badge: 'Gemini 3.8 Flash',
    type: 'text',
    provider: 'gemini',
    description: 'Flagship SOTA Flash model engineered for long-horizon software engineering, agentic tools, and instant graph layout generation.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview (SOTA Reasoning)',
    badge: 'Gemini 3.1 Pro',
    type: 'text',
    provider: 'gemini',
    description: 'Latest SOTA reasoning model with deep architectural understanding, complex tree logic, and multimodal parsing.',
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash (High Speed)',
    badge: 'Gemini 3.7 Flash',
    type: 'text',
    provider: 'gemini',
    description: 'High-speed, reliable Flash model built for multi-step execution and instant mindmap auto-expansions.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite (Ultra Fast)',
    badge: 'Gemini 3.5 Lite',
    type: 'text',
    provider: 'gemini',
    description: 'Fastest, most cost-effective 3.5 model for high-volume rapid mindmapping and instant child node generation.',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash (Multimodal)',
    badge: 'Gemini 3.6 Flash',
    type: 'text',
    provider: 'gemini',
    description: 'Balanced Flash model offering strong multimodal reasoning across general agentic and structured data tasks.',
  },
];

const MODEL_ALIASES: Record<string, string> = {
  'gemini-2.5-pro': 'gemini-3.1-pro-preview',
  'gemini-2.5-flash': 'gemini-3.8-flash',
  'gemini-2.0-flash': 'gemini-3.8-flash',
  'gemini-1.5-pro': 'gemini-3.1-pro-preview',
  'gemini-1.5-flash': 'gemini-3.7-flash',
};

export interface GeminiCompletionOptions {
  apiKey?: string;
  modelId?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * Direct call to Google Gemini REST API (v1beta)
 */
export async function generateGeminiCompletion(options: GeminiCompletionOptions): Promise<string> {
  const apiKey = (options.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    throw new Error('Google Gemini API key required. Please enter your API key from Google AI Studio (https://aistudio.google.com/app/apikey).');
  }

  const requestedModel = options.modelId || 'gemini-3.8-flash';
  const modelId = MODEL_ALIASES[requestedModel] || requestedModel;

  // System instruction and contents formatting for Gemini API
  const systemMessage = options.messages.find((m) => m.role === 'system');
  const userMessages = options.messages.filter((m) => m.role !== 'system');

  const contents = userMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.6,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  };

  if (systemMessage) {
    payload.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  const data = await res.json();

  if (!res.ok) {
    const errMsg = data.error?.message || `Google Gemini API error (${res.status})`;
    if (res.status === 400 && errMsg.toLowerCase().includes('key')) {
      throw new Error('Invalid Google Gemini API Key. Please verify your key at https://aistudio.google.com/app/apikey');
    }
    if (res.status === 429) {
      throw new Error('Google Gemini API Rate limit exceeded. Please wait a few seconds or try Gemini 3.8 Flash.');
    }
    throw new Error(errMsg);
  }

  const candidates = data.candidates;
  if (!candidates || candidates.length === 0 || !candidates[0].content?.parts?.[0]?.text) {
    throw new Error('Google Gemini returned an empty response.');
  }

  return candidates[0].content.parts[0].text;
}

/**
 * Generate high-speed MindMap structure using Google Gemini API.
 */
export async function generateMindMapWithGemini(
  prompt: string,
  apiKey?: string,
  modelId: string = 'gemini-3.8-flash',
  existingNodes: any[] = [],
  signal?: AbortSignal,
  onLog?: (msg: string) => void,
  existingEdges: any[] = [],
  targetNodeId?: string | null
): Promise<{ nodes: any[]; edges: any[] }> {
  onLog?.(`⚡ Preparing request for Direct Google Gemini API (${modelId})...`);

  const systemPrompt = `You are a world-class AI Mind Map Architect.
Your task is to take a prompt (and optional existing mindmap structure) and generate or expand a comprehensive, highly detailed hierarchical JSON mindmap graph.

MANDATORY RULES FOR MAP UPGRADES & EXPANSIONS:
1. Return ONLY a single valid JSON object. No intro, no trailing text, no markdown code blocks if possible.
2. IF AN EXISTING MINDMAP STRUCTURE IS PROVIDED: You MUST PRESERVE all existing node IDs and structure. To add new branches or expand a node, create NEW nodes with unique "id" strings and set their "parentId" to the target node's "id". Do NOT delete or rewrite existing branches.
3. The JSON schema MUST be:
{
  "nodes": [
    {
      "id": "node_1",
      "text": "Root Node Title",
      "isRoot": true,
      "depth": 0,
      "parentId": null,
      "emoji": "🧠",
      "color": "#00f2fe",
      "details": "Detailed breakdown explanation...",
      "note": "Sub-points or notes"
    },
    {
      "id": "node_2",
      "text": "Subtopic Title",
      "isRoot": false,
      "depth": 1,
      "parentId": "node_1",
      "emoji": "🚀",
      "color": "#ff007f",
      "tag": "step 1",
      "details": "Details here...",
      "note": "Notes here..."
    }
  ]
}

4. Ensure EVERY node has a unique string "id" (e.g. node_1, node_2, node_3...).
5. "parentId" of root node is null.
6. Provide rich descriptions in "details" and bullet points in "note". For non-leaf parent/process/category nodes, assign a short categorizing tag e.g. "step 1", "process", "Phase 1", "Validation", "Strategy", etc. in the "tag" field.
7. Use harmonious hex color codes (e.g. #00f2fe, #ff007f, #10b981, #f59e0b, #8b5cf6, #3b82f6).
8. CRITICAL QUOTE RULE: Inside string values for "text", "details", "note", and "tag", NEVER use unescaped double quotes ("). Use single quotes (') for titles or quotes inside string values.`;

  let userPromptText = `Generate a complete, deeply detailed mind map for topic: "${prompt}"`;

  if (existingNodes.length > 0) {
    const targetNode = (targetNodeId && existingNodes.find((n) => n.id === targetNodeId)) ||
      existingNodes.find((n) => n.isRoot || n.depth === 0) ||
      existingNodes[0];

    const targetChildrenTitles = existingNodes
      .filter((n) => n.parentId === targetNode.id)
      .map((n) => n.text);

    userPromptText = `MAP UPGRADE / NOTE EDIT REQUEST:
- TARGET NODE TO MODIFY: "${targetNode.text}" (ID: "${targetNode.id}")
- Current Sub-Items under Target Node: ${JSON.stringify(targetChildrenTitles)}

USER PROMPT: "${prompt}"

CRITICAL GENERATION RULES:
1. IF USER ASKS TO EXPAND THE NODE: Generate 4 to 8 BRAND NEW sub-nodes attached under parentId: "${targetNode.id}".
2. IF USER ASKS TO WRITE/EDIT NOTES, DETAILS, OR ACCEPTANCE CRITERIA FOR "${targetNode.text}": Include a node entry for "${targetNode.text}" (id: "${targetNode.id}") with comprehensive, rich "details" breakdown and bullet points in "note" (or "notes" array). You may also generate sub-nodes if requested.
3. DO NOT INCLUDE OR REPEAT UNCHANGED EXISTING NODES. Output ONLY the target node or new sub-nodes array.
4. Each node MUST have: unique string "id", "text", "parentId", "emoji", "color", "details", and "note".
5. Return ONLY a valid JSON object matching: {"nodes": [...]}.`;
  }

  onLog?.(`📡 Dispatching request to Google Gemini API endpoint...`);
  if (signal?.aborted) throw new Error('AI generation was cancelled by user.');

  const rawText = await generateGeminiCompletion({
    apiKey,
    modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPromptText },
    ],
    temperature: 0.6,
    maxTokens: 4000,
    signal,
  });

  if (signal?.aborted) throw new Error('AI generation was cancelled by user.');
  onLog?.(`⚡ Google Gemini response received. Parsing JSON graph structure...`);

  const parsed = robustParseJson(rawText);
  if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('Google Gemini returned an invalid JSON mindmap structure.');
  }

  onLog?.(`⚙️ Successfully parsed ${parsed.nodes.length} nodes from Gemini. Performing incremental graph preservation & layout...`);

  const { nodes: finalNodes, edges: finalEdges } = mergeIncrementalMindMap(
    existingNodes,
    existingEdges,
    parsed.nodes,
    targetNodeId
  );

  onLog?.(`✨ Google Gemini MindMap updated successfully with ${finalNodes.length} nodes & ${finalEdges.length} connections!`);
  return { nodes: finalNodes, edges: finalEdges };
}

/**
 * Generate clean SVG code for logos and graphics using Google Gemini API.
 */
export async function generateSvgWithGemini(
  prompt: string,
  apiKey?: string,
  modelId?: string
): Promise<string> {
  const systemPrompt = `You are a master vector graphic artist & SVG code architect.
Your job is to generate visually stunning, clean, self-contained XML SVG graphics and logos based on the user's request.

Rules:
1. Output ONLY valid <svg> ... </svg> code.
2. Do NOT include markdown code fences like \`\`\`xml or \`\`\`svg if possible. If you use fences, output only the clean SVG inside.
3. Make sure the SVG includes:
   - Proper width, height, and viewBox attributes (e.g. width="240" height="240" viewBox="0 0 200 200").
   - Modern aesthetics: smooth gradients (<linearGradient>), drop shadows, rounded corners, clean shapes (<circle>, <rect>, <polygon>, <path>, <text>).
   - Rich colors (deep dark backgrounds or vibrant neon highlights).
   - High contrast and crisp scaling.
4. MANDATORY COMMENTING: ALWAYS add clear descriptive XML comments directly above EVERY element, group, and definition (e.g. <!-- Emblem Background -->, <!-- Rocket Body -->, <!-- Left Wing -->, <!-- Glow Gradient -->). Every component must be commented!
5. Ensure all XML tags are correctly closed.`;

  const rawText = await generateGeminiCompletion({
    apiKey,
    modelId: modelId || 'gemini-3.8-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Design an SVG graphic for: ${prompt}` },
    ],
    temperature: 0.5,
    maxTokens: 4000,
  });

  let svgCode = rawText.trim();

  // 1) Clean markdown code fences if present around response
  svgCode = svgCode.replace(/^```[a-z]*\n?/gi, '').replace(/\n?```$/gi, '').trim();

  // 2) Case-insensitive extraction of <svg>...</svg> block anywhere in the text
  const svgMatch = svgCode.match(/<svg[\s\S]*?(?:<\/svg>|$)/i);
  if (svgMatch) {
    svgCode = svgMatch[0].trim();
    // Ensure closing tag exists if output was truncated
    if (!/<\/svg>/i.test(svgCode)) {
      svgCode += '\n</svg>';
    }
  }

  // 3) Strip any leading XML declaration or text before <svg
  const svgStartIdx = svgCode.search(/<svg/i);
  if (svgStartIdx > 0) {
    svgCode = svgCode.substring(svgStartIdx).trim();
  }

  if (!svgCode.toLowerCase().startsWith('<svg')) {
    console.error('Failed to parse Gemini AI SVG response. Raw text was:', rawText);
    throw new Error('AI response did not contain a valid <svg> root element.');
  }

  return svgCode;
}

