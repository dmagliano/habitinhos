CREATE TABLE auth_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_users(id),
  purpose VARCHAR(40) NOT NULL CHECK (purpose IN ('PASSWORD', 'RESPONSIBLE_PIN')),
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_auth_reset_tokens_user_purpose_active
  ON auth_reset_tokens(user_id, purpose)
  WHERE used_at IS NULL;

CREATE INDEX idx_auth_reset_tokens_token_hash_purpose
  ON auth_reset_tokens(token_hash, purpose);
