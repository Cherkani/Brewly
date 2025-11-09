-- Brewly Coffee Shop SaaS - Initial Schema
-- Migration: 001_initial_schema
-- Description: Core platform tables, tenancy, catalog, and orders

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE order_status AS ENUM (
  'queued',
  'in_progress',
  'ready',
  'paid',
  'completed',
  'cancelled'
);

CREATE TYPE subscription_plan AS ENUM ('basic', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled');
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'mobile_payment');
CREATE TYPE inventory_tx_type AS ENUM ('purchase', 'production', 'waste', 'adjustment', 'sale');
CREATE TYPE alert_type AS ENUM ('low_stock', 'out_of_stock');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'cashier');
CREATE TYPE po_status AS ENUM ('draft', 'sent', 'confirmed', 'received', 'cancelled');
CREATE TYPE production_status AS ENUM ('in_progress', 'ready_for_sale', 'completed');

-- ============================================================================
-- PLATFORM & TENANCY
-- ============================================================================

-- Platform Superusers
CREATE TABLE platform_superusers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (Tenants)
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'basic',
  status subscription_status NOT NULL DEFAULT 'trialing',
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations (Physical Stores)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members (Owners)
CREATE TABLE org_members (
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Location Members (Admins, Cashiers)
CREATE TABLE location_members (
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (location_id, user_id)
);

-- ============================================================================
-- CATALOG
-- ============================================================================

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT, -- URL to product image
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sizes
CREATE TABLE sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Small', 'Medium', 'Large'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Prices
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, size_id)
);

-- Modifier Groups
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Milk Type', 'Toppings', etc.
  required BOOLEAN DEFAULT false,
  min_choices INT DEFAULT 0,
  max_choices INT, -- NULL = unlimited
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifiers
CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Whole Milk', 'Almond Milk', etc.
  price_delta_cents INT DEFAULT 0, -- Additional cost
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Modifier Groups (Junction Table)
CREATE TABLE product_modifier_groups (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (product_id, group_id)
);

-- ============================================================================
-- ORDERS & PAYMENTS
-- ============================================================================

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  number BIGSERIAL NOT NULL, -- Human-readable order number
  status order_status NOT NULL DEFAULT 'queued',
  cashier_id UUID REFERENCES auth.users(id),
  discount_cents INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  size_id UUID NOT NULL REFERENCES sizes(id),
  qty INT NOT NULL CHECK (qty > 0),
  base_price_cents INT NOT NULL,
  line_total_cents INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Item Modifiers
CREATE TABLE order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id),
  price_delta_cents INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status History
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY & RECIPES
-- ============================================================================

-- Ingredients
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- 'lb', 'oz', 'gallon', 'unit'
  on_hand NUMERIC(10, 2) DEFAULT 0,
  low_stock_threshold NUMERIC(10, 2) DEFAULT 0,
  unit_cost_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID REFERENCES sizes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, size_id)
);

-- Recipe Items
CREATE TABLE recipe_items (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty NUMERIC(10, 3) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (recipe_id, ingredient_id)
);

-- Inventory Transactions
CREATE TABLE inventory_tx (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  type inventory_tx_type NOT NULL,
  qty NUMERIC(10, 3) NOT NULL, -- Positive for additions, negative for deductions
  unit_cost_cents INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- KDS (Kitchen Display System)
-- ============================================================================

-- KDS Tokens
CREATE TABLE kds_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Tenancy indexes
CREATE INDEX idx_orgs_created_at ON orgs(created_at);
CREATE INDEX idx_locations_org_id ON locations(org_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);

-- Catalog indexes
CREATE INDEX idx_products_org_location ON products(org_id, location_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_modifiers_group_id ON modifiers(group_id);

-- Orders indexes
CREATE INDEX idx_orders_org_location ON orders(org_id, location_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- Inventory indexes
CREATE INDEX idx_ingredients_org_location ON ingredients(org_id, location_id);
CREATE INDEX idx_inventory_tx_ingredient_id ON inventory_tx(ingredient_id);
CREATE INDEX idx_alerts_location_resolved ON alerts(location_id, is_resolved);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE platform_superusers IS 'Platform administrators with full system access';
COMMENT ON TABLE orgs IS 'Organizations (tenants) - each coffee shop chain';
COMMENT ON TABLE locations IS 'Physical store locations within an organization';
COMMENT ON TABLE products IS 'Product catalog - coffee, food items, etc.';
COMMENT ON TABLE modifier_groups IS 'Groups of modifiers (e.g., milk types, toppings)';
COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON TABLE ingredients IS 'Inventory items used in recipes';
COMMENT ON TABLE recipes IS 'Product recipes defining ingredient requirements';

