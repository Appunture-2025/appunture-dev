#!/usr/bin/env python3
"""Generate symptoms and categories seed files from points_review.csv indications."""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Set

# Configuration constants
MIN_SYMPTOM_LENGTH = 3
MAX_SYMPTOM_LENGTH = 100
MAX_SYMPTOM_ID_LENGTH = 50

# Category keyword patterns - organized for maintainability
CATEGORY_KEYWORDS = {
    "Dor e Musculoesquelético": [
        "dor", "dolor", "pain", "artralgia", "mialgia", "rigidez",
        "tensão", "contratura", "paralisia", "atrofia", "fraqueza", "dormência"
    ],
    "Respiratório": [
        "tosse", "asma", "dispneia", "falta de ar", "respirat",
        "pulmão", "pneumo", "bronqu", "estertores"
    ],
    "Digestivo": [
        "vômito", "náusea", "diarr", "constipação", "distensão abdom",
        "digestivo", "estômago", "intestin", "gastral", "gástric", "borborigmo", "anorexia"
    ],
    "Neurológico e Mental": [
        "cefal", "enxaqueca", "tontura", "vertigem", "epilep", "convuls",
        "síncope", "delírio", "mania", "ansied", "depres", "insônia", "sonho", "irritabil"
    ],
    "Cardiovascular": [
        "palpita", "cardía", "pressão", "hipertens", "taquicard", "bradica", "edema"
    ],
    "Olhos e Visão": [
        "ocular", "olho", "visão", "visual", "cegueira", "lacrim", "conjuntiv", "blefarit"
    ],
    "Ouvidos e Audição": [
        "ouvid", "surdez", "zumbido", "otorr", "otite", "audição"
    ],
    "Nariz e Garganta": [
        "nariz", "nasal", "epistaxe", "rino", "garganta", "laringe",
        "faringe", "amígdal", "disfagia"
    ],
    "Urogenital": [
        "urin", "micção", "disúria", "reten", "bexiga", "prósta",
        "genital", "menstr", "amenorr", "dismenorr", "útero", "ovár",
        "vaginal", "impo", "ejaculação"
    ],
    "Pele e Dermatológico": [
        "pele", "cutân", "eczema", "urticár", "coceira", "prurido",
        "acne", "erupção", "herpes"
    ],
    "Febre e Sistema Imune": [
        "febre", "calafrio", "sudor", "infecç", "inflama", "gripe", "resfr"
    ],
    "Geral e Energético": [
        "fadiga", "cansaço", "fraqueza geral", "yang", "yin", "qi", "sangue", "essência"
    ],
}

# Build compiled regex patterns from keywords
CATEGORY_PATTERNS: Dict[str, re.Pattern] = {}
for category, keywords in CATEGORY_KEYWORDS.items():
    pattern = "|".join(re.escape(kw) if not any(c in kw for c in "[]()") else kw for kw in keywords)
    CATEGORY_PATTERNS[category] = re.compile(pattern, re.IGNORECASE)


def categorize_symptom(symptom: str) -> str:
    """Determine category for a symptom based on keywords."""
    symptom_lower = symptom.lower()
    for category, pattern in CATEGORY_PATTERNS.items():
        if pattern.search(symptom_lower):
            return category
    return "Outros"


def extract_symptoms_from_indications(indications: str) -> List[str]:
    """Extract individual symptoms from an indication string."""
    if not indications or not indications.strip():
        return []
    
    # Split by common separators
    separators = r"[;,.]|\be\b"
    parts = re.split(separators, indications)
    
    symptoms: List[str] = []
    for part in parts:
        part = part.strip()
        # Clean up and filter by length bounds
        if MIN_SYMPTOM_LENGTH < len(part) < MAX_SYMPTOM_LENGTH:
            # Capitalize first letter
            part = part[0].upper() + part[1:] if part else part
            symptoms.append(part)
    
    return symptoms


