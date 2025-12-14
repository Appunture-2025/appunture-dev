import argparse
import json
from pathlib import Path
from typing import Dict, Any


def load_ndjson(path: Path):
    with path.open('r', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def write_ndjson(path: Path, items):
    with path.open('w', encoding='utf-8') as fh:
        for it in items:
            fh.write(json.dumps(it, ensure_ascii=False) + '\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    seen = {}
    removed = []
    total = 0
    for rec in load_ndjson(args.input):
        total += 1
        rid = str(rec.get('id') or rec.get('code') or '')
        if not rid:
            # fallback: keep with a generated key
            rid = f'__noid__{total}'
        if rid in seen:
            removed.append(rid)
            continue
        seen[rid] = rec

    kept = list(seen.values())
    write_ndjson(args.output, kept)

    print(f'Total input records: {total}')
    print(f'Unique kept: {len(kept)}')
    print(f'Duplicates removed: {len(removed)}')
    if removed:
        print('Sample removed ids:', removed[:20])


if __name__ == '__main__':
    main()
