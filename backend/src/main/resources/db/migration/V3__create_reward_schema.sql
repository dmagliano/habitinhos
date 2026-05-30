CREATE TABLE rewards (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  title VARCHAR(160) NOT NULL,
  description VARCHAR(1000),
  cost INTEGER NOT NULL CHECK (cost > 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_rewards_family_unit_id ON rewards(family_unit_id);
CREATE INDEX idx_rewards_family_unit_id_active ON rewards(family_unit_id, active);
CREATE INDEX idx_rewards_created_by_user_id ON rewards(created_by_user_id);

CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  reward_id UUID NOT NULL REFERENCES rewards(id),
  child_id UUID NOT NULL REFERENCES child_profiles(id),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  status VARCHAR(32) NOT NULL DEFAULT 'REDEEMED'
    CHECK (status IN ('REDEEMED', 'CANCELLED')),
  snapshot_title VARCHAR(160) NOT NULL,
  snapshot_cost INTEGER NOT NULL CHECK (snapshot_cost > 0),
  coin_transaction_id UUID REFERENCES coin_transactions(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_reward_redemptions_family_unit_id ON reward_redemptions(family_unit_id);
CREATE INDEX idx_reward_redemptions_child_id ON reward_redemptions(child_id);
CREATE INDEX idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX idx_reward_redemptions_coin_transaction_id ON reward_redemptions(coin_transaction_id);

ALTER TABLE coin_transactions
  ADD CONSTRAINT fk_coin_transactions_reward_redemption
  FOREIGN KEY (reward_redemption_id) REFERENCES reward_redemptions(id);
