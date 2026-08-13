CREATE TABLE mfa_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE mfa_reset_requests ENABLE ROW LEVEL SECURITY;

-- Candidates can insert their own requests
CREATE POLICY "Anyone can insert mfa reset request"
  ON mfa_reset_requests
  FOR INSERT
  WITH CHECK (true);

-- Admins can view and update all requests
CREATE POLICY "Admins can view mfa reset requests"
  ON mfa_reset_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update mfa reset requests"
  ON mfa_reset_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

