#!/usr/bin/env python3
"""Generate the static shared layout, preserving article markup and line endings.

Requires beautifulsoup4. Run from any directory; --check verifies generated output.
"""
from pathlib import Path
import argparse
import html
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / 'index.html', *sorted((ROOT / 'pages').rglob('*.html'))]
TOPICS = [('sleep', 'النوم الآمن'), ('nutrition', 'التغذية'), ('crying', 'فهم البكاء'),
          ('growth', 'النمو'), ('vaccine', 'التلقيح'), ('bath', 'الاستحمام'),
          ('diapers', 'الحفاضات'), ('digestive', 'الجهاز الهضمي'), ('diseases', 'الصحة'), ('tips', 'نصائح يومية')]
PAGE_CSS = {'index': [], 'crying': ['crying-analyzer', 'improvements-crying'],
            'tools': ['tools', 'tools-index'], 'routine': ['tools'],
            'search': ['articles', 'search'], 'blog': ['articles', 'search'], 'editorial-policy': ['articles'], 'sections': [], 'resources': [], 'terms': [], 'privacy': [], 'faq': [], 'disclaimer': []}

def span(source, node):
    start = sum(len(line) for line in source.splitlines(keepends=True)[:node.sourceline - 1]) + node.sourcepos
    depth = 0
    for match in re.finditer(r'</?' + node.name + r'\b[^>]*>', source[start:], re.I):
        depth += -1 if match.group().startswith('</') else 1
        if depth == 0:
            return start, start + match.end()
    raise ValueError(f'Unclosed {node.name}')

def replace(source, node, content):
    start, end = span(source, node)
    return source[:start] + content + source[end:]

