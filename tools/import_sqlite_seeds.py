import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence


def load_ndjson(path: Path) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            records.append(json.loads(line))
    return records


def ensure_schema(conn: sqlite3.Connection) -> None:
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute(
        """CREATE TABLE IF NOT EXISTS points (
        id TEXT PRIMARY KEY,
        code TEXT,
        name TEXT NOT NULL,
        chinese_name TEXT,
        meridian TEXT NOT NULL,
        location TEXT NOT NULL,
        functions TEXT,
        indications TEXT,
        contraindications TEXT,
        image_path TEXT,
        coordinates TEXT,
        favorite_count INTEGER,
        synced INTEGER DEFAULT 1,
        last_sync DATETIME
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS symptoms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        synonyms TEXT,
        category TEXT,
        use_count INTEGER,
        synced INTEGER DEFAULT 1,
        last_sync DATETIME
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS symptom_points (
        symptom_id TEXT NOT NULL,
        point_id TEXT NOT NULL,
        efficacy_score REAL DEFAULT 1.0,
        PRIMARY KEY(symptom_id, point_id)
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        point_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        operation TEXT NOT NULL DEFAULT 'UPSERT',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(point_id, user_id)
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        point_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS sync_status (
        table_name TEXT PRIMARY KEY,
        last_sync DATETIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'success'
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT NOT NULL,
        reference TEXT,
        timestamp INTEGER NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        last_attempt INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL
    )"""
    )

    conn.execute(
        """CREATE TABLE IF NOT EXISTS image_sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        point_id TEXT NOT NULL,
        image_uri TEXT NOT NULL,
        payload TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_attempt DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_points_meridian ON points(meridian)",
        "CREATE INDEX IF NOT EXISTS idx_points_name ON points(name)",
        "CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category)",
        "CREATE INDEX IF NOT EXISTS idx_symptom_points_symptom ON symptom_points(symptom_id)",
        "CREATE INDEX IF NOT EXISTS idx_symptom_points_point ON symptom_points(point_id)",
        "CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_favorites_point ON favorites(point_id)",
        "CREATE INDEX IF NOT EXISTS idx_notes_point ON notes(point_id)",
        "CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status)",
        "CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type)",
        "CREATE INDEX IF NOT EXISTS idx_sync_queue_reference ON sync_queue(reference)",
        "CREATE INDEX IF NOT EXISTS idx_image_sync_queue_status ON image_sync_queue(status)",
        "CREATE INDEX IF NOT EXISTS idx_image_sync_queue_point ON image_sync_queue(point_id)",
    ]
    for statement in indexes:
        conn.execute(statement)


def map_point(record: Dict[str, Any]) -> Sequence[Any]:
    coordinates = record.get("coordinates")
    coordinates_json = json.dumps(coordinates) if coordinates is not None else None
    favorite_count = record.get("favoriteCount")
    if favorite_count is None:
        favorite_count = 0

    return (
        record["id"],
        record.get("code"),
        record.get("name"),
        record.get("chineseName"),
        record.get("meridian"),
        record.get("location"),
        record.get("functions"),
        record.get("indication") or record.get("indications"),
        record.get("contraindications"),
        None,  # image_path placeholder
        coordinates_json,
        favorite_count,
        1,
        record.get("updatedAt") or record.get("createdAt") or datetime.now(timezone.utc).isoformat(),
    )


def map_symptom(record: Dict[str, Any]) -> Sequence[Any]:
    return (
        record["id"],
        record.get("name"),
        None,  # synonyms
        record.get("category"),
        record.get("useCount") or record.get("use_count") or 0,
        1,
        record.get("updatedAt") or record.get("createdAt") or datetime.now(timezone.utc).isoformat(),
    )


def reset_tables(conn: sqlite3.Connection) -> None:
    tables = [
        "symptom_points",
        "points",
        "symptoms",
    ]
    for table in tables:
        conn.execute(f"DELETE FROM {table}")


def insert_points(conn: sqlite3.Connection, points: List[Dict[str, Any]]) -> None:
    conn.executemany(
        """INSERT OR REPLACE INTO points
        (id, code, name, chinese_name, meridian, location, functions, indications, contraindications, image_path, coordinates, favorite_count, synced, last_sync)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [map_point(point) for point in points],
    )


def insert_symptoms(conn: sqlite3.Connection, symptoms: List[Dict[str, Any]]) -> None:
    conn.executemany(
        """INSERT OR REPLACE INTO symptoms
        (id, name, synonyms, category, use_count, synced, last_sync)
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        [map_symptom(symptom) for symptom in symptoms],
    )


def insert_symptom_points(conn: sqlite3.Connection, symptoms: List[Dict[str, Any]]) -> None:
    rows: List[tuple[str, str, float]] = []
    for symptom in symptoms:
        for point_id in symptom.get("pointIds", []):
            rows.append((symptom["id"], point_id, 1.0))
    if rows:
        conn.executemany(
            """INSERT OR REPLACE INTO symptom_points (symptom_id, point_id, efficacy_score)
            VALUES (?, ?, ?)""",
            rows,
        )


def update_sync_status(conn: sqlite3.Connection, tables: Iterable[str]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    rows = [(table, now, "success") for table in tables]
    conn.executemany(
        "INSERT OR REPLACE INTO sync_status (table_name, last_sync, status) VALUES (?, ?, ?)",
        rows,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Load NDJSON seeds into a local SQLite database.")
    parser.add_argument("--db", type=Path, default=Path("appunture.db"), help="Target SQLite database file")
    parser.add_argument("--points", type=Path, required=True, help="Path to points_seed.ndjson")
    parser.add_argument("--symptoms", type=Path, required=True, help="Path to symptoms_seed.ndjson")
    parser.add_argument("--no-wipe", dest="wipe", action="store_false", help="Do not delete existing points/symptoms before import")
    parser.add_argument("--dry-run", action="store_true", help="Parse files without writing to the database")
    parser.set_defaults(wipe=True)

    args = parser.parse_args()

    points = load_ndjson(args.points)
    symptoms = load_ndjson(args.symptoms)
    print(f"Loaded {len(points)} points and {len(symptoms)} symptoms from seeds.")

    if args.dry_run:
        print("Dry run: validation complete; no writes executed.")
        return

    conn = sqlite3.connect(args.db)
    try:
        ensure_schema(conn)
        conn.execute("BEGIN")
        if args.wipe:
            reset_tables(conn)
        insert_points(conn, points)
        insert_symptoms(conn, symptoms)
        insert_symptom_points(conn, symptoms)
        update_sync_status(conn, ["points", "symptoms", "symptom_points"])
        conn.execute("COMMIT")
    except Exception as exc:  # noqa: BLE001
        conn.execute("ROLLBACK")
        raise
    finally:
        conn.close()

    print(f"Import completed. Database written to {args.db}.")


if __name__ == "__main__":
    main()
