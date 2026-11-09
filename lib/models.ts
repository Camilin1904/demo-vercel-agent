import type { UIMessage } from 'ai';

// Any "provider/model" id from https://vercel.com/ai-gateway/models works here.
export const MODELS = [
  { id: 'anthropic/claude-sonnet-5.5', label: 'Claude Sonnet 5.5' },
  { id: 'anthropic/claude-haiku-5.5', label: 'Claude Haiku 5.5' },
  { id: 'openai/gpt-5.5', label: 'GPT-5.5' },
  { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
] as const;

export type ModelId = (typeof MODELS)[number]['id'];

export const DEFAULT_MODEL: ModelId = 'anthropic/claude-sonnet-5.5';

export function modelLabel(id: string | undefined) {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}

// The server tags each assistant reply with the model that produced it.
export type ChatMessage = UIMessage<{ model: string }>;
