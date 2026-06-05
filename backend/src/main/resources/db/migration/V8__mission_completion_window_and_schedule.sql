ALTER TABLE missions
  ADD COLUMN completion_window_days INTEGER NOT NULL DEFAULT 0
    CHECK (completion_window_days >= 0);

ALTER TABLE assigned_missions
  ADD COLUMN scheduled_date DATE,
  ADD COLUMN snapshot_completion_window_days INTEGER NOT NULL DEFAULT 0
    CHECK (snapshot_completion_window_days >= 0);

UPDATE assigned_missions
SET scheduled_date = COALESCE(due_date, created_at::date)
WHERE scheduled_date IS NULL;

ALTER TABLE assigned_missions
  ALTER COLUMN scheduled_date SET NOT NULL;

DROP INDEX IF EXISTS uk_assigned_missions_open_mission_child;

CREATE UNIQUE INDEX uk_assigned_missions_open_once_mission_child
  ON assigned_missions(mission_id, child_id)
  WHERE status IN ('PENDING', 'AWAITING_APPROVAL')
    AND snapshot_recurrence_type IN ('ONCE', 'CUSTOM');

CREATE UNIQUE INDEX uk_assigned_missions_mission_child_scheduled
  ON assigned_missions(mission_id, child_id, scheduled_date);
