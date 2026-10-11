/* Behavioral checks using published content and explicit age metadata. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = { window: {}, location: { pathname: '/ri3aya/pages/search.html' }, URLSearchParams };
vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(root, 'js/search-core.js'), 'utf8'), context);
const engine = context.window.Ri3ayaSearch;
const index = JSON.parse(fs.readFileSync(path.join(root, 'search/index.json'), 'utf8'));
const items = index.items;
const defaults = { q: '', age: '', topic: 'all', type: 'all' };
const urls = state => engine.filter(items, { ...defaults, ...state }).map(item => item.url);
assert.equal(index.schema_version, 4);
assert.ok(urls({ q: 'النَّوْم' }).includes('pages/articles/safe-sleep.html'));
assert.ok(urls({ q: 'الطعام التكميلي' }).includes('pages/articles/first-foods.html'));
assert.ok(urls({ q: 'تطعيم' }).includes('pages/vaccine.html'));
assert.ok(urls({ q: 'حفاظات' }).includes('pages/articles/diaper-care.html'));
assert.ok(!urls({ age: '0' }).includes('pages/articles/first-foods.html'));
assert.ok(urls({ age: '6', topic: 'nutrition', type: 'article' }).includes('pages/articles/first-foods.html'));
assert.ok(!urls({ age: '0' }).includes('pages/nutrition.html'), 'Unspecified age must not masquerade as infant suitability');
assert.equal(urls({ age: '36', type: 'article' }).join(','), 'pages/articles/diaper-care.html');
assert.ok(urls({ age: '24', type: 'tool' }).includes('pages/tools/routine.html'));
assert.equal(urls({ age: '25', type: 'tool' }).length, 0);
assert.equal(urls({ age: '2', topic: 'nutrition', type: 'article' }).length, 0);
assert.equal(urls({ q: 'كلمةلاوجودلها' }).length, 0);
assert.equal(urls({ q: '!!!' }).length, 0);
assert.ok(!urls({}).includes('pages/privacy.html'));
assert.ok(urls({ type: 'page' }).includes('pages/privacy.html'));
const parsed = engine.parseState('?q=%D9%86%D9%88%D9%85&age=0&topic=sleep&type=article');
assert.equal(engine.paramsFor(parsed).get('age'), '0');
assert.equal(parsed.topic, 'sleep');
const invalid = engine.parseState('?age=-1&topic=invalid&type=invalid');
assert.equal(invalid.age, ''); assert.equal(invalid.topic, 'all'); assert.equal(invalid.type, 'all');
assert.equal(engine.parseState('?age=37').age, '');
for (const [pathname, expected] of [['/ri3aya/index.html', ''], ['/ri3aya/pages/search.html', '../'], ['/ri3aya/pages/articles/safe-sleep.html', '../../']]) {
    context.location.pathname = pathname; assert.equal(engine.rootPath(), expected);
}
for (const item of items) {
    assert.ok(fs.existsSync(path.join(root, item.url)), `Broken result: ${item.url}`);
    assert.ok(['article', 'guide', 'tool', 'page'].includes(item.type));
    assert.ok(Array.isArray(item.topics));
    if (item.age_scope === 'range') assert.ok(item.age_min_months >= 0 && item.age_max_months <= 36 && item.age_max_months >= item.age_min_months);
}
console.log('PASS: Arabic variants, multiple words, terminology, age boundaries including zero, general-content exclusion, type/topic combinations, empty matches, URL validation and nested paths.');
