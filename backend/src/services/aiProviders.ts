/**
 * Multi-provider AI abstraction layer.
 *
 * Supports: gemini (default), openai, mock
 * Config via .env:
 *   AI_PROVIDER=gemini|openai|mock
 *   GEMINI_API_KEY=...
 *   GEMINI_MODEL=gemini-2.5-flash  (optional)
 *   OPENAI_API_KEY=...
 *   OPENAI_MODEL=gpt-4o-mini       (optional)
 *
 * Falls back to mock if the configured provider has no API key.
 */

export interface AIProvider {
  name: string;
  generateText(systemPrompt: string, userPrompt: string): Promise<string>;
}

// ─── Gemini Provider ────────────────────────────────────────────────
function createGeminiProvider(): AIProvider | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return {
    name: 'gemini',
    async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
      // Dynamic import to avoid requiring the package when not in use
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          maxOutputTokens: 8192,
          // Disable thinking for simple text generation — prevents
          // reasoning tokens from eating the output budget
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      return response.text || '';
    },
  };
}

// ─── OpenAI Provider ────────────────────────────────────────────────
function createOpenAIProvider(): AIProvider | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return {
    name: 'openai',
    async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey });

      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || '';
    },
  };
}

// ─── Mock Provider (always available) ───────────────────────────────
function createMockProvider(): AIProvider {
  return {
    name: 'mock',
    async generateText(_systemPrompt: string, _userPrompt: string): Promise<string> {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      return ''; // Empty signals the caller to use its own mock generator
    },
  };
}

// ─── Provider Resolution ────────────────────────────────────────────
const PROVIDER_FACTORIES: Record<string, () => AIProvider | null> = {
  gemini: createGeminiProvider,
  openai: createOpenAIProvider,
  mock: createMockProvider,
};

// Priority order when AI_PROVIDER is not explicitly set
const AUTO_PRIORITY = ['gemini', 'openai'];

/**
 * Resolves the active AI provider based on configuration.
 *
 * Logic:
 * 1. If AI_PROVIDER is explicitly set → use that provider (fall back to mock if no key)
 * 2. If AI_PROVIDER is not set → try providers in priority order, pick first with a valid key
 * 3. Last resort → mock
 */
export function resolveProvider(): AIProvider {
  const configured = process.env.AI_PROVIDER?.toLowerCase();

  // Explicit provider requested
  if (configured && configured !== 'auto') {
    if (configured === 'mock') return createMockProvider();

    const factory = PROVIDER_FACTORIES[configured];
    if (factory) {
      const provider = factory();
      if (provider) {
        console.log(`[AI] Using provider: ${provider.name}`);
        return provider;
      }
      console.warn(`[AI] Provider "${configured}" configured but no API key found. Falling back to mock.`);
    } else {
      console.warn(`[AI] Unknown provider "${configured}". Falling back to mock.`);
    }
    return createMockProvider();
  }

  // Auto-detect: try each provider in priority order
  for (const name of AUTO_PRIORITY) {
    const factory = PROVIDER_FACTORIES[name];
    if (factory) {
      const provider = factory();
      if (provider) {
        console.log(`[AI] Auto-detected provider: ${provider.name}`);
        return provider;
      }
    }
  }

  console.log('[AI] No API keys found. Using mock insights.');
  return createMockProvider();
}
