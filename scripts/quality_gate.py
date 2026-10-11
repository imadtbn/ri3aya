from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
html_files = [ROOT / 'index.html', *sorted((ROOT / 'pages').rglob('*.html'))]

for path in [*ROOT.glob('js/**/*.js'), ROOT / 'service-worker.js']:
    result = subprocess.run(['node', '--check', str(path)], capture_output=True, text=True)
    if result.returncode:
        errors.append(f'JavaScript syntax: {path}: {result.stderr.strip()}')

for path in [*ROOT.glob('content/**/*.json'), ROOT / 'manifest.json', ROOT / 'search/index.json']:
    try:
        json.loads(path.read_text(encoding='utf-8'))
    except Exception as exc:
        errors.append(f'JSON invalid: {path}: {exc}')

risk_pattern = re.compile(r'\bdoseMg\b|\bdoseMl\b|\bmaxDaily\b|\bcalculateMedicineDose\b|\bmedicineDatabase\b|15mg/kg|10mg/kg|5mg/kg|\bCryAudio\b|\bCryPattern\b|getUserMedia|تشخيص مبدئي|تحليل صوت طبي|احتمالات تشخيصية|ارفعي رأس السرير|رفع رأس الطفل قليلاً أثناء النوم|وقت النوم على البطن|التشخيص المحتمل|محلل بكاء الرضيع الذكي|احصل على التشخيص', re.I)
for path in [*ROOT.glob('js/**/*.js'), *ROOT.glob('pages/**/*.html'), ROOT / 'index.html']:
    text = path.read_text(encoding='utf-8', errors='replace')
    if risk_pattern.search(text):
        errors.append(f'Unsafe medical token: {path}')

for path in html_files:
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='replace'), 'html.parser')
    for selector in ('.site-header', '.site-hero', '.site-footer', '.site-header .search-input'):
        if len(soup.select(selector)) != 1:
            errors.append(f'Expected one {selector}: {path}')
    styles = [link['href'].split('?', 1)[0] for link in soup.select('link[rel="stylesheet"]')]
    if len(styles) != len(set(styles)):
        errors.append(f'Duplicate stylesheet: {path}')
    ids = [tag['id'] for tag in soup.select('[id]')]
    if len(ids) != len(set(ids)):
        errors.append(f'Duplicate HTML id: {path}')
    for button in soup.select('.site-header button[aria-controls]'):
        if not soup.find(id=button['aria-controls']):
            errors.append(f'Missing disclosure target: {path}')
    if not soup.find('meta', charset=re.compile(r'^utf-8$', re.I)):
        errors.append(f'Missing UTF-8 declaration: {path}')
    if not soup.find('main'):
        errors.append(f'Missing main: {path}')
    if len(soup.find_all('h1')) != 1:
        errors.append(f'Expected one h1: {path}')
    if not soup.find('meta', attrs={'name': 'description'}):
        errors.append(f'Missing description: {path}')
    if not soup.find('link', rel='canonical'):
        errors.append(f'Missing canonical: {path}')
    if not soup.find('script', src=re.compile(r'(?:^|/)search\.js$')):
        errors.append(f'Missing global search: {path}')
    if len(soup.find_all('script', src=re.compile(r'(?:^|/)search-core\.js$'))) != 1:
        errors.append(f'Expected one shared search engine: {path}')
    if path.relative_to(ROOT).as_posix() in ('pages/tools.html', 'pages/growth.html', 'pages/nutrition.html', 'pages/digestive.html', 'pages/tools/routine.html'):
        if len(soup.select('#local-data-panel')) != 1 or len(soup.find_all('script', src=re.compile(r'(?:^|/)local-data\.js$'))) != 1:
            errors.append(f'Missing or duplicate local data management: {path}')
    for image in soup.find_all('img'):
        if not image.get('alt'):
            errors.append(f'Image without alt: {path}')
    for tag in soup.select('a[href], link[href], img[src]'):
        url = urlsplit(tag.get('href') or tag.get('src') or '')
        if url.scheme or url.netloc or not url.path:
            continue
        target = (path.parent / unquote(url.path)).resolve()
        if not target.exists():
            errors.append(f'Missing local resource {url.path} in {path}')
    for script in soup.find_all('script', src=True):
        source = script['src'].split('?', 1)[0]
        if source.startswith(('http://', 'https://')):
            continue
        target = (path.parent / source).resolve()
        if not target.exists():
            errors.append(f'Missing local script {source} in {path}')

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'quality gate passed: {len(html_files)} HTML pages')
