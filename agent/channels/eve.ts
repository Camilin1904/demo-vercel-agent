import { localDev, vercelOidc, type AuthFn } from 'eve/channels/auth';
import { eveChannel } from 'eve/channels/eve';
import { MODEL_HEADER } from '../../lib/models';

// The chat page is public, like the rest of the demo: browsers call the agent without signing in.
const visitor: AuthFn<Request> = () => ({
  authenticator: 'public',
  principalId: 'visitor',
  principalType: 'user',
  attributes: {},
});

// Copies the model the page picked into the caller's attributes, where agent/agent.ts reads
// (and validates) it.
const withModel =
  (auth: AuthFn<Request>): AuthFn<Request> =>
  (request) => {
    const caller = auth(request);
    const model = request.headers.get(MODEL_HEADER);
    return caller && model ? { ...caller, attributes: { ...caller.attributes, model } } : caller;
  };

// Order matters: Vercel OIDC callers (`eve eval --url`) and local dev servers are recognized
// first and keep their own identity; everyone else is an anonymous visitor.
export default eveChannel({
  auth: [vercelOidc(), localDev(), visitor].map(withModel),
});
