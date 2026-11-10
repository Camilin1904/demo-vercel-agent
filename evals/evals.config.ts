import { defineEvalConfig } from 'eve/evals';

export default defineEvalConfig({
  // Pinned so judge scores don't shift when the gateway's default jev version changes.
  judge: { model: 'typesafe-ai/jev-1.14.0' },
  timeoutMs: 90_000,
  maxConcurrency: 4,
});
