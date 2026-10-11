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
    for (const width of [320, 360, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const file of pages) {
            await page.goto(base + file, { waitUntil: 'load' });
            const layout = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, search: document.querySelector('.search-input').getBoundingClientRect().width }));
            assert.ok(layout.scroll <= width + 1, `${file} overflows at ${width}px: ${layout.scroll}`);
            assert.ok(layout.search > 0, `${file} search hidden at ${width}px`);
            // Notes contain prose, not a two-column icon/content grid. A page
            // can pass the overflow check while a source link collapses to 10px.
            for (const note of await page.locator('main .medical-safety-note').all()) {
                const metrics = await note.evaluate(el => {
                    const box = el.getBoundingClientRect();
                    return { display: getComputedStyle(el).display, width: box.width,
                        paragraphs: [...el.children].filter(e => e.tagName === 'P').map(e => e.getBoundingClientRect().width),
                        overflow: el.scrollWidth > el.clientWidth + 1 };
                });
                assert.equal(metrics.display, 'block', `${file}: prose note must flow vertically`);
                assert.equal(metrics.overflow, false, `${file}: note overflows at ${width}px`);
                assert.ok(metrics.paragraphs.every(w => w >= metrics.width * .65), `${file}: cramped note paragraphs at ${width}px`);
            }
            for (const table of await page.locator('main table').all()) {
                assert.equal(await table.locator('..').getAttribute('tabindex'), '0', `${file}: table needs keyboard scrolling`);
                assert.equal(await table.locator('..').getAttribute('role'), 'region');
            }
        }
    }
    // Readability with enlarged text and long source links on a narrow screen.
    await page.setViewportSize({ width: 360, height: 900 });
    for (const file of ['pages/vaccine.html', 'pages/resources.html', 'pages/contact.html', 'pages/crying.html']) {
        await page.goto(base + file);
        await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
        for (const note of await page.locator('main .medical-safety-note').all()) {
            assert.equal(await note.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true, `${file}: enlarged note clipped`);
        }
    }
    await page.goto(base + 'pages/diapers.html');
    const tableRegion = page.locator('.size-table-container');
    await tableRegion.focus();
    const beforeScroll = await tableRegion.evaluate(el => el.scrollLeft);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    assert.notEqual(await tableRegion.evaluate(el => el.scrollLeft), beforeScroll, 'Wide table must scroll with the keyboard in RTL');
    if (process.env.LAYOUT_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.LAYOUT_SCREENSHOT_DIR, { recursive: true });
        for (const width of [360, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            for (const file of ['vaccine', 'resources']) {
                await page.goto(base + `pages/${file}.html`);
                const target = page.locator(file === 'vaccine' ? 'section.vaccine-schedule' : '#resources');
                await target.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, `${file}-${width}.png`) });
            }
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
    // A native header submission opens the full search from a nested article.
    await input.fill('نوم');
    await input.press('Enter');
    await page.waitForURL('**/pages/search.html?q=*');
    await page.locator('.search-result-card').first().waitFor();
    assert.equal(new URL(page.url()).searchParams.get('q'), 'نوم');
    await page.goto(base + 'pages/search.html');
    await page.locator('.search-result-card').first().waitFor();
    const index = JSON.parse(fs.readFileSync(path.join(root, 'search/index.json'), 'utf8'));
    const discoverable = index.items.filter(item => item.type !== 'page').length;
    assert.equal(await page.locator('.search-result-card').count(), Math.min(8, discoverable));
    await page.locator('#discovery-more').click();
    assert.equal(await page.locator('.search-result-card').count(), Math.min(16, discoverable));
    const fullAge = page.locator('#discovery-age');
    await fullAge.fill('0'); await fullAge.press('Tab');
    await page.locator('#discovery-type').selectOption('article');
    await page.waitForFunction(() => document.querySelector('#discovery-results').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.search-result-card').count(), 4);
    await page.locator('#discovery-topic').selectOption('nutrition');
    await page.locator('#discovery-empty').waitFor({ state: 'visible' });
    await fullAge.fill('6'); await fullAge.press('Tab');
    await page.locator('.search-result-card').first().waitFor();
    assert.equal(await page.locator('.search-result-card').count(), 1);
    assert.ok((await page.locator('.search-result-card').textContent()).includes('الطعام التكميلي'));
    const sharedURL = page.url();
    assert.equal(new URL(sharedURL).searchParams.get('age'), '6');
    await page.reload();
    await page.locator('.search-result-card').first().waitFor();
    assert.equal(await fullAge.inputValue(), '6');
    assert.equal(await page.locator('#discovery-topic').inputValue(), 'nutrition');
    await page.locator('#discovery-topic').selectOption('sleep');
    await page.waitForFunction(() => document.querySelector('#discovery-results').getAttribute('aria-busy') === 'false');
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('#discovery-topic').value === 'nutrition' && document.querySelector('#discovery-results').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.search-result-card').count(), 1);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.copiedSearchURL = value; } } }));
    await page.locator('#discovery-copy').click();
    await page.getByText('تم نسخ رابط البحث والفلاتر.').waitFor();
    assert.equal(new URL(await page.evaluate(() => window.copiedSearchURL)).searchParams.get('age'), '6');
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
    await page.locator('#discovery-copy').click();
    await page.locator('#discovery-copy-fallback').waitFor({ state: 'visible' });
    assert.equal(new URL(await page.locator('#discovery-share-link').inputValue()).searchParams.get('topic'), 'nutrition');
    // Library restores all three filters and can clear them without losing cards.
    await page.goto(base + 'pages/blog.html?q=طعام&age=6&topic=nutrition');
    await page.waitForFunction(() => document.querySelector('#library-query').value === 'طعام');
    assert.equal(await page.locator('.library-card:visible').count(), 1);
    await page.locator('#library-reset').click();
    assert.equal(await page.locator('.library-card:visible').count(), 5);
    assert.equal(new URL(page.url()).search, '');
    // A failed index can be retried; latest filters win while its response is delayed.
    const failIndex = route => route.abort();
    await context.route('**/search/index.json', failIndex);
    await page.goto(base + 'pages/search.html');
    await page.locator('#discovery-error').waitFor({ state: 'visible' });
    await context.unroute('**/search/index.json', failIndex);
    await page.locator('#discovery-retry').click();
    await fullAge.fill('0'); await fullAge.press('Tab');
    await fullAge.fill('6'); await fullAge.press('Tab');
    await page.locator('#discovery-topic').selectOption('nutrition');
    await page.locator('#discovery-type').selectOption('article');
    await page.waitForFunction(() => document.querySelector('#discovery-results').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.search-result-card').count(), 1);
    assert.equal(await page.locator('#discovery-error').isVisible(), false);
    await page.goto(base + 'pages/search.html?age=-1&topic=unknown&type=unknown');
    await page.locator('.search-result-card').first().waitFor();
    assert.equal(await fullAge.inputValue(), '');
    assert.equal(new URL(page.url()).search, '');
    if (process.env.LAYOUT_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.LAYOUT_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, 'search-mobile.png'), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, 'search-desktop.png'), fullPage: true });
    }
    if (process.env.LAYOUT_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.LAYOUT_SCREENSHOT_DIR, { recursive: true });
        await page.setViewportSize({ width: 390, height: 900 });
        await page.goto(base + 'pages/articles/first-foods.html');
        await page.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, 'article-mobile.png'), fullPage: true });
        await page.goto(base + 'pages/blog.html');
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: path.join(process.env.LAYOUT_SCREENSHOT_DIR, 'library-desktop.png'), fullPage: true });
    }
    // Phase 5: real persistence, downloads, confirmed deletions and storage failures.
    await page.goto(base + 'pages/tools.html');
    const fixtures = {
        foodRecords: Array.from({ length: 23 }, (_, i) => ({ id: i, food: 'تفاح ' + i, date: '2026-10-11', reaction: 'like', timestamp: i })),
        symptomRecords: Array.from({ length: 12 }, (_, i) => ({ id: i, date: '11 أكتوبر', disorder: 'gas', severity: 'mild', duration: '2 ساعة', timestamp: i })),
        'ri3aya-growth-tracker': [{ date: '2026-10-11', age: 0, sex: 'female', weight: 3.5, height: '', head: '', notes: '<img src=x onerror=alert(1)>' }]
    };
    await page.evaluate(fixtures => { for (const [k,v] of Object.entries(fixtures)) localStorage.setItem(k, JSON.stringify(v)); localStorage.setItem('unrelated-test-data', 'keep'); }, fixtures);
    await page.reload();
    assert.ok((await page.locator('#local-data-list').textContent()).includes('23 سجل'));
    assert.ok((await page.locator('#local-data-list').textContent()).includes('12 سجل'));
    await page.goto(base + 'pages/nutrition.html');
    assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 23, 'Do not truncate legacy food records');
    await page.locator('#newFood').fill('<img src=x onerror=alert(1)>');
    await page.locator('#foodDate').fill('2026-10-11');
    await page.locator('.reaction-btn[data-reaction="like"]').click();
    await page.locator('#trackFood').click();
    assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 24);
    assert.equal(await page.locator('#foodHistory img').count(), 0, 'Record content is literal text');
    await page.reload(); assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 24);
    const foodDownload = page.waitForEvent('download');
    await page.locator('#local-data-panel').getByRole('button', { name: 'تصدير JSON', exact: true }).click();
    const foodFile = await foodDownload;
    const foodBackup = JSON.parse(fs.readFileSync(await foodFile.path(), 'utf8'));
    assert.equal(foodBackup.records.foodRecords.length, 24);
    assert.equal(foodBackup.records.foodRecords[0].food, '<img src=x onerror=alert(1)>');
    const csvDownload = page.waitForEvent('download');
    await page.locator('#local-data-panel').getByRole('button', { name: 'تصدير CSV', exact: true }).click();
    const csvFile = await csvDownload; assert.ok(fs.readFileSync(await csvFile.path(), 'utf8').includes('تفاح 0'));
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#foodHistory .delete-record').first().click(); assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 24);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#foodHistory .delete-record').first().click(); assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 23);
    await page.evaluate(() => { window.savedSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(k,v) { if (k === 'foodRecords') throw new DOMException('full', 'QuotaExceededError'); return window.savedSetItem.call(this,k,v); }; });
    await page.locator('#newFood').fill('حفظ متعذر'); await page.locator('#foodDate').fill('2026-10-11'); await page.locator('.reaction-btn[data-reaction="like"]').click();
    await page.locator('#trackFood').click();
    assert.equal(await page.locator('#newFood').inputValue(), 'حفظ متعذر');
    assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 23);
    assert.ok((await page.locator('#local-data-message').textContent()).includes('تعذر الحفظ'));
    await page.evaluate(() => { Storage.prototype.setItem = window.savedSetItem; });
    // Another tab updates the active history rather than overwriting a cached array.
    const second = await context.newPage(); await second.goto(base + 'pages/tools.html');
    await second.evaluate(() => window.Ri3ayaLocal.add('foodRecords', { food: 'موز من نافذة أخرى', date:'2026-10-11',reaction:'neutral'}));
    await page.locator('#foodHistory .tracker-history-item').filter({ hasText: 'موز من نافذة أخرى' }).waitFor();
    assert.equal(await page.locator('#foodHistory .tracker-history-item').count(), 24);
    await page.goto(base + 'pages/digestive.html'); assert.equal(await page.locator('#symptomHistory .tracker-history-item').count(), 12);
    await page.locator('#disorderType').selectOption('gas'); await page.locator('#symptomSeverity').selectOption('mild'); await page.locator('#symptomDuration').fill('2'); await page.locator('#trackSymptom').click();
    assert.equal(await page.locator('#symptomHistory .tracker-history-item').count(), 13);
    await page.goto(base + 'pages/growth.html');
    assert.equal(await page.locator('#tracker-body .tracker-delete').count(), 1); assert.equal(await page.locator('#tracker-body img').count(), 0);
    await page.locator('#track-age').fill('0'); await page.locator('#track-date').fill('2026-10-11'); await page.locator('#track-weight').fill('3.5'); await page.locator('#track-sex').selectOption('female'); await page.locator('#track-notes').fill('قياس جديد');
    await page.locator('#add-measurement').click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('ri3aya-growth-tracker')).length === 2);
    const measurement = await page.evaluate(() => JSON.parse(localStorage.getItem('ri3aya-growth-tracker'))[0]);
    assert.equal(measurement.age, 0); assert.equal(measurement.sex, 'female'); assert.ok(measurement.reference.version); assert.ok(measurement.results.length);
    page.once('dialog', dialog => dialog.accept()); await page.locator('#tracker-body .tracker-delete').first().click(); assert.equal(await page.locator('#tracker-body .tracker-delete').count(), 1);
    await page.goto(base + 'pages/tools/routine.html'); await page.locator('#generate-routine').click();
    page.once('dialog', dialog => dialog.accept('روتين <img src=x onerror=alert(1)>'));
    await page.locator('#save-routine').click(); assert.equal(await page.locator('.saved-routine-card').count(), 1);
    await page.reload(); assert.equal(await page.locator('.saved-routine-card').count(), 1); assert.equal(await page.locator('.saved-routine-card img').count(), 0);
    await page.locator('.saved-routine-card').getByRole('button', { name: 'عرض الروتين', exact: true }).click(); assert.equal(await page.locator('.routine-card').count(), 1);
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable:true, value: { writeText: () => Promise.reject(new Error('denied')) } }));
    await page.locator('#share-routine').click(); await page.locator('#routine-share-copy').waitFor(); assert.ok((await page.locator('#routine-share-copy').inputValue()).includes('روتين'));
    await page.goto(base + 'pages/tools.html');
    const allDownload = page.waitForEvent('download'); await page.locator('#local-export-all').click();
    const allFile = await allDownload; assert.equal(await page.evaluate(() => document.activeElement.id), 'local-export-all'); const allBackup = JSON.parse(fs.readFileSync(await allFile.path(), 'utf8')); assert.equal(Object.keys(allBackup.records).length, 4); assert.equal(allBackup.records.saved_routines.length, 1);
    if (process.env.LAYOUT_SCREENSHOT_DIR) {
        await page.evaluate(() => document.activeElement?.blur());
        await page.setViewportSize({width:390,height:900}); await page.locator('#local-data-panel').screenshot({path:path.join(process.env.LAYOUT_SCREENSHOT_DIR,'local-data-mobile.png')});
        await page.setViewportSize({width:1440,height:1000}); await page.locator('#local-data-panel').screenshot({path:path.join(process.env.LAYOUT_SCREENSHOT_DIR,'local-data-desktop.png')});
    }
    page.once('dialog', dialog => dialog.dismiss()); await page.locator('#local-delete-all').click(); assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('saved_routines')).length), 1);
    page.once('dialog', dialog => dialog.accept()); await page.locator('#local-delete-all').click();
    assert.equal(await page.evaluate(() => ['foodRecords','symptomRecords','ri3aya-growth-tracker','saved_routines'].every(k => localStorage.getItem(k) === null)), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('unrelated-test-data')), 'keep');
    // Corrupt payload is retained, with an explicit raw backup instead of an invented empty record set.
    await page.evaluate(() => localStorage.setItem('foodRecords','{broken'));
    await page.goto(base + 'pages/nutrition.html'); assert.ok((await page.locator('#foodHistory').textContent()).includes('غير قابلة للقراءة'));
    assert.equal(await page.locator('#local-data-panel').getByRole('button',{name:'تصدير JSON',exact:true}).isDisabled(),true);
    const rawDownload = page.waitForEvent('download'); await page.locator('#local-data-panel').getByRole('button',{name:'نسخة خام',exact:true}).click();
    const rawFile = await rawDownload; assert.equal(JSON.parse(fs.readFileSync(await rawFile.path(),'utf8')).raw.foodRecords,'{broken');
    // Denied storage must not crash any of the five tool surfaces.
    const blocked = await browser.newContext({serviceWorkers:'block'});
    await blocked.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await blocked.addInitScript(() => Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('denied','SecurityError');}}));
    const deniedPage=await blocked.newPage(); deniedPage.on('pageerror', e=>errors.push(e.message));
    for(const file of ['pages/tools.html','pages/growth.html','pages/nutrition.html','pages/digestive.html','pages/tools/routine.html']) {
        await deniedPage.goto(base+file); assert.ok((await deniedPage.locator('#local-data-list').textContent()).includes('تعذر الوصول'));
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
    console.log(`PASS: ${pages.length * 6} viewport checks, readable notes/enlarged text, keyboard table scrolling, navigation, Arabic search, age/topic/type filtering, pagination, shared URLs, browser back, copy/fallback, retry, stale responses, local persistence/downloads/deletions/corruption/storage failures/cross-tab updates and static articles.`);
} finally {
    if (browser) await browser.close();
    server.close();
}
