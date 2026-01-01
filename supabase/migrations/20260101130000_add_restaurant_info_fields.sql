-- Add additional restaurant info fields to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS address_line1 TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS address_line2 TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS postcode TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS delivery_time_minutes INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS opens_at TIME DEFAULT '15:30:00';

-- Update existing settings row with default values
UPDATE public.settings
SET
  address_line1 = COALESCE(address_line1, '808 London Rd'),
  address_line2 = COALESCE(address_line2, ''),
  city = COALESCE(city, 'Leigh-on-Sea'),
  postcode = COALESCE(postcode, 'SS9 3LB'),
  email = COALESCE(email, 'info@fishfeastpro.com'),
  delivery_time_minutes = COALESCE(delivery_time_minutes, 45),
  opens_at = COALESCE(opens_at, '15:30:00'::TIME)
WHERE id = '00000000-0000-0000-0000-000000000001';
