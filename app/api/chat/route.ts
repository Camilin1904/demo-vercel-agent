import { convertToModelMessages, streamText } from 'ai';
import { DEFAULT_MODEL, type ChatMessage } from '@/lib/models';
import { CHAT_INSTRUCTIONS } from '@/lib/prompt';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model }: { messages: ChatMessage[]; model?: string } = await req.json();
  // Any AI Gateway model id works, so new models don't need a code change.
  const modelId = model || DEFAULT_MODEL;

  const result = streamText({
    // A plain "provider/model" string is routed through Vercel AI Gateway.
    // Auth: AI_GATEWAY_API_KEY locally, or the OIDC token automatically on Vercel.
    model: modelId,
    instructions: CHAT_INSTRUCTIONS,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse<ChatMessage>({
    messageMetadata: ({ part }) => (part.type === 'start' ? { model: modelId } : undefined),
    // Surface gateway errors (e.g. a missing API key) in the UI; fine for a demo.
    onError: (error) => (error instanceof Error ? error.message : 'Something went wrong.'),
  });
}
