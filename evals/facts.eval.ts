import { defineEval } from 'eve/evals';
import { includes } from 'eve/evals/expect';
import { loadYaml } from 'eve/evals/loaders';
import { modelHeaders } from './shared';

type FactRow = { task: string; prompt: string; expect: string };

const doc = await loadYaml('evals/data/facts.yaml');
const rows = doc.evals as readonly FactRow[];

export default rows.map((row) =>
  defineEval({
    description: `Fact check: ${row.task}`,
    tags: ['deterministic'],
    async test(t) {
      const turn = await t.send(row.prompt, { headers: modelHeaders() });
      t.succeeded();
      t.check(turn.reply, includes(new RegExp(row.expect, 'i')));
    },
  }),
);
