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

