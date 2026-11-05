"""Transactional case storage and append-only, server-attributed revision history."""
import json
import sqlite3
import uuid
from review_protocol import eligibility_reasons
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / 'runtime' / 'skeleton.sqlite3'

class ClosingConnection(sqlite3.Connection):
    """Commit or roll back, then release the Windows file handle."""
    def __exit__(self, exc_type, exc_value, traceback):
        result = super().__exit__(exc_type, exc_value, traceback)
        self.close()
        return result

def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH, timeout=30, factory=ClosingConnection)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA journal_mode=WAL')
    db.executescript('''
      CREATE TABLE IF NOT EXISTS cases(id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, at TEXT NOT NULL, actor TEXT NOT NULL,
        kind TEXT NOT NULL, case_id TEXT, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS feedback(
        id TEXT PRIMARY KEY, case_id TEXT NOT NULL, revision INTEGER NOT NULL,
        status TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL,
        actor TEXT NOT NULL, payload TEXT NOT NULL,
        UNIQUE(case_id, revision)
      );
      CREATE INDEX IF NOT EXISTS idx_feedback_case ON feedback(case_id, revision DESC);
      CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status, updated DESC);
    ''')
    return db

def now():
    return datetime.now(timezone.utc).isoformat()

def event(kind, actor, case_id=None, payload=None, db=None):
    owned = db is None
    db = db or connect()
    identifier = uuid.uuid4().hex
    db.execute('INSERT INTO events VALUES(?,?,?,?,?,?)',
        (identifier, now(), actor, kind, case_id, json.dumps(payload or {}, ensure_ascii=False)))
    if owned:
        db.commit()
        db.close()
    return identifier

def save_cases(cases, actor):
    # An omitted case never deletes an existing record.
    with connect() as db:
        for case in cases:
            identifier = case.get('id')
            if not isinstance(identifier, str) or not identifier or len(identifier) > 120:
                raise ValueError('Case id is required (maximum 120 characters)')
            encoded = json.dumps(case, ensure_ascii=False, sort_keys=True)
            old = db.execute('SELECT payload FROM cases WHERE id=?', (identifier,)).fetchone()
            if old and old['payload'] == encoded:
                continue
            db.execute('INSERT INTO cases VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated=excluded.updated', (identifier, encoded, now()))
            event('CASE_UPDATED' if old else 'CASE_CREATED', actor, identifier,
                  {'before': json.loads(old['payload']) if old else None, 'after': case}, db)

def list_cases():
    with connect() as db:
        return [json.loads(r['payload']) for r in db.execute('SELECT payload FROM cases ORDER BY updated DESC')]

def get_case(case_id):
    with connect() as db:
        row = db.execute('SELECT payload FROM cases WHERE id=?', (case_id,)).fetchone()
    return json.loads(row['payload']) if row else None

def save_feedback(case_id, actor, payload, status='candidate'):
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        revision = db.execute(
            'SELECT COALESCE(MAX(revision), 0) + 1 AS revision FROM feedback WHERE case_id=?',
            (case_id,),
        ).fetchone()['revision']
        identifier = uuid.uuid4().hex
        timestamp = now()
        db.execute(
            'INSERT INTO feedback VALUES(?,?,?,?,?,?,?,?)',
            (identifier, case_id, revision, status, timestamp, timestamp, actor,
             json.dumps(payload, ensure_ascii=False, sort_keys=True)),
        )
        event('FEEDBACK_CREATED', actor, case_id,
              {'feedback_id': identifier, 'revision': revision, 'status': status}, db)
    return {'id': identifier, 'case_id': case_id, 'revision': revision, 'status': status, 'created': timestamp}

def list_feedback(status=None):
    with connect() as db:
        rows = db.execute(
            'SELECT * FROM feedback WHERE (? IS NULL OR status=?) ORDER BY updated DESC',
            (status, status),
        ).fetchall()
    return [{**dict(row), 'payload': json.loads(row['payload'])} for row in rows]

def update_feedback_status(feedback_id, status, actor, note=''):
    with connect() as db:
        row = db.execute('SELECT case_id, status, payload FROM feedback WHERE id=?', (feedback_id,)).fetchone()
        if not row:
            return None
        timestamp = now()
        payload = json.loads(row['payload'])
        if status == 'approved':
            reasons = eligibility_reasons(payload)
            if reasons:
                raise ValueError('Cannot approve: ' + ', '.join(reasons))
        if payload.get('locked_test', False) and status == 'approved':
            status = 'blocked_locked_test'
        payload['training_eligible'] = status == 'approved' and not payload.get('locked_test', False)
        payload['adjudication_note'] = note
        payload['adjudicated_at'] = timestamp
        payload['adjudicated_by'] = actor
        db.execute('UPDATE feedback SET status=?, updated=?, payload=? WHERE id=?',
                   (status, timestamp, json.dumps(payload, ensure_ascii=False, sort_keys=True), feedback_id))
        event('FEEDBACK_STATUS_CHANGED', actor, row['case_id'], {
            'feedback_id': feedback_id, 'before': row['status'], 'after': status, 'note': note,
        }, db)
    return {'id': feedback_id, 'status': status, 'updated': timestamp}

def exportable_feedback():
    # An older approved label must never override a newer pending revision.
    latest = {}
    for item in list_feedback():
        if item['case_id'] not in latest or item['revision'] > latest[item['case_id']]['revision']:
            latest[item['case_id']] = item
    return [item for item in latest.values() if item['status'] == 'approved'
            and not eligibility_reasons(item['payload'])]

def delete_case(case_id, actor):
    with connect() as db:
        old = db.execute('SELECT payload FROM cases WHERE id=?', (case_id,)).fetchone()
        if not old:
            return False
        db.execute('DELETE FROM cases WHERE id=?', (case_id,))
        event('CASE_DELETED', actor, case_id, {'before': json.loads(old['payload'])}, db)
    return True

def history(case_id=None):
    with connect() as db:
        rows = db.execute('SELECT * FROM events WHERE (? IS NULL OR case_id=?) ORDER BY at DESC LIMIT 500', (case_id, case_id)).fetchall()
    return [{**dict(r), 'payload': json.loads(r['payload'])} for r in rows]
