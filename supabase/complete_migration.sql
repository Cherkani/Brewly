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

-- Brewly Coffee Shop SaaS - Suppliers & Purchase Orders
-- Migration: 002_suppliers_and_purchase_orders
-- Description: Supplier management and purchase order system

-- ============================================================================
-- SUPPLIERS
-- ============================================================================

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  category TEXT, -- Primary category
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  payment_terms TEXT, -- 'Net 30', 'Net 15', 'Prepaid'
  delivery_time TEXT, -- '1-2 days', '3-5 days'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Categories (Many-to-Many)
CREATE TABLE supplier_categories (
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'Coffee Beans', 'Dairy Products', 'Packaging'
  PRIMARY KEY (supplier_id, category)
);

-- Supplier Products
CREATE TABLE supplier_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0),
  unit TEXT NOT NULL, -- 'lb', 'gallon', 'pack'
  min_order_qty NUMERIC(10, 2) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PURCHASE ORDERS
-- ============================================================================

-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL, -- 'PO-2001'
  status po_status NOT NULL DEFAULT 'draft',
  total_amount_cents INT NOT NULL DEFAULT 0,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  expected_delivery TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, order_number)
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  supplier_product_id UUID REFERENCES supplier_products(id),
  item_name TEXT NOT NULL, -- Denormalized for history
  quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0),
  total_price_cents INT NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_suppliers_org_id ON suppliers(org_id);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX idx_purchase_orders_org_location ON purchase_orders(org_id, location_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE suppliers IS 'Supplier directory for procurement';
COMMENT ON TABLE supplier_categories IS 'Categories that each supplier provides';
COMMENT ON TABLE supplier_products IS 'Product catalog from each supplier';
COMMENT ON TABLE purchase_orders IS 'Purchase orders to suppliers';
COMMENT ON TABLE purchase_order_items IS 'Line items in purchase orders';

-- Brewly Coffee Shop SaaS - Marketplace & Production
-- Migration: 003_marketplace_and_production
-- Description: Marketplace for surplus inventory and production tracking

-- ============================================================================
-- MARKETPLACE
-- ============================================================================

-- Marketplace Listings
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL, -- 'lb', 'kg', 'unit'
  price_per_unit_cents INT NOT NULL CHECK (price_per_unit_cents >= 0),
  available_quantity NUMERIC(10, 2) NOT NULL CHECK (available_quantity >= 0),
  min_order_quantity NUMERIC(10, 2) DEFAULT 1,
  quality TEXT, -- 'Standard', 'Premium', 'Organic'
  certifications TEXT[], -- ['Organic', 'Fair Trade', 'Rainforest Alliance']
  production_date DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PRODUCTION
-- ============================================================================

-- Production Records
CREATE TABLE production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity_produced NUMERIC(10, 2) NOT NULL CHECK (quantity_produced > 0),
  unit TEXT NOT NULL,
  cost_per_unit_cents INT,
  total_cost_cents INT,
  production_date DATE NOT NULL,
  expiry_date DATE,
  produced_by UUID REFERENCES auth.users(id),
  status production_status NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_marketplace_listings_org_location ON marketplace_listings(org_id, location_id);
CREATE INDEX idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_is_active ON marketplace_listings(is_active);
CREATE INDEX idx_marketplace_listings_expiry ON marketplace_listings(expiry_date);
CREATE INDEX idx_production_org_location ON production(org_id, location_id);
CREATE INDEX idx_production_status ON production(status);
CREATE INDEX idx_production_date ON production(production_date DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE marketplace_listings IS 'Surplus inventory listings for inter-location trading';
COMMENT ON TABLE production IS 'Production batch tracking for manufactured items';

-- Brewly Coffee Shop SaaS - Navigation & Billing
-- Migration: 004_navigation_and_billing
-- Description: Navigation settings and billing records

-- ============================================================================
-- NAVIGATION SETTINGS
-- ============================================================================

-- Navigation Settings
CREATE TABLE navigation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id)
);

-- Navigation Permissions
CREATE TABLE navigation_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Display name
  href TEXT NOT NULL, -- Route path
  icon TEXT, -- Icon identifier
  role user_role NOT NULL,
  enabled BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (org_id, href, role)
);

-- ============================================================================
-- BILLING
-- ============================================================================

