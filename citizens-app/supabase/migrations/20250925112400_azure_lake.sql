/*
  # Add Ward Support to Database

  1. New Tables
    - `wards` table for storing ward information
      - `id` (uuid, primary key)
      - `ward_id` (text, unique) - External ward identifier
      - `name` (text) - Ward name
      - `municipality_id` (uuid) - Reference to municipality
      - `geojson` (jsonb) - Ward boundary geometry
      - `properties` (jsonb) - Additional ward properties
      - `created_at` (timestamp)

  2. Schema Updates
    - Add `ward_id` column to `users` table
    - Add `ward_id` column to `reports` table
    - Add indexes for performance

  3. Security
    - Enable RLS on `wards` table
    - Add policies for public read access
*/

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id text UNIQUE NOT NULL,
  name text NOT NULL,
  municipality_id uuid REFERENCES municipalities(id),
  geojson jsonb NOT NULL DEFAULT '{}',
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add ward_id to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'ward_id'
  ) THEN
    ALTER TABLE users ADD COLUMN ward_id text;
  END IF;
END $$;

-- Add ward_id to reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'ward_id'
  ) THEN
    ALTER TABLE reports ADD COLUMN ward_id text;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wards_ward_id ON wards(ward_id);
CREATE INDEX IF NOT EXISTS idx_wards_municipality_id ON wards(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_ward_id ON users(ward_id);
CREATE INDEX IF NOT EXISTS idx_reports_ward_id ON reports(ward_id);

-- Enable RLS on wards table
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for wards
CREATE POLICY "Anyone can read wards"
  ON wards
  FOR SELECT
  TO public
  USING (true);

-- Add foreign key constraints (optional, as ward_id might be external)
-- Uncomment if you want to enforce referential integrity
-- ALTER TABLE users ADD CONSTRAINT users_ward_id_fkey 
--   FOREIGN KEY (ward_id) REFERENCES wards(ward_id);
-- ALTER TABLE reports ADD CONSTRAINT reports_ward_id_fkey 
--   FOREIGN KEY (ward_id) REFERENCES wards(ward_id);