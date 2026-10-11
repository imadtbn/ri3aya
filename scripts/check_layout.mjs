/** Browser acceptance checks. Install Playwright separately; no production dependency.
 * PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROMIUM_PATH=/path/to/chromium node scripts/check_layout.mjs
 * With standard Playwright installed: node scripts/check_layout.mjs
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function htmlPages(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? htmlPages(file) : file.endsWith('.html') ? [path.relative(root, file).split(path.sep).join('/')] : [];
    });
}
const pages = ['index.html', ...htmlPages(path.join(root, 'pages'))];
const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--no-zygote', '--single-process'] } : {}) });
    const context = await browser.newContext({ serviceWorkers: 'block' });
    // Deterministic local checks exclude external analytics, fonts and CDN libraries.
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}/`;
    for (const width of [360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const file of pages) {
            await page.goto(base + file, { waitUntil: 'load' });
            const layout = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, search: document.querySelector('.search-input').getBoundingClientRect().width }));
            assert.ok(layout.scroll <= width + 1, `${file} overflows at ${width}px: ${layout.scroll}`);
            assert.ok(layout.search > 0, `${file} search hidden at ${width}px`);
        }
    }
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(base + 'pages/tools/routine.html');
    const menu = page.locator('.mobile-menu-btn');
    await menu.click();
    await assert.doesNotReject(() => page.locator('.nav-menu').waitFor({ state: 'visible' }));
    await page.locator('.dropdown-toggle').click();
    await page.locator('.dropdown-toggle').press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.closest('.dropdown-menu')?.id), 'care-topics');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'mobile-menu-btn');
    const input = page.locator('.search-input');
    await input.fill('النَّوْم');
    await page.locator('.site-search-result').first().waitFor();
    assert.ok((await page.locator('.site-search-result').allTextContents()).some(text => text.includes('النوم')));
    const href = await page.locator('.site-search-result').first().getAttribute('href');
    assert.ok(href.startsWith('../../pages/'), 'Nested page search must resolve relative links');
    await input.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'site-search-result');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.site-search-results').isVisible(), false);
    await input.fill('كلمةلاوجودلها');
    await page.getByText('لم نجد نتائج. جربي كلمات مثل نوم أو تغذية.').waitFor();
    await input.fill('');
    await page.locator('.site-search-results').waitFor({ state: 'hidden' });
    // Delayed response must never reopen results after Escape.
    await context.route('**/search/index.json', async route => { await new Promise(resolve => setTimeout(resolve, 500)); await route.continue(); });
    await page.reload();
    await input.fill('نوم');
    await page.getByText('جارٍ البحث…').waitFor();
    await input.press('Escape');
    await page.waitForTimeout(650);
    assert.equal(await page.locator('.site-search-results').isVisible(), false);
    await page.goto(base + 'pages/blog.html');
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/articles/catalog.json'), 'utf8'));
    const published = catalog.articles.filter(article => article.publication_status === 'published');
    assert.equal(await page.locator('.library-card').count(), published.length);
    for (const category of ['nutrition', 'care', 'safety', 'all']) {
        await page.locator(`.library-filter[data-category="${category}"]`).click();
        assert.equal(await page.locator('.library-card:visible').count(), published.filter(a => category === 'all' || a.category === category).length);
    }
    await page.goto(base + 'pages/articles/first-foods.html');
    await input.fill('التكميلي');
    await page.locator('.site-search-result[href="../../pages/articles/first-foods.html"]').waitFor();
    await input.press('Escape');
    if (process.env.LAYOUT_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.LAYOUT_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, 'article-mobile.png'), fullPage: true });
        await page.goto(base + 'pages/blog.html');
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, 'library-desktop.png'), fullPage: true });
    }
    const staticContext = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: 'block' });
    await staticContext.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    const staticPage = await staticContext.newPage();
    await staticPage.goto(base + 'pages/blog.html');
    assert.equal(await staticPage.locator('.library-card:visible').count(), published.length);
    for (const article of published) {
        await staticPage.goto(base + `pages/articles/${article.slug}.html`);
        assert.equal(await staticPage.locator('.care-article').isVisible(), true);
        assert.ok((await staticPage.locator('.article-review-panel').textContent()).includes('لم تتم بعد'));
    }
    // Keep both contexts open until browser shutdown (single-process Chromium).
    assert.deepEqual(errors, [], 'Uncaught local JavaScript errors');
    console.log(`PASS: ${pages.length * 5} viewport checks, navigation, keyboard, Arabic search, nested article links, filtering, stale responses and static articles without JavaScript.`);
} finally {
    if (browser) await browser.close();
    server.close();
}
