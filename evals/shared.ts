// Helpers shared by the evals (not an eval itself: the file name doesn't end in .eval.ts).
import { MODEL_HEADER } from '../lib/models';

// Sends the model under test the way the chat page does. scripts/run-evals.ts sets EVAL_MODEL
// once per model; without it the agent uses its default model.
export function modelHeaders(): Record<string, string> {
  return process.env.EVAL_MODEL ? { [MODEL_HEADER]: process.env.EVAL_MODEL } : {};
}

export function wordCount(text: string | undefined) {
  return (text ?? '').split(/\s+/).filter(Boolean).length;
}

// 1 at or under `ideal` words, 0 at or over `max`, linear in between.
// The chatbot is told to be concise, so long answers to simple questions lose points.
export function brevity(text: string | undefined, ideal: number, max: number) {
  const words = wordCount(text);
  const score = words <= ideal ? 1 : words >= max ? 0 : 1 - (words - ideal) / (max - ideal);
  return { score, metadata: { words, ideal, max } };
}
