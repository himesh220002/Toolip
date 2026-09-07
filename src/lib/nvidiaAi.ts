export interface NvidiaModel {
  id: string;
  name: string;
  badge: string;
  type: 'text' | 'vision';
  description: string;
}

export const NVIDIA_MODELS: NvidiaModel[] = [
  {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    badge: 'Llama 3.3 70B',
    type: 'text',
    description: 'Active flagship 70B reasoning model for rapid brainstorming and structured graph layout generation.',
  },
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision Instruct',
    badge: 'Vision 1 (Llama)',
    type: 'vision',
    description: 'Multimodal vision model capable of understanding visual diagrams, images, and complex prompt structures.',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B (OpenAI)',
    badge: 'Vision 2 (GPT-OSS 20B)',
    type: 'vision',
    description: 'High performance open-weights multimodal model specialized in visual reasoning, logos, and vector layout design.',
  },
];

const API_KEY_STORAGE_KEY = 'toolip_nvidia_api_key';
const SELECTED_MODEL_STORAGE_KEY = 'toolip_nvidia_selected_model';

export function getNvidiaApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function setNvidiaApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

export function removeNvidiaApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function getNvidiaSelectedModel(): string {
  if (typeof window === 'undefined') return NVIDIA_MODELS[0].id;
  const saved = localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
  if (saved && NVIDIA_MODELS.some((m) => m.id === saved)) {
    return saved;
  }
  return NVIDIA_MODELS[0].id;
}

export function setNvidiaSelectedModel(modelId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, modelId);
}

