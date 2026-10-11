"""Check publication visibility and the editorial/medical review boundary."""
from pathlib import Path
import json
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from build_articles import ROOT, BASE, load_catalog, used_sources, review_label

data, sources = load_catalog()
articles = {a['slug']: a for a in data['articles'] if a['publication_status'] == 'published'}
search = json.loads((ROOT / 'search/index.json').read_text())['items']
article_results = {item['url']: item for item in search if item['url'].startswith('pages/articles/')}
expected = {f'pages/articles/{slug}.html' for slug in articles}
assert set(article_results) == expected, 'Search must expose only published articles'
assert {str(p.relative_to(ROOT)) for p in (ROOT / 'pages/articles').glob('*.html')} == expected, 'Draft/withdrawn article has a public page'
library = BeautifulSoup((ROOT / 'pages/blog.html').read_text(), 'html.parser')
assert {card.h2.a['href'] for card in library.select('.library-card')} == {f'articles/{slug}.html' for slug in articles}, 'Library card URLs mismatch'
urls = {e.text for e in ET.parse(ROOT / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert {url for url in urls if '/pages/articles/' in url} == {BASE + url for url in expected}, 'Sitemap publication mismatch'
for slug, a in articles.items():
    path = ROOT / f'pages/articles/{slug}.html'
    soup = BeautifulSoup(path.read_text(), 'html.parser')
    panel = soup.select_one('.article-review-panel')
    assert soup.select_one('.review-badge').get_text() == review_label(a), 'Incorrect review badge'
    assert a['editorial_review']['date'] in panel.get_text(), 'Missing editorial date'
    assert a['age_label'] in panel.get_text(), 'Missing age group'
    times = [t['datetime'] for t in panel.find_all('time')]
    assert times == [a['published_at'], a['updated_at'], a['editorial_review']['date']], 'Date roles mismatch'
    if a['medical_review']['status'] != 'reviewed':
        assert 'لم تتم بعد؛ لا يوجد مراجع طبي أو تاريخ اعتماد.' in panel.get_text(), 'Unreviewed article must not imply clinical approval'
    for link in soup.select('a[href^="#"]'):
        assert soup.find(id=link['href'][1:]), f'Broken table-of-contents/citation link: {path}: {link["href"]}'
    listed = {li['id'].removeprefix('source-'): li for li in soup.select('.article-sources li[id]')}
    assert set(listed) == set(used_sources(a)), 'Reference list mismatch'
    for key, li in listed.items():
        assert li.a['href'] == sources[key]['url'], 'Reference points to wrong source'
        assert sources[key]['checked_at'] in li.get_text(), 'Source access date missing'
    schema = json.loads(soup.find('script', type='application/ld+json').string)
    assert schema['@type'] == 'Article' and schema['dateModified'] == a['updated_at'], 'Incorrect Article schema'
    assert set(schema['citation']) == {sources[key]['url'] for key in used_sources(a)}, 'Schema source mismatch'
    assert 'reviewedBy' not in schema and 'lastReviewed' not in schema, 'Editorial dates must not masquerade as medical sign-off'
print(f'Article integrity passed: {len(articles)} published articles, source anchors, date roles, review labels and discovery URLs.')
