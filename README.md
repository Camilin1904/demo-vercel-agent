# AI Gateway Chat

A small streaming chatbot built with Next.js, the [AI SDK](https://ai-sdk.dev), and [Vercel AI Gateway](https://vercel.com/ai-gateway). Pick a model from the dropdown and every request is routed through the gateway — no provider-specific SDKs or keys.

## Run locally

1. Create an AI Gateway API key in the Vercel dashboard (**AI Gateway → API Keys**).
2. `cp .env.example .env.local` and paste the key into `AI_GATEWAY_API_KEY`.
   - Alternative: `npx vercel link` then `npx vercel env pull` to use the project's OIDC token instead.
3. `npm install && npm run dev`, then open http://localhost:3000.

## Deploy

```bash
npx vercel deploy
```

On Vercel no API key is needed — the deployment authenticates to AI Gateway with its OIDC token automatically.

## Where things are

- `app/api/chat/route.ts` — `streamText` with a `"provider/model"` string, which the AI SDK routes through AI Gateway.
- `app/page.tsx` — chat UI using `useChat` from `@ai-sdk/react`.
- `lib/models.ts` — models offered in the dropdown. Add any id from https://vercel.com/ai-gateway/models.
- `lib/prompt.ts` — the system instructions, shared with the eval twin below.

## Evals

[eve](https://github.com/vercel/eve) evals only talk to an eve agent, so `agent/` holds an eval-only twin of `/api/chat`: same instructions (`lib/prompt.ts`), same model allowlist, no tools. `withEve` in `next.config.ts` ships it with every deployment at `/eve/v1/*`, where it accepts only Vercel OIDC tokens for this project (`agent/channels/eve.ts`), so the public can't reach it.

```bash
npm run evals                          # every eval in evals/, against each model in lib/models.ts
npm run evals -- --exclude-tag judge   # only the deterministic evals
npm run evals -- --repeat 3 --strict   # 3 attempts each; soft-score misses fail too
```

The script loads `AI_GATEWAY_API_KEY` from `.env` / `.env.local`, prints a model × eval matrix, and saves it under `.eve/model-matrix/`.

To run the evals against a deployment (the deployed twin uses the default model), from a folder linked to this Vercel project:

1. In Vercel → **Settings → Deployment Protection**, create a **Protection Bypass for Automation** secret and add it to `.env` as `VERCEL_AUTOMATION_BYPASS_SECRET`.
2. Run `npx vercel env pull .env.local` to get a `VERCEL_OIDC_TOKEN` (valid 12 hours) that the agent accepts.
3. Run `npm run evals:remote -- https://<deployment-url>`, adding eval ids after the URL to run only some.

Before sending either credential, eve uses the Vercel CLI to check that the URL belongs to this project; the script puts the CLI on the `PATH` for that.
