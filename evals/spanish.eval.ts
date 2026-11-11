import { defineEval } from 'eve/evals';
import { modelHeaders } from './shared';

export default defineEval({
  description: 'A question in Spanish gets a correct answer in Spanish.',
  tags: ['judge'],
  async test(t) {
    await t.send('¿Qué diferencia hay entre un lago y una laguna? Responde en dos frases.', { headers: modelHeaders() });
    t.succeeded();
    t.judge('The reply is written in Spanish.').label('replies-in-spanish').gate(0.8);
    t.judge('The reply states a real difference between a lake and a lagoon, such as size or depth.')
      .label('answers-question')
      .atLeast(0.7);
  },
});
