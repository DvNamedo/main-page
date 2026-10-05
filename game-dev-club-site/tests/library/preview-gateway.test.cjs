const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Existing TypeScript compiler only; this does not replace the separate tsc check.
const previousTsLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(output.outputText, filename);
};
const { previewGateway } = require('../../src/lib/library/preview-gateway.ts');
const { exampleAdminData } = require('../../src/lib/library/preview-data.ts');
const { screenTitles } = require('../../src/lib/library/screen-contracts.ts');
if (previousTsLoader) require.extensions['.ts'] = previousTsLoader;
else delete require.extensions['.ts'];

test('TC-SHELL-01/29: public lookup exposes bibliography only', () => {
  const result = previewGateway.readPublicBooks('normal');
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.data.map((book) => book.bookId), ['B04', 'B05', 'B06']);
  for (const book of result.data) assert.deepEqual(Object.keys(book).sort(), ['author', 'bookId', 'category', 'title']);
});

test('TC-SHELL-08/29: own lookup excludes administrator identity and evidence', () => {
  const result = previewGateway.readOwnLoans('normal');
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.data.map((loan) => loan.loanId), ['L01', 'L02', 'L13']);
  for (const loan of result.data) {
    for (const key of ['studentNumber', 'borrowerName', 'note', 'photoState', 'linked', 'source']) assert.equal(key in loan, false);
  }
});

test('TC-SHELL-02/03: successful zero results differ from pending and failed reads', () => {
  for (const read of ['readPublicBooks', 'readOwnLoans', 'readAdminData']) {
    const empty = previewGateway[read]('empty');
    assert.equal(empty.status, 'ready');
    assert.ok('data' in empty);
    const arrays = Array.isArray(empty.data) ? [empty.data] : [empty.data.books, empty.data.loans, empty.data.cleanupLoans];
    assert.ok(arrays.every((items) => items.length === 0));
    for (const scenario of ['loading', 'error']) {
      const result = previewGateway[read](scenario);
      assert.equal(result.status, scenario);
      assert.equal('data' in result, false);
    }
  }
});

test('TC-SHELL-27: long-value scenarios preserve canonical target IDs', () => {
  for (const read of ['readPublicBooks', 'readOwnLoans']) {
    const normal = previewGateway[read]('normal').data;
    const long = previewGateway[read]('long').data;
    assert.deepEqual(long.map((item) => item.bookId), normal.map((item) => item.bookId));
    assert.ok(long.every((item, index) => item.title.length > normal[index].title.length));
  }
  const normal = previewGateway.readAdminData('normal').data;
  const long = previewGateway.readAdminData('long').data;
  assert.deepEqual(long.cleanupLoans.map((loan) => loan.loanId), normal.cleanupLoans.map((loan) => loan.loanId));
});

test('TC-SHELL-13/18/19: administrative examples keep book, loan and independent penalty identities consistent', () => {
  const data = previewGateway.readAdminData('normal').data;
  for (const loan of [...data.loans, ...data.cleanupLoans]) {
    const book = data.books.find((item) => item.bookId === loan.bookId);
    assert.ok(book);
    assert.equal(loan.title, book.title);
    assert.equal(loan.author, book.author);
    assert.equal(loan.category, book.category);
  }
  assert.equal(data.penalties.find((item) => item.penaltyId === 'P01').sourceLoanId, 'L11');
  assert.equal(data.penalties.find((item) => item.penaltyId === 'P02').sourceLoanId, null);
});

test('TC-SHELL-07/10/16/21/22/29: commands stay disconnected and never change fixtures', () => {
  const before = JSON.stringify(exampleAdminData);
  for (const action of ['borrow', 'return', 'renew', 'policy', 'cleanup', 'role', 'upload']) {
    const result = previewGateway.request({ action, targetIds: ['L01'], payload: { reason: 'synthetic test input' } });
    assert.equal(result.status, 'not-connected');
    assert.match(result.message, /전송하지 않았으며 자료를 변경하지/);
  }
  assert.equal(JSON.stringify(exampleAdminData), before);
});

test('TC-SHELL-25: result queries never invoke the command boundary', () => {
  const original = previewGateway.request;
  previewGateway.request = () => { assert.fail('A result query must not resubmit a command'); };
  try {
    const result = previewGateway.readResult('SAMPLE-R01');
    assert.equal(result.status, 'not-connected');
    assert.match(result.message, /원래 명령을 다시 실행하지/);
  } finally { previewGateway.request = original; }
});

test('screen contract: all 28 existing design screens have nonempty display titles', () => {
  const expected = ['M', 'A', 'S'].flatMap((prefix) => Array.from({ length: prefix === 'S' ? 12 : 8 }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`));
  assert.deepEqual(Object.keys(screenTitles).sort(), expected.sort());
  assert.ok(Object.values(screenTitles).every((title) => title.trim().length > 0));
});
