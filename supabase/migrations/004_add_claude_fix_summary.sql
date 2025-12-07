-- Add claude fix summary fields to track what Claude did
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS claude_fix_summary text;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS claude_fix_files text[];

-- Create index for finding bugs fixed by Claude
CREATE INDEX IF NOT EXISTS idx_bugs_claude_fix_summary ON bugs(claude_fix_summary) WHERE claude_fix_summary IS NOT NULL;
