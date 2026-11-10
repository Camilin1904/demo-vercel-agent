import { defineAgent } from 'eve';
import { DEFAULT_MODEL, MODELS } from '../lib/models';

// eve twin of /api/chat, used only by the evals in evals/. EVAL_MODEL picks which of the
// chatbot's models it runs (only ids in MODELS); scripts/run-evals.ts sets it once per model.
const model = MODELS.find((m) => m.id === process.env.EVAL_MODEL)?.id ?? DEFAULT_MODEL;

export default defineAgent({
  model,
  // The chatbot has no tools, so neither does its twin.
  defaultTools: false,
});
