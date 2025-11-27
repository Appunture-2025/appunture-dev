#!/usr/bin/env python3
"""Normalize Appunture acupuncture CSVs into FirestorePoint seed artifacts."""

from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class SeedRecord:
    code: str
    name: str
    chineseName: Optional[str]
    meridian: str
    meridianName: str
    meridianGroup: str
    translation: Dict[str, Optional[str]]
    description: str = ""
    location: str = ""
    indication: str = ""
    contraindications: str = ""
    functions: str = ""
    coordinates: Dict[str, Optional[float]] = field(
        default_factory=lambda: {"x": None, "y": None}
    )
    bodyMapCoords: List[Dict[str, Any]] = field(default_factory=list)
    imageUrls: List[str] = field(default_factory=list)
    imageRefs: List[str] = field(default_factory=list)
    imageThumbnailMap: Dict[str, str] = field(default_factory=dict)
    imageAudit: List[Dict[str, Any]] = field(default_factory=list)
    symptomIds: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    category: str = ""
    createdAt: str = ""
    updatedAt: str = ""
    createdBy: str = ""
    favoriteCount: int = 0
    viewCount: int = 0
    contentStatus: str = "pending-review"

    def to_firestore_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        # Firestore document id is derived from code (e.g., replace hyphen)
        data["id"] = self.code.replace("-", "_").lower()
        return data


