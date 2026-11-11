// Runs the eve evals once per chatbot model (the evals send EVAL_MODEL to the chat agent in the
// x-chat-model header, like the page does), then prints a model x eval matrix and saves it to
// .eve/model-matrix/<timestamp>.json.
//
//   npm run evals                          every eval, every model
//   npm run evals -- --exclude-tag judge   skip the judge-graded evals
//   npm run evals -- --repeat 3            run each eval 3 times per model
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MODELS } from '../lib/models.ts';

const ARTIFACTS = '.eve/evals';

type Assertion = { name: string; key?: string; score?: number; passed?: boolean; severity: string };
type Result = { id: string; attempt?: number; verdict: string; reply?: string; assertions: Assertion[] };
type EveEvent = { type: string; data: Record<string, any>; meta: { at: string } };

function artifactDirs() {
  return new Set(existsSync(ARTIFACTS) ? readdirSync(ARTIFACTS) : []);
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarize(dir: string) {
  const results: Result[] = readFileSync(join(dir, 'results.jsonl'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const modelIds = new Set<string>();
  // Turn time only: eve stamps all of a model step's events at once, so there is no usable
  // time-to-first-token in the artifacts.
  const turnLatencies: number[] = [];
  let costUsd = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  for (const file of filesUnder(join(dir, 'evals')).filter((f) => f.endsWith('.events.ndjson'))) {
    const events: EveEvent[] = readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const turnStarts: number[] = [];

    for (const event of events) {
      const at = Date.parse(event.meta.at);
      if (event.type === 'turn.started') turnStarts.push(at);
      if (event.type === 'turn.settled' && turnStarts.length > 0) turnLatencies.push(at - turnStarts.shift()!);
      if (event.type === 'model.started') modelIds.add(event.data.modelId);
      if (event.type === 'usage.recorded' && event.data.kind === 'model') {
        costUsd += event.data.usage.costUsd ?? 0;
        inputTokens += event.data.usage.inputTokens ?? 0;
        outputTokens += event.data.usage.outputTokens ?? 0;
      }
    }
  }

  return {
    artifacts: dir,
    results,
    modelIds: [...modelIds],
    costUsd,
    inputTokens,
    outputTokens,
    medianTurnMs: median(turnLatencies),
  };
}

type Run = { model: (typeof MODELS)[number]; exitCode: number | null; results: Result[] } & Partial<
  ReturnType<typeof summarize>
>;

const runs: Run[] = [];
for (const model of MODELS) {
  console.log(`\n=== ${model.label} (${model.id}) ===`);
  const before = artifactDirs();
  const { status } = spawnSync(process.execPath, ['node_modules/eve/bin/eve.js', 'eval', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, EVAL_MODEL: model.id },
  });
  const dir = [...artifactDirs()].filter((d) => !before.has(d)).sort().at(-1);
  if (!dir) {
    console.error(`No eval artifacts were written for ${model.id}.`);
    runs.push({ model, exitCode: status, results: [] });
    continue;
  }
  const summary = summarize(join(ARTIFACTS, dir));
  // Guards the EVAL_MODEL plumbing: every model call must have gone to the model under test.
  if (summary.modelIds.some((id) => id !== model.id)) {
    console.error(`Expected only ${model.id}, but the agent called: ${summary.modelIds.join(', ')}`);
  }
  runs.push({ model, exitCode: status, ...summary });
}

// Model x eval matrix: "pass", "fail", "soft" (below a soft threshold), or "k/n" across repeats.
const ids = [...new Set(runs.flatMap((run) => run.results.map((r) => r.id)))].sort();
const cell = (results: Result[], id: string) => {
  const attempts = results.filter((r) => r.id === id);
  const passed = attempts.filter((r) => r.verdict === 'passed').length;
  if (attempts.length === 0) return '-';
  if (attempts.length > 1) return `${passed}/${attempts.length}`;
  return passed ? 'pass' : attempts[0].verdict === 'scored' ? 'soft' : 'fail';
};
const width = Math.max(...ids.map((id) => id.length), 'median turn'.length) + 2;
const header = 'eval'.padEnd(width) + runs.map((run) => run.model.label.padEnd(18)).join('');
console.log(`\n${header}\n${'-'.repeat(header.length)}`);
for (const id of ids) {
  console.log(id.padEnd(width) + runs.map((run) => cell(run.results, id).padEnd(18)).join(''));
}
console.log('-'.repeat(header.length));
const footer = (label: string, value: (run: Run) => string) =>
  console.log(label.padEnd(width) + runs.map((run) => value(run).padEnd(18)).join(''));
footer('passed', (run) => `${run.results.filter((r) => r.verdict === 'passed').length}/${run.results.length}`);
footer('median turn', (run) => (run.medianTurnMs != null ? `${(run.medianTurnMs / 1000).toFixed(1)}s` : '-'));
footer('cost', (run) => (run.costUsd !== undefined ? `$${run.costUsd.toFixed(4)}` : '-'));

mkdirSync('.eve/model-matrix', { recursive: true });
const out = join('.eve/model-matrix', `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
writeFileSync(out, JSON.stringify({ args: process.argv.slice(2), runs }, null, 2));
console.log(`\nSaved ${out}`);

process.exitCode = runs.some((run) => run.exitCode !== 0) ? 1 : 0;
