const { test } = require('node:test');
const assert = require('node:assert/strict');

test('verification preload blocks remote services before invoking the transport', async () => {
  const originalFetch = globalThis.fetch;
  const forwarded = [];
  globalThis.fetch = async (input) => { forwarded.push(input); return new Response('local test response'); };
  try {
    require('./block-external-fetch.cjs');
    for (const url of ['https://docs.google.com/spreadsheets/synthetic', 'https://script.google.com/synthetic', 'http://example.com/synthetic']) {
      await assert.rejects(globalThis.fetch(url), /blocked external fetch/);
    }
    assert.deepEqual(forwarded, []);
    const request = new Request('http://127.0.0.1:3100/library');
    assert.equal(await (await globalThis.fetch(request)).text(), 'local test response');
    assert.deepEqual(forwarded, [request]);
  } finally { globalThis.fetch = originalFetch; }
});
