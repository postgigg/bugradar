-- Add claude_fixing flag to track when Claude is actively fixing a bug
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS claude_fixing boolean DEFAULT false;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS claude_fix_started_at timestamptz;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS claude_fix_completed_at timestamptz;

-- Create index for finding bugs being fixed by Claude
CREATE INDEX IF NOT EXISTS idx_bugs_claude_fixing ON bugs(claude_fixing) WHERE claude_fixing = true;
