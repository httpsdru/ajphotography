#!/usr/bin/env python3
"""
Reads every .yml file in content/photos/ and writes data/photos.json.
Triggered automatically by the GitHub Action whenever Pages.cms saves a photo.
"""
import os, json, glob, yaml

PHOTOS_DIR  = os.path.join(os.path.dirname(__file__), '..', 'content', 'photos')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'photos.json')

files = sorted(
    glob.glob(os.path.join(PHOTOS_DIR, '*.yml')) +
    glob.glob(os.path.join(PHOTOS_DIR, '*.yaml'))
)

photos = []
for idx, filepath in enumerate(files, 1):
    with open(filepath, encoding='utf-8') as fh:
        data = yaml.safe_load(fh) or {}

    data['id'] = idx

    # Pages.cms stores the uploaded image path as 'image'.
    # Copy it to 'src' so gallery.js can find it.
    if 'image' in data and 'src' not in data:
        data['src'] = data['image']

    photos.append(data)

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
with open(OUTPUT_FILE, 'w', encoding='utf-8') as fh:
    json.dump({'photos': photos}, fh, indent=2, ensure_ascii=False)

print(f'Built {len(photos)} photo(s) → data/photos.json')