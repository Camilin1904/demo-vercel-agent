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
