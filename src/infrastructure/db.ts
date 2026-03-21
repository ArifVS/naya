import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'nyaymitra.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'hi',
    persona TEXT,
    state_code TEXT,
    tier TEXT NOT NULL DEFAULT 'FREE',
    queries_today INTEGER DEFAULT 0,
    queries_reset_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deleted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    input_type TEXT NOT NULL,
    input_text TEXT NOT NULL,
    input_audio_s3 TEXT,
    language_code TEXT NOT NULL,
    persona TEXT NOT NULL,
    state_code TEXT,
    answer_text TEXT,
    answer_audio_s3 TEXT,
    citation_act TEXT,
    citation_section TEXT,
    citation_verified INTEGER DEFAULT 0,
    sentence_count INTEGER,
    action_step_text TEXT,
    escalation_flag INTEGER DEFAULT 0,
    escalation_reason TEXT,
    misinfo_detected INTEGER DEFAULT 0,
    verdict TEXT,
    model_used TEXT DEFAULT 'gemini-3-flash-preview',
    latency_ms INTEGER,
    tokens_in INTEGER,
    tokens_out INTEGER,
    sampled_for_review INTEGER DEFAULT 0,
    advocate_verdict TEXT,
    advocate_notes TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    year INTEGER NOT NULL,
    section_count INTEGER,
    s3_key TEXT NOT NULL,
    pinecone_ns TEXT NOT NULL,
    chunk_count INTEGER,
    last_indexed_at TEXT,
    is_active INTEGER DEFAULT 1,
    language_code TEXT NOT NULL DEFAULT 'en',
    version INTEGER DEFAULT 1,
    supersedes_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supersedes_id) REFERENCES legal_documents(id)
  );

  CREATE TABLE IF NOT EXISTS legal_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    pinecone_id TEXT UNIQUE NOT NULL,
    section_ref TEXT,
    chunk_text TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES legal_documents(id)
  );
`);

export default db;
