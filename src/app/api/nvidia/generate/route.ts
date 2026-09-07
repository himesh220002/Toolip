import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey, model, messages, temperature, max_tokens } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json({ error: 'NVIDIA API key required (BYOK nvapi-...)' }, { status: 400 });
    }

    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: model || 'meta/llama-3.1-8b-instruct',
        messages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2048,
      }),
    });

    if (!nvidiaRes.ok) {
      let errText = '';
      try {
        const errJson = await nvidiaRes.json();
        errText = errJson.detail || errJson.error?.message || errJson.message || '';
      } catch {
        errText = await nvidiaRes.text();
      }

      if (nvidiaRes.status === 401) {
        return NextResponse.json(
          { error: 'Invalid NVIDIA API Key. Please check your nvapi-... key in BYOK settings.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `NVIDIA API Error (${nvidiaRes.status}): ${errText || nvidiaRes.statusText}` },
        { status: nvidiaRes.status }
      );
    }

    const data = await nvidiaRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('NVIDIA proxy error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error while contacting NVIDIA API' },
      { status: 500 }
    );
  }
}
