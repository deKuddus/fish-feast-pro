-- Add delivery and pickup availability flags to products
ALTER TABLE public.products
  ADD COLUMN delivery_available BOOLEAN DEFAULT true,
  ADD COLUMN pickup_available BOOLEAN DEFAULT true;

-- Update existing products to have both options enabled
UPDATE public.products SET delivery_available = true, pickup_available = true;
