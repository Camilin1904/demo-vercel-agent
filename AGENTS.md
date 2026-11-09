# Agent guidelines

Small Next.js chatbot that calls LLMs through Vercel AI Gateway with the AI SDK (v7).

## Rules

- **Models are allowlisted.** `/api/chat` must only send model ids listed in `MODELS` (`lib/models.ts`) to the gateway. Never pass a client-supplied model id through unchecked: the gateway serves hundreds of models, including expensive ones, and the route is public.
- **Route everything through AI Gateway.** Pass `"provider/model"` strings to the AI SDK. Do not add provider SDKs (`@ai-sdk/openai`, `@ai-sdk/anthropic`, …) or provider API keys.
- **No secrets in code.** Locally, auth comes from `AI_GATEWAY_API_KEY` in `.env.local`; on Vercel, from the project's OIDC token.
- **AI SDK v7 APIs.** Use `instructions` (not the deprecated `system`), and `await convertToModelMessages(...)`, which is async.
- **Streaming routes keep `maxDuration`** so long responses are not cut off.

## Checks

- `npm run build` must pass (it also runs the TypeScript check).
