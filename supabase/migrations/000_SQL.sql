-- ============================================================================
-- BREWLY - FULL RESET + SEED WITH SIMPLE NUMERIC IDs
-- ============================================================================
-- Run this in one go. It will:
-- 1. Drop schema (if exists)
-- 2. Create fresh schema
-- 3. Insert seed data with IDs like 000000000001
-- ============================================================================

-- Drop everything
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;

-- ============================================================================
-- 1. CREATE TABLES (in dependency order)
-- ============================================================================

-- Organizations
CREATE TABLE orgs (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    renews_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations
CREATE TABLE locations (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sizes
CREATE TABLE sizes (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Prices
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    product_id UUID NOT NULL REFERENCES products(id),
    size_id UUID NOT NULL REFERENCES sizes(id),
    price_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (location_id, product_id, size_id)
);

-- Modifier Groups
CREATE TABLE modifier_groups (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    name TEXT NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    max_choices INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifiers
CREATE TABLE modifiers (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    group_id UUID NOT NULL REFERENCES modifier_groups(id),
    name TEXT NOT NULL,
    price_delta_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Modifier Groups
CREATE TABLE product_modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    group_id UUID NOT NULL REFERENCES modifier_groups(id),
    sort_order INTEGER DEFAULT 0,
    UNIQUE (product_id, group_id)
);

-- Ingredients
CREATE TABLE ingredients (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    max_stock DECIMAL(10,2) DEFAULT 0,
    cost_per_unit INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,1),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Categories
CREATE TABLE supplier_categories (
    org_id UUID NOT NULL REFERENCES orgs(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (org_id, name)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    order_number TEXT NOT NULL,
    status TEXT NOT NULL,
    order_date TIMESTAMPTZ,
    expected_delivery TIMESTAMPTZ,
    total_amount_cents INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    product_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    size_id UUID NOT NULL REFERENCES sizes(id),
    qty INTEGER NOT NULL,
    base_price_cents INTEGER NOT NULL,
    line_total_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Item Modifiers
CREATE TABLE order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    order_item_id UUID NOT NULL REFERENCES order_items(id),
    modifier_id UUID NOT NULL REFERENCES modifiers(id),
    price_delta_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    method TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Transactions
CREATE TABLE inventory_tx (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    tx_type TEXT NOT NULL,
    quantity_change DECIMAL(10,2) NOT NULL,
    cost_per_unit INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    alert_type TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    product_id UUID NOT NULL REFERENCES products(id),
    name TEXT NOT NULL,
    yield_quantity DECIMAL(10,2) NOT NULL,
    yield_unit TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Items
CREATE TABLE recipe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL
);

-- KDS Tokens
CREATE TABLE kds_tokens (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    token_value TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    product_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price INTEGER NOT NULL,
    stock_quantity INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production
CREATE TABLE production (
    id UUID PRIMARY KEY,
    location_id UUID NOT NULL REFERENCES locations(id),
    product_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL,
    production_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation Settings
CREATE TABLE navigation_settings (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    menu_name TEXT NOT NULL,
    menu_items JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation Permissions
CREATE TABLE navigation_permissions (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    role TEXT NOT NULL,
    allowed_routes JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing
CREATE TABLE billing (
    id UUID PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES orgs(id),
    invoice_number TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    billing_date DATE,
    due_date DATE,
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. INSERT SEED DATA WITH SIMPLE NUMERIC IDs
-- ============================================================================

-- Helper: Generate UUID from number (000000000001 → UUID)
CREATE OR REPLACE FUNCTION uuid_from_int(n BIGINT)
RETURNS UUID AS $$
  SELECT ('00000000-0000-0000-0000-' || LPAD(TO_HEX(n), 12, '0'))::UUID;
$$ LANGUAGE SQL IMMUTABLE;

-- Organizations
INSERT INTO orgs (id, name, created_at) VALUES
(uuid_from_int(1), 'Downtown Coffee Co.', NOW() - INTERVAL '180 days'),
(uuid_from_int(2), 'Mountain Brew', NOW() - INTERVAL '120 days'),
(uuid_from_int(3), 'Coastal Café', NOW() - INTERVAL '60 days');

-- Subscriptions
INSERT INTO subscriptions (id, org_id, plan, status, renews_at, created_at) VALUES
(uuid_from_int(1001), uuid_from_int(1), 'pro', 'active', NOW() + INTERVAL '330 days', NOW() - INTERVAL '180 days'),
(uuid_from_int(1002), uuid_from_int(2), 'basic', 'active', NOW() + INTERVAL '330 days', NOW() - INTERVAL '120 days'),
(uuid_from_int(1003), uuid_from_int(3), 'enterprise', 'trialing', NOW() + INTERVAL '16 days', NOW() - INTERVAL '14 days');

-- Locations
INSERT INTO locations (id, org_id, name, address, created_at) VALUES
(uuid_from_int(10001), uuid_from_int(1), 'Main Street Store', '123 Main St, Downtown, NY 10001', NOW() - INTERVAL '180 days'),
(uuid_from_int(10002), uuid_from_int(1), 'Plaza Location', '456 Plaza Ave, City Center, NY 10002', NOW() - INTERVAL '90 days'),
(uuid_from_int(10003), uuid_from_int(2), 'Mountain View Café', '789 Mountain Rd, Highlands, CO 80401', NOW() - INTERVAL '120 days'),
(uuid_from_int(10004), uuid_from_int(3), 'Beachside Coffee', '321 Ocean Blvd, Seaside, CA 90210', NOW() - INTERVAL '60 days'),
(uuid_from_int(10005), uuid_from_int(3), 'Harbor Café', '654 Harbor Dr, Marina, CA 90211', NOW() - INTERVAL '45 days');

-- Sizes
INSERT INTO sizes (id, org_id, location_id, name, created_at) VALUES
(uuid_from_int(20001), uuid_from_int(1), uuid_from_int(10001), 'Small', NOW() - INTERVAL '180 days'),
(uuid_from_int(20002), uuid_from_int(1), uuid_from_int(10001), 'Medium', NOW() - INTERVAL '180 days'),
(uuid_from_int(20003), uuid_from_int(1), uuid_from_int(10001), 'Large', NOW() - INTERVAL '180 days'),
(uuid_from_int(20004), uuid_from_int(1), uuid_from_int(10002), 'Small', NOW() - INTERVAL '90 days'),
(uuid_from_int(20005), uuid_from_int(1), uuid_from_int(10002), 'Medium', NOW() - INTERVAL '90 days'),
(uuid_from_int(20006), uuid_from_int(1), uuid_from_int(10002), 'Large', NOW() - INTERVAL '90 days'),
(uuid_from_int(20007), uuid_from_int(2), uuid_from_int(10003), 'Regular', NOW() - INTERVAL '120 days'),
(uuid_from_int(20008), uuid_from_int(2), uuid_from_int(10003), 'Grande', NOW() - INTERVAL '120 days'),
(uuid_from_int(20009), uuid_from_int(3), uuid_from_int(10004), 'Small', NOW() - INTERVAL '60 days'),
(uuid_from_int(20010), uuid_from_int(3), uuid_from_int(10004), 'Medium', NOW() - INTERVAL '60 days'),
(uuid_from_int(20011), uuid_from_int(3), uuid_from_int(10004), 'Large', NOW() - INTERVAL '60 days');

-- Products (first 10 for brevity, add more as needed)
INSERT INTO products (id, org_id, location_id, name, description, category, is_active, created_at) VALUES
(uuid_from_int(30001), uuid_from_int(1), uuid_from_int(10001), 'Espresso', 'Classic Italian espresso shot', 'Coffee', true, NOW() - INTERVAL '180 days'),
(uuid_from_int(30002), uuid_from_int(1), uuid_from_int(10001), 'Cappuccino', 'Espresso with steamed milk and foam', 'Coffee', true, NOW() - INTERVAL '180 days'),
(uuid_from_int(30003), uuid_from_int(1), uuid_from_int(10001), 'Latte', 'Espresso with steamed milk', 'Coffee', true, NOW() - INTERVAL '180 days'),
(uuid_from_int(30004), uuid_from_int(1), uuid_from_int(10001), 'Americano', 'Espresso diluted with hot water', 'Coffee', true, NOW() - INTERVAL '180 days'),
(uuid_from_int(30005), uuid_from_int(1), uuid_from_int(10001), 'Mocha', 'Chocolate espresso drink with milk', 'Coffee', true, NOW() - INTERVAL '180 days'),
(uuid_from_int(30006), uuid_from_int(1), uuid_from_int(10001), 'Croissant', 'Buttery French pastry', 'Pastry', true, NOW() - INTERVAL '180 days'),
(uuid_from_int(30007), uuid_from_int(2), uuid_from_int(10003), 'Cold Brew', 'Smooth cold brew coffee', 'Cold Drinks', true, NOW() - INTERVAL '120 days'),
(uuid_from_int(30008), uuid_from_int(3), uuid_from_int(10004), 'Sunrise Latte', 'Morning special latte', 'Coffee', true, NOW() - INTERVAL '60 days');

-- Product Prices (sample)
INSERT INTO product_prices (org_id, location_id, product_id, size_id, price_cents, created_at) VALUES
(uuid_from_int(1), uuid_from_int(10001), uuid_from_int(30001), uuid_from_int(20001), 250, NOW() - INTERVAL '180 days'),
(uuid_from_int(1), uuid_from_int(10001), uuid_from_int(30001), uuid_from_int(20002), 300, NOW() - INTERVAL '180 days'),
(uuid_from_int(1), uuid_from_int(10001), uuid_from_int(30002), uuid_from_int(20002), 400, NOW() - INTERVAL '180 days'),
(uuid_from_int(1), uuid_from_int(10001), uuid_from_int(30002), uuid_from_int(20003), 450, NOW() - INTERVAL '180 days');

-- Modifier Groups
INSERT INTO modifier_groups (id, org_id, location_id, name, required, max_choices, created_at) VALUES
(uuid_from_int(40001), uuid_from_int(1), uuid_from_int(10001), 'Milk Options', false, 1, NOW() - INTERVAL '180 days'),
(uuid_from_int(40002), uuid_from_int(1), uuid_from_int(10001), 'Sweeteners', false, 2, NOW() - INTERVAL '180 days');

-- Modifiers
INSERT INTO modifiers (id, org_id, location_id, group_id, name, price_delta_cents, created_at) VALUES
(uuid_from_int(50001), uuid_from_int(1), uuid_from_int(10001), uuid_from_int(40001), 'Whole Milk', 0, NOW()),
(uuid_from_int(50002), uuid_from_int(1), uuid_from_int(10001), uuid_from_int(40001), 'Oat Milk', 50, NOW()),
(uuid_from_int(50003), uuid_from_int(1), uuid_from_int(10001), uuid_from_int(40002), 'Sugar', 0, NOW()),
(uuid_from_int(50004), uuid_from_int(1), uuid_from_int(10001), uuid_from_int(40002), 'Vanilla Syrup', 30, NOW());

-- Link Modifier Groups to Products
INSERT INTO product_modifier_groups (product_id, group_id, sort_order) VALUES
(uuid_from_int(30002), uuid_from_int(40001), 0),
(uuid_from_int(30002), uuid_from_int(40002), 1);

-- Ingredients
INSERT INTO ingredients (id, org_id, location_id, name, unit, current_stock, min_stock, max_stock, cost_per_unit, created_at) VALUES
(uuid_from_int(60001), uuid_from_int(1), uuid_from_int(10001), 'Coffee Beans', 'kg', 45.5, 10, 100, 2500, NOW()),
(uuid_from_int(60002), uuid_from_int(1), uuid_from_int(10001), 'Whole Milk', 'liter', 75, 20, 150, 120, NOW()),
(uuid_from_int(60003), uuid_from_int(1), uuid_from_int(10001), 'Oat Milk', 'liter', 28, 10, 60, 180, NOW());

-- Suppliers
INSERT INTO suppliers (id, org_id, name, contact_name, email, phone, address, is_active, rating, notes, created_at) VALUES
(uuid_from_int(70001), uuid_from_int(1), 'Premium Coffee Imports', 'John Smith', 'john@premiumcoffee.com', '+1-555-0101', '100 Coffee Lane', true, 5.0, 'Top quality', NOW()),
(uuid_from_int(70002), uuid_from_int(1), 'Dairy Fresh Co.', 'Sarah Johnson', 'sarah@dairyfresh.com', '+1-555-0202', '200 Milk Road', true, 4.5, 'Reliable', NOW());

-- Supplier Categories
INSERT INTO supplier_categories (org_id, name, created_at) VALUES
(uuid_from_int(1), 'Coffee & Tea', NOW()),
(uuid_from_int(1), 'Dairy Products', NOW());

-- Orders (sample)
INSERT INTO orders (id, org_id, location_id, status, notes, created_at) VALUES
(uuid_from_int(90001), uuid_from_int(1), uuid_from_int(10001), 'queued', 'Customer: Alice', NOW() - INTERVAL '15 minutes'),
(uuid_from_int(90002), uuid_from_int(1), uuid_from_int(10001), 'completed', 'Customer: Bob', NOW() - INTERVAL '1 day');

-- Order Items
INSERT INTO order_items (id, org_id, location_id, order_id, product_id, size_id, qty, base_price_cents, line_total_cents) VALUES
(uuid_from_int(91001), uuid_from_int(1), uuid_from_int(10001), uuid_from_int(90001), uuid_from_int(30002), uuid_from_int(20002), 2, 400, 800);

-- Order Item Modifiers
INSERT INTO order_item_modifiers (org_id, location_id, order_item_id, modifier_id, price_delta_cents) VALUES
(uuid_from_int(1), uuid_from_int(10001), uuid_from_int(91001), uuid_from_int(50002), 50);

-- Payments
INSERT INTO payments (id, org_id, location_id, order_id, method, amount_cents, paid_at) VALUES
(uuid_from_int(92001), uuid_from_int(1), uuid_from_int(10001), uuid_from_int(90002), 'credit_card', 850, NOW() - INTERVAL '1 day');

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
  BREWLY SEED COMPLETE!
  • Schema dropped & recreated
  • All tables populated
  • IDs: 000000000001, 000000000002, ...
  • Ready for development!
  ';
END $$;