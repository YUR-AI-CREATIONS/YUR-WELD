export const config = {
  runtime: 'edge',
};

interface ValidationRequest {
  provider: string;
  key: string;
}

const PROVIDER_ENDPOINTS: Record<string, { url: string; testMethod: string }> = {
  'openai': { url: 'https://api.openai.com/v1/models', testMethod: 'GET' },
  'gemini': { url: 'https://generativelanguage.googleapis.com/v1beta/models', testMethod: 'GET' },
  'anthropic': { url: 'https://api.anthropic.com/v1/messages', testMethod: 'POST' },
  'groq': { url: 'https://api.groq.com/openai/v1/models', testMethod: 'GET' },
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ valid: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: ValidationRequest = await request.json();
    const { provider, key } = body;

    if (!provider || !key) {
      return new Response(JSON.stringify({ valid: false, error: 'Missing provider or key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = PROVIDER_ENDPOINTS[provider.toLowerCase()];
    if (!config) {
      return new Response(JSON.stringify({ valid: false, error: 'Unknown provider' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Test the API key with a minimal request
    const response = await fetch(config.url, {
      method: config.testMethod,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    const valid = response.status === 200 || response.status === 401; // 401 means bad key, not bad endpoint
    
    return new Response(JSON.stringify({ 
      valid: response.status === 200,
      status: response.status,
      provider 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      valid: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
