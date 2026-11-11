# AI Gateway Chat

A small streaming chatbot built with Next.js, an [eve](https://github.com/vercel/eve) agent, and [Vercel AI Gateway](https://vercel.com/ai-gateway). Pick a model from the dropdown and every request is routed through the gateway — no provider-specific SDKs or keys. Every conversation is an eve session, so on Vercel it shows up in **Observability → Agent Runs**.

## Run locally

1. Create an AI Gateway API key in the Vercel dashboard (**AI Gateway → API Keys**).
2. `cp .env.example .env.local` and paste the key into `AI_GATEWAY_API_KEY`.
   - Alternative: `npx vercel link` then `npx vercel env pull` to use the project's OIDC token instead.
3. `npm install && npm run dev` (Node 24 or newer), then open http://localhost:3000. `next dev` starts the agent too.

## Deploy

```bash
npx vercel deploy
```

On Vercel no API key is needed — the deployment authenticates to AI Gateway with its OIDC token automatically. `withEve` deploys the agent as its own service in the same project.

## Where things are

- `agent/agent.ts` — the chat agent. It picks its model from the `x-chat-model` header, allowlisted against `lib/models.ts`.
- `agent/channels/eve.ts` — who can call the agent: Vercel OIDC (evals), local dev servers, and anonymous visitors.
- `agent/instructions.ts` — loads the system instructions from `lib/prompt.ts`.
- `app/page.tsx` — chat UI using `useEveAgent` from `eve/react`.
- `lib/models.ts` — models offered in the dropdown. Add any id from https://vercel.com/ai-gateway/models.

## Evals

The evals in `evals/` talk to the same chat agent users do, sending the model under test in the same header the page uses.

```bash
npm run evals                          # every eval in evals/, against each model in lib/models.ts
npm run evals -- --exclude-tag judge   # only the deterministic evals
npm run evals -- --repeat 3 --strict   # 3 attempts each; soft-score misses fail too
```

The script loads `AI_GATEWAY_API_KEY` from `.env` / `.env.local`, prints a model × eval matrix, and saves it under `.eve/model-matrix/`.

To run the evals against a deployment, from a folder linked to this Vercel project:

1. In Vercel → **Settings → Deployment Protection**, create a **Protection Bypass for Automation** secret and add it to `.env` as `VERCEL_AUTOMATION_BYPASS_SECRET`.
2. Run `npx vercel env pull .env.local` to get a `VERCEL_OIDC_TOKEN` (valid 12 hours) that the agent accepts.
3. Run `npm run evals:remote -- https://<deployment-url>`, adding eval ids after the URL to run only some. Set `EVAL_MODEL` to test a model other than the default.

Before sending either credential, eve uses the Vercel CLI to check that the URL belongs to this project; the script puts the CLI on the `PATH` for that.
