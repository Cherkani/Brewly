-- ============================================================================
-- BREWLY - SEED DATA
-- ============================================================================
-- Simple seed data for development
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO orgs (id, name, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Downtown Coffee Co.', NOW()),
('00000000-0000-0000-0000-000000000002', 'Mountain Brew', NOW()),
('00000000-0000-0000-0000-000000000003', 'Coastal Café', NOW());

-- ============================================================================
-- STORES
-- ============================================================================

-- Downtown Coffee Co. stores
INSERT INTO stores (id, org_id, name, address, is_active, created_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Street Store', '123 Main St, Downtown, NY 10001', true, NOW()),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Plaza Location', '456 Plaza Ave, City Center, NY 10002', true, NOW());

-- Mountain Brew stores
INSERT INTO stores (id, org_id, name, address, is_active, created_at) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Mountain View Café', '789 Mountain Rd, Highlands, CO 80401', true, NOW());

-- Coastal Café stores
INSERT INTO stores (id, org_id, name, address, is_active, created_at) VALUES
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Beachside Coffee', '321 Ocean Blvd, Seaside, CA 90210', true, NOW()),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Harbor Café', '654 Harbor Dr, Marina, CA 90211', true, NOW());

-- ============================================================================
-- USER ROLES
-- ============================================================================
-- Note: You'll need to manually link auth.users to roles after user signup
-- Example:
-- INSERT INTO user_roles (user_id, role, org_id, store_id, is_default) VALUES
-- ('YOUR-AUTH-USER-ID', 'cashier', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

-- Downtown Coffee Co. - Main Street Store Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Espresso', 'Coffee', 250, true, NOW()),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cappuccino', 'Coffee', 400, true, NOW()),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Latte', 'Coffee', 450, true, NOW()),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Americano', 'Coffee', 330, true, NOW()),
('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Mocha', 'Coffee', 500, true, NOW()),
('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Croissant', 'Pastry', 320, true, NOW()),
('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Blueberry Muffin', 'Pastry', 280, true, NOW());

-- Downtown Coffee Co. - Plaza Location Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Espresso', 'Coffee', 250, true, NOW()),
('30000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Cappuccino', 'Coffee', 400, true, NOW()),
('30000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Latte', 'Coffee', 450, true, NOW());

-- Mountain Brew Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Cold Brew', 'Cold Drinks', 400, true, NOW()),
('30000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Iced Latte', 'Cold Drinks', 450, true, NOW()),
('30000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Mountain Brew Special', 'Coffee', 420, true, NOW());

-- Coastal Café Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Sunrise Latte', 'Coffee', 450, true, NOW()),
('30000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Ocean Breeze', 'Cold Drinks', 480, true, NOW());

-- ============================================================================
-- SAMPLE ORDERS
-- ============================================================================

-- Order 1 (Queued)
INSERT INTO orders (id, org_id, store_id, status, total_cents, notes, created_at) VALUES
('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'queued', 800, 'Customer: Alice', NOW() - INTERVAL '15 minutes');

INSERT INTO order_items (order_id, product_id, quantity, price_cents, line_total_cents) VALUES
('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 2, 400, 800);

-- Order 2 (In Progress)
INSERT INTO orders (id, org_id, store_id, status, total_cents, notes, created_at) VALUES
('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'in_progress', 1090, 'Customer: Bob', NOW() - INTERVAL '10 minutes');

INSERT INTO order_items (order_id, product_id, quantity, price_cents, line_total_cents) VALUES
('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 1, 450, 450),
('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006', 2, 320, 640);

-- Order 3 (Completed)
INSERT INTO orders (id, org_id, store_id, status, total_cents, notes, created_at) VALUES
('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'completed', 330, 'Customer: Charlie', NOW() - INTERVAL '1 day');

INSERT INTO order_items (order_id, product_id, quantity, price_cents, line_total_cents) VALUES
('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 1, 330, 330);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
  ========================================
  ✅ SEED DATA LOADED!
  ========================================
  
  📊 Created:
  • 3 Organizations
  • 5 Stores
  • 15 Products
  • 3 Sample Orders
  
  🏢 Organizations:
  1. Downtown Coffee Co. (2 stores)
  2. Mountain Brew (1 store)
  3. Coastal Café (2 stores)
  
  📝 Next Steps:
  1. Sign up users via auth
  2. Link users to roles in user_roles table
  3. Set is_default = true for default login role/store
  
  ========================================
  ';
END $$;

