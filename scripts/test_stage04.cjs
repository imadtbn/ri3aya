'use strict';
// Stage 04 executable unit checks with built-in Node modules, no browser/network needed.
// Run: node scripts/test_stage04.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const load = p => fs.readFileSync(path.join(root, p), 'utf8');
let checks = 0;
const check = (condition, label) => { assert.ok(condition, label); checks += 1; };

const searchWindow = {};
vm.runInNewContext(load('js/search-core.js'), {
    window: searchWindow, location: { pathname: '/ri3aya/pages/search.html' },
    URLSearchParams, fetch: async () => { throw new Error('no network in unit tests'); }
});
vm.runInNewContext(load('js/tools-index.js'), {
    window: searchWindow, document: { addEventListener() {} }
});
const engine = searchWindow.Ri3ayaSearch;
const chooser = searchWindow.Ri3ayaTools;
const indexed = [
    { title: 'جدول التلقيح', url: 'pages/vaccine.html', section: 'الصحة', keywords: 'لقاح', age_scope: 'range',
      age_min_months: 0, age_max_months: 12, type: 'guide', topics: ['vaccine'] },
    { title: 'النوم الآمن', url: 'pages/sleep.html', section: 'النوم', keywords: 'قيلولة', age_scope: 'range',
      age_min_months: 0, age_max_months: 36, type: 'article', topics: ['sleep'] }
];
check(engine.normalize('النَّوْم') === 'النوم', 'Arabic normalization');
check(engine.filter(indexed, { q: 'تطعيم', age: '3', topic: 'all', type: 'all' }).length === 1, 'Vaccine synonym');
check(engine.filter(indexed, { q: 'تطعيم', age: '13', topic: 'all', type: 'all' }).length === 0, 'Search age boundary');
check(engine.parseState('?q=نوم&age=90').age === '', 'Bad query-string age');
const tool = { goal: 'followup', maxAge: 24, text: 'النمو' };
for (const [age, result] of [[24, true], [25, false], [-1, false], [1.5, false], [37, false]]) {
    check(chooser.matches(tool, { goal: 'followup', age, query: 'نمو' }, engine.normalize) === result,
        'Tool suitability with age ' + age);
}

