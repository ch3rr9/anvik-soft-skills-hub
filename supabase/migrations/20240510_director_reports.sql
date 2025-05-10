
-- Create table for storing references to test result PDFs for director viewing
CREATE TABLE IF NOT EXISTS director_reports (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  test_result_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewed BOOLEAN NOT NULL DEFAULT false
);

-- Add policy to ensure only directors can view these reports
ALTER TABLE director_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for directors to view all reports
CREATE POLICY "Directors can view all reports" 
ON director_reports
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'director'
  )
);

-- Create policy for directors to update viewing status
CREATE POLICY "Directors can update reports" 
ON director_reports
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'director'
  )
);

-- Create storage bucket for test results if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'test-results', 'test-results', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'test-results'
);

-- Enable RLS on the bucket
UPDATE storage.buckets SET public = false WHERE id = 'test-results';

-- Allow directors to access files in the test-results bucket
CREATE POLICY "Directors can access test results" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'test-results' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'director'
  )
);

-- Allow employees to upload test results but not access them
CREATE POLICY "Users can upload test results" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'test-results' AND
  auth.uid() IS NOT NULL
);
