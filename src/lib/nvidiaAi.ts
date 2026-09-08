import { mergeIncrementalMindMap } from './mindMapMerger';

export interface AiModelItem {
  id: string;
  name: string;
  badge: string;
  type: 'text' | 'vision';
  provider: 'nvidia' | 'ollama';
  ollamaModel?: string;
  description: string;
}

export type NvidiaModel = AiModelItem;

export const CLOUD_NVIDIA_MODELS: AiModelItem[] = [
  {
    id: 'deepseek-ai/deepseek-v4-pro-0813',
    name: 'DeepSeek V4 Pro',
    badge: 'DeepSeek V4 Pro',
    type: 'text',
    provider: 'nvidia',
    description: '1M-token context window MoE model optimized for high accuracy, coding, and agentic workflows.',
  },
  {
    id: 'google/gemma-4-31b-it',
    name: 'Gemma 4 31B Instruct',
    badge: 'Gemma 4 31B',
    type: 'text',
    provider: 'nvidia',
    description: 'Dense 31B model delivering frontier reasoning for coding, agentic workflows, and fine-tuning.',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    name: 'Nemotron 3.5 Lightning 30B',
    badge: 'Nemotron 3.5 30B',
    type: 'text',
    provider: 'nvidia',
    description: 'Fastest 30B A3B MoE model with leading domain accuracy for specialized agentic tasks.',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B (OpenAI)',
    badge: 'GPT-OSS 20B',
    type: 'text',
    provider: 'nvidia',
    description: 'High performance open-weights model specialized in SVG code generation and mindmap structures.',
  },
  {
    id: 'meta/muse-glimmer-30b',
    name: 'Muse Glimmer 30B',
    badge: 'Muse Glimmer 30B',
    type: 'vision',
    provider: 'nvidia',
    description: 'Multimodal reasoning model accepting text & visual inputs with native tool-calling capabilities.',
  },
  {
    id: 'moonshotai/kimi-k3',
    name: 'Kimi K3 (Moonshot AI)',
    badge: 'Moonshot Kimi K3',
    type: 'text',
    provider: 'nvidia',
    description: 'Frontier long-context reasoning model by Moonshot AI with superior structural understanding, mindmaps, and coding.',
  },
];

export const LOCAL_OLLAMA_MODELS: AiModelItem[] = [
  {
    id: 'ollama/qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder 7B',
    badge: 'Ollama Local 7B',
    type: 'text',
    provider: 'ollama',
    ollamaModel: 'qwen2.5-coder:7b',
    description: 'Local open-weights Qwen 2.5 Coder 7B model running on local Ollama service (http://localhost:11434).',
  },
  {
    id: 'ollama/llava:7b',
    name: 'LLaVA 7B (Multimodal)',
    badge: 'Ollama Local 7B',
    type: 'vision',
    provider: 'ollama',
    ollamaModel: 'llava:7b',
    description: 'Local multimodal vision & reasoning LLaVA 7B model running on local Ollama service (http://localhost:11434).',
  },
];

export const NVIDIA_MODELS: AiModelItem[] = [...CLOUD_NVIDIA_MODELS, ...LOCAL_OLLAMA_MODELS];

const API_KEY_STORAGE_KEY = 'toolip_nvidia_api_key';
const SELECTED_MODEL_STORAGE_KEY = 'toolip_nvidia_selected_model';
const CUSTOM_OLLAMA_STORAGE_KEY = 'toolip_custom_ollama_models';

