-- Seed file for Fish Feast Pro
-- Creates default admin user and sample data

-- ============================================
-- CREATE DEFAULT ADMIN USER
-- ============================================
-- Email: ma.kuddus37@gmail.com
-- Password: You'll need to set this via Supabase Auth UI or change password flow

-- Note: In Supabase, users are created via the auth.users table which is managed by Supabase Auth
-- We can't directly insert into auth.users in SQL, so we'll create a function to help with this

-- First, let's create a helper function to create users if they don't exist
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT DEFAULT 'ChangeMe123!',
  user_full_name TEXT DEFAULT 'Admin User'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = user_email;

  IF new_user_id IS NOT NULL THEN
    -- User already exists, just ensure they have admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'User % already exists with ID %. Admin role ensured.', user_email, new_user_id;
    RETURN new_user_id;
  END IF;

  -- For new installations, we'll create a placeholder entry
  -- The actual user creation should be done via Supabase Dashboard or Auth API
  RAISE NOTICE 'User % does not exist. Please create this user via:', user_email;
  RAISE NOTICE '1. Supabase Dashboard → Authentication → Users → Invite User';
  RAISE NOTICE '2. Or use the Supabase Auth API';
  RAISE NOTICE '3. Then run this function again or manually add admin role';

  RETURN NULL;
END;
$$;

-- Try to assign admin role if user exists
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'ma.kuddus37@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- User exists, ensure they have admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE '✅ Admin role assigned to ma.kuddus37@gmail.com';
  ELSE
    RAISE NOTICE '⚠️  User ma.kuddus37@gmail.com does not exist yet.';
    RAISE NOTICE '📝 To create admin user:';
    RAISE NOTICE '   1. Go to Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '   2. Click "Invite User" or "Add User"';
    RAISE NOTICE '   3. Email: ma.kuddus37@gmail.com';
    RAISE NOTICE '   4. Auto-confirm: Yes';
    RAISE NOTICE '   5. After creation, run: SELECT create_admin_user(''ma.kuddus37@gmail.com'');';
    RAISE NOTICE '   Or the trigger will automatically assign customer role, then manually update:';
    RAISE NOTICE '   INSERT INTO user_roles (user_id, role) ';
    RAISE NOTICE '   SELECT id, ''admin'' FROM auth.users WHERE email = ''ma.kuddus37@gmail.com'';';
  END IF;
END;
$$;

