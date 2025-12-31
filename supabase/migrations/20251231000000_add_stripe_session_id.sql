-- Add stripe_session_id column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);

-- Add missing columns to order_items table
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);

-- Update existing rows to copy unit_price to price if needed
UPDATE public.order_items SET price = unit_price WHERE price IS NULL;
