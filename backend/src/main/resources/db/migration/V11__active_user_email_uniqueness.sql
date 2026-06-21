DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT lower(email) AS normalized_email
      FROM app_users
      WHERE active = true
      GROUP BY lower(email)
      HAVING count(*) > 1
    ) duplicate_active_emails
  ) THEN
    RAISE EXCEPTION 'Duplicate active app_users e-mail values found. Resolve active duplicates before applying active-only uniqueness.';
  END IF;
END $$;

ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_email_key;

DROP INDEX IF EXISTS uk_app_users_active_email_lower;

CREATE UNIQUE INDEX uk_app_users_active_email_lower
  ON app_users (lower(email))
  WHERE active = true;
