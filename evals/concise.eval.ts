import { defineEval } from 'eve/evals';
import { includes } from 'eve/evals/expect';
import { brevity } from './shared';

export default defineEval({
  description: 'A one-fact question gets the right fact in a short answer, as the instructions ask.',
  tags: ['deterministic'],
  async test(t) {
    const turn = await t.send('What is the capital of Australia?');
    t.succeeded();
    t.check(turn.reply, includes(/canberra/i));
    t.score(brevity(turn.reply, 25, 100)).label('brevity').atLeast(0.5);
  },
});
