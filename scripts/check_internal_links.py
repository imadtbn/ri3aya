#!/usr/bin/env python3
"""Check all local links, assets and fragment targets in the published HTML tree."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
from bs4 import BeautifulSoup
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / "index.html", *sorted((ROOT / "pages").rglob("*.html"))]
SOUPS = {p: BeautifulSoup(p.read_text(encoding="utf-8"), "html.parser") for p in PAGES}
ERRORS = []
CHECKED = 0


def local_target(page, value):
    parsed = urlsplit(value.strip())
    if parsed.scheme or parsed.netloc or value.strip().startswith("//"):
        return None, ""
    raw = unquote(parsed.path)
    if not raw and not parsed.fragment:
        return None, ""
    if raw.startswith("/ri3aya/"):
        target = ROOT / raw[len("/ri3aya/"):]
    elif raw.startswith("/"):
        # Absolute root paths are not valid inside the GitHub Pages project.
        ERRORS.append(f"{page.relative_to(ROOT)}: root-relative link escapes /ri3aya/: {value}")
        return None, ""
    else:
        target = page.parent / raw if raw else page
    target = target.resolve()
    if not target.is_relative_to(ROOT):
        ERRORS.append(f"{page.relative_to(ROOT)}: path outside project: {value}")
        return None, ""
    if target.is_dir():
        target = target / "index.html"
    return target, unquote(parsed.fragment)


for page, soup in SOUPS.items():
    for tag in soup.select("a[href], area[href], link[href], script[src], img[src], source[src], iframe[src], form[action]"):
        attribute = "src" if tag.has_attr("src") else "action" if tag.has_attr("action") else "href"
        value = tag.get(attribute, "").strip()
        if not value or value.startswith(("mailto:", "tel:", "javascript:", "data:", "blob:")):
            continue
        target, fragment = local_target(page, value)
        if target is None:
            continue
        CHECKED += 1
        if not target.is_file():
            ERRORS.append(f"{page.relative_to(ROOT)}: missing target: {value}")
            continue
        if fragment and target.suffix == ".html":
            target_soup = SOUPS.get(target)
            if target_soup is None:
                target_soup = BeautifulSoup(target.read_text(encoding="utf-8"), "html.parser")
                SOUPS[target] = target_soup
            if target_soup.find(id=fragment) is None and target_soup.find(attrs={"name": fragment}) is None:
                ERRORS.append(f"{page.relative_to(ROOT)}: missing fragment: {value}")

    for tag in soup.select("img[srcset], source[srcset]"):
        for variant in tag["srcset"].split(","):
            value = variant.strip().split()[0] if variant.strip() else ""
            if not value:
                continue
            target, _ = local_target(page, value)
            if target:
                CHECKED += 1
                if not target.is_file():
                    ERRORS.append(f"{page.relative_to(ROOT)}: missing srcset image: {value}")

# CSS local background images, icon URLs and @imports.
for stylesheet in sorted((ROOT / "css").rglob("*.css")):
    css = stylesheet.read_text(encoding="utf-8")
    for match in re.finditer(r"url\\(\\s*['\\\"]?([^'\\\")]+)", css, re.I):
        raw = match.group(1).strip()
        if not raw or raw.startswith(("data:", "#")):
            continue
        target, _ = local_target(stylesheet, raw)
        if target:
            CHECKED += 1
            if not target.is_file():
                ERRORS.append(f"{stylesheet.relative_to(ROOT)}: missing url(): {raw}")

if ERRORS:
    print("FAIL: " + str(len(ERRORS)) + " internal link/asset issues")
    for issue in ERRORS:
        print(" - " + issue)
    raise SystemExit(1)
print(f"PASS: {len(PAGES)} HTML pages and {CHECKED} internal references/assets, including fragment targets.")
