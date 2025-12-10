import argparse
import itertools
import json
from pathlib import Path
from typing import Any, Dict, Iterable, List

import firebase_admin
from firebase_admin import credentials, firestore


def load_ndjson(path: Path) -> List[Dict[str, Any]]:
    """Load an NDJSON file into a list of dicts."""
    records: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            records.append(json.loads(line))
    return records


def chunked(items: List[Dict[str, Any]], size: int) -> Iterable[List[Dict[str, Any]]]:
    """Yield items in fixed-size chunks."""
    it = iter(items)
    while True:
        batch = list(itertools.islice(it, size))
        if not batch:
            break
        yield batch


def initialise_firebase(creds_path: Path | None, project: str | None) -> firestore.Client:
    """Initialise a Firestore client using explicit credentials or ambient settings."""

    # Reutiliza instância existente
    if firebase_admin._apps:
        return firestore.client()

    # Usa credentials explícitas, se fornecidas
    if creds_path:
        cred = credentials.Certificate(creds_path)
        firebase_admin.initialize_app(cred, {
            "projectId": project,
        })
    else:
        # Usa GOOGLE_APPLICATION_CREDENTIALS ou ambiente local configurado
        firebase_admin.initialize_app()

    # Firestore Admin SDK não aceita parâmetro "project"
    return firestore.client()


def push_documents(
    client: firestore.Client,
    collection: str,
    documents: List[Dict[str, Any]],
    batch_size: int,
) -> None:
    """Write documents to a Firestore collection using batch operations."""
    for batch in chunked(documents, batch_size):
        batch_writer = client.batch()
        for doc in batch:
            doc_id = doc.get("id")
            if not doc_id:
                raise ValueError(f"Document without id in collection {collection}: {doc}")

            payload = dict(doc)
            doc_ref = client.collection(collection).document(str(doc_id))
            batch_writer.set(doc_ref, payload)

        batch_writer.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Import seed data into Firestore.")

    parser.add_argument("--project", help="Firestore project id")
    parser.add_argument("--credentials", type=Path, help="Path to Firebase service account JSON")

    parser.add_argument("--points", type=Path, required=True, help="Path to points_seed.ndjson")
    parser.add_argument("--symptoms", type=Path, required=True, help="Path to symptoms_seed.ndjson")

    parser.add_argument("--points-collection", default="points", help="Collection name for points")
    parser.add_argument("--symptoms-collection", default="symptoms", help="Collection name for symptoms")

    parser.add_argument("--batch-size", type=int, default=400, help="Batch size (max 500)")
    parser.add_argument("--dry-run", action="store_true", help="Validate files but do not write")

    args = parser.parse_args()

    # Load data
    points = load_ndjson(args.points)
    symptoms = load_ndjson(args.symptoms)

    print(f"Loaded {len(points)} points and {len(symptoms)} symptoms from seeds.")

    if args.dry_run:
        print("Dry run: files validated; no writes executed.")
        return

    # Initialise Firebase
    client = initialise_firebase(args.credentials, args.project)

    # Upload points
    print(f"\nWriting points to collection '{args.points_collection}'...")
    push_documents(client, args.points_collection, points, args.batch_size)
    print("Points imported.")

    # Upload symptoms
    print(f"\nWriting symptoms to collection '{args.symptoms_collection}'...")
    push_documents(client, args.symptoms_collection, symptoms, args.batch_size)
    print("Symptoms imported.")

    print("\nImport completed successfully!")


if __name__ == "__main__":
    main()
