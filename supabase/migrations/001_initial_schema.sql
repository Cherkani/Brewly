-- ============================================================================
-- BREWLY - SIMPLIFIED SCHEMA
-- ============================================================================
-- Clean schema with just: Users, Organizations, Stores, Products, Orders
-- ============================================================================

-- Enable UUID extension
DROP EXTENSION IF EXISTS "uuid-ossp";
CREATE EXTENSION "uuid-ossp" SCHEMA public;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'developer', 'cashier');
CREATE TYPE order_status AS ENUM ('queued', 'in_progress', 'ready', 'paid', 'completed', 'cancelled');

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STORES (Locations)
-- ============================================================================

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER ROLES & ASSIGNMENTS
-- ============================================================================

-- User roles table - links auth.users to roles and assignments
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'cashier',
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE, -- NULL for superadmin/developer
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- NULL for superadmin/admin/developer, required for cashier
  is_default BOOLEAN DEFAULT true, -- Default role/store for login
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role, org_id, store_id)
);

-- ============================================================================
-- PRODUCTS
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ORDERS
-- ============================================================================

-- Order number sequence per store
CREATE SEQUENCE order_number_seq;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  number BIGINT NOT NULL DEFAULT nextval('order_number_seq'), -- Human-readable order number
  status order_status NOT NULL DEFAULT 'queued',
  cashier_id UUID REFERENCES auth.users(id),
  total_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, store_id, number)
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_stores_org_id ON stores(org_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_org_id ON user_roles(org_id);
CREATE INDEX idx_user_roles_store_id ON user_roles(store_id);
CREATE INDEX idx_user_roles_default ON user_roles(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_products_org_store ON products(org_id, store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_org_store ON orders(org_id, store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to assign default role to new users (bypasses RLS)
CREATE OR REPLACE FUNCTION assign_default_user_role(user_uuid UUID)
RETURNS void AS $$
DECLARE
  default_org_id UUID := '00000000-0000-0000-0000-000000000001';
  default_store_id UUID := '10000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert role directly (this function has SECURITY DEFINER)
  INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
  VALUES (user_uuid, 'cashier', default_org_id, default_store_id, true)
  ON CONFLICT (user_id, role, org_id, store_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE orgs IS 'Organizations (tenants)';
COMMENT ON TABLE stores IS 'Physical store locations within organizations';
COMMENT ON TABLE user_roles IS 'User role assignments with organization and store context';
COMMENT ON TABLE products IS 'Product catalog with organization and store separation';
COMMENT ON TABLE orders IS 'Customer orders with organization and store separation';

