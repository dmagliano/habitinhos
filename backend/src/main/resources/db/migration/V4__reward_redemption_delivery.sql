ALTER TABLE reward_redemptions
  ADD COLUMN delivered_at TIMESTAMPTZ;

ALTER TABLE reward_redemptions
  DROP CONSTRAINT reward_redemptions_status_check;

ALTER TABLE reward_redemptions
  ADD CONSTRAINT reward_redemptions_status_check
  CHECK (status IN ('REDEEMED', 'DELIVERED', 'CANCELLED'));
