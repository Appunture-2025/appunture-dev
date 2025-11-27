#!/usr/bin/env python3
"""Convert tools/output/points_review.csv into Firestore seed artifacts."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List

DEFAULT_INT_FIELDS = {
    "favoriteCount": 0,
    "viewCount": 0,
}


def load_config(config_path: Path) -> Dict[str, Any]:
    if not config_path.exists():
        return {}
    return json.loads(config_path.read_text(encoding="utf-8"))


def parse_float(value: str | None, field: str, code: str) -> float | None:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError as exc:
        raise ValueError(f"Point {code}: field '{field}' is not a float") from exc


def parse_json(value: str | None, field: str, code: str) -> Any:
    if value is None:
        return []
    value = value.strip()
    if not value:
        return []
    try:
        return json.loads(value)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Point {code}: field '{field}' has invalid JSON: {exc}") from exc


def sanitize_text(value: str | None, fallback: str = "") -> str:
    if value is None:
        return fallback
    text = value.strip()
    return text or fallback


def build_document(row: Dict[str, str], defaults: Dict[str, Any], strict: bool) -> Dict[str, Any]:
    code = sanitize_text(row.get("code"))
    if not code:
        raise ValueError("Encountered row without a code")

    translation = {
        "pinyin": sanitize_text(row.get("translation.pinyin")),
        "transliteration": sanitize_text(row.get("translation.transliteration")),
        "korean": sanitize_text(row.get("translation.korean")),
        "vietnamese": sanitize_text(row.get("translation.vietnamese")),
    }

    favorite_default = str(defaults.get("favoriteCount", DEFAULT_INT_FIELDS["favoriteCount"]))
    view_default = str(defaults.get("viewCount", DEFAULT_INT_FIELDS["viewCount"]))

    doc: Dict[str, Any] = {
        "code": code,
        "name": sanitize_text(row.get("name"), code),
        "chineseName": sanitize_text(row.get("chineseName")),
        "meridian": sanitize_text(row.get("meridian")),
        "meridianName": sanitize_text(row.get("meridianName")),
        "meridianGroup": sanitize_text(row.get("meridianGroup")),
        "translation": translation,
        "description": sanitize_text(row.get("description")),
        "location": sanitize_text(row.get("location")),
        "indication": sanitize_text(row.get("indication")),
        "contraindications": sanitize_text(row.get("contraindications")),
        "functions": sanitize_text(row.get("functions")),
        "coordinates": {
            "x": parse_float(row.get("coordinates.x"), "coordinates.x", code),
            "y": parse_float(row.get("coordinates.y"), "coordinates.y", code),
        },
        "bodyMapCoords": parse_json(row.get("bodyMapCoords"), "bodyMapCoords", code),
        "imageUrls": parse_json(row.get("imageUrls"), "imageUrls", code),
        "imageRefs": parse_json(row.get("imageRefs"), "imageRefs", code),
        "imageThumbnailMap": {},
        "imageAudit": [],
        "symptomIds": parse_json(row.get("symptomIds"), "symptomIds", code),
        "tags": parse_json(row.get("tags"), "tags", code) or defaults.get("tags", []),
        "category": sanitize_text(row.get("category"), defaults.get("categoryFallback", "General")),
        "createdAt": sanitize_text(row.get("createdAt"), defaults.get("createdAt", "")),
        "updatedAt": sanitize_text(row.get("updatedAt"), defaults.get("updatedAt", "")),
        "createdBy": sanitize_text(row.get("createdBy"), defaults.get("createdBy", "system")),
        "favoriteCount": int(sanitize_text(row.get("favoriteCount"), favorite_default)),
        "viewCount": int(sanitize_text(row.get("viewCount"), view_default)),
        "contentStatus": sanitize_text(row.get("contentStatus"), "pending-review"),
    }

    for field, default_value in DEFAULT_INT_FIELDS.items():
        if field not in doc:
            doc[field] = default_value

    if strict:
        for text_field in ("description", "location", "indication", "contraindications", "functions"):
            if not doc[text_field]:
                raise ValueError(f"Point {code} is missing required field '{text_field}'")

    doc["id"] = code.replace("-", "_").lower()
    return doc


def export_points(
    csv_path: Path,
    json_path: Path,
    ndjson_path: Path,
    config_path: Path,
    meridian_prefix: str | None = None,
    strict: bool = True,
) -> int:
    defaults = load_config(config_path).get("defaults", {})
    records: List[Dict[str, Any]] = []
    prefix = None
    if meridian_prefix:
        prefix = meridian_prefix.strip().upper()
        if prefix and not prefix.endswith("-"):
            prefix = f"{prefix}-"

    with csv_path.open(encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if prefix:
                code_value = (row.get("code") or "").strip().upper()
                if not code_value.startswith(prefix):
                    continue
            doc = build_document(row, defaults, strict)
            records.append(doc)

    if not records:
        raise ValueError("No points exported; verify the meridian filter or CSV contents.")

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")

    with ndjson_path.open("w", encoding="utf-8") as fh:
        for doc in records:
            fh.write(json.dumps(doc, ensure_ascii=False))
            fh.write("\n")

    return len(records)


def main() -> None:
    parser = argparse.ArgumentParser(description="Export points_review.csv to Firestore seed artifacts")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("tools/output/points_review.csv"),
        help="Path to points_review.csv",
    )
    parser.add_argument(
        "--json",
        type=Path,
        default=Path("tools/output/points_seed.json"),
        help="Output path for pretty JSON seed",
    )
    parser.add_argument(
        "--ndjson",
        type=Path,
        default=Path("tools/output/points_seed.ndjson"),
        help="Output path for Firestore NDJSON seed",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=Path("tools/seed_config.json"),
        help="Path to seed configuration for defaults",
    )
    parser.add_argument(
        "--meridian",
        type=str,
        default=None,
        help="Optional meridian prefix to export (e.g. GV, CV)",
    )
    parser.add_argument(
        "--allow-missing",
        action="store_true",
        help="Skip strict required-field validation to generate partial seeds",
    )
    args = parser.parse_args()

    strict = not args.allow_missing
    count = export_points(
        args.input,
        args.json,
        args.ndjson,
        args.config,
        args.meridian,
        strict,
    )
    print(f"Wrote {count} records to {args.json} and {args.ndjson}")


if __name__ == "__main__":
    main()
