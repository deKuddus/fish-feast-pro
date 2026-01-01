-- Add email and order cancellation settings to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_order_cancellation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS resend_api_key TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS notification_email TEXT DEFAULT '';

-- Update existing settings row with default values
UPDATE public.settings
SET
  email_notifications_enabled = COALESCE(email_notifications_enabled, false),
  email_verification_required = COALESCE(email_verification_required, false),
  allow_order_cancellation = COALESCE(allow_order_cancellation, true),
  resend_api_key = COALESCE(resend_api_key, ''),
  notification_email = COALESCE(notification_email, '')
WHERE id = '00000000-0000-0000-0000-000000000001';