def generate_symptom_id(name: str) -> str:
    """Generate a URL-safe ID from symptom name."""
    # Convert to lowercase, remove special chars, replace spaces with underscore
    id_str = name.lower()
    id_str = re.sub(r'[àáâãäå]', 'a', id_str)
    id_str = re.sub(r'[èéêë]', 'e', id_str)
    id_str = re.sub(r'[ìíîï]', 'i', id_str)
    id_str = re.sub(r'[òóôõö]', 'o', id_str)
    id_str = re.sub(r'[ùúûü]', 'u', id_str)
    id_str = re.sub(r'[ç]', 'c', id_str)
    id_str = re.sub(r'[ñ]', 'n', id_str)
    id_str = re.sub(r'[^a-z0-9\s]', '', id_str)
    id_str = re.sub(r'\s+', '_', id_str)
    return id_str[:MAX_SYMPTOM_ID_LENGTH]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate symptoms seed from points indications")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("tools/output/points_review.csv"),
        help="Path to points_review.csv",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("tools/output"),
        help="Output directory for seed files",
    )
    args = parser.parse_args()

    # Read points and extract indications
    symptoms_to_points: Dict[str, Set[str]] = defaultdict(set)
    all_symptoms: Set[str] = set()
    
    with args.input.open(encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            point_code = row.get("code", "").strip()
            indication = row.get("indication", "").strip()
            
            if not point_code or not indication:
                continue
            
            # Generate point ID (same format as export_points_review.py)
            point_id = point_code.replace("-", "_").lower()
            
            # Extract individual symptoms
            extracted = extract_symptoms_from_indications(indication)
            for symptom in extracted:
                all_symptoms.add(symptom)
                symptoms_to_points[symptom].add(point_id)
    
    # Build symptoms list with deduplication and categorization
    timestamp = datetime.now(timezone.utc).isoformat()
    
    symptom_records: List[Dict[str, Any]] = []
    category_counts: Dict[str, int] = defaultdict(int)
    
    for symptom_name in sorted(all_symptoms):
        symptom_id = generate_symptom_id(symptom_name)
        if not symptom_id:
            continue
            
        category = categorize_symptom(symptom_name)
        category_counts[category] += 1
        
        point_ids = sorted(symptoms_to_points[symptom_name])
        
        record = {
            "id": symptom_id,
            "name": symptom_name,
            "description": f"Sintoma: {symptom_name}",
            "category": category,
            "tags": [category.lower().replace(" ", "-")],
            "pointIds": point_ids,
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "createdBy": "system",
            "useCount": 0,
            "associatedPointsCount": len(point_ids),
            "severity": 5,  # Default middle severity
            "priority": 1,
        }
        symptom_records.append(record)
    
    # Write symptoms JSON
    symptoms_json_path = args.output_dir / "symptoms_seed.json"
    symptoms_json_path.write_text(
        json.dumps(symptom_records, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    
    # Write symptoms NDJSON
    symptoms_ndjson_path = args.output_dir / "symptoms_seed.ndjson"
    with symptoms_ndjson_path.open("w", encoding="utf-8") as fh:
        for record in symptom_records:
            fh.write(json.dumps(record, ensure_ascii=False))
            fh.write("\n")
    
    # Build categories
    category_records: List[Dict[str, Any]] = []
    for category_name, count in sorted(category_counts.items()):
        category_id = generate_symptom_id(category_name)
        record = {
            "id": category_id,
            "name": category_name,
            "description": f"Categoria de sintomas: {category_name}",
            "symptomCount": count,
            "createdAt": timestamp,
            "updatedAt": timestamp,
            "createdBy": "system",
        }
        category_records.append(record)
    
    # Write categories JSON
    categories_json_path = args.output_dir / "categories_seed.json"
    categories_json_path.write_text(
        json.dumps(category_records, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    
    # Write categories NDJSON
    categories_ndjson_path = args.output_dir / "categories_seed.ndjson"
    with categories_ndjson_path.open("w", encoding="utf-8") as fh:
        for record in category_records:
            fh.write(json.dumps(record, ensure_ascii=False))
            fh.write("\n")
    
    print(f"Generated {len(symptom_records)} symptoms -> {symptoms_json_path}")
    print(f"Generated {len(category_records)} categories -> {categories_json_path}")
    print("\nCategory distribution:")
    for category, count in sorted(category_counts.items()):
        print(f"  {category}: {count}")


if __name__ == "__main__":
    main()
