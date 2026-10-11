// Meaningful persistence/failure tests; no DOM or production dependency.
const vm = require('node:vm'), fs = require('node:fs'), assert = require('node:assert/strict');
const source = fs.readFileSync('js/local-data.js', 'utf8');
function setup() {
    const data = new Map(), events = [], listeners = {};
    const storage = { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) };
    const window = { localStorage: storage, dispatchEvent: e => events.push(e), addEventListener: (k,f) => listeners[k] = f };
    vm.runInNewContext(source, { window, document: { addEventListener() {} }, Blob, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }, Date, JSON, Object, URL, setTimeout });
    return { api: window.Ri3ayaLocal, data, storage, events, listeners };
}
const food = { id: 1, food: 'تفاح', date: '2026-10-11', reaction: 'like', timestamp: 1 };
const symptom = { date: '11 أكتوبر', disorder: 'gas', severity: 'mild', duration: '2 ساعة' };
const growth = { date: '2026-10-11', age: 0, weight: 3.5, height: '', head: '', notes: 'ملاحظة' };
const routine = { name: 'مساء', title: 'روتين', savedAt: '2026-10-11T12:00:00Z', config: {age: '0-3'}, schedule: [{time:'07:00',activity:'رضاعة',duration:'مرن',icon:'🍼'}], tips: ['حسب إشارات الطفل'], totalSleep: 'مرن', totalFeeds: 'عند الطلب' };
let {api,data,storage,events,listeners} = setup();
for (const [key,record] of [['foodRecords',food],['symptomRecords',symptom],['ri3aya-growth-tracker',growth],['saved_routines',routine]]) {
    data.set(key, JSON.stringify([record])); // Existing keys and records need no destructive migration.
    assert.equal(api.read(key).records.length, 1);
    assert.equal(api.add(key,record).ok,true); assert.equal(api.read(key).records.length,2);
    assert.equal(api.removeRecord(key,record).ok,true); assert.equal(api.read(key).records.length,1);
}
assert.equal(events.length,8);
assert.equal(api.add('foodRecords',{...food,date:'2026-02-31'}).ok,false);
assert.equal(api.add('ri3aya-growth-tracker',{...growth,results:[null]}).ok,false);
assert.equal(api.add('foodRecords',{...food,reaction:'<svg onload=alert(1)>'}).ok,false);
assert.equal(api.read('unrelated').code,'invalid');
const prior=data.get('foodRecords');
storage.setItem=()=>{throw new Error('quota');};
assert.equal(api.add('foodRecords',food).code,'full'); assert.equal(data.get('foodRecords'),prior);
assert.equal(api.removeRecord('foodRecords',food).ok,false); assert.equal(data.get('foodRecords'),prior);
storage.setItem=(k,v)=>data.set(k,v);
data.set('foodRecords','{broken');
assert.equal(api.read('foodRecords').code,'corrupt');
assert.equal(api.add('foodRecords',food).code,'corrupt'); assert.equal(data.get('foodRecords'),'{broken');
assert.equal(api.exportData(['foodRecords']).ok,false);
assert.equal(JSON.parse(api.exportData(['foodRecords'],'raw').content).raw.foodRecords,'{broken');
for(const value of ['{}','null','[null]',JSON.stringify([{food:'تفاح'}])]) { data.set('foodRecords',value); assert.equal(api.read('foodRecords').code,'corrupt'); }
data.set('foodRecords',JSON.stringify(Array.from({length:1000},(_,i)=>({...food,id:i}))));
assert.equal(api.add('foodRecords',food).code,'limit'); assert.equal(api.read('foodRecords').records.length,1000);
assert.equal(api.exportData(['foodRecords']).ok,true);
data.set('foodRecords',JSON.stringify(Array.from({length:1002},(_,i)=>({...food,id:i}))));
assert.equal(api.removeRecord('foodRecords',food).ok,true); assert.equal(api.read('foodRecords').records.length,1001);
data.set('foodRecords',JSON.stringify([food]));
const get=storage.getItem; storage.getItem=()=>{throw new Error('blocked');};
assert.equal(api.read('foodRecords').code,'blocked'); assert.equal(api.add('foodRecords',food).code,'blocked'); assert.equal(api.exportData(['foodRecords'],'raw').ok,false);
storage.getItem=get;
storage.removeItem=()=>{throw new Error('blocked');};
assert.equal(api.clear('foodRecords').ok,false); assert.equal(api.read('foodRecords').records.length,1);
storage.removeItem=k=>data.delete(k);
data.set('another-site-key','keep');
assert.equal(api.clear('another-site-key').ok,false);
assert.equal(api.clear('foodRecords').ok,true); assert.equal(data.get('another-site-key'),'keep');
// JSON retains Arabic, notes and calculated reference fields; CSV survives quotes/newlines and formula-like text.
data.set('ri3aya-growth-tracker',JSON.stringify([{...growth,results:[{label:'الوزن',unit:'كجم',value:3.5,z:0,percentile:50}],reference:{version:'test'}}]));
const backup=JSON.parse(api.exportData(['ri3aya-growth-tracker','saved_routines']).content);
assert.equal(backup.version,1); assert.equal(backup.records['ri3aya-growth-tracker'][0].age,0); assert.equal(backup.records.saved_routines[0].name,'مساء');
data.set('foodRecords',JSON.stringify([{...food,food:'=1+1\n"تفاح"'}]));
const csv=api.exportData(['foodRecords'],'csv').content;
assert.ok(csv.startsWith('\uFEFF')); assert.ok(csv.includes('"\'=1+1\n""تفاح"""'));
const before=events.length;listeners.storage({key:'another-site-key'});assert.equal(events.length,before);
listeners.storage({key:'foodRecords'});assert.equal(events.at(-1).detail.key,'foodRecords');
listeners.storage({key:null});assert.equal(events.at(-1).detail.key,null);
assert.equal(api.removeRecord('foodRecords',food).code,'missing');
console.log('PASS: legacy records, zero age, validation, corruption preservation/raw backup, blocked reads, failed writes/deletes, capacity without truncation, JSON/CSV exports, formula safety, owned keys and cross-tab notifications.');
