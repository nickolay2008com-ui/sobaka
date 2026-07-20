CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  user_agent TEXT,
  device TEXT,
  ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS funnel_events (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON funnel_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_events_name ON funnel_events(event_name, created_at DESC);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  messenger TEXT,
  niche TEXT NOT NULL,
  project_summary TEXT NOT NULL,
  proof TEXT,
  current_clients TEXT,
  budget_ready BOOLEAN NOT NULL DEFAULT FALSE,
  role_ready BOOLEAN NOT NULL DEFAULT FALSE,
  long_term_ready BOOLEAN NOT NULL DEFAULT FALSE,
  time_ready BOOLEAN NOT NULL DEFAULT FALSE,
  ethics_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER NOT NULL,
  fit TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_fit ON leads(fit, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_codes (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_codes_email ON admin_codes(email, created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  rate_key TEXT NOT NULL,
  bucket TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (rate_key, bucket)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);