-- ============================================
-- SAMPLE CATEGORIES
-- ============================================
INSERT INTO public.categories (name, slug, icon, sort_order)
VALUES
  ('Fish', 'fish', '🐟', 1),
  ('Burgers', 'burgers', '🍔', 2),
  ('Chicken', 'chicken', '🍗', 3),
  ('Pizza', 'pizza', '🍕', 4),
  ('Wraps', 'wraps', '🌯', 5),
  ('Pasta', 'pasta', '🍝', 6),
  ('Sides', 'sides', '🍟', 7),
  ('Salads', 'salads', '🥗', 8),
  ('Kids Meals', 'kids-meals', '👶', 9),
  ('Desserts', 'desserts', '🍰', 10),
  ('Drinks', 'drinks', '🥤', 11),
  ('Milkshakes', 'milkshakes', '🥤', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE PRODUCTS (50 Items)
-- ============================================
DO $$
DECLARE
  fish_cat_id UUID;
  burger_cat_id UUID;
  chicken_cat_id UUID;
  pizza_cat_id UUID;
  wraps_cat_id UUID;
  pasta_cat_id UUID;
  sides_cat_id UUID;
  salads_cat_id UUID;
  kids_cat_id UUID;
  desserts_cat_id UUID;
  drinks_cat_id UUID;
  milkshakes_cat_id UUID;
  
  product_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO fish_cat_id FROM public.categories WHERE slug = 'fish';
  SELECT id INTO burger_cat_id FROM public.categories WHERE slug = 'burgers';
  SELECT id INTO chicken_cat_id FROM public.categories WHERE slug = 'chicken';
  SELECT id INTO pizza_cat_id FROM public.categories WHERE slug = 'pizza';
  SELECT id INTO wraps_cat_id FROM public.categories WHERE slug = 'wraps';
  SELECT id INTO pasta_cat_id FROM public.categories WHERE slug = 'pasta';
  SELECT id INTO sides_cat_id FROM public.categories WHERE slug = 'sides';
  SELECT id INTO salads_cat_id FROM public.categories WHERE slug = 'salads';
  SELECT id INTO kids_cat_id FROM public.categories WHERE slug = 'kids-meals';
  SELECT id INTO desserts_cat_id FROM public.categories WHERE slug = 'desserts';
  SELECT id INTO drinks_cat_id FROM public.categories WHERE slug = 'drinks';
  SELECT id INTO milkshakes_cat_id FROM public.categories WHERE slug = 'milkshakes';

  -- Fish Products (8 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (fish_cat_id, 'Classic Fish & Chips', 'Beer-battered cod with crispy golden chips', 12.99, true, true, true, true, ARRAY['fish', 'gluten']),
    (fish_cat_id, 'Jumbo Cod', 'Extra large cod fillet with chips', 14.99, true, true, true, true, ARRAY['fish', 'gluten']),
    (fish_cat_id, 'Haddock & Chips', 'Fresh haddock in crispy batter', 13.49, false, true, true, true, ARRAY['fish', 'gluten']),
    (fish_cat_id, 'Plaice & Chips', 'Delicate plaice fillet with chips', 13.99, false, true, true, true, ARRAY['fish', 'gluten']),
    (fish_cat_id, 'Scampi & Chips', 'Breaded scampi pieces with chips', 11.99, true, true, true, true, ARRAY['shellfish', 'gluten']),
    (fish_cat_id, 'Fish Fingers', '6 crispy fish fingers with chips', 8.99, false, true, true, true, ARRAY['fish', 'gluten']),
    (fish_cat_id, 'Calamari Rings', 'Crispy fried calamari with tartare sauce', 9.49, false, true, true, true, ARRAY['shellfish', 'gluten']),
    (fish_cat_id, 'Grilled Salmon', 'Grilled salmon fillet with chips and salad', 15.99, false, true, true, true, ARRAY['fish']);

  -- Burgers (7 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (burger_cat_id, 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 8.99, true, true, true, true, ARRAY['gluten', 'dairy']),
    (burger_cat_id, 'Cheese Burger', 'Beef burger with melted cheddar cheese', 9.49, true, true, true, true, ARRAY['gluten', 'dairy']),
    (burger_cat_id, 'Double Beef Burger', 'Two beef patties with cheese and bacon', 12.99, true, true, true, true, ARRAY['gluten', 'dairy']),
    (burger_cat_id, 'BBQ Bacon Burger', 'Beef burger with BBQ sauce, bacon, and onion rings', 11.49, false, true, true, true, ARRAY['gluten', 'dairy']),
    (burger_cat_id, 'Veggie Burger', 'Plant-based patty with fresh vegetables', 8.49, false, true, true, true, ARRAY['gluten', 'soy']),
    (burger_cat_id, 'Fish Burger', 'Crispy fish fillet in a soft bun', 9.99, false, true, true, true, ARRAY['fish', 'gluten']),
    (burger_cat_id, 'Chicken Fillet Burger', 'Crispy chicken fillet with mayo', 9.49, false, true, true, true, ARRAY['gluten', 'dairy']);

  -- Chicken (6 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (chicken_cat_id, '6x Chicken Strips', 'Tender chicken strips with chips', 10.99, true, true, true, true, ARRAY['gluten']),
    (chicken_cat_id, '10x Chicken Wings', 'Crispy chicken wings with BBQ or buffalo sauce', 9.99, true, true, true, true, ARRAY['gluten']),
    (chicken_cat_id, 'Southern Fried Chicken', 'Half chicken with chips and coleslaw', 13.99, false, true, true, true, ARRAY['gluten', 'dairy']),
    (chicken_cat_id, 'Grilled Chicken Breast', 'Grilled chicken with rice and vegetables', 12.49, false, true, true, true, NULL),
    (chicken_cat_id, 'Chicken Nuggets', '10 golden chicken nuggets', 7.99, false, true, true, true, ARRAY['gluten']),
    (chicken_cat_id, 'BBQ Chicken', 'Chicken pieces in BBQ sauce with chips', 11.99, false, true, true, true, ARRAY['gluten']);

  -- Pizza (5 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (pizza_cat_id, 'Margherita Pizza', 'Classic tomato and mozzarella', 9.99, true, true, true, true, ARRAY['gluten', 'dairy']),
    (pizza_cat_id, 'Pepperoni Pizza', 'Loaded with pepperoni and cheese', 11.99, true, true, true, true, ARRAY['gluten', 'dairy']),
    (pizza_cat_id, 'Hawaiian Pizza', 'Ham and pineapple with cheese', 11.49, false, true, true, true, ARRAY['gluten', 'dairy']),
    (pizza_cat_id, 'BBQ Chicken Pizza', 'BBQ chicken with onions and peppers', 12.99, false, true, true, true, ARRAY['gluten', 'dairy']),
    (pizza_cat_id, 'Vegetarian Pizza', 'Mixed vegetables with cheese', 10.99, false, true, true, true, ARRAY['gluten', 'dairy']);

  -- Wraps (4 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (wraps_cat_id, 'Chicken Caesar Wrap', 'Grilled chicken with Caesar dressing', 7.99, false, true, true, true, ARRAY['gluten', 'dairy', 'egg']),
    (wraps_cat_id, 'BBQ Chicken Wrap', 'BBQ chicken with lettuce and cheese', 8.49, false, true, true, true, ARRAY['gluten', 'dairy']),
    (wraps_cat_id, 'Falafel Wrap', 'Crispy falafel with hummus and salad', 7.49, false, true, true, true, ARRAY['gluten', 'sesame']),
    (wraps_cat_id, 'Fish Wrap', 'Crispy fish with tartare sauce', 8.99, false, true, true, true, ARRAY['fish', 'gluten']);

  -- Pasta (3 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (pasta_cat_id, 'Spaghetti Bolognese', 'Classic meat sauce with spaghetti', 10.99, false, true, true, true, ARRAY['gluten']),
    (pasta_cat_id, 'Chicken Alfredo', 'Creamy pasta with grilled chicken', 11.99, false, true, true, true, ARRAY['gluten', 'dairy']),
    (pasta_cat_id, 'Vegetable Pasta', 'Mixed vegetables in tomato sauce', 9.99, false, true, true, true, ARRAY['gluten']);

  -- Sides (7 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (sides_cat_id, 'Regular Chips', 'Golden crispy chips', 3.50, true, true, true, true, NULL),
    (sides_cat_id, 'Large Chips', 'Extra large portion of chips', 4.50, true, true, true, true, NULL),
    (sides_cat_id, 'Onion Rings', 'Crispy breaded onion rings', 3.99, false, true, true, true, ARRAY['gluten']),
    (sides_cat_id, 'Coleslaw', 'Fresh homemade coleslaw', 2.99, false, true, true, true, ARRAY['egg']),
    (sides_cat_id, 'Mushy Peas', 'Traditional mushy peas', 2.49, false, true, true, true, NULL),
    (sides_cat_id, 'Curry Sauce', 'Rich curry sauce', 1.99, false, true, true, true, NULL),
    (sides_cat_id, 'Garlic Bread', '4 slices of garlic bread', 3.49, false, true, true, true, ARRAY['gluten', 'dairy']);

  -- Salads (3 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (salads_cat_id, 'Garden Salad', 'Fresh mixed salad with vinaigrette', 5.99, false, true, true, true, NULL),
    (salads_cat_id, 'Caesar Salad', 'Romaine lettuce with Caesar dressing and croutons', 6.99, false, true, true, true, ARRAY['gluten', 'dairy', 'egg']),
    (salads_cat_id, 'Greek Salad', 'Tomato, cucumber, olives, and feta cheese', 7.49, false, true, true, true, ARRAY['dairy']);

  -- Kids Meals (3 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (kids_cat_id, 'Kids Fish Fingers', '4 fish fingers with chips and drink', 6.99, false, true, true, true, ARRAY['fish', 'gluten']),
    (kids_cat_id, 'Kids Chicken Nuggets', '6 chicken nuggets with chips and drink', 6.99, false, true, true, true, ARRAY['gluten']),
    (kids_cat_id, 'Kids Burger', 'Small burger with chips and drink', 6.49, false, true, true, true, ARRAY['gluten', 'dairy']);

  -- Desserts (4 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (desserts_cat_id, 'Apple Pie', 'Warm apple pie with custard', 4.99, false, true, true, true, ARRAY['gluten', 'dairy', 'egg']),
    (desserts_cat_id, 'Chocolate Brownie', 'Rich chocolate brownie with ice cream', 5.49, false, true, true, true, ARRAY['gluten', 'dairy', 'egg']),
    (desserts_cat_id, 'Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce', 4.49, false, true, true, true, ARRAY['dairy']),
    (desserts_cat_id, 'Cheesecake', 'New York style cheesecake', 5.99, false, true, true, true, ARRAY['gluten', 'dairy', 'egg']);

  -- Drinks (5 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available)
  VALUES
    (drinks_cat_id, 'Coca Cola', '330ml can', 1.50, false, true, true, true),
    (drinks_cat_id, 'Diet Coke', '330ml can', 1.50, false, true, true, true),
    (drinks_cat_id, 'Sprite', '330ml can', 1.50, false, true, true, true),
    (drinks_cat_id, 'Orange Juice', '330ml bottle', 2.50, false, true, true, true),
    (drinks_cat_id, 'Still Water', '500ml bottle', 1.20, false, true, true, true);

  -- Milkshakes (3 items)
  INSERT INTO public.products (category_id, name, description, price, is_popular, is_available, delivery_available, pickup_available, allergens)
  VALUES
    (milkshakes_cat_id, 'Vanilla Milkshake', 'Creamy vanilla milkshake', 4.99, false, true, true, true, ARRAY['dairy']),
    (milkshakes_cat_id, 'Chocolate Milkshake', 'Rich chocolate milkshake', 4.99, false, true, true, true, ARRAY['dairy']),
    (milkshakes_cat_id, 'Strawberry Milkshake', 'Fresh strawberry milkshake', 4.99, false, true, true, true, ARRAY['dairy']);

END;
$$;

-- ============================================
-- PRODUCT OPTIONS
-- ============================================
DO $$
DECLARE
  rec RECORD;
  opt_group_id UUID;
BEGIN
  -- Add Size options for Burgers, Pizza, and Wraps
  FOR rec IN 
    SELECT id, name FROM products 
    WHERE category_id IN (
      SELECT id FROM categories WHERE slug IN ('burgers', 'pizza', 'wraps', 'fish')
    )
  LOOP
    -- Create Size option group
    INSERT INTO product_option_groups (product_id, name, is_required, min_selections, max_selections)
    VALUES (rec.id, 'Size', false, 0, 1)
    RETURNING id INTO opt_group_id;
    
    -- Add size options
    INSERT INTO product_options (option_group_id, name, price_modifier)
    VALUES 
      (opt_group_id, 'Regular', 0),
      (opt_group_id, 'Large', 2.00);
  END LOOP;

  -- Add Drink options for Kids Meals
  FOR rec IN 
    SELECT id FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'kids-meals')
  LOOP
    INSERT INTO product_option_groups (product_id, name, is_required, min_selections, max_selections)
    VALUES (rec.id, 'Drink Choice', true, 1, 1)
    RETURNING id INTO opt_group_id;
    
    INSERT INTO product_options (option_group_id, name, price_modifier)
    VALUES 
      (opt_group_id, 'Coca Cola', 0),
      (opt_group_id, 'Sprite', 0),
      (opt_group_id, 'Orange Juice', 0);
  END LOOP;

  -- Add Extra Toppings for Burgers
  FOR rec IN 
    SELECT id FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'burgers')
  LOOP
    INSERT INTO product_option_groups (product_id, name, is_required, min_selections, max_selections)
    VALUES (rec.id, 'Extra Toppings', false, 0, 5)
    RETURNING id INTO opt_group_id;
    
    INSERT INTO product_options (option_group_id, name, price_modifier)
    VALUES 
      (opt_group_id, 'Extra Cheese', 1.00),
      (opt_group_id, 'Bacon', 1.50),
      (opt_group_id, 'Fried Egg', 1.00),
      (opt_group_id, 'Jalapeños', 0.50),
      (opt_group_id, 'Onion Rings', 1.00);
  END LOOP;

  -- Add Sauce options for Chicken
  FOR rec IN 
    SELECT id FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'chicken')
  LOOP
    INSERT INTO product_option_groups (product_id, name, is_required, min_selections, max_selections)
    VALUES (rec.id, 'Sauce', false, 0, 2)
    RETURNING id INTO opt_group_id;
    
    INSERT INTO product_options (option_group_id, name, price_modifier)
    VALUES 
      (opt_group_id, 'BBQ Sauce', 0.50),
      (opt_group_id, 'Buffalo Sauce', 0.50),
      (opt_group_id, 'Garlic Mayo', 0.50),
      (opt_group_id, 'Sweet Chili', 0.50);
  END LOOP;

  -- Add Toppings for Pizza
  FOR rec IN 
    SELECT id FROM products WHERE category_id IN (SELECT id FROM categories WHERE slug = 'pizza')
  LOOP
    INSERT INTO product_option_groups (product_id, name, is_required, min_selections, max_selections)
    VALUES (rec.id, 'Extra Toppings', false, 0, 4)
    RETURNING id INTO opt_group_id;
    
    INSERT INTO product_options (option_group_id, name, price_modifier)
    VALUES 
      (opt_group_id, 'Extra Cheese', 1.50),
      (opt_group_id, 'Mushrooms', 1.00),
      (opt_group_id, 'Olives', 1.00),
      (opt_group_id, 'Pepperoni', 1.50),
      (opt_group_id, 'Chicken', 2.00);
  END LOOP;

END;
$$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the seed worked:

-- Check if admin user exists and has admin role
-- SELECT u.email, ur.role
-- FROM auth.users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- WHERE u.email = 'ma.kuddus37@gmail.com';

-- Check categories
-- SELECT * FROM categories ORDER BY sort_order;

-- Check products
-- SELECT p.name, c.name as category, p.price, p.is_available
-- FROM products p
-- LEFT JOIN categories c ON p.category_id = c.id
-- ORDER BY c.name, p.name;

-- ============================================
-- POST-SEED INSTRUCTIONS
-- ============================================
-- After running this seed:
-- 1. Create the admin user via Supabase Dashboard if not exists
-- 2. Manually assign admin role if the user was created after seed:
--    INSERT INTO user_roles (user_id, role)
--    SELECT id, 'admin' FROM auth.users WHERE email = 'ma.kuddus37@gmail.com'
--    ON CONFLICT DO NOTHING;
-- 3. Set a secure password for the admin user
-- 4. Test login with admin credentials
