-- ============================================================================
-- BREWLY - DEVELOPMENT SEED DATA
-- ============================================================================
-- This script creates sample organizations, locations, users, and test data
-- for development and testing purposes
-- ============================================================================

-- Clean up existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE order_item_modifiers, order_items, orders, payments CASCADE;
-- TRUNCATE TABLE product_modifier_groups, product_prices, products CASCADE;
-- TRUNCATE TABLE modifiers, modifier_groups, sizes CASCADE;
-- TRUNCATE TABLE location_members, locations CASCADE;
-- TRUNCATE TABLE org_members, subscriptions, orgs CASCADE;
-- DELETE FROM auth.users WHERE email LIKE '%@brewly.test';

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

-- Organization 1: Downtown Coffee Co.
INSERT INTO orgs (id, name, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Downtown Coffee Co.', NOW());

-- Organization 2: Mountain Brew
INSERT INTO orgs (id, name, created_at) VALUES
('00000000-0000-0000-0000-000000000002', 'Mountain Brew', NOW());

-- Organization 3: Coastal Café
INSERT INTO orgs (id, name, created_at) VALUES
('00000000-0000-0000-0000-000000000003', 'Coastal Café', NOW());

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

INSERT INTO subscriptions (org_id, plan, status, started_at) VALUES
('00000000-0000-0000-0000-000000000001', 'pro', 'active', NOW()),
('00000000-0000-0000-0000-000000000002', 'basic', 'active', NOW()),
('00000000-0000-0000-0000-000000000003', 'enterprise', 'trialing', NOW());

-- ============================================================================
-- LOCATIONS
-- ============================================================================

-- Downtown Coffee Co. Locations
INSERT INTO locations (id, org_id, name, address, created_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Street Store', '123 Main St, Downtown', NOW()),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Plaza Location', '456 Plaza Ave, City Center', NOW());

-- Mountain Brew Locations
INSERT INTO locations (id, org_id, name, address, created_at) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Mountain View Café', '789 Mountain Rd, Highlands', NOW());

-- Coastal Café Locations
INSERT INTO locations (id, org_id, name, address, created_at) VALUES
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Beachside Coffee', '321 Ocean Blvd, Seaside', NOW()),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Harbor Café', '654 Harbor Dr, Marina', NOW());

-- ============================================================================
-- STAFF MEMBERS (Will be linked when users sign up)
-- ============================================================================
-- Note: In production, users sign up via auth.users
-- For dev, you can manually insert auth.users records, then link them here
-- Example of how to link after user signup:

-- Sample org members (you'll need real user_id from auth.users)
-- INSERT INTO org_members (org_id, user_id, role, created_at) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'YOUR-AUTH-USER-ID', 'owner', NOW());

-- Sample location members
-- INSERT INTO location_members (location_id, user_id, role, created_at) VALUES
-- ('10000000-0000-0000-0000-000000000001', 'YOUR-AUTH-USER-ID', 'admin', NOW());

-- ============================================================================
-- SIZES
-- ============================================================================

INSERT INTO sizes (id, location_id, name, created_at) VALUES
-- Downtown Coffee Co. - Main Street
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Small', NOW()),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Medium', NOW()),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Large', NOW()),

-- Downtown Coffee Co. - Plaza
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Small', NOW()),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Medium', NOW()),
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Large', NOW()),

-- Mountain Brew
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Regular', NOW()),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'Grande', NOW()),

-- Coastal Café - Beachside
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'Small', NOW()),
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'Medium', NOW()),
('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'Large', NOW());

-- ============================================================================
-- PRODUCTS
-- ============================================================================

-- Downtown Coffee Co. - Main Street Products
INSERT INTO products (id, location_id, name, description, category, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Espresso', 'Classic Italian espresso', 'Coffee', true, NOW()),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Cappuccino', 'Espresso with steamed milk foam', 'Coffee', true, NOW()),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Latte', 'Espresso with steamed milk', 'Coffee', true, NOW()),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Americano', 'Espresso with hot water', 'Coffee', true, NOW()),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Mocha', 'Chocolate espresso drink', 'Coffee', true, NOW()),
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'Croissant', 'Buttery French pastry', 'Pastry', true, NOW()),
('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Blueberry Muffin', 'Fresh baked muffin', 'Pastry', true, NOW());

