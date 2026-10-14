
'use strict';
/** Test configured two-slot AdSense delivery and existing offline guards. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const source = read('js/site-tags.js');
const client = 'ca-pub-5656416032906373';
assert.ok(source.includes("adsenseClient: '" + client + "'"));
assert.ok(source.includes("display: '3143411927'"));
assert.ok(source.includes("inFeed: '7867079394'"));

function simulate(width) {
    const loaded = [];
    const shells = [{}, {}];
    const slots = ['7867079394', '3143411927'];
    const units = slots.map((slot, index) => ({
        style: {},
        dataset: { siteAdKey: index === 0 ? 'inFeed' : 'display', adSlot: slot },
        getAttribute() { return null; },
        hasAttribute() { return false; },
        closest(selector) { return selector === '[data-site-ad-shell]' ? shells[index] : null; },
        getClientRects() { return [{ width }]; },
        getBoundingClientRect() { return { width }; }
    }));
    const document = {
        scripts: loaded,
        readyState: 'complete',
        querySelectorAll(selector) { return selector.includes('ins.adsbygoogle') ? units : []; },
        createElement() { return { setAttribute(k,v) { this[k] = v; }, addEventListener() {} }; },
        head: { appendChild(el) { loaded.push(el); } }
    };
    function IntersectionObserver(callback) {
        this.observe = unit => callback([{ target: unit, isIntersecting: true }]);
        this.unobserve = () => {};
    }
    const window = { dataLayer: [], adsbygoogle: [], IntersectionObserver };
    vm.runInNewContext(source, { document, window, Date, encodeURIComponent, IntersectionObserver, console });
    return { loaded: loaded.filter(el => (el.src || '').includes('adsbygoogle.js')), units, window };
}
const good = simulate(320);
assert.equal(good.loaded.length, 1, 'AdSense must load once');
assert.equal(good.window.adsbygoogle.length, 2, 'Two viable ad units must be queued');
assert.deepEqual(good.units.map(unit => unit.dataset.adSlot), ['7867079394', '3143411927']);
const narrow = simulate(81);
assert.equal(narrow.loaded.length, 0, 'No ad request in an 81px slot');
assert.equal(narrow.window.adsbygoogle.length, 0, 'No push in an 81px slot');

const htmlPages = [path.join(root, 'index.html')];
function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const item = path.join(dir, entry.name);
        if (entry.isDirectory()) collect(item);
        else if (entry.name.endsWith('.html')) htmlPages.push(item);
    }
}
collect(path.join(root, 'pages'));
for (const file of htmlPages) {
    const html = fs.readFileSync(file, 'utf8');
    assert.equal((html.match(/<ins class="adsbygoogle"/g) || []).length, 2, file + ': two ads required');
    assert.match(html, /data-ad-slot="7867079394"/, file + ': in-feed missing');
    assert.match(html, /data-ad-slot="3143411927"/, file + ': display missing');
    assert.ok(!/data-site-ad-shell hidden/.test(html), file + ': configured shell is hidden');
}
assert.match(read('css/accessibility.css'), /site-ad--display/);
console.log('PASS: ' + htmlPages.length + ' public pages have exactly 2 static ad reserves; one loader, mobile width guard.');

const worker = read('service-worker.js');
assert.match(worker, /CORE_URLS.*filter/);
assert.match(worker, /(?:html\|css\|js\|json\|csv)/);
assert.match(worker, /Math\.min\(5, optional\.length\)/);
assert.match(worker, /await Promise\.all\(workers\)/);
assert.ok(worker.includes('index += 12'), 'Critical downloads must be bounded');
assert.ok(worker.includes('optimized'), 'Alternate image sizes should be deferred');
assert.ok(worker.includes('cache.put(url.href, response.clone())'), 'On-demand images must be stored after visit');
const pwaText = read('pwa/config.js');
const manifest = JSON.parse(pwaText.slice(pwaText.indexOf('=') + 1).replace(/;\s*$/, ''));
assert.ok(manifest.revision, 'Missing PWA revision');
assert.ok(Array.isArray(manifest.files) && manifest.files.length >= 100, 'Unexpectedly small offline bundle');
for (const file of manifest.files) assert.ok(fs.existsSync(path.join(root, file)), 'Missing PWA precache file: ' + file);
for (const required of ['index.html','offline.html','pages/nutrition.html','pages/growth.html','pages/search.html','search/index.json','content/medical/growth/manifest.json']) {
    assert.ok(manifest.files.includes(required), 'Critical offline file missing: '+required);
}
console.log('PASS: configured AdSense units are responsive; narrow slots are not initialized.');
console.log('PASS: optional PWA image handling and ' + manifest.files.length + ' local precache references exist.');
