UPDATE app_users
SET responsible_pin_hash = '$2a$10$3ra09GPlb98dDocvt2T77Oxy2gBsUAHYOUxL87l7GM1byGQbeOy8a'
WHERE role = 'RESPONSIBLE'
  AND responsible_pin_hash IS NULL;
