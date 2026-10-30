-- Idempotent: never delete imported clinical data.
CREATE TABLE IF NOT EXISTS public.nutricare (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    drug TEXT NOT NULL,
    active_sub TEXT NOT NULL,
    side_effect TEXT NOT NULL,
    avoid_consume TEXT NOT NULL,
    note TEXT
);

-- İndeks ekliyoruz
CREATE INDEX IF NOT EXISTS idx_nutricare_drug ON nutricare (drug);

-- RLS politikalarını ekliyoruz
ALTER TABLE nutricare ENABLE ROW LEVEL SECURITY;

-- Mevcut RLS politikalarını siliyoruz (eğer varsa)
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON nutricare;

-- Yeni RLS politikası ekliyoruz
CREATE POLICY "Allow read access to all authenticated users"
    ON nutricare
    FOR SELECT
    USING (auth.role() = 'authenticated'); 