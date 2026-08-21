ALTER TABLE auth_reset_tokens
  DROP CONSTRAINT auth_reset_tokens_purpose_check;

ALTER TABLE auth_reset_tokens
  ADD CONSTRAINT auth_reset_tokens_purpose_check
  CHECK (purpose IN ('PASSWORD', 'RESPONSIBLE_PIN', 'ACCOUNT_DELETION', 'PERMANENT_ACCOUNT_DELETION'));