def layout(source, path):
    soup = BeautifulSoup(source, 'html.parser')
    root = '../' * (len(path.relative_to(ROOT).parts) - 1)
    link = lambda slug: root + ('index.html' if slug == 'index' else f'pages/{slug}.html')
    current = 'tools' if path.stem == 'routine' else path.stem
    def navlink(slug, label):
        active = ' aria-current="page"' if slug == current else ''
        return f'<a href="{link(slug)}"{active}>{label}</a>'
    topics = '\n'.join(f'<li>{navlink(slug, label)}</li>' for slug, label in TOPICS)
    header = f'''<header class="site-header" data-layout="shared-v2">
    <div class="container site-header-inner">
        <a class="site-brand" href="{link('index')}" aria-label="رعاية الرضع — الرئيسية"><span class="site-brand-mark" aria-hidden="true">ر</span><span><strong>رعاية الرضع</strong><small>معك في تفاصيل العناية اليومية</small></span></a>
        <button class="mobile-menu-btn" type="button" aria-label="قائمة التنقل" aria-controls="primary-navigation" aria-expanded="false">☰</button>
        <nav class="site-nav" aria-label="التنقل الرئيسي"><ul class="nav-menu" id="primary-navigation">
            <li>{navlink('index', 'الرئيسية')}</li>
            <li class="dropdown"><div class="site-topic-link">{navlink('sections', 'أقسام الرعاية')}<button class="dropdown-toggle" type="button" aria-label="عرض موضوعات الرعاية" aria-controls="care-topics" aria-expanded="false">⌄</button></div><ul class="dropdown-menu" id="care-topics">{topics}</ul></li>
            <li>{navlink('tools', 'الأدوات')}</li><li>{navlink('blog', 'الأدلة والمقالات')}</li><li>{navlink('resources', 'المصادر')}</li><li>{navlink('faq', 'الأسئلة الشائعة')}</li>
        </ul></nav>
        <form class="search-container" action="{root}pages/search.html" method="get" role="search"><label class="sr-only" for="site-search">ابحث في أدلة الرعاية</label><input id="site-search" class="search-input" name="q" type="search" maxlength="160" placeholder="ابحث: نوم، تغذية، نمو…" autocomplete="off" aria-controls="site-search-results"><button class="search-btn" type="submit" aria-label="بحث">بحث</button><a class="advanced-search-link" href="{root}pages/search.html">فلترة</a></form>
    </div>
</header>'''
    old = soup.select_one('.site-header') or soup.select_one('nav.navbar')
    if not old:
        old = next((h for h in soup.find_all('header') if h.find('nav')), None)
    if old:
        source = replace(source, old, header)
    else:
        skip = soup.select_one('.skip-link')
        _, end = span(source, skip)
        source = source[:end] + '\n' + header + source[end:]

    soup = BeautifulSoup(source, 'html.parser')
    h1 = soup.h1
    title = h1.get_text(' ', strip=True)
    hero = soup.select_one('.site-hero') or next((a for a in h1.parents if a.name in ('section', 'header') or 'page-header' in a.get('class', [])), None)
    description = (hero or h1.parent).find('p')
    description = description.get_text(' ', strip=True) if description else ''
    image = (hero or h1.parent).find('img')
    image_markup = ''
    if image:
        image_markup = f'<img class="site-hero-image" src="{html.escape(image["src"], quote=True)}" alt="{html.escape(image.get("alt", ""), quote=True)}" width="480" height="320" decoding="async" fetchpriority="high">'
    crumbs = '' if path.name == 'index.html' else f'<nav class="site-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="{link("index")}">الرئيسية</a></li><li><a href="{link("tools" if current == "tools" else "sections")}">{"الأدوات" if current == "tools" else "أقسام الرعاية"}</a></li><li aria-current="page">{html.escape(title)}</li></ol></nav>'
    if current != 'index' and (current in ('sections', 'tools') or current not in dict(TOPICS)):
        crumbs = f'<nav class="site-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="{link("index")}">الرئيسية</a></li><li aria-current="page">{html.escape(title)}</li></ol></nav>'
    if path.parent.name == 'articles':
        crumbs = f'<nav class="site-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="{link("index")}">الرئيسية</a></li><li><a href="{link("blog")}">مكتبة المقالات</a></li><li aria-current="page">{html.escape(title)}</li></ol></nav>'
    cta = f'<div class="site-hero-actions"><a class="btn btn-primary" href="{link("sections")}">استكشفي أدلة الرعاية</a><a class="btn btn-secondary" href="{link("tools")}">أدوات المتابعة</a></div>' if current == 'index' else ''
    heading_id = f' id="{h1["id"]}"' if h1.get('id') else ''
    hero_markup = f'<section class="site-hero{" site-hero-home" if current == "index" else ""}"><div class="container site-hero-inner"><div>{crumbs}<h1{heading_id}>{html.escape(title)}</h1><p>{html.escape(description)}</p>{cta}</div>{image_markup}</div></section>'
    if hero:
        source = replace(source, hero, hero_markup)
    else:  # Disclaimer: leave the actual article intact.
        source = replace(source, h1, hero_markup)
        soup = BeautifulSoup(source, 'html.parser')
        subtitle = soup.select_one('.page-subtitle')
        if subtitle:
            source = replace(source, subtitle, '')

    soup = BeautifulSoup(source, 'html.parser')
    footer = soup.select_one('footer')
    footer_markup = f'''<footer class="site-footer" data-layout="shared-v2" aria-labelledby="footer-title"><div class="container">
    <div class="site-footer-grid"><div><h2 id="footer-title">رعاية الرضع</h2><p>أدلة عربية للعناية اليومية، وأدوات تساعدك على تنظيم الملاحظات والمتابعة.</p><p class="site-footer-note">محتوى تثقيفي عام. عند القلق على صحة طفلك، تواصلي مع مختص.</p></div>
    <nav aria-label="استكشاف الموقع"><h3>استكشفي</h3>{navlink('sections', 'أقسام الرعاية')}{navlink('tools', 'الأدوات التفاعلية')}{navlink('blog', 'الأدلة والمقالات')}{navlink('resources', 'المصادر الموثوقة')}</nav>
    <nav aria-label="المساعدة والسياسات"><h3>حول الموقع</h3>{navlink('faq', 'الأسئلة الشائعة')}{navlink('contact', 'ملاحظات حول الموقع')}{navlink('privacy', 'سياسة الخصوصية')}{navlink('terms', 'شروط الاستخدام')}{navlink('disclaimer', 'إخلاء المسؤولية')}</nav></div>
    <div class="site-footer-bottom">© 2026 رعاية الرضع · المعرفة تساعدك على العناية.</div>
</div></footer>'''
    source = replace(source, footer, footer_markup) if footer else source.replace('</body>', footer_markup + '\n</body>')
    # Only the page's own styles plus shared layers; final shell CSS follows inline legacy CSS.
    source = re.sub(r'<link\b[^>]*href=["\'](?:\.\./)*css/[^"\']+["\'][^>]*>\s*', '', source, flags=re.I)
    if 'font-awesome/' not in source:
        source = source.replace('</head>', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n</head>')
    page_css = ['articles'] if path.parent.name == 'articles' else PAGE_CSS.get(path.stem, [path.stem])
    if path.stem in ('index', 'sections', 'resources', 'sleep', 'nutrition', 'bath', 'diapers', 'crying') and 'articles' not in page_css:
        page_css = [*page_css, 'articles']
    styles = ['main', 'responsive', *page_css, 'accessibility', 'animations', 'site-polish']
    source = re.sub(r'\s*</head>', '\n' + '\n'.join(f'<link rel="stylesheet" href="{root}css/{name}.css">' for name in styles) + '\n</head>', source, count=1)
    source = re.sub(r'<script\b[^>]*src=[\"\'][^\"\']*js/search-core\.js[\"\'][^>]*></script>\s*', '', source)
    source = source.replace('</head>', f'<script defer src="{root}js/search-core.js"></script>\n</head>')
    source = re.sub(r'<body([^>]*)>', lambda m: '<body' + (re.sub(r'class="([^"]*)"', lambda c: f'class="{c[1]} site-shell"' if 'site-shell' not in c[1].split() else c[0], m[1]) if 'class=' in m[1] else m[1] + ' class="site-shell"') + '>', source, count=1)
    return source

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    changed = []
    for path in PAGES:
        raw = path.read_bytes()
        source = raw.decode().replace('\r\n', '\n')
        result = layout(source, path)
        output = result.replace('\n', '\r\n').encode() if b'\r\n' in raw else result.encode()
        if output != raw:
            changed.append(str(path.relative_to(ROOT)))
            if not args.check:
                path.write_bytes(output)
    if args.check and changed:
        raise SystemExit('Layout out of sync: ' + ', '.join(changed))
    print(f'Shared layout: {len(PAGES)} pages; {len(changed)} changed.')

if __name__ == '__main__':
    main()