-- Mountain Brew Products
INSERT INTO products (id, location_id, name, description, category, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000003', 'Cold Brew', 'Smooth cold brew coffee', 'Cold Drinks', true, NOW()),
('30000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000003', 'Iced Latte', 'Chilled espresso with milk', 'Cold Drinks', true, NOW()),
('30000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000003', 'Mountain Brew Special', 'Our signature blend', 'Coffee', true, NOW());

-- ============================================================================
-- PRODUCT PRICES
-- ============================================================================

-- Espresso Prices
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 250, NOW()), -- Small
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 300, NOW()); -- Medium

-- Cappuccino Prices
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 350, NOW()),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 400, NOW()),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 450, NOW());

-- Latte Prices
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 350, NOW()),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 400, NOW()),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 450, NOW());

-- Americano Prices
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 280, NOW()),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 330, NOW()),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 380, NOW());

-- Mocha Prices
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 450, NOW()),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 500, NOW());

-- Pastry Prices (no size variation)
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 320, NOW()),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 280, NOW());

-- Mountain Brew Prices
INSERT INTO product_prices (product_id, size_id, price, created_at) VALUES
('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000007', 400, NOW()),
('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000008', 500, NOW()),
('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000007', 380, NOW()),
('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000008', 450, NOW());

-- ============================================================================
-- MODIFIER GROUPS
-- ============================================================================

INSERT INTO modifier_groups (id, location_id, name, is_required, max_selections, created_at) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Milk Options', false, 1, NOW()),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sweeteners', false, 2, NOW()),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Extra Shots', false, 3, NOW()),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Toppings', false, 5, NOW());

-- ============================================================================
-- MODIFIERS
-- ============================================================================

-- Milk Options
INSERT INTO modifiers (id, modifier_group_id, name, price_adjustment, created_at) VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Whole Milk', 0, NOW()),
('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Skim Milk', 0, NOW()),
('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Oat Milk', 50, NOW()),
('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'Almond Milk', 50, NOW()),
('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'Soy Milk', 40, NOW());

-- Sweeteners
INSERT INTO modifiers (id, modifier_group_id, name, price_adjustment, created_at) VALUES
('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000002', 'Sugar', 0, NOW()),
('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000002', 'Honey', 20, NOW()),
('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000002', 'Vanilla Syrup', 30, NOW()),
('50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000002', 'Caramel Syrup', 30, NOW()),
('50000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000002', 'Hazelnut Syrup', 30, NOW());

-- Extra Shots
INSERT INTO modifiers (id, modifier_group_id, name, price_adjustment, created_at) VALUES
('50000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000003', 'Extra Shot', 50, NOW()),
('50000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000003', 'Double Shot', 100, NOW());

-- Toppings
INSERT INTO modifiers (id, modifier_group_id, name, price_adjustment, created_at) VALUES
('50000000-0000-0000-0000-000000000030', '40000000-0000-0000-0000-000000000004', 'Whipped Cream', 30, NOW()),
('50000000-0000-0000-0000-000000000031', '40000000-0000-0000-0000-000000000004', 'Chocolate Drizzle', 20, NOW()),
('50000000-0000-0000-0000-000000000032', '40000000-0000-0000-0000-000000000004', 'Cinnamon', 10, NOW());

-- ============================================================================
-- PRODUCT MODIFIER GROUPS (Link products to modifier groups)
-- ============================================================================

-- Cappuccino can have all modifier groups
INSERT INTO product_modifier_groups (product_id, modifier_group_id, created_at) VALUES
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', NOW()),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', NOW()),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', NOW()),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', NOW());

-- Latte can have all modifier groups
INSERT INTO product_modifier_groups (product_id, modifier_group_id, created_at) VALUES
('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', NOW()),
('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', NOW()),
('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', NOW()),
('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', NOW());

-- Americano (sweeteners and extra shots only)
INSERT INTO product_modifier_groups (product_id, modifier_group_id, created_at) VALUES
('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', NOW()),
('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', NOW());

