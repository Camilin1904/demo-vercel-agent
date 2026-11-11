import { defineAgent } from 'eve';
import { defineDynamic } from 'eve/models';
import { DEFAULT_MODEL } from '../lib/models';

// The chat agent behind the page and the evals. The model comes from the x-chat-model header,
// which agent/channels/eve.ts copies into the caller's attributes.
export default defineAgent({
  model: defineDynamic((ctx) => {
    const requested = ctx.session.auth.current?.attributes.model;
    // Any AI Gateway model id works, so new models don't need a code change.
    return typeof requested === 'string' ? requested : DEFAULT_MODEL;
  }),
  // The chatbot has no tools.
  defaultTools: false,
});
