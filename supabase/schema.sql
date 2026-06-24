-- ZoMet Membership - Supabase Schema
-- Jalankan file ini di Supabase SQL Editor

-- ============================
-- TABEL UTAMA
-- ============================

-- Profil bisnis (satu per akun owner)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'gym',
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  whatsapp_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paket membership
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- dalam Rupiah
  duration_days INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data anggota
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  member_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('L', 'P')),
  address TEXT,
  photo_url TEXT,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Langganan aktif anggota
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed')),
  amount_paid INTEGER,
  receipt_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log check-in harian
CREATE TABLE IF NOT EXISTS checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  method TEXT DEFAULT 'qr' CHECK (method IN ('qr', 'manual', 'barcode')),
  notes TEXT
);

-- ============================
-- VIEWS BERGUNA
-- ============================

-- View status member lengkap
CREATE OR REPLACE VIEW member_status AS
SELECT
  m.id,
  m.business_id,
  m.member_code,
  m.full_name,
  m.phone,
  m.email,
  m.photo_url,
  s.id AS subscription_id,
  s.start_date,
  s.end_date,
  s.status,
  p.name AS plan_name,
  p.price AS plan_price,
  (s.end_date - CURRENT_DATE) AS days_remaining,
  (SELECT COUNT(*) FROM checkins c WHERE c.member_id = m.id) AS total_checkins,
  (SELECT MAX(checked_in_at) FROM checkins c WHERE c.member_id = m.id) AS last_checkin
FROM members m
LEFT JOIN subscriptions s ON s.member_id = m.id
  AND s.status IN ('active', 'trial')
  AND s.end_date >= CURRENT_DATE
LEFT JOIN plans p ON p.id = s.plan_id;

-- ============================
-- ROW LEVEL SECURITY
-- ============================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Owner hanya bisa akses data bisnisnya sendiri
CREATE POLICY "Owner akses bisnis sendiri" ON businesses
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Owner akses paket bisnis sendiri" ON plans
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Owner akses anggota bisnis sendiri" ON members
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Owner akses langganan bisnis sendiri" ON subscriptions
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Owner akses checkin bisnis sendiri" ON checkins
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- ============================
-- FUNGSI GENERATE KODE MEMBER
-- ============================

CREATE OR REPLACE FUNCTION generate_member_code(business_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  prefix TEXT;
  num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO num FROM members m WHERE m.business_id = $1;
  code := 'MBR-' || TO_CHAR(NOW(), 'YY') || '-' || LPAD(num::TEXT, 4, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- DATA SAMPLE (opsional)
-- ============================

-- Uncomment untuk insert data contoh setelah register akun
/*
INSERT INTO plans (business_id, name, price, duration_days, features, is_featured) VALUES
  ('[BUSINESS_ID]', 'Trial', 99000, 30, '["Akses gym jam kerja","Loker standar"]', false),
  ('[BUSINESS_ID]', 'Basic', 199000, 30, '["Akses gym all day","2 kelas grup/bulan","Loker standar"]', true),
  ('[BUSINESS_ID]', 'Premium', 349000, 30, '["Akses gym 24 jam","Kelas grup unlimited","1x personal trainer","Loker premium"]', false);
*/
