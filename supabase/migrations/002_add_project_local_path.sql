-- Add local_path column to projects table for Claude Code integration
-- This stores the local file system path to the project directory

ALTER TABLE public.projects
ADD COLUMN local_path TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.projects.local_path IS 'Local filesystem path to the project directory for Claude Code integration';
