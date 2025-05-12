--------------- NUTRICARE ---------------

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create nutricare table
CREATE TABLE IF NOT EXISTS public.nutricare (
    -- Required fields
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    drug TEXT NOT NULL,
    active_sub TEXT NOT NULL,
    side_effect TEXT NOT NULL,
    avoid_consume TEXT NOT NULL,
    note TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nutricare_drug ON public.nutricare (drug);

-- Enable RLS
ALTER TABLE public.nutricare ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON public.nutricare
FOR SELECT
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_nutricare_updated_at
    BEFORE UPDATE ON public.nutricare
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 