-- Billing Records
CREATE TABLE billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL CHECK (amount_cents >= 0),
  plan subscription_plan NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'refunded')),
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_navigation_permissions_org_role ON navigation_permissions(org_id, role);
CREATE INDEX idx_navigation_permissions_sort_order ON navigation_permissions(org_id, sort_order);
CREATE INDEX idx_billing_org_id ON billing(org_id);
CREATE INDEX idx_billing_date ON billing(date DESC);
CREATE INDEX idx_billing_status ON billing(status);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE navigation_settings IS 'Organization-level navigation configuration';
COMMENT ON TABLE navigation_permissions IS 'Role-based navigation menu permissions';
COMMENT ON TABLE billing IS 'Billing history and invoices';

-- Brewly Coffee Shop SaaS - RLS Helper Functions
-- Migration: 005_rls_helper_functions
-- Description: Helper functions for Row-Level Security policies

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is a platform superuser
CREATE OR REPLACE FUNCTION is_superuser()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM platform_superusers 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user owns an organization
CREATE OR REPLACE FUNCTION user_is_org_owner(org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM org_members 
    WHERE org_id = org_uuid 
    AND user_id = auth.uid() 
    AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to a location (any role)
CREATE OR REPLACE FUNCTION user_in_location(location_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM location_members 
    WHERE location_id = location_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin of a location
CREATE OR REPLACE FUNCTION user_is_location_admin(location_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM location_members 
    WHERE location_id = location_uuid 
    AND user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is cashier of a location
CREATE OR REPLACE FUNCTION user_is_location_cashier(location_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM location_members 
    WHERE location_id = location_uuid 
    AND user_id = auth.uid() 
    AND role = 'cashier'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to organization (owner or member of any location)
CREATE OR REPLACE FUNCTION user_in_org(org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM org_members 
    WHERE org_id = org_uuid AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM location_members lm
    JOIN locations l ON l.id = lm.location_id
    WHERE l.org_id = org_uuid AND lm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can manage products (owner or admin)
CREATE OR REPLACE FUNCTION can_manage_products(location_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_uuid UUID;
BEGIN
  -- Get org_id from location
  SELECT org_id INTO org_uuid FROM locations WHERE id = location_uuid;
  
  RETURN is_superuser() 
    OR user_is_org_owner(org_uuid) 
    OR user_is_location_admin(location_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can view data (owner, admin, or cashier)
CREATE OR REPLACE FUNCTION can_view_location_data(location_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_uuid UUID;
BEGIN
  -- Get org_id from location
  SELECT org_id INTO org_uuid FROM locations WHERE id = location_uuid;
  
  RETURN is_superuser() 
    OR user_is_org_owner(org_uuid) 
    OR user_in_location(location_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Get user's organization IDs
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS TABLE (org_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT om.org_id
  FROM org_members om
  WHERE om.user_id = auth.uid()
  UNION
  SELECT DISTINCT l.org_id
  FROM location_members lm
  JOIN locations l ON l.id = lm.location_id
  WHERE lm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's location IDs
CREATE OR REPLACE FUNCTION get_user_location_ids()
RETURNS TABLE (location_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT lm.location_id
  FROM location_members lm
  WHERE lm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create order status history on order insert/update
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (order_id, status, changed_at)
    VALUES (NEW.id, NEW.status, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Deduct inventory on order completion
CREATE OR REPLACE FUNCTION deduct_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  recipe RECORD;
  recipe_item RECORD;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Loop through order items
    FOR item IN 
      SELECT * FROM order_items WHERE order_id = NEW.id
    LOOP
      -- Find recipe for this product/size
      SELECT * INTO recipe 
      FROM recipes 
      WHERE product_id = item.product_id 
      AND (size_id = item.size_id OR size_id IS NULL)
      LIMIT 1;
      
      IF FOUND THEN
        -- Deduct ingredients
        FOR recipe_item IN 
          SELECT * FROM recipe_items WHERE recipe_id = recipe.id
        LOOP
          -- Update ingredient quantity
          UPDATE ingredients 
          SET on_hand = on_hand - (recipe_item.qty * item.qty)
          WHERE id = recipe_item.ingredient_id;
          
          -- Create inventory transaction
          INSERT INTO inventory_tx (
            org_id, location_id, ingredient_id, type, qty, notes
          ) VALUES (
            NEW.org_id, 
            NEW.location_id, 
            recipe_item.ingredient_id, 
            'sale', 
            -(recipe_item.qty * item.qty),
            'Order #' || NEW.number
          );
          
          -- Check for low stock and create alert
          INSERT INTO alerts (org_id, location_id, ingredient_id, type)
          SELECT 
            i.org_id,
            i.location_id,
            i.id,
            CASE 
              WHEN i.on_hand <= 0 THEN 'out_of_stock'::alert_type
              WHEN i.on_hand <= i.low_stock_threshold THEN 'low_stock'::alert_type
            END
          FROM ingredients i
          WHERE i.id = recipe_item.ingredient_id
          AND i.on_hand <= i.low_stock_threshold
          AND NOT EXISTS (
            SELECT 1 FROM alerts a 
            WHERE a.ingredient_id = i.id 
            AND a.is_resolved = false
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER navigation_settings_updated_at
  BEFORE UPDATE ON navigation_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER navigation_permissions_updated_at
  BEFORE UPDATE ON navigation_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order status history trigger
CREATE TRIGGER order_status_history_trigger
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- Inventory deduction trigger
CREATE TRIGGER deduct_inventory_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION deduct_inventory_on_order();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_superuser() IS 'Check if current user is a platform superuser';
COMMENT ON FUNCTION user_is_org_owner(UUID) IS 'Check if user owns an organization';
COMMENT ON FUNCTION user_in_location(UUID) IS 'Check if user has access to a location';
COMMENT ON FUNCTION can_manage_products(UUID) IS 'Check if user can manage products at a location';
COMMENT ON FUNCTION can_view_location_data(UUID) IS 'Check if user can view location data';

-- Brewly Coffee Shop SaaS - RLS Policies
-- Migration: 006_rls_policies
-- Description: Row-Level Security policies for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE platform_superusers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_tx ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE production ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PLATFORM & TENANCY POLICIES
-- ============================================================================

-- Platform Superusers (only superusers can view)
CREATE POLICY platform_superusers_select ON platform_superusers
  FOR SELECT USING (is_superuser());

-- Organizations
CREATE POLICY orgs_select ON orgs
  FOR SELECT USING (is_superuser() OR user_in_org(id));

CREATE POLICY orgs_insert ON orgs
  FOR INSERT WITH CHECK (is_superuser());

CREATE POLICY orgs_update ON orgs
  FOR UPDATE USING (is_superuser() OR user_is_org_owner(id));

CREATE POLICY orgs_delete ON orgs
  FOR DELETE USING (is_superuser());

-- Subscriptions
CREATE POLICY subscriptions_select ON subscriptions
  FOR SELECT USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY subscriptions_insert ON subscriptions
  FOR INSERT WITH CHECK (is_superuser());

CREATE POLICY subscriptions_update ON subscriptions
  FOR UPDATE USING (is_superuser());

-- Locations
CREATE POLICY locations_select ON locations
  FOR SELECT USING (is_superuser() OR user_in_org(org_id));

CREATE POLICY locations_insert ON locations
  FOR INSERT WITH CHECK (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY locations_update ON locations
  FOR UPDATE USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY locations_delete ON locations
  FOR DELETE USING (is_superuser() OR user_is_org_owner(org_id));

-- Organization Members
CREATE POLICY org_members_select ON org_members
  FOR SELECT USING (is_superuser() OR user_in_org(org_id));

CREATE POLICY org_members_insert ON org_members
  FOR INSERT WITH CHECK (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY org_members_update ON org_members
  FOR UPDATE USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY org_members_delete ON org_members
  FOR DELETE USING (is_superuser() OR user_is_org_owner(org_id));

-- Location Members
CREATE POLICY location_members_select ON location_members
  FOR SELECT USING (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_in_location(location_id)
  );

CREATE POLICY location_members_insert ON location_members
  FOR INSERT WITH CHECK (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

CREATE POLICY location_members_update ON location_members
  FOR UPDATE USING (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

CREATE POLICY location_members_delete ON location_members
  FOR DELETE USING (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

-- ============================================================================
-- CATALOG POLICIES
-- ============================================================================

-- Products
CREATE POLICY products_select ON products
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY products_update ON products
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY products_delete ON products
  FOR DELETE USING (can_manage_products(location_id));

-- Sizes
CREATE POLICY sizes_select ON sizes
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY sizes_insert ON sizes
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY sizes_update ON sizes
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY sizes_delete ON sizes
  FOR DELETE USING (can_manage_products(location_id));

-- Product Prices
CREATE POLICY product_prices_select ON product_prices
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY product_prices_insert ON product_prices
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY product_prices_update ON product_prices
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY product_prices_delete ON product_prices
  FOR DELETE USING (can_manage_products(location_id));

-- Modifier Groups
CREATE POLICY modifier_groups_select ON modifier_groups
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY modifier_groups_insert ON modifier_groups
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY modifier_groups_update ON modifier_groups
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY modifier_groups_delete ON modifier_groups
  FOR DELETE USING (can_manage_products(location_id));

-- Modifiers
CREATE POLICY modifiers_select ON modifiers
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY modifiers_insert ON modifiers
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY modifiers_update ON modifiers
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY modifiers_delete ON modifiers
  FOR DELETE USING (can_manage_products(location_id));

-- Product Modifier Groups (junction table - uses product access)
CREATE POLICY product_modifier_groups_select ON product_modifier_groups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND can_view_location_data(location_id))
  );

CREATE POLICY product_modifier_groups_insert ON product_modifier_groups
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND can_manage_products(location_id))
  );

CREATE POLICY product_modifier_groups_delete ON product_modifier_groups
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND can_manage_products(location_id))
  );

-- ============================================================================
-- ORDERS & PAYMENTS POLICIES
-- ============================================================================

-- Orders
CREATE POLICY orders_select ON orders
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

CREATE POLICY orders_update ON orders
  FOR UPDATE USING (can_view_location_data(location_id));

CREATE POLICY orders_delete ON orders
  FOR DELETE USING (can_manage_products(location_id));

-- Order Items
CREATE POLICY order_items_select ON order_items
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY order_items_insert ON order_items
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

CREATE POLICY order_items_update ON order_items
  FOR UPDATE USING (can_view_location_data(location_id));

CREATE POLICY order_items_delete ON order_items
  FOR DELETE USING (can_view_location_data(location_id));

-- Order Item Modifiers
CREATE POLICY order_item_modifiers_select ON order_item_modifiers
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY order_item_modifiers_insert ON order_item_modifiers
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

CREATE POLICY order_item_modifiers_delete ON order_item_modifiers
  FOR DELETE USING (can_view_location_data(location_id));

-- Payments
CREATE POLICY payments_select ON payments
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY payments_insert ON payments
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

CREATE POLICY payments_update ON payments
  FOR UPDATE USING (can_manage_products(location_id));

-- Order Status History
CREATE POLICY order_status_history_select ON order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND can_view_location_data(location_id))
  );

-- ============================================================================
-- INVENTORY POLICIES
-- ============================================================================

-- Ingredients
CREATE POLICY ingredients_select ON ingredients
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY ingredients_insert ON ingredients
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY ingredients_update ON ingredients
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY ingredients_delete ON ingredients
  FOR DELETE USING (can_manage_products(location_id));

-- Recipes
CREATE POLICY recipes_select ON recipes
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY recipes_insert ON recipes
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY recipes_update ON recipes
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY recipes_delete ON recipes
  FOR DELETE USING (can_manage_products(location_id));

-- Recipe Items
CREATE POLICY recipe_items_select ON recipe_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND can_view_location_data(location_id))
  );

CREATE POLICY recipe_items_insert ON recipe_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND can_manage_products(location_id))
  );

CREATE POLICY recipe_items_update ON recipe_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND can_manage_products(location_id))
  );

CREATE POLICY recipe_items_delete ON recipe_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND can_manage_products(location_id))
  );

-- Inventory Transactions
CREATE POLICY inventory_tx_select ON inventory_tx
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY inventory_tx_insert ON inventory_tx
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

-- Alerts
CREATE POLICY alerts_select ON alerts
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY alerts_insert ON alerts
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

CREATE POLICY alerts_update ON alerts
  FOR UPDATE USING (can_manage_products(location_id));

-- ============================================================================
-- SUPPLIER & PURCHASE ORDER POLICIES
-- ============================================================================

-- Suppliers
CREATE POLICY suppliers_select ON suppliers
  FOR SELECT USING (is_superuser() OR user_is_org_owner(org_id) OR user_in_org(org_id));

CREATE POLICY suppliers_insert ON suppliers
  FOR INSERT WITH CHECK (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY suppliers_update ON suppliers
  FOR UPDATE USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY suppliers_delete ON suppliers
  FOR DELETE USING (is_superuser() OR user_is_org_owner(org_id));

-- Supplier Categories
CREATE POLICY supplier_categories_select ON supplier_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_in_org(org_id)))
  );

