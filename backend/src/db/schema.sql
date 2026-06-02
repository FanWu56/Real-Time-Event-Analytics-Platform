CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  user_id TEXT,
  properties JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO projects (id, name)
VALUES ('demo_project_1', 'Demo Project')
ON CONFLICT (id) DO NOTHING;

INSERT INTO api_keys (id, project_id, api_key)
VALUES ('demo_api_key_1', 'demo_project_1', 'test_api_key_123')
ON CONFLICT (api_key) DO NOTHING;