class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [2026, 9, 12, 8])); }
    static now() { return new Date(2026, 9, 12, 12).getTime(); }
}
let initVaccine, submitVaccine;
const vaccineNodes = new Map();
const mockElement = () => ({
    value: '', textContent: '', innerHTML: '', hidden: false, disabled: false, dataset: {},
    style: {}, children: [], classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {}, setAttribute() {}, append(...items) { this.children.push(...items); },
    appendChild(item) { this.children.push(item); }, replaceChildren(...items) { this.children = items; },
    scrollIntoView() {}, focus() {}, remove() {}, click() {}
});
const vaccineDoc = {
    addEventListener: (type, listener) => { if (type === 'DOMContentLoaded') initVaccine = listener; },
    querySelectorAll: () => [],
    createElement: () => mockElement(),
    getElementById: id => {
        if (!vaccineNodes.has(id)) vaccineNodes.set(id, mockElement());
        return vaccineNodes.get(id);
    }
};
const birthDay = vaccineDoc.getElementById('birth-day'), birthMonth = vaccineDoc.getElementById('birth-month'), birthYear = vaccineDoc.getElementById('birth-year');
birthDay.add = birthMonth.add = birthYear.add = function () {};
const vaccineForm = vaccineDoc.getElementById('vax-birth-form');
vaccineForm.addEventListener = (type, callback) => { if (type === 'submit') submitVaccine = callback; };
vaccineDoc.getElementById('birth-day').value = '';
vaccineDoc.getElementById('birth-month').value = '';
vaccineDoc.getElementById('birth-year').value = '';
const syncPromise = (value, error = null) => ({
    then(callback) {
        if (error) return syncPromise(undefined, error);
        try { return syncPromise(callback(value)); } catch (nextError) { return syncPromise(undefined, nextError); }
    },
    catch(callback) {
        if (!error) return this;
        try { return syncPromise(callback(error)); } catch (nextError) { return syncPromise(undefined, nextError); }
    }
});
vm.runInNewContext(load('js/vaccine.js'), {
    document: vaccineDoc, Date: FixedDate,
    Option: class { constructor(label, value) { this.label = label; this.value = value; } },
    fetch: () => syncPromise({ ok: true, json: () => JSON.parse(load('content/medical/vaccines/algeria.json')) }),
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    confirm: () => true
});
initVaccine();
check(typeof submitVaccine === 'function', 'Vaccine birth form submit handler');
for (const [value, expected] of [
    ['', 'اختاري يومًا وشهرًا وسنة صحيحة'],
    ['2026-10-13', 'اليوم أو قبله'],
    ['2026-02-30', 'اليوم أو قبله']
]) {
    const [y, m, d] = value ? value.split('-') : ['', '', ''];
    birthYear.value = y;
    birthMonth.value = m ? String(Number(m)) : '';
    birthDay.value = d ? String(Number(d)) : '';
    submitVaccine({ preventDefault() {} });
    check(vaccineDoc.getElementById('vax-form-message').textContent.includes(expected),
        'Vaccine calendar validation: ' + (value || 'empty'));
}
for (const [value, expected] of [
    ['2026-10-12', '0 شهر'],
    ['2026-09-12', '1 شهر'],
    ['2026-09-13', '0 شهر'],
    ['2024-10-12', '24 شهر']
]) {
    const [y, m, d] = value.split('-');
    birthYear.value = y;
    birthMonth.value = String(Number(m));
    birthDay.value = String(Number(d));
    submitVaccine({ preventDefault() {} });
    check(vaccineDoc.getElementById('vax-age').textContent.includes(expected),
        'Vaccine calendar calculation: ' + value);
}

// Food dates are validated in the user's local calendar before trying storage.
let initFood, clickFood, chooseReaction;
const foods = [], notices = [];
const foodName = { value: 'تفاح' }, foodDate = { value: '' };
const reaction = {
    classList: { add() {}, remove() {} },
    getAttribute() { return 'like'; },
    addEventListener(_, callback) { chooseReaction = callback; }
};
const foodDoc = {
    addEventListener(type, listener) { if (type === 'DOMContentLoaded') initFood = listener; },
    querySelectorAll(selector) { return selector === '.reaction-btn' ? [reaction] : []; },
    getElementById(id) {
        return ({
            trackFood: { addEventListener(_, callback) { clickFood = callback; } },
            newFood: foodName,
            foodDate: foodDate
        })[id] || null;
    },
    createElement() { return { classList: { add() {}, remove() {} }, setAttribute() {} }; },
    head: { appendChild() {} },
    body: { appendChild(node) { notices.push(node.textContent); } }
};
const foodWindow = {
    Ri3ayaLocal: { add(key, record) { foods.push({ key, record }); return { ok: true }; }, notify() {} },
    addEventListener() {}
};
vm.runInNewContext(load('js/nutrition.js'), {
    document: foodDoc, window: foodWindow, Date: FixedDate,
    setTimeout() { return 0; }, console
});
initFood();
chooseReaction.call(reaction);
for (const date of ['2099-01-01', '2026-02-30']) {
    foodName.value = 'تفاح';
    foodDate.value = date;
    clickFood();
    check(foods.length === 0, 'Rejected future/invalid food date: ' + date);
    check(foodName.value === 'تفاح', 'Retained invalid form for correction');
}
foodDate.value = '2026-10-12';
clickFood();
check(foods.length === 1 && foods[0].record.date === '2026-10-12', 'Accepted local current date');
check(notices.some(message => message.includes('حُفظ')), 'Successful food save message');
console.log('PASS: ' + checks + ' stage-04 calculation, query, age and food-date checks');