CREATE POLICY supplier_categories_insert ON supplier_categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_is_org_owner(org_id)))
  );

CREATE POLICY supplier_categories_delete ON supplier_categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_is_org_owner(org_id)))
  );

-- Supplier Products
CREATE POLICY supplier_products_select ON supplier_products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_in_org(org_id)))
  );

CREATE POLICY supplier_products_insert ON supplier_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_is_org_owner(org_id)))
  );

CREATE POLICY supplier_products_update ON supplier_products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_is_org_owner(org_id)))
  );

CREATE POLICY supplier_products_delete ON supplier_products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = supplier_id AND (is_superuser() OR user_is_org_owner(org_id)))
  );

-- Purchase Orders
CREATE POLICY purchase_orders_select ON purchase_orders
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY purchase_orders_insert ON purchase_orders
  FOR INSERT WITH CHECK (can_manage_products(location_id));

CREATE POLICY purchase_orders_update ON purchase_orders
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY purchase_orders_delete ON purchase_orders
  FOR DELETE USING (can_manage_products(location_id));

-- Purchase Order Items
CREATE POLICY purchase_order_items_select ON purchase_order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM purchase_orders WHERE id = purchase_order_id AND can_view_location_data(location_id))
  );

CREATE POLICY purchase_order_items_insert ON purchase_order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM purchase_orders WHERE id = purchase_order_id AND can_manage_products(location_id))
  );

