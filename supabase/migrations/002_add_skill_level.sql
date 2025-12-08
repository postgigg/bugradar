-- Add skill level to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'rookie' CHECK (skill_level IN ('rookie', 'pro'));

-- Update existing users to be 'pro' (they already know the platform)
UPDATE public.users SET skill_level = 'pro' WHERE skill_level IS NULL;
