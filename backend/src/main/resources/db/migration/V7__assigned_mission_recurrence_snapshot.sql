ALTER TABLE assigned_missions
  ADD COLUMN snapshot_recurrence_type VARCHAR(24) NOT NULL DEFAULT 'ONCE'
    CHECK (snapshot_recurrence_type IN ('ONCE', 'DAILY', 'WEEKLY', 'CUSTOM'));
