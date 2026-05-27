#!/usr/bin/env python3
"""
build-index.py
Reads every file in content/photos/ (.md with YAML frontmatter, or plain .yml/.yaml)
and writes data/photos.json.

Pages.cms saves collections as Markdown files with YAML frontmatter:
  ---
  image: /images/foo.jpg
  category: gigs
  ...
  ---
"""
import os, json, glob, yaml

PHOTOS_DIR  = os.path.join(os.path.dirname(__file__), '..', 'content', 'photos')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'photos.json')


def parse_file(filepath):
    """Return a dict from a .md (frontmatter) or .yml/.yaml file."""
    with open(filepath, encoding='utf-8') as fh:
        content = fh.read().strip()

    if not content:
        return {}

    # Markdown with YAML frontmatter  (--- ... ---)
    if content.startswith('---'):
        parts = content.split('---', 2)
        # parts[0] == '', parts[1] == frontmatter, parts[2] == body (ignored)
        if len(parts) >= 2:
            return yaml.safe_load(parts[1]) or {}

    # Plain YAML file
    return yaml.safe_load(content) or {}


# Collect all supported files, sorted for stable ordering
files = []
for pat in ('*.md', '*.yml', '*.yaml'):
    files.extend(glob.glob(os.path.join(PHOTOS_DIR, pat)))
files = sorted(set(files))

photos = []
for idx, filepath in enumerate(files, 1):
    try:
        data = parse_file(filepath)
    except Exception as e:
        print(f'  WARNING: could not parse {filepath}: {e}')
        continue

    if not data:
        continue

    data['id'] = idx

    # Pages.cms stores the upload path in 'image'; gallery.js reads 'src'
    if 'image' in data and 'src' not in data:
        data['src'] = data['image']

    photos.append(data)

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
with open(OUTPUT_FILE, 'w', encoding='utf-8') as fh:
    json.dump({'photos': photos}, fh, indent=2, ensure_ascii=False)

print(f'Built {len(photos)} photo(s) → data/photos.json')