export function getCustomOllamaModels(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_OLLAMA_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function addCustomOllamaModel(rawModelName: string): string {
  if (typeof window === 'undefined') return '';
  const cleanName = rawModelName.trim().replace(/^ollama\//i, '');
  if (!cleanName) return '';

  const existing = getCustomOllamaModels();
  if (!existing.includes(cleanName)) {
    const updated = [...existing, cleanName];
    localStorage.setItem(CUSTOM_OLLAMA_STORAGE_KEY, JSON.stringify(updated));
  }
  return `ollama/${cleanName}`;
}

export function removeCustomOllamaModel(rawModelName: string): void {
  if (typeof window === 'undefined') return;
  const cleanName = rawModelName.trim().replace(/^ollama\//i, '');
  const existing = getCustomOllamaModels();
  const updated = existing.filter((m) => m !== cleanName);
  localStorage.setItem(CUSTOM_OLLAMA_STORAGE_KEY, JSON.stringify(updated));
}

export function getAllOllamaModels(installedModels: string[] = []): AiModelItem[] {
  const customNames = getCustomOllamaModels();
  const baseDefaults = ['qwen2.5-coder:7b', 'llava:7b'];

  const allNames = Array.from(
    new Set<string>([...baseDefaults, ...customNames, ...installedModels])
  );

  return allNames.map((name) => {
    const cleanName = name.replace(/^ollama\//i, '');
    const isCustom = customNames.includes(cleanName);
    return {
      id: `ollama/${cleanName}`,
      name: cleanName,
      badge: isCustom ? 'Custom Local' : 'Ollama Local',
      type: 'text',
      provider: 'ollama',
      ollamaModel: cleanName,
      description: `Local open-weights ${cleanName} model running on local Ollama service (http://localhost:11434).`,
    };
  });
}

export function getNvidiaApiKey(): string {
  const envKey = process.env.NEXT_PUBLIC_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY || '';
  if (typeof window === 'undefined') return envKey;
  return localStorage.getItem(API_KEY_STORAGE_KEY) || envKey;
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
  if (typeof window === 'undefined') return CLOUD_NVIDIA_MODELS[0].id;
  const saved = localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
  if (saved) return saved;
  return CLOUD_NVIDIA_MODELS[0].id;
}

export function setNvidiaSelectedModel(modelId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, modelId);
}

/**
 * Check if local Ollama service is active & list installed local models
 */
export async function checkOllamaHealth(endpoint = 'http://localhost:11434'): Promise<{ active: boolean; models: string[] }> {
  if (typeof window === 'undefined') return { active: false, models: [] };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name || m.model);
      return { active: true, models };
    }
  } catch {
    // Offline / unreachable
  }
  return { active: false, models: [] };
}

/**
 * Generate completion using local Ollama service (http://localhost:11434) with real-time streaming
 */
export async function generateOllamaCompletion({
  model,
  messages,
  signal,
  endpoint = 'http://localhost:11434',
  onLog,
}: {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  signal?: AbortSignal;
  endpoint?: string;
  onLog?: (msg: string) => void;
}): Promise<string> {
  onLog?.(`🟢 Connecting to Local Ollama service (${endpoint}) for model "${model}"...`);
  if (signal?.aborted) throw new Error('AI generation was cancelled by user.');

  try {
    const res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: {
          temperature: 0.6,
          num_ctx: 8192,
        },
      }),
      signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama Error (${res.status}): ${text || res.statusText}`);
    }

    if (!res.body) {
      throw new Error('Ollama response body is empty.');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';
    let tokenCount = 0;
    let lastLogTime = Date.now();
    const startTime = Date.now();
    let inThinkBlock = false;
    let thinkText = '';
    const loggedNodeTitles = new Set<string>();

    onLog?.(`⚡ Connected! Real-time stream active. Receiving AI thinking & generation tokens...`);

    while (true) {
      if (signal?.aborted) throw new Error('AI generation was cancelled by user.');
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      buffer += chunkStr;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          const token = parsed.message?.content || parsed.response || '';
          if (token) {
            fullContent += token;
            tokenCount++;

            if (token.includes('<think>')) {
              inThinkBlock = true;
              onLog?.(`🧠 AI Reasoning Chain (<think>): Analyzing structure...`);
            }
            if (inThinkBlock) {
              thinkText += token;
              if (token.includes('</think>')) {
                inThinkBlock = false;
                onLog?.(`💡 AI Reasoning Complete (${thinkText.length} chars of thinking logic processed).`);
              }
            }

            const now = Date.now();

            // Extract newly completed node titles from accumulated JSON
            const textRegex = /"text"\s*:\s*"([^"]+)"/g;
            let match: RegExpExecArray | null;
            while ((match = textRegex.exec(fullContent)) !== null) {
              const title = match[1];
              if (title && !loggedNodeTitles.has(title)) {
                loggedNodeTitles.add(title);
                onLog?.(`✨ [Stream Token #${tokenCount}] Generated Node: "${title}"`);
              }
            }

            if (now - lastLogTime > 250 || parsed.done) {
              lastLogTime = now;
              const elapsedSec = ((now - startTime) / 1000).toFixed(1);

              if (inThinkBlock) {
                const snippet = thinkText.slice(-60).replace(/\n/g, ' ');
                onLog?.(`🧠 [Thinking ${elapsedSec}s] ${snippet}...`);
              } else {
                onLog?.(`⚡ [Live Stream ${elapsedSec}s] Generating structural JSON... (${tokenCount} tokens / ${fullContent.length} bytes)`);
              }
            }

            if (parsed.done) {
              const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
              onLog?.(`✅ Ollama stream completed in ${totalSec}s (${tokenCount} tokens generated).`);
            }
          }
        } catch {
          // ignore incomplete chunk
        }
      }
    }

    if (!fullContent.trim()) {
      throw new Error('Ollama returned an empty completion response.');
    }
    return fullContent;
  } catch (e: any) {
    if (e.name === 'AbortError' || signal?.aborted) {
      throw new Error('AI generation was cancelled by user.');
    }
    throw new Error(
      `Failed to connect to local Ollama service at ${endpoint}: ${e.message}. Please verify Ollama is running ('ollama serve').`
    );
  }
}

