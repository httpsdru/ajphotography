#!/usr/bin/env python3
"""Reads content/photos/*.yml → writes data/photos.json"""
import os, json, glob, yaml

PHOTOS_DIR  = os.path.join(os.path.dirname(__file__), '..', 'content', 'photos')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'photos.json')

files  = sorted(glob.glob(os.path.join(PHOTOS_DIR, '*.yml')))
photos = []
for idx, f in enumerate(files, 1):
    with open(f) as fh:
        data = yaml.safe_load(fh) or {}
    data['id'] = idx
    photos.append(data)

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
with open(OUTPUT_FILE, 'w') as fh:
    json.dump({'photos': photos}, fh, indent=2, ensure_ascii=False)
print(f'Built {len(photos)} photos → data/photos.json')
