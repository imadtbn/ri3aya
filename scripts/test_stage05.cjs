'use strict';
/** Stage 05 asset/advertising guards. Run: node scripts/test_stage05.cjs */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const source = read('js/site-tags.js');
function simulate(script, width) {
    const loaded = [];
    const shell = { hidden: true, attributes: {}, setAttribute(k,v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; } };
    const ins = {
        style: {}, dataset: {},
        getAttribute(k) { return k === 'data-ad-slot' ? 'xxxxxxxxx' : null; },
        closest() { return shell; },
        getBoundingClientRect() { return { width }; },
        parentElement: { getBoundingClientRect() { return { width }; } }
    };
    const document = {
        scripts: loaded,
        readyState: 'complete',
        querySelectorAll(sel) { return sel.includes('ins.adsbygoogle') ? [ins] : []; },
        createElement(name) {
            assert.equal(name, 'script');
            return { setAttribute(k,v) { this[k] = v; }, addEventListener() {} };
        },
        head: { appendChild(el) { loaded.push(el); } }
    };
    const window = { dataLayer: [], adsbygoogle: [], __ri3ayaSiteTags: null };
    vm.runInNewContext(script, { document, window, Date, encodeURIComponent });
    return { scripts: loaded.map(el => el.src), shell, ins, window };
}
const placeholder = simulate(source, 320);
assert.equal(placeholder.shell.hidden, true, 'Placeholder ads must stay hidden');
assert.equal(placeholder.scripts.some(src => src.includes('adsbygoogle.js')), false, 'Do not fetch AdSense with fake IDs');
assert.equal(placeholder.window.adsbygoogle.length, 0, 'No placeholder ad pushes');

const configured = source
    .replace("adsenseClient: 'xxxxxxxxx'", "adsenseClient: 'ca-pub-1234567890123456'")
    .replace("display: 'xxxxxxxxx'", "display: '1234567890'");
const good = simulate(configured, 320);
assert.equal(good.shell.hidden, false, 'Configured ad must be unhidden');
assert.ok(good.scripts.some(src => src.includes('adsbygoogle.js')), 'Configured AdSense script missing');
assert.equal(good.window.adsbygoogle.length, 1, 'Configured ad should be queued only once');
assert.equal(good.ins.dataset.adSlot, '1234567890');
const narrow = simulate(configured, 81);
assert.equal(narrow.shell.hidden, true, 'Tiny 81px slot must not be displayed');
assert.equal(narrow.window.adsbygoogle.length, 0, 'Never push into tiny ad slot');
assert.equal(narrow.scripts.some(src => src.includes('adsbygoogle.js')), false, 'Avoid ad request when no viable slot');

const worker = read('service-worker.js');
assert.match(worker, /CORE_URLS.*filter/);
assert.match(worker, /(?:html\|css\|js\|json\|csv)/);
assert.match(worker, /Math\.min\(5, optional\.length\)/);
assert.match(worker, /await Promise\.all\(workers\)/);
const pwaText = read('pwa/config.js');
const manifest = JSON.parse(pwaText.slice(pwaText.indexOf('=') + 1).replace(/;\s*$/, ''));
assert.ok(manifest.revision, 'Missing PWA revision');
assert.ok(Array.isArray(manifest.files) && manifest.files.length >= 100, 'Unexpectedly small offline bundle');
for (const file of manifest.files) assert.ok(fs.existsSync(path.join(root, file)), 'Missing PWA precache file: ' + file);
for (const required of ['index.html','offline.html','pages/nutrition.html','pages/growth.html','pages/search.html','search/index.json','content/medical/growth/manifest.json']) {
    assert.ok(manifest.files.includes(required), 'Critical offline file missing: '+required);
}
console.log('PASS: fake ad units hidden, configured ads can display at viable widths, narrow slots blocked.');
console.log('PASS: optional PWA image handling and ' + manifest.files.length + ' local precache references exist.');