export interface NvidiaCompletionParams {
  apiKey?: string;
  modelId?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export async function generateNvidiaCompletion({
  apiKey,
  modelId,
  messages,
  temperature = 0.7,
  maxTokens = 2048,
  signal,
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
      signal,
    });
    if (res.ok || res.status < 500) {
      response = res;
    }
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('AI generation was cancelled by user.');
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
        signal,
      });
      if (expressRes.ok || expressRes.status < 500) {
        response = expressRes;
      }
    } catch (e: any) {
      if (e.name === 'AbortError') throw new Error('AI generation was cancelled by user.');
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
        signal,
      });
    } catch (e: any) {
      if (e.name === 'AbortError') throw new Error('AI generation was cancelled by user.');
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
 * Robustly extract and parse JSON from AI model response, automatically repairing common LLM syntax anomalies
 * (e.g. trailing commas, single quotes, unquoted keys, control chars, markdown wrappers, truncated responses).
 */
export function robustParseJson(rawText: string): any {
  let str = rawText.trim();

  // 1. Extract content inside markdown code block if present
  const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    str = codeBlockMatch[1].trim();
  }

  // 2. Extract from first '{' to last '}' if conversational wrapper text exists
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.substring(firstBrace, lastBrace + 1).trim();
  } else if (firstBrace !== -1 && lastBrace === -1) {
    // Truncated response before closing brace
    str = str.substring(firstBrace).trim();
  }

  // 3. First attempt: Direct JSON.parse
  try {
    return JSON.parse(str);
  } catch (e1) {
    // 4. Auto-repair pass for common LLM JSON syntax errors:
    let repaired = str;

    // a. Strip trailing commas before } or ]
    repaired = repaired.replace(/,\s*([}\]])/g, '$1');

    // b. Convert single-quoted keys/strings to double-quoted JSON strings
    repaired = repaired.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');
    repaired = repaired.replace(/:\s*'([^']*)'/g, ': "$1"');

    // c. Replace unescaped control characters & raw linebreaks inside quotes
    repaired = repaired.replace(/[\u0000-\u001F]+/g, ' ');

    try {
      return JSON.parse(repaired);
    } catch (e2) {
      // d. Remove dangling trailing comma before end of string
      repaired = repaired.replace(/,\s*$/g, '');
      try {
        return JSON.parse(repaired);
      } catch (e3) {
        // e. TRUNCATION REPAIR PASS: If AI output was cut off mid-array (hit maxTokens limit)
        if (repaired.includes('"nodes"')) {
          const lastObjClose = repaired.lastIndexOf('}');
          if (lastObjClose !== -1) {
            let truncated = repaired.substring(0, lastObjClose + 1).trim();
            if (truncated.endsWith(',')) {
              truncated = truncated.slice(0, -1).trim();
            }
            if (!truncated.endsWith(']')) {
              truncated += '\n  ]';
            }
            if (!truncated.endsWith('}')) {
              truncated += '\n}';
            }
            try {
              return JSON.parse(truncated);
            } catch (e4) {
              let patch = truncated;
              const openBrackets = (patch.match(/\[/g) || []).length;
              const closeBrackets = (patch.match(/\]/g) || []).length;
              const openBraces = (patch.match(/\{/g) || []).length;
              const closeBraces = (patch.match(/\}/g) || []).length;

              for (let i = 0; i < openBrackets - closeBrackets; i++) patch += ']';
              for (let i = 0; i < openBraces - closeBraces; i++) patch += '}';
              try {
                return JSON.parse(patch);
              } catch (e5) {
                // continue
              }
            }
          }
        }

        console.error('Failed to parse AI JSON:', { rawText, repaired });
        throw new Error(
          `AI JSON Syntax Error: ${(e3 as Error).message}. The model response was received but contained malformed JSON formatting.`
        );
      }
    }
  }
}

/**
 * Generate structured Mind Map nodes JSON from a user prompt using NVIDIA NIM API.
 * Supports incremental map updates by passing existing canvas nodes.
 */
