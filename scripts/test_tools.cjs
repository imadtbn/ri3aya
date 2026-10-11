'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = require('node:path').resolve(__dirname, '..');
const code = file => fs.readFileSync(root + '/' + file, 'utf8');
const routineContext = { window: {}, document: { addEventListener() {} } };
vm.runInNewContext(code('js/tools/routine.js'), routineContext);
const routine = routineContext.window.Ri3ayaRoutine;
assert.equal(routine.formatTime(0), '00:00');
assert.equal(routine.formatTime(12), '12:00');
assert.equal(routine.formatTime(23.75), '23:45');
assert.equal(routine.formatTime(25), '01:00 (+1 يوم)');
for (const age of ['0-3', '4-6', '7-9', '10-12', '13-18', '19-24']) {
    for (let naps = 1; naps <= 4; naps++) {
        const plan = routine.createRoutine(age, 23.75, naps, 'breast', ['outdoor', 'reading', 'music', 'bath', 'massage', 'bath']);
        assert.equal(plan.schedule.filter(s => s.activity.startsWith('قيلولة')).length, naps);
        assert.equal(plan.schedule.length, 2 + naps + 5);
        assert.ok(plan.schedule.some(s => s.time.includes('(+1 يوم)')));
        assert.ok(plan.schedule.every(s => !s.time.startsWith('24:')));
    }
}
assert.throws(() => routine.createRoutine('0-3', 24, 3, 'breast', []));
assert.throws(() => routine.createRoutine('bad', 7, 3, 'breast', []));
assert.throws(() => routine.createRoutine('0-3', 7, 0, 'breast', []));
const chooserContext = { window: {}, document: { addEventListener() {} } };
vm.runInNewContext(code('js/tools-index.js'), chooserContext);
const match = chooserContext.window.Ri3ayaTools.matches;
const tool = { text: 'متابعة النمو والقياسات', goal: 'followup', maxAge: 24 };
assert.equal(match(tool, { query: 'النمو القياسات', age: 0, goal: 'followup' }, s => s), true);
assert.equal(match(tool, { query: '', age: 25, goal: 'all' }, s => s), false);
assert.equal(match(tool, { query: '', age: 0, goal: 'organize' }, s => s), false);
assert.equal(match({ ...tool, maxAge: null }, { query: '', age: 36, goal: 'all' }, s => s), true);

function engine({ failManifest = false, failDataset = false, hold = false } = {}) {
    const calls = new Map(), pending = [];
    const context = { window: {}, fetch: async url => {
        calls.set(url, (calls.get(url) || 0) + 1);
        if (url.endsWith('manifest.json') && failManifest) { failManifest = false; throw Error('network unavailable'); }
        if (url.includes('boys-weight-for-age.csv') && failDataset) { failDataset = false; throw Error('dataset unavailable'); }
        if (hold && !url.endsWith('manifest.json')) await new Promise(resolve => pending.push(resolve));
        const file = root + '/' + url.replace(/^\.\.\//, '');
        return { ok: true, json: async () => JSON.parse(fs.readFileSync(file, 'utf8')), text: async () => fs.readFileSync(file, 'utf8') };
    }};
    vm.runInNewContext(code('js/medical/growth-engine.js'), context);
    return { api: context.window.Ri3ayaGrowth, calls, pending };
}
(async () => {
    const params = { sex: 'male', ageMonths: 3, weight: 6.5, length: 65, head: 42.5 };
    let e = engine({ failManifest: true });
    await assert.rejects(e.api.load());
    await e.api.load();
    assert.equal([...e.calls.values()][0], 2, 'Manifest failure must be retryable');
    e = engine({ failDataset: true });
    await assert.rejects(e.api.assess(params));
    const recovered = await e.api.assess(params);
    assert.equal(recovered.results.length, 4);
    assert.equal(e.calls.get('../content/medical/growth/who-lms/boys-weight-for-age.csv'), 2);
    const before = [...e.calls.values()].reduce((a, b) => a + b, 0);
    await e.api.assess(params);
    assert.equal([...e.calls.values()].reduce((a, b) => a + b, 0), before, 'Successful data reused without refetch');
    assert.equal(recovered.sex, 'male');
    assert.deepEqual(Array.from(recovered.results, r => r.key), ['weightForAge', 'lengthForAge', 'headCircumferenceForAge', 'weightForLength']);
    assert.equal(e.api.zScore(10, { L: 1, M: 10, S: .1 }), 0);
    assert.ok(Math.abs(e.api.percentile(0) - 50) < .001);
    await assert.rejects(e.api.assess({ ...params, weight: -1 }));
    await assert.rejects(e.api.assess({ ...params, ageMonths: 25 }));
    await assert.rejects(e.api.assess({ ...params, weight: 0, length: 0, head: 0 }));
    e = engine({ hold: true });
    await e.api.load();
    const task = e.api.assess(params);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(e.pending.length, 4, 'Four independent reference requests start concurrently');
    e.pending.forEach(resolve => resolve());
    assert.equal((await task).results.length, 4);
    console.log('PASS: routine choices across six ages, selected activities/naps, midnight rollover, tool eligibility, growth retry/caching/concurrent reference loading, validation and stable indicator order.');
})().catch(error => { console.error(error); process.exitCode = 1; });
