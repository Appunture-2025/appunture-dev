import json
from pathlib import Path

root = Path("d:/_repos/appunture-dev")
data_dir = root / "data/processed/2025-11-28"
coord_path = root / "coordenadas/COMPLETE.json"
symptoms_path = data_dir / "symptoms_seed.ndjson"
points_ndjson_path = data_dir / "points_seed.ndjson"
points_json_path = data_dir / "points_seed.json"

with coord_path.open("r", encoding="utf-8") as f:
    complete = json.load(f)

coordinates = complete["coordinates"]
exported_at = complete.get("exportedAt")

# Build a point -> symptomIds mapping preserving the order in the symptoms file.
point_to_symptoms: dict[str, list[str]] = {}
with symptoms_path.open("r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        symptom = json.loads(line)
        for point_id in symptom.get("pointIds", []):
            point_to_symptoms.setdefault(point_id, []).append(symptom["id"])


def normalize_tags(tags: list[str]) -> list[str]:
    seen: list[str] = []
    for tag in tags or []:
        if tag == "seed-pending":
            continue
        if tag not in seen:
            seen.append(tag)
    if "coords-mapped" not in seen:
        seen.append("coords-mapped")
    return seen


def apply_mapping(point: dict) -> dict:
    code = point["code"]
    coord = coordinates.get(code)
    if coord is None:
        raise KeyError(f"Missing coordinates for {code}")

    point["coordinates"] = {"x": coord["x"], "y": coord["y"]}
    point["bodyMapCoords"] = [
        {
            "view": coord.get("view"),
            "x": coord["x"],
            "y": coord["y"],
            "mappedAt": coord.get("mappedAt"),
        }
    ]
    point["tags"] = normalize_tags(point.get("tags", []))
    point["symptomIds"] = point_to_symptoms.get(point.get("id"), [])
    point["contentStatus"] = "approved"
    if exported_at:
        point["updatedAt"] = exported_at
    return point


# Update NDJSON version
points_ndjson = []
with points_ndjson_path.open("r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        pt = json.loads(line)
        points_ndjson.append(apply_mapping(pt))

with points_ndjson_path.open("w", encoding="utf-8", newline="\n") as f:
    for pt in points_ndjson:
        f.write(json.dumps(pt, ensure_ascii=False) + "\n")

# Update JSON array version
with points_json_path.open("r", encoding="utf-8") as f:
    points_json = json.load(f)

points_json = [apply_mapping(pt) for pt in points_json]

with points_json_path.open("w", encoding="utf-8", newline="\n") as f:
    json.dump(points_json, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("Updated points seeds with coordinates, symptomIds, and approval status.")
