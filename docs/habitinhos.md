classDiagram
direction BT
class app_users {
   uuid family_unit_id
   varchar(160) name
   varchar(320) email
   varchar(40) role
   varchar(255) password_hash
   boolean active
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class assigned_missions {
   uuid family_unit_id
   uuid mission_id
   uuid child_id
   varchar(32) status
   date due_date
   timestamp with time zone completed_at
   timestamp with time zone approved_at
   timestamp with time zone rejected_at
   varchar(500) rejection_reason
   varchar(160) snapshot_title
   varchar(1000) snapshot_description
   integer snapshot_coin_value
   boolean snapshot_requires_approval
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class child_profiles {
   uuid family_unit_id
   varchar(160) name
   integer age
   varchar(80) avatar_key
   varchar(255) access_pin_hash
   boolean active
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class coin_transactions {
   uuid family_unit_id
   uuid wallet_id
   uuid child_id
   uuid assigned_mission_id
   uuid reward_redemption_id
   varchar(20) type
   varchar(40) source_type
   integer amount
   integer balance_after
   varchar(255) description
   uuid created_by_user_id
   timestamp with time zone created_at
   uuid id
}
class family_units {
   varchar(160) name
   boolean active
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class flyway_schema_history {
   varchar(50) version
   varchar(200) description
   varchar(20) type
   varchar(1000) script
   integer checksum
   varchar(100) installed_by
   timestamp installed_on
   integer execution_time
   boolean success
   integer installed_rank
}
class missions {
   uuid family_unit_id
   varchar(160) title
   varchar(1000) description
   integer coin_value
   boolean requires_approval
   varchar(24) recurrence_type
   boolean active
   uuid created_by_user_id
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class reward_redemptions {
   uuid family_unit_id
   uuid reward_id
   uuid child_id
   uuid wallet_id
   varchar(32) status
   varchar(160) snapshot_title
   integer snapshot_cost
   uuid coin_transaction_id
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class rewards {
   uuid family_unit_id
   varchar(160) title
   varchar(1000) description
   integer cost
   boolean active
   uuid created_by_user_id
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}
class wallets {
   uuid family_unit_id
   uuid child_id
   integer balance
   timestamp with time zone created_at
   timestamp with time zone updated_at
   uuid id
}

app_users  -->  family_units : family_unit_id:id
assigned_missions  -->  child_profiles : child_id:id
assigned_missions  -->  family_units : family_unit_id:id
assigned_missions  -->  missions : mission_id:id
child_profiles  -->  family_units : family_unit_id:id
coin_transactions  -->  app_users : created_by_user_id:id
coin_transactions  -->  assigned_missions : assigned_mission_id:id
coin_transactions  -->  child_profiles : child_id:id
coin_transactions  -->  family_units : family_unit_id:id
coin_transactions  -->  reward_redemptions : reward_redemption_id:id
coin_transactions  -->  wallets : wallet_id:id
missions  -->  app_users : created_by_user_id:id
missions  -->  family_units : family_unit_id:id
reward_redemptions  -->  child_profiles : child_id:id
reward_redemptions  -->  coin_transactions : coin_transaction_id:id
reward_redemptions  -->  family_units : family_unit_id:id
reward_redemptions  -->  rewards : reward_id:id
reward_redemptions  -->  wallets : wallet_id:id
rewards  -->  app_users : created_by_user_id:id
rewards  -->  family_units : family_unit_id:id
wallets  -->  child_profiles : child_id:id
wallets  -->  family_units : family_unit_id:id
