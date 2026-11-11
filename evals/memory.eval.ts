import { defineEval } from 'eve/evals';
import { modelHeaders } from './shared';

export default defineEval({
  description: 'The agent remembers something from an earlier turn in the same conversation.',
  tags: ['deterministic'],
  async test(t) {
    const first = await t.send('Please remember this for later: my favorite word is marigold.', {
      headers: modelHeaders(),
    });
    const second = await first.session.send('What is my favorite word? Answer with just the word.', {
      headers: modelHeaders(),
    });
    t.succeeded();
    second.messageIncludes(/marigold/i);
  },
});
