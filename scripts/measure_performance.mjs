/**
 * Local synthetic browser audit, not field Core Web Vitals.
 * Run: node scripts/measure_performance.mjs (requires Playwright).
 */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html':'text/html;charset=utf-8', '.js':'text/javascript;charset=utf-8',
    '.css':'text/css;charset=utf-8', '.json':'application/json;charset=utf-8',
    '.csv':'text/csv;charset=utf-8', '.webp':'image/webp', '.png':'image/png',
    '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); res.end(); return; }
    if (!pathname.startsWith('/ri3aya/')) { res.writeHead(404); res.end(); return; }
    const file = path.resolve(root, pathname.slice('/ri3aya/'.length) || 'index.html');
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end('missing'); return;
    }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port + '/ri3aya/';
const pages = ['index.html', 'pages/sleep.html', 'pages/nutrition.html',
    'pages/growth.html', 'pages/tools.html'];
const rows = [];
let browser;
try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ?
        { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {}) });
    for (const viewportWidth of [390, 1440]) {
        const context = await browser.newContext({
            viewport: { width: viewportWidth, height: 900 },
            locale: 'ar-DZ', colorScheme: 'light',
            serviceWorkers: 'block', reducedMotion: 'reduce'
        });
        await context.route('**/*', route => {
            const u = new URL(route.request().url());
            return u.hostname === '127.0.0.1' && Number(u.port) === server.address().port
                ? route.continue() : route.abort();
        });
        for (const relativePath of pages) {
            const page = await context.newPage();
            await page.addInitScript(() => {
                window.__perf = { lcp: null, cls: 0 };
                try {
                    new PerformanceObserver(list => {
                        for (const entry of list.getEntries()) window.__perf.lcp = entry.startTime;
                    }).observe({ type: 'largest-contentful-paint', buffered: true });
                } catch {}
                try {
                    new PerformanceObserver(list => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) window.__perf.cls += entry.value;
                        }
                    }).observe({ type: 'layout-shift', buffered: true });
                } catch {}
            });
            const localFailures = [], pageErrors = [];
            let requests = 0, images = 0;
            page.on('response', response => {
                if (response.url().startsWith(base)) {
                    requests++;
                    if (response.status() >= 400) localFailures.push(response.status() + ' ' + response.url());
                    if (/\.(?:png|jpe?g|webp|svg)(?:\?|$)/i.test(response.url())) images++;
                }
            });
            page.on('pageerror', error => pageErrors.push(error.message));
            const response = await page.goto(base + relativePath, { waitUntil: 'load' });
            await page.waitForTimeout(250);
            const metrics = await page.evaluate(() => ({
                fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
                domReady: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? null,
                loadEvent: performance.getEntriesByType('navigation')[0]?.loadEventEnd ?? null,
                lcp: window.__perf.lcp,
                cls: window.__perf.cls,
                documentWidth: document.documentElement.scrollWidth,
                brokenVisibleImages: [...document.querySelectorAll('img')].filter(el =>
                    el.getBoundingClientRect().top < innerHeight && el.complete && !el.naturalWidth).length
            }));
            assert.equal(response?.status(), 200, relativePath + ' failed');
            assert.equal(localFailures.length, 0, relativePath + ' missing resource: ' + localFailures.join(', '));
            assert.ok(metrics.documentWidth <= viewportWidth + 1,
                relativePath + ' horizontal overflow at ' + viewportWidth);
            rows.push({ page: relativePath, viewportWidth, requests, images, ...metrics, pageErrors });
            await page.close();
        }
        await context.close();
    }
    fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    fs.writeFileSync(path.join(root, 'artifacts/performance-lab.json'), JSON.stringify({
        recordedAt: new Date().toISOString(),
        context: 'Synthetic Chromium local server; external resources blocked; not field Web Vitals',
        rows
    }, null, 2));
    for (const row of rows) {
        console.log(row.viewportWidth + 'px ' + row.page + ': FCP=' +
            (row.fcp?.toFixed(0) ?? 'n/a') + 'ms LCP=' + (row.lcp?.toFixed(0) ?? 'n/a') +
            'ms CLS=' + row.cls.toFixed(3) + ' requests=' + row.requests +
            ' images=' + row.images + ' JS-errors=' + row.pageErrors.length);
    }
    console.log('Measured ' + rows.length + ' viewport/page combinations.');
} finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
}
