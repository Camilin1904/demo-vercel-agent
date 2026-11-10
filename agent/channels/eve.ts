import { localDev, vercelOidc } from 'eve/channels/auth';
import { eveChannel } from 'eve/channels/eve';

// The twin exists only for evals, so it never takes anonymous traffic: Vercel OIDC tokens for
// this project (`eve eval --url`) and local dev servers only.
export default eveChannel({
  auth: [vercelOidc(), localDev()],
});
