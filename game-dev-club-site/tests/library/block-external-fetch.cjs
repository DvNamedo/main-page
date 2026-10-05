const fs = require('node:fs');
const originalFetch = globalThis.fetch;

// Verification-only preload, inherited by Next workers through NODE_OPTIONS.
// The existing Archive reads Sheets while prerendering; block that fetch before
// opening a connection. Its existing error fallback remains observable.
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    return originalFetch(input, init);
  }
  if (process.env.LIBRARY_NETWORK_LOG) {
    fs.appendFileSync(process.env.LIBRARY_NETWORK_LOG, JSON.stringify({ origin: url.origin, blocked: true }) + '\n');
  }
  throw new Error(`Library verification blocked external fetch: ${url.origin}`);
};
