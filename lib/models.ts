// Any "provider/model" id from https://vercel.com/ai-gateway/models works here.
export const MODELS = [
  { id: 'anthropic/claude-sonnet-5.5', label: 'Claude Sonnet 5.5' },
  { id: 'anthropic/claude-haiku-5.5', label: 'Claude Haiku 5.5' },
  { id: 'openai/gpt-5.5', label: 'GPT-5.5' },
  { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
] as const;

export type ModelId = (typeof MODELS)[number]['id'];

export const DEFAULT_MODEL: ModelId = 'anthropic/claude-sonnet-5.5';

// The chat page sends the picked model in this header with every message.
export const MODEL_HEADER = 'x-chat-model';

export function isModelId(value: unknown): value is ModelId {
  return MODELS.some((m) => m.id === value);
}

export function modelLabel(id: string | undefined) {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}
