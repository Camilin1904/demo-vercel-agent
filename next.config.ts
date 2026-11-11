import type { NextConfig } from 'next';
import { withEve } from 'eve/next';

const nextConfig: NextConfig = {};

// Mounts the chat agent in agent/ at /eve/v1/* (its own service on Vercel), where the page and
// the evals (`eve eval --url`) reach it.
export default withEve(nextConfig);
