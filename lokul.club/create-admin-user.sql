-- Create Admin User in Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/sql/new

-- Create admin user with email/password
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@lokul.club',
  crypt('admin123', gen_salt('bf')),  -- Password: admin123
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"role":"admin","name":"Admin"}'::jsonb,
  false,
  'authenticated',
  'authenticated'
);

-- Verify the user was created
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@lokul.club';