class Normalizer:
    def __init__(self, config_path: Path):
        self.config = json.loads(config_path.read_text(encoding="utf-8"))
        base_dir = config_path.parent.parent
        self.tables_dir = (base_dir / self.config["paths"]["tablesDir"]).resolve()
        self.meridian_summary_path = (
            base_dir / self.config["paths"]["meridianSummary"]
        ).resolve()
        self.output_dir = (base_dir / self.config["paths"]["outputDir"]).resolve()
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.defaults = self.config.get("defaults", {})
        aliases = self.config.get("meridianAliases", {})
        self.meridian_aliases = {k.upper(): v.upper() for k, v in aliases.items()}

    def load_meridian_summary(self) -> Dict[str, Dict[str, str]]:
        mapping: Dict[str, Dict[str, str]] = {}
        with self.meridian_summary_path.open(encoding="utf-8-sig") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                code = row.get("codigo") or row.get("Code") or row.get("code")
                if not code:
                    continue
                mapping[code.strip().upper()] = {
                    "chinese": row.get("Chinese Name") or row.get("chines"),
                    "pinyin": row.get("Pinyin") or row.get("pinyin"),
                    "english": row.get("English") or row.get("nome_ingles"),
                    "group": row.get("meridiano") or row.get("Group") or "",
                }
        if not mapping:
            raise RuntimeError(
                f"No meridian metadata found in {self.meridian_summary_path}"
            )
        return mapping

    def discover_point_files(self) -> List[Path]:
        hyphenated = list(self.tables_dir.glob("*-meridian.csv"))
        underscored = list(self.tables_dir.glob("*_meridian.csv"))
        files = sorted({*hyphenated, *underscored}, key=lambda p: p.name)
        if not files:
            raise RuntimeError(
                f"No meridian CSV files found under {self.tables_dir}; expected pattern '*-meridian.csv' or '*_meridian.csv'"
            )
        return files

    def run(self) -> None:
        meridians = self.load_meridian_summary()
        files = self.discover_point_files()
        records: List[SeedRecord] = []
        seen_codes: set[str] = set()
        errors: List[str] = []

        timestamp = self.defaults.get("createdAt") or datetime.now(timezone.utc).isoformat()
        tags = self.defaults.get("tags") or []
        created_by = self.defaults.get("createdBy", "system")

        for file_path in files:
            with file_path.open(encoding="utf-8-sig") as fh:
                reader = csv.DictReader(fh)
                for row in reader:
                    code = (row.get("Point") or row.get("code") or "").strip()
                    if not code:
                        errors.append(f"Missing code in {file_path.name}")
                        continue
                    if code in seen_codes:
                        errors.append(f"Duplicate code detected: {code} in {file_path.name}")
                        continue

                    meridian_code = code.split("-")[0].upper()
                    canonical_code = self.meridian_aliases.get(
                        meridian_code, meridian_code
                    )
                    meridian_meta = meridians.get(canonical_code)
                    if not meridian_meta:
                        errors.append(
                            f"Unknown meridian '{meridian_code}' for point {code} in {file_path.name}"
                        )
                        continue

                    name = (
                        row.get("English")
                        or row.get("Transliteration")
                        or row.get("Name")
                        or code
                    ).strip()

                    record = SeedRecord(
                        code=code,
                        name=name,
                        chineseName=(row.get("Name") or row.get("Chinese") or "").strip() or None,
                        meridian=canonical_code,
                        meridianName=meridian_meta.get("english") or canonical_code,
                        meridianGroup=meridian_meta.get("group") or self.defaults.get("categoryFallback", ""),
                        translation={
                            "pinyin": row.get("Pinyin"),
                            "transliteration": row.get("Transliteration"),
                            "korean": row.get("Korean 한글"),
                            "vietnamese": row.get("Vietnamese"),
                        },
                        category=self.defaults.get("categoryFallback", ""),
                        tags=list(tags),
                        createdAt=timestamp,
                        updatedAt=timestamp,
                        createdBy=created_by,
                        favoriteCount=int(self.defaults.get("favoriteCount", 0)),
                        viewCount=int(self.defaults.get("viewCount", 0)),
                    )
                    records.append(record)
                    seen_codes.add(code)

        if errors:
            error_report = "\n".join(errors)
            raise SystemExit(f"Validation failed:\n{error_report}")

        self.write_outputs(records)
        print(f"Generated {len(records)} records -> {self.output_dir}")

    def write_outputs(self, records: List[SeedRecord]) -> None:
        json_path = self.output_dir / "points_seed.json"
        ndjson_path = self.output_dir / "points_seed.ndjson"
        csv_path = self.output_dir / "points_review.csv"

        json_path.write_text(
            json.dumps([rec.to_firestore_dict() for rec in records], indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        with ndjson_path.open("w", encoding="utf-8") as fh:
            for rec in records:
                fh.write(json.dumps(rec.to_firestore_dict(), ensure_ascii=False))
                fh.write("\n")

        headers = [
            "code",
            "name",
            "chineseName",
            "meridian",
            "meridianName",
            "meridianGroup",
            "translation.pinyin",
            "translation.transliteration",
            "translation.korean",
            "translation.vietnamese",
            "description",
            "location",
            "indication",
            "contraindications",
            "functions",
            "coordinates.x",
            "coordinates.y",
            "bodyMapCoords",
            "imageUrls",
            "imageRefs",
            "symptomIds",
            "tags",
            "category",
            "createdAt",
            "updatedAt",
            "createdBy",
            "contentStatus",
        ]
        with csv_path.open("w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=headers)
            writer.writeheader()
            for rec in records:
                data = rec.to_firestore_dict()
                row = {
                    "code": data["code"],
                    "name": data["name"],
                    "chineseName": data.get("chineseName") or "",
                    "meridian": data["meridian"],
                    "meridianName": data["meridianName"],
                    "meridianGroup": data.get("meridianGroup", ""),
                    "translation.pinyin": rec.translation.get("pinyin") or "",
                    "translation.transliteration": rec.translation.get("transliteration") or "",
                    "translation.korean": rec.translation.get("korean") or "",
                    "translation.vietnamese": rec.translation.get("vietnamese") or "",
                    "description": rec.description,
                    "location": rec.location,
                    "indication": rec.indication,
                    "contraindications": rec.contraindications,
                    "functions": rec.functions,
                    "coordinates.x": rec.coordinates.get("x"),
                    "coordinates.y": rec.coordinates.get("y"),
                    "bodyMapCoords": json.dumps(rec.bodyMapCoords, ensure_ascii=False),
                    "imageUrls": json.dumps(rec.imageUrls, ensure_ascii=False),
                    "imageRefs": json.dumps(rec.imageRefs, ensure_ascii=False),
                    "symptomIds": json.dumps(rec.symptomIds, ensure_ascii=False),
                    "tags": json.dumps(rec.tags, ensure_ascii=False),
                    "category": rec.category,
                    "createdAt": rec.createdAt,
                    "updatedAt": rec.updatedAt,
                    "createdBy": rec.createdBy,
                    "contentStatus": rec.contentStatus,
                }
                writer.writerow(row)


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize Appunture point CSVs")
    parser.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).resolve().with_name("seed_config.json"),
        help="Path to normalization config JSON",
    )
    args = parser.parse_args()

    normalizer = Normalizer(args.config)
    normalizer.run()


if __name__ == "__main__":
    main()
