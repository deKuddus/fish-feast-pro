-- Create settings table for restaurant configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT DEFAULT 'Fish Feast Pro',
  phone TEXT DEFAULT '',
  opening_hours JSONB DEFAULT '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-23:00", "saturday": "10:00-23:00", "sunday": "11:00-21:00"}'::jsonb,
  privacy_policy TEXT DEFAULT '',
  cookie_policy TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (id, shop_name, phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Fish Feast Pro', '+44 20 1234 5678')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to settings"
  ON public.settings
  FOR SELECT
  TO public
  USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access to settings"
  ON public.settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
