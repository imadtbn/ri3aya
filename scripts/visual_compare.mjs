/**
 * Stage 01 visual regression capture. Requires Playwright (development-only).
 * Usage:
 *   node scripts/visual_compare.mjs --before-root=/tmp/ri3aya-before --after-root=. --out=visual-report
 * Optional: CHROMIUM_PATH=/usr/bin/chromium
 * Produces side-by-side screenshots and objective layout metrics.
 * No files in either source tree are modified.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = Object.fromEntries(process.argv.slice(2).map(arg => {
    const i = arg.indexOf('=');
    return i < 0 ? [arg.replace(/^--/, ''), true] : [arg.slice(2, i), arg.slice(i + 1)];
}));
if (!options['before-root']) {
    console.error('Required: --before-root=/path/to/baseline [--after-root=. --out=visual-report]');
    process.exit(2);
}
const beforeRoot = path.resolve(options['before-root']);
const afterRoot = path.resolve(options['after-root'] || project);
const outRoot = path.resolve(options.out || path.join(project, 'visual-report'));
const pages = [
    'index.html', 'pages/sections.html', 'pages/nutrition.html',
    'pages/crying.html', 'pages/sleep.html', 'pages/tools.html',
    'pages/growth.html', 'pages/vaccine.html', 'pages/blog.html',
    'pages/articles/safe-sleep.html'
];
const sizes = [390, 1440];
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
    '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.csv': 'text/csv' };
function startServer(root) {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            let pathname;
            try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
            catch { res.writeHead(400); res.end(); return; }
            const resolved = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
            if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
                res.writeHead(404); res.end('Not found'); return;
            }
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Content-Type', mime[path.extname(resolved)] || 'application/octet-stream');
            fs.createReadStream(resolved).pipe(res);
        });
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const beforeServer = await startServer(beforeRoot);
const afterServer = await startServer(afterRoot);
let browser;
try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ?
        { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {}) });
    const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce',
        locale: 'ar-DZ', colorScheme: 'light' });
    const allowed = new Set([beforeServer.address().port, afterServer.address().port]);
    await context.route('**/*', route => {
        const u = new URL(route.request().url());
        return u.hostname === '127.0.0.1' && allowed.has(Number(u.port))
            ? route.continue() : route.abort();
    });
    const entries = [];
    for (const width of sizes) {
        const page = await context.newPage();
        await page.setViewportSize({ width, height: 900 });
        for (const filename of pages) {
            const id = filename.replaceAll('/', '-').replace(/\.html$/, '') + '-' + width;
            const entry = { page: filename, viewport: width };
            for (const [side, server] of [['before', beforeServer], ['after', afterServer]]) {
                const imagePath = path.join(outRoot, side, id + '.png');
                fs.mkdirSync(path.dirname(imagePath), { recursive: true });
                const url = 'http://127.0.0.1:' + server.address().port + '/' + filename;
                const response = await page.goto(url, { waitUntil: 'load' });
                await page.screenshot({ path: imagePath, fullPage: false, animations: 'disabled' });
                const metrics = await page.evaluate(() => {
                    const q = selector => document.querySelector(selector);
                    const rect = selector => q(selector)?.getBoundingClientRect();
                    const css = (selector, prop) => q(selector) ? getComputedStyle(q(selector))[prop] : null;
                    return {
                        documentWidth: document.documentElement.scrollWidth,
                        viewportWidth: window.innerWidth,
                        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
                        headerHeight: Math.round(rect('.site-header')?.height || 0),
                        heroHeight: Math.round(rect('.site-hero')?.height || 0),
                        cardPadding: css('.sections-grid .section-card', 'padding'),
                        cardDisplay: css('.sections-grid .section-card', 'display'),
                        contentDisplay: css('.content-wrapper', 'display'),
                        sidebarPosition: css('.content-wrapper > .sidebar', 'position'),
                        brokenImages: [...document.querySelectorAll('main img')].filter(x => x.complete && !x.naturalWidth).length
                    };
                });
                entry[side] = { http: response?.status() || 0, screenshot: side + '/' + id + '.png', metrics };
            }
            entries.push(entry);
        }
        await page.close();
    }
    fs.mkdirSync(outRoot, { recursive: true });
    fs.writeFileSync(path.join(outRoot, 'metrics.json'), JSON.stringify(entries, null, 2));
    const panels = entries.map(entry => {
        const a = entry.before.metrics, b = entry.after.metrics;
        const values = [['Card padding', a.cardPadding, b.cardPadding],
            ['Content display', a.contentDisplay, b.contentDisplay],
            ['Sidebar position', a.sidebarPosition, b.sidebarPosition],
            ['Document width', a.documentWidth, b.documentWidth],
            ['Horizontal overflow', a.hasHorizontalOverflow, b.hasHorizontalOverflow],
            ['Header height', a.headerHeight, b.headerHeight],
            ['Hero height', a.heroHeight, b.heroHeight]];
        const rows = values.map(x => '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td><td>' + esc(x[2]) + '</td></tr>').join('');
        return '<section><h2>' + esc(entry.page) + ' — ' + entry.viewport + 'px</h2>' +
            '<div class="shots"><figure><figcaption>Before</figcaption><img loading="lazy" src="' + esc(entry.before.screenshot) +
            '"></figure><figure><figcaption>After</figcaption><img loading="lazy" src="' +
            esc(entry.after.screenshot) + '"></figure></div>' +
            '<table><thead><tr><th>Metric</th><th>Before</th><th>After</th></tr></thead><tbody>' +
            rows + '</tbody></table></section>';
    }).join('\n');
    const html = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Ri3aya visual comparison</title><style>body{font:16px system-ui;margin:24px auto;max-width:1400px;padding:0 16px;background:#f7faf9;color:#173b49}' +
        'section{background:#fff;border:1px solid #d7e5e6;border-radius:16px;padding:20px;margin:24px 0}h2{font-size:1.25rem}' +
        '.shots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}figure{margin:0;min-width:0}img{display:block;width:100%;border:1px solid #ddd}figcaption{padding:8px;font-weight:bold}' +
        'table{border-collapse:collapse;width:100%;margin-top:16px}td,th{padding:8px;border:1px solid #ddd;text-align:left;overflow-wrap:anywhere}' +
        '@media(max-width:700px){.shots{grid-template-columns:1fr}}</style><h1>Ri3aya — Before / After</h1><p>Captured from actual local pages with external services disabled.</p>' + panels + '</html>';
    fs.writeFileSync(path.join(outRoot, 'index.html'), html);
    console.log('Visual comparison ready: ' + path.join(outRoot, 'index.html'));
    console.log('Captured ' + entries.length + ' page-and-viewport pairs.');
} finally {
    await browser?.close();
    await Promise.all([new Promise(r => beforeServer.close(r)), new Promise(r => afterServer.close(r))]);
}
