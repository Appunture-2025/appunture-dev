#!/usr/bin/env python3
"""Validate enriched tools/output/points_review.csv before seeding.

Checks:
- Required text fields are non-empty for all points.
- JSON-like columns remain valid (where present).
- Optional filter by meridian for batch validation.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import List


REQUIRED_TEXT_FIELDS = [
    "description",
    "location",
    "indication",
    "contraindications",
    "functions",
]

JSON_FIELDS = [
    "bodyMapCoords",
    "imageUrls",
    "imageRefs",
    "symptomIds",
    "tags",
]


def validate(csv_path: Path, meridian: str | None = None) -> int:
    errors: List[str] = []

    with csv_path.open(encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            code = row.get("code", "").strip()
            if meridian and not code.startswith(f"{meridian}-"):
                continue

            # Required text fields
            for field in REQUIRED_TEXT_FIELDS:
                if not (row.get(field) or "").strip():
                    errors.append(f"{code}: missing required field '{field}'")

            # JSON list fields
            for field in JSON_FIELDS:
                raw = (row.get(field) or "").strip()
                if not raw:
                    continue
                try:
                    parsed = json.loads(raw)
                    if not isinstance(parsed, (list, dict)):
                        errors.append(f"{code}: field '{field}' is not list/dict JSON")
                except json.JSONDecodeError as exc:
                    errors.append(f"{code}: field '{field}' invalid JSON: {exc}")

    if errors:
        print("Validation failed:")
        for e in errors:
            print("-", e)
        return 1

    print("Validation passed.")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate points_review.csv")
    parser.add_argument(
        "--file",
        type=Path,
        default=Path("tools/output/points_review.csv"),
        help="Path to points_review.csv",
    )
    parser.add_argument(
        "--meridian",
        type=str,
        default=None,
        help="Optional meridian prefix to validate (e.g. LU, LI)",
    )
    args = parser.parse_args()

    exit_code = validate(args.file, args.meridian)
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