-- Mocha (all modifiers)
INSERT INTO product_modifier_groups (product_id, modifier_group_id, created_at) VALUES
('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', NOW()),
('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', NOW()),
('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', NOW()),
('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000004', NOW());

-- ============================================================================
-- INGREDIENTS
-- ============================================================================

INSERT INTO ingredients (id, location_id, name, unit, current_stock, min_stock, max_stock, cost_per_unit, created_at) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Coffee Beans (Arabica)', 'kg', 50.00, 10.00, 100.00, 2500, NOW()),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Whole Milk', 'liter', 80.00, 20.00, 150.00, 120, NOW()),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Oat Milk', 'liter', 30.00, 10.00, 60.00, 180, NOW()),
('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Sugar', 'kg', 25.00, 5.00, 50.00, 150, NOW()),
('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Chocolate Powder', 'kg', 15.00, 5.00, 30.00, 800, NOW()),
('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'Vanilla Syrup', 'liter', 12.00, 3.00, 25.00, 600, NOW()),
('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Caramel Syrup', 'liter', 10.00, 3.00, 25.00, 650, NOW()),
('60000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'Paper Cups (12oz)', 'units', 500, 100, 1000, 15, NOW()),
('60000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'Paper Cups (16oz)', 'units', 450, 100, 1000, 20, NOW()),
('60000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'Lids', 'units', 800, 200, 1500, 5, NOW());

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

INSERT INTO suppliers (id, org_id, name, contact_name, email, phone, address, is_active, rating, created_at) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Premium Coffee Imports', 'John Smith', 'john@premiumcoffee.com', '+1-555-0101', '100 Coffee Lane, Import City', true, 5.0, NOW()),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Dairy Fresh Co.', 'Sarah Johnson', 'sarah@dairyfresh.com', '+1-555-0202', '200 Milk Road, Dairy Town', true, 4.5, NOW()),
('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Packaging Solutions Inc.', 'Mike Brown', 'mike@packagingsolutions.com', '+1-555-0303', '300 Supply Street, Package City', true, 4.8, NOW());

-- ============================================================================
-- SAMPLE ORDERS
-- ============================================================================

-- Sample Order 1 (Queued)
INSERT INTO orders (id, location_id, order_number, customer_name, status, total, created_at) VALUES
('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1001, 'Alice Cooper', 'queued', 750, NOW() - INTERVAL '5 minutes');

INSERT INTO order_items (order_id, product_id, size_id, quantity, unit_price, total_price) VALUES
('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 2, 400, 800);

-- Sample Order 2 (In Progress)
INSERT INTO orders (id, location_id, order_number, customer_name, status, total, created_at) VALUES
('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 1002, 'Bob Dylan', 'in_progress', 1130, NOW() - INTERVAL '3 minutes');

INSERT INTO order_items (order_id, product_id, size_id, quantity, unit_price, total_price) VALUES
('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 1, 450, 450),
('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 2, 320, 640);

-- Sample Order 3 (Ready)
INSERT INTO orders (id, location_id, order_number, customer_name, status, total, created_at) VALUES
('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 1003, 'Charlie Brown', 'ready', 380, NOW() - INTERVAL '1 minute');

INSERT INTO order_items (order_id, product_id, size_id, quantity, unit_price, total_price) VALUES
('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 1, 330, 330);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
  ========================================
  ✅ SEED DATA LOADED SUCCESSFULLY!
  ========================================
  
  📊 Created:
  • 3 Organizations
  • 5 Locations
  • 10+ Products with prices
  • 4 Modifier groups with options
  • 10 Ingredients
  • 3 Suppliers
  • 3 Sample orders
  
  🏢 Organizations:
  1. Downtown Coffee Co. (ID: 00000000-0000-0000-0000-000000000001)
     - Main Street Store
     - Plaza Location
  
  2. Mountain Brew (ID: 00000000-0000-0000-0000-000000000002)
     - Mountain View Café
  
  3. Coastal Café (ID: 00000000-0000-0000-0000-000000000003)
     - Beachside Coffee
     - Harbor Café
  
  📝 Next Steps:
  1. Sign up with your email
  2. Link your user to an organization
  3. Start using the POS system!
  
  ========================================
  ';
END $$;

