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