CREATE POLICY purchase_order_items_update ON purchase_order_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM purchase_orders WHERE id = purchase_order_id AND can_manage_products(location_id))
  );

CREATE POLICY purchase_order_items_delete ON purchase_order_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM purchase_orders WHERE id = purchase_order_id AND can_manage_products(location_id))
  );

-- ============================================================================
-- MARKETPLACE & PRODUCTION POLICIES
-- ============================================================================

-- Marketplace Listings (visible to all authenticated users, managed by location admins)
CREATE POLICY marketplace_listings_select ON marketplace_listings
  FOR SELECT USING (is_active = true OR can_view_location_data(location_id));

CREATE POLICY marketplace_listings_insert ON marketplace_listings
  FOR INSERT WITH CHECK (can_manage_products(location_id) AND seller_id = auth.uid());

CREATE POLICY marketplace_listings_update ON marketplace_listings
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY marketplace_listings_delete ON marketplace_listings
  FOR DELETE USING (can_manage_products(location_id));

-- Production
CREATE POLICY production_select ON production
  FOR SELECT USING (can_view_location_data(location_id));

CREATE POLICY production_insert ON production
  FOR INSERT WITH CHECK (can_view_location_data(location_id));

CREATE POLICY production_update ON production
  FOR UPDATE USING (can_manage_products(location_id));

