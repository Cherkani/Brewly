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

