CREATE TABLE family_units (
  id UUID PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE app_users (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  name VARCHAR(160) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role VARCHAR(40) NOT NULL CHECK (role IN ('RESPONSIBLE', 'ADMIN')),
  password_hash VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE child_profiles (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  name VARCHAR(160) NOT NULL,
  age INTEGER CHECK (age IS NULL OR age >= 0),
  avatar_key VARCHAR(80),
  access_pin_hash VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  child_id UUID NOT NULL UNIQUE REFERENCES child_profiles(id),
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_app_users_family_unit_id ON app_users(family_unit_id);
CREATE INDEX idx_child_profiles_family_unit_id ON child_profiles(family_unit_id);
CREATE INDEX idx_wallets_family_unit_id ON wallets(family_unit_id);
CREATE INDEX idx_wallets_child_id ON wallets(child_id);