export async function generateMindMapWithNvidia(
  prompt: string,
  apiKey?: string,
  modelId?: string,
  existingNodes?: any[],
  signal?: AbortSignal,
  onLog?: (msg: string) => void,
  existingEdges?: any[],
  targetNodeId?: string | null
): Promise<{ nodes: any[]; edges: any[] }> {
  if (signal?.aborted) {
    throw new Error('AI generation was cancelled by user.');
  }

  const selectedModel = modelId || getNvidiaSelectedModel();
  onLog?.(`🚀 Initializing NVIDIA AI MindMap generation using model: ${selectedModel}...`);

  const hasExistingMap = Array.isArray(existingNodes) && existingNodes.length > 0;

  let existingContext = '';
  if (hasExistingMap) {
    onLog?.(`🧠 Reading & parsing active canvas state (${existingNodes.length} existing nodes)...`);

    const targetNode = (targetNodeId && existingNodes.find((n) => n.id === targetNodeId)) ||
      existingNodes.find((n) => n.isRoot || n.depth === 0) ||
      existingNodes[0];

    const targetChildrenTitles = existingNodes
      .filter((n) => n.parentId === targetNode.id)
      .map((n) => n.text);

    existingContext = `TARGET PARENT NODE TO EXPAND: "${targetNode.text}" (ID: "${targetNode.id}")
Current Sub-Items under Target Node: ${JSON.stringify(targetChildrenTitles)}\n\n`;
  }

  const systemPrompt = `You are an expert AI mindmap & architecture designer for the Toolip workspace.
Your job is to generate or update a comprehensive, visually rich mind map graph structure based on the user's prompt.

You MUST respond ONLY with a valid, clean JSON object (no markdown formatting outside the JSON, no backticks wrappers if possible, just pure valid JSON).

JSON Schema:
{
  "nodes": [
    {
      "id": "node_1",
      "text": "Node Title",
      "parentId": "target_id",
      "emoji": "🚀",
      "color": "#ff007f",
      "depth": 1,
      "details": "Comprehensive details, breakdown, acceptance criteria, or technical specs",
      "note": "Sub-notes or bullet point specs"
    }
  ]
}

Rules:
1. IF EXPANDING AN EXISTING TARGET NODE: Generate 4 to 8 BRAND NEW, highly detailed sub-nodes with "parentId" set to the target node's "id" (or a new sub-item's id).
2. IF WRITING/EDITING NOTES OR DETAILS FOR A SPECIFIC NODE: Return an entry for that node with updated "details" and "note" content (and optional new sub-nodes if requested).
3. Do NOT output existing unchanged ancestor nodes or root nodes.
4. Assign appropriate emojis (e.g. 🧠, 💡, 🚀, 🎯, 🎨, 💻, ⚡, 🔥, 🏆, 📌) to every node.
5. Assign vibrant hex colors from this palette (#00f2fe, #ff007f, #10b981, #f59e0b, #8b5cf6, #3b82f6, #ff5722) based on branch themes.
6. Provide informative "details" and "note" content for each node.
7. CRITICAL JSON RULES: Use double quotes for all JSON keys/strings. Never include trailing commas before closing braces/brackets. Return ONLY the raw JSON string matching the schema.`;

  const userPromptText = hasExistingMap
    ? `${existingContext}USER PROMPT: "${prompt}"\n\nTask: Fulfill user prompt by generating new sub-nodes OR updating "details" and "note" on target node. Do NOT include unchanged existing nodes. Output the nodes JSON array.`
    : `Generate a mindmap for: ${prompt}`;

  const isOllamaModel = selectedModel.startsWith('ollama/');

  let rawText = '';
  if (isOllamaModel) {
    const rawOllamaName = selectedModel.replace(/^ollama\//i, '');
    onLog?.(`🏠 Routing generation request to Local Ollama model (${rawOllamaName})...`);
    rawText = await generateOllamaCompletion({
      model: rawOllamaName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPromptText },
      ],
      signal,
      onLog,
    });
  } else {
    onLog?.(`📡 Dispatching prompt request to NVIDIA NIM API endpoint...`);
    if (signal?.aborted) throw new Error('AI generation was cancelled by user.');

    rawText = await generateNvidiaCompletion({
      apiKey,
      modelId: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPromptText },
      ],
      temperature: 0.6,
      maxTokens: 3500,
      signal,
    });
  }

  if (signal?.aborted) throw new Error('AI generation was cancelled by user.');
  onLog?.(`⚡ API Response received. Executing robust JSON auto-repair parser...`);

  const parsed = robustParseJson(rawText);
  if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
    throw new Error('AI returned invalid mindmap node structure.');
  }

  onLog?.(`⚙️ Successfully parsed ${parsed.nodes.length} nodes from AI JSON response. Performing incremental graph preservation & layout...`);

  const { nodes: finalNodes, edges: finalEdges } = mergeIncrementalMindMap(
    existingNodes || [],
    existingEdges || [],
    parsed.nodes,
    targetNodeId
  );

  onLog?.(`✨ MindMap graph updated successfully with ${finalNodes.length} nodes and ${finalEdges.length} connections!`);
  return { nodes: finalNodes, edges: finalEdges };
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
