// Run from repository root: node --test tests/local-data.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/local-data.js', 'utf8');
function boot(seed = {}, options = {}) {
  const store = new Map(Object.entries(seed));
  const events = [];
  const listeners = {};
  const localStorage = {
    getItem(k) { if (options.blockRead) throw Error('blocked'); return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { if (options.blockWrite) throw Error('quota'); store.set(k, String(v)); },
    removeItem(k) { if (options.blockDelete) throw Error('blocked'); store.delete(k); }
  };
  const window = { localStorage, dispatchEvent: e => events.push(e), addEventListener: (k, f) => listeners[k] = f };
  const document = { addEventListener() {} };
  const ctx = { window, document, Blob, CustomEvent: class { constructor(type, opts) { this.type=type; this.detail=opts.detail; } }, Date, URL, setTimeout };
  vm.runInNewContext(source,ctx);
  return { api: window.Ri3ayaLocal, store, events };
}
const growth = { date:'2026-10-12', age:8, weight:8, height:69, head:44, notes:'ملاحظة تجريبية' };
const food = { date:'2026-10-12', food:'تفاح', reaction:'like' };
test('save and read preserve values across fresh application initialization', () => {
  const a=boot(); assert.equal(a.api.add('foodRecords',food).ok,true);
  const b=boot(Object.fromEntries(a.store)); assert.equal(b.api.read('foodRecords').records[0].food,'تفاح');
});
test('export JSON is parseable and CSV includes UTF-8 BOM and Arabic data', () => {
  const {api}=boot(); api.add('ri3aya-growth-tracker',growth);api.add('foodRecords',food);
  const json=api.exportData(['ri3aya-growth-tracker','foodRecords'],'json');
  assert.equal(json.ok,true);
  const parsed=JSON.parse(json.content);
  assert.equal(parsed.records.foodRecords[0].food,'تفاح');
  const csv=api.exportData(['foodRecords'],'csv');
  assert.equal(csv.ok,true);assert.equal(csv.content.charCodeAt(0),0xFEFF);assert.match(csv.content,/تفاح/);
});
test('CSV formula injection remains literal', () => {
  const {api}=boot();api.add('foodRecords',{...food,food:'=HYPERLINK("unsafe")'});
  assert.match(api.exportData(['foodRecords'],'csv').content,/'=HYPERLINK/);
});
test('corrupt existing storage cannot be silently overwritten, raw backup is possible', () => {
  const {api,store}=boot({foodRecords:'{not valid'});
  assert.equal(api.add('foodRecords',food).code,'corrupt');
  assert.equal(store.get('foodRecords'),'{not valid');
  assert.equal(JSON.parse(api.exportData(['foodRecords'],'raw').content).raw.foodRecords,'{not valid');
});
test('quota failures and denied storage do not report success', () => {
  assert.equal(boot({}, {blockWrite:true}).api.add('foodRecords',food).code,'full');
  assert.equal(boot({}, {blockRead:true}).api.read('foodRecords').code,'blocked');
  assert.equal(boot({}, {blockDelete:true}).api.clear('foodRecords').code,'blocked');
});
test('remove one record and scoped clearing preserve other data', () => {
  const {api}=boot();api.add('foodRecords',food);api.add('ri3aya-growth-tracker',growth);
  assert.equal(api.removeRecord('foodRecords',food).ok,true);
  assert.equal(api.read('foodRecords').records.length,0);
  api.clear('foodRecords');
  assert.equal(api.read('ri3aya-growth-tracker').records.length,1);
});
test('invalid records and oversized sets are refused', () => {
  const {api}=boot();
  assert.equal(api.add('foodRecords',{...food,reaction:'wrong'}).code,'invalid');
  assert.equal(api.add('ri3aya-growth-tracker',{...growth,age:-1}).code,'invalid');
  assert.equal(api.add('foodRecords',{...food,food:'x'.repeat(11000)}).code,'invalid');
  assert.equal(api.exportData(['not-a-key']).code,'invalid');
  assert.equal(api.exportData(['foodRecords'],'xml').code,'invalid');
});
