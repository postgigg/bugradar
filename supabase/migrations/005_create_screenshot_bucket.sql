-- Create storage bucket for bug screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bug-screenshots',
  'bug-screenshots',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Allow public read access to screenshots
CREATE POLICY "Public read access for screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'bug-screenshots');

-- Allow authenticated uploads (service role)
CREATE POLICY "Service role can upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bug-screenshots');

-- Allow service role to delete screenshots
CREATE POLICY "Service role can delete screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'bug-screenshots');
