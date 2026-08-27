#!/usr/bin/env python3
"""Validate the unified analytics/GTM/Clarity/AdSense integration."""
from pathlib import Path
import re
import sys
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = [*sorted(ROOT.glob("*.html")), *sorted((ROOT / "pages").rglob("*.html"))]
DIRECT_MARKERS = (
    "googletagmanager.com/gtm.js",
    "googletagmanager.com/ns.html",
    "googletagmanager.com/gtag/js",
    "googlesyndication.com/pagead/js/adsbygoogle.js",
    "clarity.ms/tag/",
)

errors = []
loader_count = 0
ad_unit_count = 0
for page in PAGES:
    text = page.read_text(encoding="utf-8", errors="replace")
    soup = BeautifulSoup(text, "html.parser")
    loaders = [tag for tag in soup.find_all("script", src=True) if "site-tags.js" in tag.get("src", "")]
    if len(loaders) != 1:
        errors.append(f"{page.relative_to(ROOT)}: expected one site-tags.js loader, found {len(loaders)}")
    else:
        loader_count += 1
        src = loaders[0]["src"]
        target = (page.parent / src).resolve()
        if not target.is_file():
            errors.append(f"{page.relative_to(ROOT)}: broken loader path {src}")
    for tag in soup.find_all("script", src=True):
        src = tag.get("src", "")
        if any(marker in src for marker in DIRECT_MARKERS):
            errors.append(f"{page.relative_to(ROOT)}: direct external tag load {src}")
    inline = " ".join(script.get_text(" ", strip=True) for script in soup.find_all("script", src=False))
    if re.search(r"\bgtag\s*\(", inline) or "clarity(" in inline or "adsbygoogle.push" in inline:
        errors.append(f"{page.relative_to(ROOT)}: legacy inline analytics/ads code found")
    for unit in soup.select("ins.adsbygoogle[data-site-ad]"):
        ad_unit_count += 1
        shell = unit.find_parent(attrs={"data-site-ad-shell": True})
        if shell is None:
            errors.append(f"{page.relative_to(ROOT)}: ad unit is outside data-site-ad-shell")
        elif not shell.has_attr("hidden"):
            errors.append(f"{page.relative_to(ROOT)}: ad shell must be hidden while IDs are placeholders")

central = ROOT / "js" / "site-tags.js"
if not central.is_file():
    errors.append("js/site-tags.js is missing")
else:
    source = central.read_text(encoding="utf-8")
    for key in ("gtmId", "ga4Id", "clarityId", "adsenseClient", "adSlots"):
        if key not in source:
            errors.append(f"js/site-tags.js: missing config key {key}")

for obsolete in (ROOT / "css" / "ads.css", ROOT / "js" / "ads-manager.js"):
    if obsolete.exists():
        errors.append(f"obsolete ad integration file still exists: {obsolete.relative_to(ROOT)}")

if errors:
    print("site tags check failed:")
    print("\n".join(f"- {error}" for error in errors))
    sys.exit(1)

print(f"site tags check passed: {loader_count} loaders, {ad_unit_count} HTML ad units, no direct legacy loads")
