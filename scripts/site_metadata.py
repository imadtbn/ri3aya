"""Shared deterministic image, sharing and PWA markup. Used by sync_layout."""
from pathlib import Path
import json, re, html
from urllib.parse import urljoin
from bs4 import BeautifulSoup
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://imadtbn.github.io/ri3aya/'

def finish(source, path):
    from sync_layout import replace
    root = '../' * (len(path.relative_to(ROOT).parts) - 1)
    canonical = BASE if path.name == 'index.html' else BASE + path.relative_to(ROOT).as_posix()
    catalog = json.loads((ROOT/'images/optimized/catalog.json').read_text())
    reverse = {v['src']: original for original, entry in catalog.items() for v in entry['variants']}
    soup = BeautifulSoup(source, 'html.parser')
    for img in reversed(soup.find_all('img')):
        rel = (path.parent/img.get('src', '')).resolve().relative_to(ROOT).as_posix()
        original = reverse.get(rel, rel)
        if original in catalog:
            variants = catalog[original]['variants']
            img['src'] = root + variants[-1]['src']
            img['srcset'] = ', '.join(f"{root}{v['src']} {v['width']}w" for v in variants)
            img['sizes'] = '(max-width: 600px) calc(100vw - 32px), 480px' if 'site-hero-image' in img.get('class', []) else '(max-width: 600px) calc(100vw - 32px), 720px'
        img['decoding'] = 'async'
        img['loading'] = 'eager' if 'site-hero-image' in img.get('class', []) else 'lazy'
        start = sum(len(line) for line in source.splitlines(keepends=True)[:img.sourceline - 1]) + img.sourcepos
        end = start + re.match(r'<img\b[^>]*>', source[start:], re.I).end()
        source = source[:start] + str(img) + source[end:]
    # Consistent small icons; never use the 1.2 MB source as a favicon.
    source = re.sub(r'<link\b[^>]*rel=["\'](?:icon|apple-touch-icon)["\'][^>]*>\s*', '', source, flags=re.I)
    source = re.sub(r'<meta\b[^>]*(?:name|property)=["\'](?:og:image(?::[a-z]+)?|og:locale|og:site_name|twitter:image|twitter:card|theme-color)["\'][^>]*>\s*', '', source, flags=re.I)
    source = re.sub(r'<script\b[^>]*id="site-seo"[^>]*>.*?</script>\s*', '', source, flags=re.S)
    # Supersede legacy page/breadcrumb graphs; retain catalog-backed Article/CollectionPage blocks.
    def discard_graph(match):
        data = json.loads(re.sub(r'^.*?>|</script>\s*$', '', match[0], flags=re.S))
        return '' if isinstance(data, dict) and '@graph' in data else match[0]
    source = re.sub(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>\s*', discard_graph, source, flags=re.S)
    if path.name == 'index.html':
        source = re.sub(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>\s*', '', source, flags=re.S)
    soup = BeautifulSoup(source, 'html.parser')
    title = soup.h1.get_text(' ',strip=True)
    description = soup.find('meta',attrs={'name':'description'})['content']
    common = [{ '@type':'WebPage', '@id':canonical+'#webpage', 'url':canonical, 'name':title, 'description':description, 'inLanguage':'ar', 'isPartOf':{'@id':BASE+'#website'} }]
    crumbs=[]
    for li in soup.select('.site-breadcrumb li'):
        link=li.find('a')
        crumbs.append({'@type':'ListItem','position':len(crumbs)+1,'name':li.get_text(' ',strip=True),'item':urljoin(canonical,link['href']) if link else canonical})
    if crumbs: common.append({'@type':'BreadcrumbList','itemListElement':crumbs})
    if path.name=='index.html':
        common.extend([{'@type':'Organization','@id':BASE+'#organization','name':'رعاية الرضع','url':BASE,'logo':BASE+'images/icons/app-512.png'}, {'@type':'WebSite','@id':BASE+'#website','name':'رعاية الرضع','url':BASE,'inLanguage':'ar','publisher':{'@id':BASE+'#organization'}}])
    metadata=f'''<link rel="icon" href="{root}images/icons/favicon.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="{root}images/icons/apple-touch-icon.png" sizes="180x180">
<meta name="theme-color" content="#126b70"><meta property="og:site_name" content="رعاية الرضع"><meta property="og:locale" content="ar_DZ">
<meta property="og:image" content="{BASE}images/icons/app-512.png"><meta property="og:image:width" content="512"><meta property="og:image:height" content="512"><meta property="og:image:alt" content="أيقونة موقع رعاية الرضع">
<meta name="twitter:card" content="summary"><meta name="twitter:image" content="{BASE}images/icons/app-512.png">
<script type="application/ld+json" id="site-seo">{json.dumps({'@context':'https://schema.org','@graph':common},ensure_ascii=False).replace('<', chr(92)+'u003c')}</script>'''
    if path.stem=='search':
        source=re.sub(r'<meta\b[^>]*name="robots"[^>]*>\s*','',source)
        metadata+='<meta name="robots" content="noindex, follow">'
    source=source.replace('</head>',metadata+'\n</head>')
    source=re.sub(r'<script\b[^>]*src=["\'][^"\']*js/pwa\.js["\'][^>]*></script>\s*','',source)
    source=source.replace('</head>',f'<script defer src="{root}js/pwa.js"></script>\n</head>')
    source=re.sub(r'<!-- pwa:start -->.*?<!-- pwa:end -->\s*','',source,flags=re.S)
    controls='''<!-- pwa:start --><div class="pwa-controls" aria-label="تثبيت الموقع والعمل دون اتصال"><p id="pwa-status" role="status" aria-live="polite">جارٍ التحقق من نسخة العمل دون اتصال…</p><div class="pwa-actions"><button type="button" class="btn btn-secondary" id="pwa-install">تثبيت الموقع</button><button type="button" class="btn btn-secondary" id="pwa-check">فحص التحديث</button><button type="button" class="btn btn-primary" id="pwa-update" hidden>تحديث النسخة</button></div><p class="pwa-note">تُتاح الأدلة والأدوات المحلية بعد اكتمال حفظ النسخة. قد تكون النسخة المحفوظة أقدم من الموقع؛ تحققي من التحديث عند عودة الاتصال. التثبيت لا يضمن بقاء سجلاتك؛ صدّري نسخة منها.</p></div><dialog id="pwa-help" aria-labelledby="pwa-help-title"><h2 id="pwa-help-title">إضافة رعاية الرضع إلى جهازك</h2><p>إذا ظهر طلب التثبيت، اتبعي تعليمات المتصفح. على iPhone وiPad افتحي الموقع في Safari ثم المشاركة ← إضافة إلى الشاشة الرئيسية. في المتصفحات الأخرى ابحثي عن تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية في قائمة المتصفح.</p><p>الأدوات تثقيفية، والنسخة دون اتصال قد لا تشمل الخدمات والخطوط الخارجية. تحققي من اكتمال حفظ النسخة قبل فصل الاتصال.</p><button class="btn btn-primary" type="button" id="pwa-help-close">إغلاق</button></dialog><!-- pwa:end -->\n'''
    source=source.replace('<div class="site-footer-bottom">',controls+'<div class="site-footer-bottom">',1)
    source = re.sub(r'<script\b([^>]*\bsrc=[\"\'][^\"\']+[\"\'][^>]*)>', lambda m: m[0] if re.search(r'\b(?:defer|async)\b', m[1]) else '<script defer' + m[1] + '>', source)
    return source
