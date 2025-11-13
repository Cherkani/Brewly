-- ============================================================================
-- BREWLY - SEED DATA
-- ============================================================================
-- Simple seed data for development
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO orgs (id, name, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Default', NOW()),
('00000000-0000-0000-0000-000000000002', 'Downtown Coffee Co.', NOW()),
('00000000-0000-0000-0000-000000000003', 'Mountain Brew', NOW());

-- ============================================================================
-- STORES
-- ============================================================================

-- Default org - Main Street Store (single store)
INSERT INTO stores (id, org_id, name, address, is_active, created_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Street Store', '123 Main St, Downtown, NY 10001', true, NOW());

-- Downtown Coffee Co. - Two stores
INSERT INTO stores (id, org_id, name, address, is_active, created_at) VALUES
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Plaza Location', '456 Plaza Ave, City Center, NY 10002', true, NOW()),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'City Center Store', '789 City Center Blvd, NY 10003', true, NOW());

-- Mountain Brew - One store
INSERT INTO stores (id, org_id, name, address, is_active, created_at) VALUES
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Mountain View Café', '789 Mountain Rd, Highlands, CO 80401', true, NOW());

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

-- Default org - Main Street Store - One product
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Default', 'Coffee', 350, true, NOW());

-- Downtown Coffee Co. - Plaza Location Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Espresso', 'Coffee', 250, true, NOW()),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Cappuccino', 'Coffee', 400, true, NOW()),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Latte', 'Coffee', 450, true, NOW());

-- Downtown Coffee Co. - City Center Store Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Espresso', 'Coffee', 250, true, NOW()),
('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Mocha', 'Coffee', 500, true, NOW());

-- Mountain Brew Products
INSERT INTO products (id, org_id, store_id, name, category, price_cents, is_active, created_at) VALUES
('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Cold Brew', 'Cold Drinks', 400, true, NOW()),
('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Iced Latte', 'Cold Drinks', 450, true, NOW()),
('30000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'Mountain Brew Special', 'Coffee', 420, true, NOW());

-- ============================================================================
-- SAMPLE ORDERS
-- ============================================================================

-- Default org - Main Street Store - One order
INSERT INTO orders (id, org_id, store_id, status, total_cents, notes, created_at) VALUES
('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'queued', 350, 'Default', NOW() - INTERVAL '15 minutes');

INSERT INTO order_items (order_id, product_id, quantity, price_cents, line_total_cents) VALUES
('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 350, 350);

-- Downtown Coffee Co. - Plaza Location Orders
INSERT INTO orders (id, org_id, store_id, status, total_cents, notes, created_at) VALUES
('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'in_progress', 800, 'Customer: Alice', NOW() - INTERVAL '10 minutes');

INSERT INTO order_items (order_id, product_id, quantity, price_cents, line_total_cents) VALUES
('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 2, 400, 800);

-- Mountain Brew Orders
INSERT INTO orders (id, org_id, store_id, status, total_cents, notes, created_at) VALUES
('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'ready', 400, 'Customer: Bob', NOW() - INTERVAL '5 minutes');

INSERT INTO order_items (order_id, product_id, quantity, price_cents, line_total_cents) VALUES
('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000007', 1, 400, 400);

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
    - Default (1 store: Main Street Store)
    - Downtown Coffee Co. (2 stores)
    - Mountain Brew (1 store)
  • 4 Stores total
  • 9 Products
  • 3 Sample Orders
  
  🏢 Organizations:
  1. Default
     - Main Street Store (1 product, 1 order - all named "Default")
  2. Downtown Coffee Co. (2 stores)
     - Plaza Location
     - City Center Store
  3. Mountain Brew (1 store)
     - Mountain View Café
  
  📝 Next Steps:
  1. Sign up users via auth
  2. Users will automatically get default cashier role assigned to first org/store
  3. Or manually link users to roles in user_roles table
  
  ========================================
  ';
END $$;
