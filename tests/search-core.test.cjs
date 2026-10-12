// Run with: node --test tests/search-core.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {}, location: { pathname: '/ri3aya/pages/search.html' }, URLSearchParams };
vm.runInNewContext(fs.readFileSync('js/search-core.js', 'utf8'), context);
const search = context.window.Ri3ayaSearch;
const sample = [
  {title:'النوم الآمن',keywords:'نوم رضيع',url:'pages/sleep.html',section:'النوم',type:'guide',topics:['sleep'],age_scope:'range',age_min_months:0,age_max_months:12},
  {title:'النوم الآمن',keywords:'نوم رضيع',url:'pages/sleep.html',section:'النوم',type:'guide',topics:['sleep'],age_scope:'range',age_min_months:0,age_max_months:12},
  {title:'متابعة اللقاح',keywords:'تلقيح تطعيمات',url:'pages/vaccine.html',section:'التلقيح',type:'tool',topics:['vaccine'],age_scope:'general'},
  {title:'التغذية',keywords:'غذاء',url:'pages/nutrition.html',section:'التغذية',type:'article',topics:['nutrition'],age_scope:'range',age_min_months:6,age_max_months:24}
];
const state = (q='',age='',topic='all',type='all') => ({q,age,topic,type});
test('Arabic aliases including normalized taa marbuta', () => {
  assert.equal(search.filter(sample,state('غذاء')).length,1);
  assert.equal(search.filter(sample,state('تغذية')).length,1);
  assert.equal(search.filter(sample,state('تطعيم')).length,1);
  assert.equal(search.filter(sample,state('اللقاح')).length,1);
});
test('duplicates are removed by destination URL',()=> assert.equal(search.filter(sample,state('النوم')).length,1));
test('age filters exclude content without explicit age range',()=> {
  assert.equal(search.filter(sample,state('',3)).length,1);
  assert.equal(search.filter(sample,state('',7)).length,2);
});
test('topic and type filters combine',()=> {
  const found=search.filter(sample,state('', '', 'vaccine','tool'));
  assert.equal(found.length,1);
  assert.equal(found[0].url,'pages/vaccine.html');
});
test('empty result, reset, and valid query parameters',()=> {
  assert.equal(search.filter(sample,state('كلمةغيرموجودة')).length,0);
  assert.equal(search.filter(sample,state()).length,3);
  assert.equal(search.parseState('?age=90&topic=bogus&type=tool').age,'');
  assert.equal(search.parseState('?age=90&topic=bogus&type=tool').topic,'all');
});
