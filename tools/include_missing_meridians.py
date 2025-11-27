import csv
import os
from typing import Dict, List, Tuple

POINTS_PATH = os.path.join('tools', 'output', 'points_review.csv')
TEMP_PATH = os.path.join('tools', 'output', 'points_review_temp.csv')
MERIDIAN_INDEX_PATH = os.path.join('tables', 'acupuncture_points.csv')
MERIDIAN_POINT_FILES = {
    'GV': os.path.join('tables', '15_governing-vessel.csv'),
    'CV': os.path.join('tables', '16_conception-vessel.csv'),
}
DEFAULT_DATE = '2025-01-01T00:00:00Z'
LIST_PLACEHOLDER = '[]'
TAGS_PLACEHOLDER = '["seed-pending"]'


def load_meridian_metadata() -> Dict[str, Dict[str, str]]:
    metadata: Dict[str, Dict[str, str]] = {}
    with open(MERIDIAN_INDEX_PATH, encoding='utf-8', newline='') as source:
        reader = csv.DictReader(source)
        if not reader.fieldnames:
            return metadata
        field_map = {name.lower().lstrip('\ufeff'): name for name in reader.fieldnames if name}
        code_key = field_map.get('codigo')
        name_key = field_map.get('nome_ingles')
        group_key = field_map.get('meridiano')
        if not all([code_key, name_key, group_key]):
            missing = [label for label, key in [('codigo', code_key), ('nome_ingles', name_key), ('meridiano', group_key)] if key is None]
            raise KeyError(f"Missing expected columns in {MERIDIAN_INDEX_PATH}: {', '.join(missing)}")
        for row in reader:
            code = row[code_key]
            metadata[code] = {
                'meridianName': row[name_key],
                'meridianGroup': row[group_key],
            }
    return metadata


def read_points() -> Tuple[List[Dict[str, str]], List[str]]:
    with open(POINTS_PATH, encoding='utf-8', newline='') as source:
        reader = csv.DictReader(source)
        rows = list(reader)
        return rows, reader.fieldnames or []


def build_point_row(template_fields: List[str], meta: Dict[str, str], meridian_code: str, point: Dict[str, str]) -> Dict[str, str]:
    row = {field: '' for field in template_fields}
    row['code'] = point['Point']
    row['name'] = point['English']
    row['chineseName'] = point['Name']
    row['meridian'] = meridian_code
    row['meridianName'] = meta['meridianName']
    row['meridianGroup'] = meta['meridianGroup']
    row['translation.pinyin'] = point['Pinyin']
    row['translation.transliteration'] = point['Transliteration']
    row['translation.korean'] = point['Korean 한글']
    row['translation.vietnamese'] = point['Vietnamese']
    row['bodyMapCoords'] = LIST_PLACEHOLDER
    row['imageUrls'] = LIST_PLACEHOLDER
    row['imageRefs'] = LIST_PLACEHOLDER
    row['symptomIds'] = LIST_PLACEHOLDER
    row['tags'] = TAGS_PLACEHOLDER
    row['category'] = 'General'
    row['createdAt'] = DEFAULT_DATE
    row['updatedAt'] = DEFAULT_DATE
    row['createdBy'] = 'system'
    row['contentStatus'] = 'pending-review'
    return row


def write_points(rows: List[Dict[str, str]], fieldnames: List[str]) -> None:
    with open(TEMP_PATH, mode='w', encoding='utf-8', newline='') as target:
        writer = csv.DictWriter(target, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    os.replace(TEMP_PATH, POINTS_PATH)


def main() -> None:
    metadata = load_meridian_metadata()
    rows, fieldnames = read_points()
    if not fieldnames:
        raise RuntimeError('points_review.csv is missing headers')

    existing_codes = {row['code'] for row in rows}
    new_rows: List[Dict[str, str]] = []

    for meridian_code, csv_path in MERIDIAN_POINT_FILES.items():
        if meridian_code not in metadata:
            raise KeyError(f'Missing metadata for meridian {meridian_code}')
        with open(csv_path, encoding='utf-8', newline='') as source:
            reader = csv.DictReader(source)
            if not reader.fieldnames:
                continue
            header_map = {name.lower().lstrip('\ufeff'): name for name in reader.fieldnames if name}
            required_headers = [
                ('Point', 'point'),
                ('Name', 'name'),
                ('Transliteration', 'transliteration'),
                ('Pinyin', 'pinyin'),
                ('English', 'english'),
                ('Korean 한글', 'korean 한글'),
                ('Vietnamese', 'vietnamese'),
            ]
            resolved_headers = {}
            for canonical, lookup in required_headers:
                actual = header_map.get(lookup)
                if not actual:
                    raise KeyError(f"Missing column '{lookup}' in {csv_path}")
                resolved_headers[canonical] = actual
            for point in reader:
                normalized_point = {canonical: point[actual] for canonical, actual in resolved_headers.items()}
                code = normalized_point['Point']
                if code in existing_codes:
                    continue
                new_row = build_point_row(fieldnames, metadata[meridian_code], meridian_code, normalized_point)
                new_rows.append(new_row)
                existing_codes.add(code)

    if not new_rows:
        print('No missing meridian points detected.')
        return

    new_rows.sort(key=lambda item: (item['meridian'], int(item['code'].split('-')[1])))
    rows.extend(new_rows)
    write_points(rows, fieldnames)
    added_by_meridian: Dict[str, int] = {}
    for row in new_rows:
        added_by_meridian[row['meridian']] = added_by_meridian.get(row['meridian'], 0) + 1
    summary = ', '.join(f"{code}: {count}" for code, count in sorted(added_by_meridian.items()))
    print(f"Added {len(new_rows)} points -> {summary}")


if __name__ == '__main__':
    main()
