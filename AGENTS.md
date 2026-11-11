# Agent guidelines

Small Next.js chatbot whose chat agent is an [eve](https://github.com/vercel/eve) agent (`agent/`), calling LLMs through Vercel AI Gateway. `withEve` in `next.config.ts` mounts it at `/eve/v1/*`; the page talks to it with `useEveAgent`.

## Rules

- **Models are allowlisted.** The page sends the picked model in the `x-chat-model` header, and any visitor can set that header to anything. `agent/agent.ts` must only use ids listed in `MODELS` (`lib/models.ts`) and fall back to `DEFAULT_MODEL` otherwise: the gateway serves hundreds of models, including expensive ones, and the chat is public.
- **Route everything through AI Gateway.** Use `"provider/model"` model ids. Do not add provider SDKs (`@ai-sdk/openai`, `@ai-sdk/anthropic`, …) or provider API keys.
- **No secrets in code.** Locally, auth comes from `AI_GATEWAY_API_KEY` in `.env` / `.env.local`; on Vercel, from the project's OIDC token.
- **Who can call the agent** is decided in `agent/channels/eve.ts`. Keep `vercelOidc()` and `localDev()` ahead of the public `visitor` entry, so evals and local dev keep their own identity.
- **Instructions live in `lib/prompt.ts`** (loaded by `agent/instructions.ts`), so the evals grade the same prompt users get.

## Checks

- `npm run build` must pass (it also runs the TypeScript check).
- `npm run evals -- --exclude-tag judge` runs the deterministic evals against every model.