export interface NvidiaCompletionParams {
  apiKey?: string;
  modelId?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

export async function generateNvidiaCompletion({
  apiKey,
  modelId,
  messages,
  temperature = 0.7,
  maxTokens = 2048,
}: NvidiaCompletionParams): Promise<string> {
  const key = apiKey?.trim() || getNvidiaApiKey();
  if (!key) {
    throw new Error('NVIDIA API Key required. Please enter your BYOK key (nvapi-...) to proceed.');
  }

  const targetModel = modelId || getNvidiaSelectedModel();

  const payload = {
    apiKey: key,
    model: targetModel,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  let response: Response | null = null;
  let lastErrorMsg = '';

  // 1) Try Next.js API route (/api/nvidia/generate) first to bypass browser CORS
  try {
    const res = await fetch('/api/nvidia/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok || res.status < 500) {
      response = res;
    }
  } catch (e: any) {
    lastErrorMsg = e.message;
  }

  // 2) Fallback to Express backend if Next.js route is not mounted
  if (!response) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const expressRes = await fetch(`${backendUrl}/api/nvidia/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (expressRes.ok || expressRes.status < 500) {
        response = expressRes;
      }
    } catch (e: any) {
      lastErrorMsg = e.message;
    }
  }

  // 3) Final fallback: direct fetch to NVIDIA NIM API endpoint
  if (!response) {
    try {
      response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });
    } catch (e: any) {
      throw new Error(`Failed to connect to NVIDIA API: ${e.message || lastErrorMsg}. Please check network connection.`);
    }
  }

  if (!response.ok) {
    let errorText = '';
    try {
      const errJson = await response.json();
      errorText = errJson.error || errJson.detail || errJson.message || '';
    } catch {
      errorText = await response.text();
    }

    if (response.status === 401) {
      throw new Error('Invalid NVIDIA API Key. Please check your nvapi-... key in BYOK settings.');
    }
    if (response.status === 429) {
      throw new Error('NVIDIA API Rate limit exceeded. Please wait a moment before trying again.');
    }
    throw new Error(`NVIDIA API Error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('NVIDIA API returned an empty response.');
  }

  return content;
}

/**
 * Generate structured Mind Map nodes JSON from a user prompt using NVIDIA NIM API.
 */
export async function generateMindMapWithNvidia(
  prompt: string,
  apiKey?: string,
  modelId?: string
): Promise<{ nodes: any[]; edges: any[] }> {
  const systemPrompt = `You are an expert AI mindmap & architecture designer for the Toolip workspace.
Your job is to generate a comprehensive, visually rich mind map graph structure based on the user's prompt.

You MUST respond ONLY with a valid, clean JSON object (no markdown formatting outside the JSON, no backticks wrappers if possible, just pure valid JSON).

JSON Schema:
{
  "nodes": [
    {
      "id": "root_1",
      "text": "Main Topic Title",
      "emoji": "🧠",
      "color": "#00f2fe",
      "isRoot": true,
      "depth": 0,
      "details": "High level description of main topic",
      "note": "Initial notes for main topic"
    },
    {
      "id": "node_2",
      "text": "Branch 1 Title",
      "parentId": "root_1",
      "emoji": "🚀",
      "color": "#ff007f",
      "depth": 1,
      "details": "Details about branch 1",
      "note": "Notes for branch 1"
    }
  ]
}

Rules:
1. Always create exactly ONE main root node (isRoot: true, depth: 0, parentId: null).
2. Create 3 to 6 main sub-branches (depth: 1, parentId set to root node id).
3. For each sub-branch, create 2 to 4 child sub-items (depth: 2, parentId set to parent branch id).
4. Assign appropriate emojis (e.g. 🧠, 💡, 🚀, 🎯, 🎨, 💻, ⚡, 🔥, 🏆, 📌) to every node.
5. Assign vibrant hex colors from this palette (#00f2fe, #ff007f, #10b981, #f59e0b, #8b5cf6, #3b82f6, #ff5722) based on branch themes.
6. Provide informative "details" and "note" content for each node.
7. Return ONLY the raw JSON string matching the schema.`;

  const rawText = await generateNvidiaCompletion({
    apiKey,
    modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a mindmap for: ${prompt}` },
    ],
    temperature: 0.6,
    maxTokens: 3000,
  });

  // Extract JSON string (strip ```json blocks if present)
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  const parsed = JSON.parse(cleanJson);
  if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('AI returned invalid mindmap node structure.');
  }

  // Calculate layout coordinates for nodes (radial / tree layout)
  const nodes: any[] = [];
  const edges: any[] = [];

  const rawNodes = parsed.nodes;
  const rootNode = rawNodes.find((n: any) => n.isRoot || n.depth === 0) || rawNodes[0];

  const rootId = rootNode.id || 'root_main';
  const rootX = 400;
  const rootY = 300;

  nodes.push({
    ...rootNode,
    id: rootId,
    isRoot: true,
    depth: 0,
    parentId: null,
    x: rootX,
    y: rootY,
    width: 220,
    height: 64,
    color: rootNode.color || '#00f2fe',
    emoji: rootNode.emoji || '🧠',
  });

  const level1Nodes = rawNodes.filter((n: any) => n !== rootNode && (n.parentId === rootId || n.depth === 1));
  const otherNodes = rawNodes.filter((n: any) => n !== rootNode && !level1Nodes.includes(n));

  const totalL1 = level1Nodes.length || 1;
  const angleStep = (2 * Math.PI) / totalL1;
  const radius1 = 280;

  level1Nodes.forEach((node: any, idx: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    const x = Math.round(rootX + radius1 * Math.cos(angle));
    const y = Math.round(rootY + radius1 * Math.sin(angle));

    const nodeId = node.id || `node_l1_${idx}`;

    nodes.push({
      ...node,
      id: nodeId,
      isRoot: false,
      depth: 1,
      parentId: rootId,
      x,
      y,
      width: 180,
      height: 56,
      color: node.color || '#ff007f',
      emoji: node.emoji || '🚀',
    });

    edges.push({
      id: `e_${rootId}_${nodeId}`,
      source: rootId,
      target: nodeId,
      color: node.color || '#ff007f',
    });

    // Find children of this level 1 node
    const children = otherNodes.filter((cn: any) => cn.parentId === node.id || cn.parentId === nodeId);
    const totalChild = children.length;
    if (totalChild > 0) {
      const childRadius = 180;
      const spreadAngle = Math.PI / 3; // 60 deg spread
      const startAngle = angle - spreadAngle / 2;
      const childStep = totalChild > 1 ? spreadAngle / (totalChild - 1) : 0;

      children.forEach((child: any, cIdx: number) => {
        const cAngle = totalChild > 1 ? startAngle + cIdx * childStep : angle;
        const cx = Math.round(x + childRadius * Math.cos(cAngle));
        const cy = Math.round(y + childRadius * Math.sin(cAngle));

        const childId = child.id || `node_l2_${idx}_${cIdx}`;
        nodes.push({
          ...child,
          id: childId,
          isRoot: false,
          depth: 2,
          parentId: nodeId,
          x: cx,
          y: cy,
          width: 160,
          height: 50,
          color: child.color || node.color || '#10b981',
          emoji: child.emoji || '📌',
        });

        edges.push({
          id: `e_${nodeId}_${childId}`,
          source: nodeId,
          target: childId,
          color: child.color || node.color || '#10b981',
        });
      });
    }
  });

  return { nodes, edges };
}

/**
 * Generate clean SVG code for logos and graphics using NVIDIA NIM API.
 */
export async function generateSvgWithNvidia(
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

  const rawText = await generateNvidiaCompletion({
    apiKey,
    modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Design an SVG graphic for: ${prompt}` },
    ],
    temperature: 0.5,
    maxTokens: 3000,
  });

  let svgCode = rawText.trim();

  // Extract <svg> block if model wrapped it in text or codeblocks
  if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
    const startIdx = svgCode.indexOf('<svg');
    const endIdx = svgCode.lastIndexOf('</svg>') + 6;
    svgCode = svgCode.substring(startIdx, endIdx);
  } else if (svgCode.startsWith('```')) {
    svgCode = svgCode.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  if (!svgCode.startsWith('<svg')) {
    throw new Error('AI response did not contain a valid <svg> root element.');
  }

  return svgCode;
}
