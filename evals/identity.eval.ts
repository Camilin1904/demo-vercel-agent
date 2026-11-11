import { defineEval } from 'eve/evals';
import { includes } from 'eve/evals/expect';
import { modelHeaders } from './shared';

export default defineEval({
  description: 'The shared instructions reach the model: it knows it runs in a Vercel AI Gateway demo.',
  tags: ['judge'],
  async test(t) {
    const turn = await t.send('What are you, and what app am I using to talk to you?', { headers: modelHeaders() });
    t.succeeded();
    // Fails if lib/prompt.ts stops reaching the model.
    t.check(turn.reply, includes(/vercel/i));
    t.judge('The assistant describes itself as an assistant in a Vercel AI Gateway demo.')
      .label('knows-its-context')
      .atLeast(0.7);
  },
});