CREATE POLICY production_delete ON production
  FOR DELETE USING (can_manage_products(location_id));

-- ============================================================================
-- NAVIGATION & BILLING POLICIES
-- ============================================================================

-- Navigation Settings
CREATE POLICY navigation_settings_select ON navigation_settings
  FOR SELECT USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY navigation_settings_insert ON navigation_settings
  FOR INSERT WITH CHECK (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY navigation_settings_update ON navigation_settings
  FOR UPDATE USING (is_superuser() OR user_is_org_owner(org_id));

-- Navigation Permissions
CREATE POLICY navigation_permissions_select ON navigation_permissions
  FOR SELECT USING (is_superuser() OR user_in_org(org_id));

CREATE POLICY navigation_permissions_insert ON navigation_permissions
  FOR INSERT WITH CHECK (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY navigation_permissions_update ON navigation_permissions
  FOR UPDATE USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY navigation_permissions_delete ON navigation_permissions
  FOR DELETE USING (is_superuser() OR user_is_org_owner(org_id));

-- Billing
CREATE POLICY billing_select ON billing
  FOR SELECT USING (is_superuser() OR user_is_org_owner(org_id));

CREATE POLICY billing_insert ON billing
  FOR INSERT WITH CHECK (is_superuser());

-- ============================================================================
-- KDS TOKENS POLICIES
-- ============================================================================

-- KDS Tokens (special access - location admins can manage)
CREATE POLICY kds_tokens_select ON kds_tokens
  FOR SELECT USING (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

CREATE POLICY kds_tokens_insert ON kds_tokens
  FOR INSERT WITH CHECK (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

CREATE POLICY kds_tokens_update ON kds_tokens
  FOR UPDATE USING (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

CREATE POLICY kds_tokens_delete ON kds_tokens
  FOR DELETE USING (
    is_superuser() OR 
    user_is_org_owner((SELECT org_id FROM locations WHERE id = location_id)) OR
    user_is_location_admin(location_id)
  );

