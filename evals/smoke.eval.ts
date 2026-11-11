import { defineEval } from 'eve/evals';
import { satisfies } from 'eve/evals/expect';
import { modelHeaders } from './shared';

export default defineEval({
  description: 'The agent answers a greeting with text and no tool calls.',
  tags: ['deterministic'],
  async test(t) {
    const turn = await t.send('Hi! What can you help me with?', { headers: modelHeaders() });
    t.succeeded();
    t.usedNoTools();
    t.check(turn.reply ?? '', satisfies((reply: string) => reply.trim().length > 0, 'non-empty reply'));
  },
});
