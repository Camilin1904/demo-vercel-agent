import { defineEval } from 'eve/evals';
import { brevity } from './shared';

export default defineEval({
  description: 'A technical idea is explained plainly and briefly to a non-technical reader.',
  tags: ['judge'],
  async test(t) {
    const turn = await t.send('Explain what an API rate limit is to someone who has never written code.');
    t.succeeded();
    t.judge({
      type: 'score',
      instructions: 'Grade how clear the explanation is for a reader who has never written code.',
      criteria: [
        'Confusing, or full of unexplained jargon',
        'Understandable, but leans on some jargon',
        'Clear plain language, with an everyday analogy or example',
      ],
    })
      .label('clarity')
      .atLeast(0.5);
    t.score(brevity(turn.reply, 80, 250)).label('brevity').atLeast(0.5);
  },
});
