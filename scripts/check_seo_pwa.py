from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from urllib.parse import urlsplit
import json, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];BASE='https://imadtbn.github.io/ri3aya/'
files=[ROOT/'index.html',*sorted((ROOT/'pages').rglob('*.html'))]
seen=set()
for p in files:
    s=BeautifulSoup(p.read_text(),'html.parser'); title=s.title.get_text(strip=True)
    assert title not in seen, f'Duplicate title: {p}';seen.add(title)
    canonical=s.select('link[rel=canonical]');assert len(canonical)==1
    expected=BASE if p.name=='index.html' else BASE+p.relative_to(ROOT).as_posix()
    assert canonical[0]['href']==expected
    for prop in ['og:title','og:description','og:url','og:image','og:site_name']:
        tags=s.find_all('meta',attrs={'property':prop});assert len(tags)==1 and tags[0].get('content'),(p,prop)
    image=s.find('meta',attrs={'property':'og:image'})['content'];assert image.startswith(BASE) and (ROOT/image[len(BASE):]).exists()
    assert len(s.select('#pwa-install'))==1 and len(s.select('script[src$="js/pwa.js"]'))==1
    schemas=[json.loads(tag.string or tag.get_text()) for tag in s.select('script[type="application/ld+json"]')]
    graphs=[d for d in schemas if '@graph' in d]
    assert len(graphs)==1, f'{p}: expected exactly one shared JSON-LD graph'
    common=graphs[0]
    nodes=common['@graph']
    by_type={kind:[x for x in nodes if kind in (x.get('@type') if isinstance(x.get('@type'),list) else [x.get('@type')])] for kind in ('Organization','WebSite','WebPage')}
    assert all(len(by_type[kind])==1 for kind in by_type), f'{p}: missing/duplicate shared entity'
    organization,website,webpage=(by_type[kind][0] for kind in ('Organization','WebSite','WebPage'))
    assert organization['@id']==BASE+'#organization' and organization['url']==BASE
    assert website['@id']==BASE+'#website' and website['publisher']['@id']==organization['@id']
    assert webpage['@id']==expected+'#webpage' and webpage['isPartOf']['@id']==website['@id']
    if p.stem != 'search': assert isinstance(webpage.get('keywords'),list) and webpage['keywords'], f'{p}: missing editorial keywords'
    crumbs=next((x for x in nodes if x['@type']=='BreadcrumbList'),None)
    if p.name!='index.html':
        assert crumbs and len(crumbs['itemListElement'])==len(s.select('.site-breadcrumb li'))
        assert crumbs['itemListElement'][0]['item']==BASE, f'{p}: breadcrumb home URL must be the canonical root'
        page_dir=BASE if p.parent==ROOT else BASE+p.parent.relative_to(ROOT).as_posix().strip('/')+'/'
        for n,(item,li) in enumerate(zip(crumbs['itemListElement'],s.select('.site-breadcrumb li')),1):
            expected_item = urljoin(page_dir,li.a['href']) if li.a else expected
            if expected_item == BASE + 'index.html': expected_item = BASE
            assert item['position']==n and item['item']==expected_item, f'{p}: breadcrumb URL mismatch'
    for img in s.find_all('img'):
        assert img.get('width') and img.get('height') and img.get('decoding')=='async'
        assert img.get('loading')==('eager' if 'site-hero-image' in img.get('class',[]) else 'lazy')
        assert not img['src'].endswith(('crying.jpg','sleep.jpg')), f'Heavy image still served: {p}'
        if 'srcset' in img.attrs:
            for variant in img['srcset'].split(','):assert (p.parent/variant.strip().split()[0]).exists()
    assert not s.select('link[href$="icons/icons.png"]')
    if p.stem=='search':assert s.find('meta',attrs={'name':'robots'})['content']=='noindex, follow'
urls=[x.text for x in ET.parse(ROOT/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls)==len(set(urls))
assert set(urls)=={BASE if p.name=='index.html' else BASE+p.relative_to(ROOT).as_posix() for p in files if p.stem!='search'}
m=json.loads((ROOT/'manifest.json').read_text());assert m['scope']=='./' and m['id']=='./' and m['dir']=='rtl'
for icon in m['icons']:assert (ROOT/icon['src']).exists()
for shortcut in m['shortcuts']:assert (ROOT/shortcut['url']).exists()
assert BeautifulSoup((ROOT/'offline.html').read_text(),'html.parser').find('meta',attrs={'name':'robots'})['content'].startswith('noindex')
print(f'SEO/PWA static checks passed: {len(files)} pages, {len(urls)} sitemap URLs, schemas, sharing images, responsive assets, install controls and manifest.')
