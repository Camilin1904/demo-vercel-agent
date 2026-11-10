import type { NextConfig } from 'next';
import { withEve } from 'eve/next';

const nextConfig: NextConfig = {};

// Mounts the eve twin in agent/ at /eve/v1/* (its own service on Vercel), so the evals can
// run against any deployment with `eve eval --url`.
export default withEve(nextConfig);
