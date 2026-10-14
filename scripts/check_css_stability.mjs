/** No-dependency CSS stability checks. Run: node scripts/check_css_stability.mjs */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const htmlFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
});
const files = [path.join(root, 'index.html'), ...htmlFiles(path.join(root, 'pages'))];
const referencedCSS = new Set();
for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    assert.match(source, /<body\b[^>]*\bsite-shell\b/i, 'Missing shared shell: ' + file);
    const links = source.match(/<link\b[^>]*>/gi) || [];
    const styles = links.filter(tag => /\brel=["']stylesheet["']/i.test(tag))
        .map(tag => tag.match(/\bhref=["']([^"']+)["']/i)?.[1]).filter(Boolean);
    for (const href of styles) {
        if (/^(https?:)?\/\//.test(href)) continue;
        const local = path.resolve(path.dirname(file), href.split('?')[0]);
        assert.ok(local.startsWith(root + path.sep), 'CSS path escapes root: ' + href);
        assert.ok(fs.existsSync(local), 'Missing CSS: ' + path.relative(root, file) + ' -> ' + href);
        referencedCSS.add(path.relative(root, local).split(path.sep).join('/'));
    }
    const header = source.match(/<header\b[^>]*class=["'][^"']*site-header[^"']*["'][^>]*data-layout=["']shared-v2["']/i);
    const footer = source.match(/<footer\b[^>]*class=["'][^"']*site-footer[^"']*["'][^>]*data-layout=["']shared-v2["']/i);
    assert.ok(header && footer, 'Missing shared header/footer: ' + file);
    assert.match(source, /class=["'][^"']*site-hero\b/i, 'Missing shared hero: ' + file);
    assert.match(source, /class=["'][^"']*mobile-menu-btn\b/i, 'Missing mobile menu button: ' + file);
    assert.match(source, /id=["']primary-navigation["']/i, 'Missing navigation target: ' + file);
    assert.match(source, /id=["']site-search["']/i, 'Missing shared search: ' + file);
    const shared = styles.findIndex(s => s.includes('site-polish.css'));
    assert.ok(shared !== -1, 'Shared stylesheet absent: ' + file);
    const main = styles.findIndex(s => /(^|\/)main\.css$/.test(s));
    assert.ok(main !== -1 && main < shared, 'Main CSS loading order invalid: ' + file);
}
const stable = read('css/site-polish.css');
assert.ok(stable.includes('body.sections-page .sections-grid > .section-card'), 'Sections specificity fix missing');
assert.ok(!stable.includes('.site-shell .sections-grid .section-card { display: block; padding: 28px;'), 'Global section padding has regressed');
assert.ok(!stable.includes('.site-shell .back-to-top > i { display: none; }'), 'Back-to-top icon hidden');
assert.ok(stable.includes('.content-wrapper.preserve-legacy-layout'), 'Legacy layout fix missing');
assert.match(stable, /\.content-wrapper\.preserve-legacy-layout\s*\{\s*display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+280px;/, 'Guide layout must reserve a narrow fixed sidebar');
assert.ok(!stable.includes('flex: 2 1 0;'), 'Expandable guide columns would squeeze the main article again');
assert.ok(!stable.includes('flex: 1 1 300px;'), 'Sidebar must not consume half the article width');
for (const p of ['pages/nutrition.html', 'pages/crying.html']) {
    assert.match(read(p), /class="content-wrapper preserve-legacy-layout"/, 'Page layout marker missing: ' + p);
}
console.log('PASS: ' + files.length + ' HTML pages and ' + referencedCSS.size + ' local CSS files checked; no missing CSS links.');
assert.match(stable, /Stage 02: shared component and small-screen stability/, 'Missing stage 02 component styles');

assert.ok(stable.includes('--care-ink: #111111;'), 'Near-black text theme is missing');
assert.ok(stable.includes('--care-muted: #303030;'), 'Readable secondary-text color is missing');
assert.ok(stable.includes("--font-primary: 'Tajawal'"), 'Tajawal body font is missing');
assert.ok(stable.includes("--font-secondary: 'Cairo'"), 'Cairo heading font is missing');

assert.ok(stable.includes('Content-card spacing repair (2026-10-12)'), 'Textual section-card spacing patch missing');
assert.ok(stable.includes('main :where(section > .section-card)'), 'Card padding must stay scoped to textual sections');
assert.ok(!stable.includes('.site-shell main .section-card { padding:'), 'Never apply padding directly to all image and text cards');
assert.ok(stable.includes('.site-header[data-layout="shared-v2"] .site-nav'), 'Mobile overlay CSS missing');
assert.ok(stable.includes('.site-footer[data-layout="shared-v2"] .site-footer-grid'), 'Responsive footer CSS missing');
assert.ok(!stable.includes('.site-shell main .section-card { padding: 20px; }'), 'Broad mobile card padding returned');
const mainJs = read('js/main.js');
assert.ok(mainJs.includes('initNavigationIcons();'), 'Navigation icon initialization missing');
assert.ok(mainJs.includes("bars.appendChild(document.createElement('span'))"), 'Three-line toggle missing');
assert.ok(mainJs.includes("button.setAttribute('aria-expanded', String(open))"), 'Menu ARIA state missing');
assert.ok(!mainJs.includes('button.textContent = open ?'), 'Menu state must preserve animated bars');
assert.ok(mainJs.includes("if (!open) {"), 'Closing mobile menu must reset dropdown state');
console.log('PASS: shared components, CSS order, mobile nav state, and stage-01/02 regression guards.');

assert.ok(stable.includes('Semantic icons for the shared navigation'), 'Navigation theme styles missing');
assert.ok(stable.includes('Shared navigation overlay: isolated above on-page ad slots.'), 'Mobile overlay layering guard missing');
assert.ok(stable.includes('visibility: hidden;') && stable.includes('pointer-events: none;'), 'Closed mobile overlay should not intercept ad/page clicks');
assert.ok(mainJs.includes("classList.toggle('nav-open', open)"), 'Header overlay state is not synchronized');
assert.ok(!mainJs.includes('Close an open overlay when the underlying page scrolls.'), 'Scroll auto-close regression returned');
