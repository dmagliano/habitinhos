-- =============================================================================
-- V2: Mission, Assignment and Coin Transaction schema
-- =============================================================================

CREATE TABLE missions (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  title VARCHAR(160) NOT NULL,
  description VARCHAR(1000),
  coin_value INTEGER NOT NULL CHECK (coin_value > 0),
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  recurrence_type VARCHAR(24) NOT NULL DEFAULT 'ONCE'
    CHECK (recurrence_type IN ('ONCE', 'DAILY', 'WEEKLY', 'CUSTOM')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_user_id UUID NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_missions_family_unit_id ON missions(family_unit_id);
CREATE INDEX idx_missions_family_unit_id_active ON missions(family_unit_id, active);
CREATE INDEX idx_missions_created_by_user_id ON missions(created_by_user_id);

-- =============================================================================

CREATE TABLE assigned_missions (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  mission_id UUID NOT NULL REFERENCES missions(id),
  child_id UUID NOT NULL REFERENCES child_profiles(id),
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'AWAITING_APPROVAL', 'COMPLETED', 'REJECTED', 'CANCELLED')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason VARCHAR(500),
  snapshot_title VARCHAR(160) NOT NULL,
  snapshot_description VARCHAR(1000),
  snapshot_coin_value INTEGER NOT NULL CHECK (snapshot_coin_value > 0),
  snapshot_requires_approval BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_assigned_missions_family_child_status
  ON assigned_missions(family_unit_id, child_id, status);
CREATE INDEX idx_assigned_missions_family_status
  ON assigned_missions(family_unit_id, status);
CREATE INDEX idx_assigned_missions_mission_id
  ON assigned_missions(mission_id);

-- Prevents duplicate open assignments for the same mission + child
CREATE UNIQUE INDEX uk_assigned_missions_open_mission_child
  ON assigned_missions(mission_id, child_id)
  WHERE status IN ('PENDING', 'AWAITING_APPROVAL');

-- =============================================================================

CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  child_id UUID NOT NULL REFERENCES child_profiles(id),
  assigned_mission_id UUID REFERENCES assigned_missions(id),
  reward_redemption_id UUID,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('CREDIT', 'DEBIT', 'ADJUSTMENT')),
  source_type VARCHAR(40) NOT NULL
    CHECK (source_type IN ('MISSION_COMPLETION', 'REWARD_REDEMPTION', 'MANUAL_ADJUSTMENT')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  description VARCHAR(255),
  created_by_user_id UUID REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_coin_transactions_family_unit_id ON coin_transactions(family_unit_id);
CREATE INDEX idx_coin_transactions_wallet_id ON coin_transactions(wallet_id);
CREATE INDEX idx_coin_transactions_child_id ON coin_transactions(child_id);
CREATE INDEX idx_coin_transactions_assigned_mission_id ON coin_transactions(assigned_mission_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

-- Prevents duplicate mission credit for the same assigned mission
CREATE UNIQUE INDEX uk_coin_transactions_mission_credit
  ON coin_transactions(assigned_mission_id)
  WHERE assigned_mission_id IS NOT NULL
    AND type = 'CREDIT'
    AND source_type = 'MISSION_COMPLETION';
