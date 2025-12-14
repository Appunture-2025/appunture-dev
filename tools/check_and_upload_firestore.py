import argparse
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Any

import firebase_admin
from firebase_admin import credentials, firestore


def load_ndjson(path: Path) -> List[Dict[str, Any]]:
    items = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            items.append(json.loads(line))
    return items


def initialise_firebase(creds_path: Path | None, project: str | None) -> firestore.Client:
    if firebase_admin._apps:
        return firestore.client()
    if creds_path:
        cred = credentials.Certificate(str(creds_path))
        firebase_admin.initialize_app(cred, {"projectId": project})
    else:
        firebase_admin.initialize_app()
    return firestore.client()


def get_collection_count(client: firestore.Client, collection: str) -> int:
    docs = list(client.collection(collection).stream())
    return len(docs)


def sample_and_compare(client: firestore.Client, collection: str, local_items: List[Dict[str, Any]], sample_n: int = 10) -> Dict[str, Any]:
    result = {"missing": [], "mismatch": []}
    # pick first sample_n ids
    samples = [item.get('id') for item in local_items[:sample_n]]
    for sid in samples:
        doc = client.collection(collection).document(str(sid)).get()
        if not doc.exists:
            result["missing"].append(sid)
            continue
        remote = doc.to_dict()
        # basic checks: id/code existence and body_map_coords length (if present)
        local = next((i for i in local_items if str(i.get('id')) == str(sid)), None)
        if not local:
            continue
        # local may use camelCase or snake_case
        lcoords = local.get('bodyMapCoords') if local.get('bodyMapCoords') is not None else local.get('body_map_coords')
        if isinstance(lcoords, str):
            try:
                lcoords = json.loads(lcoords)
            except Exception:
                lcoords = []
        lr = len(lcoords or [])

        rcoords = remote.get('bodyMapCoords') if remote.get('bodyMapCoords') is not None else remote.get('body_map_coords')
        rr = len(rcoords or [])
        # remote may have bodyMapCoords as array or body_map_coords as string
        if lr != rr:
            result['mismatch'].append({"id": sid, "local_coords": lr, "remote_coords": rr})
    return result


def compare_ids(client: firestore.Client, collection: str, local_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    local_ids = {str(i.get('id')) for i in local_items}
    remote_docs = list(client.collection(collection).stream())
    remote_ids = {d.id for d in remote_docs}
    missing_in_remote = sorted(list(local_ids - remote_ids))
    extra_in_remote = sorted(list(remote_ids - local_ids))
    return {"missing_in_remote": missing_in_remote, "extra_in_remote": extra_in_remote}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--points', required=True, type=Path)
    parser.add_argument('--symptoms', required=True, type=Path)
    parser.add_argument('--credentials', type=Path, help='service account json')
    parser.add_argument('--project', type=str, help='GCP project id')
    parser.add_argument('--fix', action='store_true', help='If mismatches found, run import script to upload')
    args = parser.parse_args()

    points_local = load_ndjson(args.points)
    symptoms_local = load_ndjson(args.symptoms)

    print(f"Local counts -> points: {len(points_local)}, symptoms: {len(symptoms_local)}")
    # Show unique local ids (detect duplicates)
    local_point_ids = {str(i.get('id')) for i in points_local}
    local_symptom_ids = {str(i.get('id')) for i in symptoms_local}
    print(f"Local unique ids -> points: {len(local_point_ids)}, symptoms: {len(local_symptom_ids)}")

    client = initialise_firebase(args.credentials, args.project)

    points_count = get_collection_count(client, 'points')
    symptoms_count = get_collection_count(client, 'symptoms')

    print(f"Firestore counts -> points: {points_count}, symptoms: {symptoms_count}")

    diff_points = points_count - len(points_local)
    diff_symptoms = symptoms_count - len(symptoms_local)

    print(f"Diff -> points: {diff_points}, symptoms: {diff_symptoms}")

    # sample and compare
    cmp_points = sample_and_compare(client, 'points', points_local, sample_n=15)
    cmp_symptoms = sample_and_compare(client, 'symptoms', symptoms_local, sample_n=15)

    print('\nSample comparison results (first 15 local ids):')
    print('points missing:', cmp_points['missing'])
    print('points mismatch:', cmp_points['mismatch'])
    print('symptoms missing:', cmp_symptoms['missing'])
    print('symptoms mismatch:', cmp_symptoms['mismatch'])

    # Compare ids across collections to find missing documents
    idcmp_points = compare_ids(client, 'points', points_local)
    idcmp_symptoms = compare_ids(client, 'symptoms', symptoms_local)
    print('\nID comparison:')
    print('points missing in remote (sample):', idcmp_points['missing_in_remote'][:50])
    print('points extra in remote (sample):', idcmp_points['extra_in_remote'][:50])
    print('symptoms missing in remote (sample):', idcmp_symptoms['missing_in_remote'][:50])
    print('symptoms extra in remote (sample):', idcmp_symptoms['extra_in_remote'][:50])

    issues = (abs(diff_points) > 0) or (abs(diff_symptoms) > 0) or cmp_points['missing'] or cmp_points['mismatch'] or cmp_symptoms['missing'] or cmp_symptoms['mismatch']

    if issues:
        print('\nIssues detected between local seeds and Firestore.')
        if args.fix:
            print('Running import script to re-upload seeds (this will overwrite documents)...')
            cmd = [
                'python',
                str(Path(__file__).parent / 'import_firestore_seeds.py'),
                '--points', str(args.points),
                '--symptoms', str(args.symptoms),
            ]
            if args.credentials:
                cmd += ['--credentials', str(args.credentials)]
            if args.project:
                cmd += ['--project', args.project]
            print('Executing:', ' '.join(cmd))
            subprocess.run(cmd, check=True)
            print('Re-upload completed. Please re-run this check to verify.')
        else:
            print('Run with --fix to re-upload seeds.')
    else:
        print('\nNo issues detected. Firestore appears consistent with local seeds.')


if __name__ == '__main__':
    main()
