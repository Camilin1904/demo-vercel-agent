import { defineAgent } from 'eve';
import { defineDynamic } from 'eve/models';
import { DEFAULT_MODEL, isModelId } from '../lib/models';

// The chat agent behind the page and the evals. The model comes from the x-chat-model header,
// which agent/channels/eve.ts copies into the caller's attributes. Any visitor can set that
// header, so only ids in MODELS are honored.
export default defineAgent({
  model: defineDynamic((ctx) => {
    const requested = ctx.session.auth.current?.attributes.model;
    return isModelId(requested) ? requested : DEFAULT_MODEL;
  }),
  // The chatbot has no tools.
  defaultTools: false,
});
