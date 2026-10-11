"""Verify drafts/withdrawals never leak into public discovery or claim sign-off."""
from pathlib import Path
import json
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as temp:
    site = Path(temp) / 'site'
    shutil.copytree(ROOT, site, ignore=shutil.ignore_patterns('.git', '__pycache__', 'node_modules'))
    path = site / 'content/articles/catalog.json'
    data = json.loads(path.read_text())
    def run(script, success=True):
        result = subprocess.run(['python', str(site / 'scripts' / script)], cwd=site, capture_output=True, text=True)
        assert (result.returncode == 0) == success, result.stdout + result.stderr
    data['articles'][0]['medical_review']['status'] = 'reviewed'
    path.write_text(json.dumps(data, ensure_ascii=False))
    run('build_articles.py', success=False)
    data['articles'][0]['medical_review']['status'] = 'not_reviewed'
    data['articles'][1]['publication_status'] = 'draft'
    path.write_text(json.dumps(data, ensure_ascii=False))
    run('build_articles.py')
    run('check_article_library.py')
    for article in data['articles']:
        article['publication_status'] = 'withdrawn'
    path.write_text(json.dumps(data, ensure_ascii=False))
    run('build_articles.py')
    run('check_article_library.py')
    run('quality_gate.py')
print('Publication tests passed: incomplete medical sign-off rejected; draft and complete withdrawal excluded from public pages and discovery.')
