-- ============================================================================
-- BREWLY - RLS POLICIES
-- ============================================================================
-- Row-Level Security policies for simplified schema
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is developer
CREATE OR REPLACE FUNCTION is_developer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'developer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to organization
CREATE OR REPLACE FUNCTION user_has_org_access(org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Superadmin and developers have access to all orgs
  IF is_superadmin() OR is_developer() THEN
    RETURN true;
  END IF;
  
  -- Check if user has role in this org
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND org_id = org_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to store
CREATE OR REPLACE FUNCTION user_has_store_access(store_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  store_org_id UUID;
BEGIN
  -- Superadmin and developers have access to all stores
  IF is_superadmin() OR is_developer() THEN
    RETURN true;
  END IF;
  
  -- Get org_id from store
  SELECT org_id INTO store_org_id FROM stores WHERE id = store_uuid;
  
  -- Admin: check if user is admin of the store's org
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND org_id = store_org_id
  ) THEN
    RETURN true;
  END IF;
  
  -- Cashier: check if user is cashier of this specific store
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'cashier'
    AND store_id = store_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can manage (admin, superadmin, developer)
CREATE OR REPLACE FUNCTION can_manage()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_superadmin() OR is_developer() OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================

-- Superadmin and developers can see all orgs
-- Admins can see their org
CREATE POLICY orgs_select ON orgs
  FOR SELECT USING (
    is_superadmin() OR 
    is_developer() OR 
    user_has_org_access(id)
  );

-- Only superadmin can create orgs
CREATE POLICY orgs_insert ON orgs
  FOR INSERT WITH CHECK (is_superadmin());

-- Superadmin and developers can update any org
-- Admins can update their org
CREATE POLICY orgs_update ON orgs
  FOR UPDATE USING (
    is_superadmin() OR 
    is_developer() OR 
    user_has_org_access(id)
  );

-- Only superadmin can delete orgs
CREATE POLICY orgs_delete ON orgs
  FOR DELETE USING (is_superadmin());

-- ============================================================================
-- STORES POLICIES
-- ============================================================================

-- Superadmin and developers can see all stores
-- Admins can see stores in their org
-- Cashiers can see their assigned store
CREATE POLICY stores_select ON stores
  FOR SELECT USING (
    is_superadmin() OR 
    is_developer() OR 
    user_has_store_access(id) OR
    user_has_org_access(org_id)
  );

-- Superadmin, developers, and admins can create stores
CREATE POLICY stores_insert ON stores
  FOR INSERT WITH CHECK (
    is_superadmin() OR 
    is_developer() OR 
    (can_manage() AND user_has_org_access(org_id))
  );

-- Superadmin, developers, and admins can update stores
CREATE POLICY stores_update ON stores
  FOR UPDATE USING (
    is_superadmin() OR 
    is_developer() OR 
    (can_manage() AND user_has_org_access(org_id))
  );

-- Superadmin, developers, and admins can delete stores
CREATE POLICY stores_delete ON stores
  FOR DELETE USING (
    is_superadmin() OR 
    is_developer() OR 
    (can_manage() AND user_has_org_access(org_id))
  );

-- ============================================================================
-- USER ROLES POLICIES
-- ============================================================================

-- Users can see their own roles
-- Superadmin and developers can see all roles
-- Admins can see roles in their org
CREATE POLICY user_roles_select ON user_roles
  FOR SELECT USING (
    is_superadmin() OR 
    is_developer() OR 
    user_id = auth.uid() OR
    (can_manage() AND (org_id IS NULL OR user_has_org_access(org_id)))
  );

-- Superadmin can create any role
-- Users can create their own default cashier role (only if they don't have one)
CREATE POLICY user_roles_insert ON user_roles
  FOR INSERT WITH CHECK (
    is_superadmin() OR
    (
      user_id = auth.uid() AND
      role = 'cashier' AND
      org_id IS NOT NULL AND
      store_id IS NOT NULL AND
      is_default = true AND
      NOT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND is_default = true
      )
    )
  );

-- Only superadmin can update roles
CREATE POLICY user_roles_update ON user_roles
  FOR UPDATE USING (is_superadmin());

-- Only superadmin can delete roles
CREATE POLICY user_roles_delete ON user_roles
  FOR DELETE USING (is_superadmin());

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- Users can see products in stores they have access to
CREATE POLICY products_select ON products
  FOR SELECT USING (user_has_store_access(store_id));

-- Only admins, superadmin, and developers can create products
CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (
    can_manage() AND user_has_store_access(store_id)
  );

-- Only admins, superadmin, and developers can update products
CREATE POLICY products_update ON products
  FOR UPDATE USING (
    can_manage() AND user_has_store_access(store_id)
  );

-- Only admins, superadmin, and developers can delete products
CREATE POLICY products_delete ON products
  FOR DELETE USING (
    can_manage() AND user_has_store_access(store_id)
  );

-- ============================================================================
-- ORDERS POLICIES
-- ============================================================================

-- Users can see orders in stores they have access to
CREATE POLICY orders_select ON orders
  FOR SELECT USING (user_has_store_access(store_id));

-- Cashiers, admins, superadmin, and developers can create orders
CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (user_has_store_access(store_id));

-- Users can update orders in stores they have access to
CREATE POLICY orders_update ON orders
  FOR UPDATE USING (user_has_store_access(store_id));

-- Only admins, superadmin, and developers can delete orders
CREATE POLICY orders_delete ON orders
  FOR DELETE USING (
    can_manage() AND user_has_store_access(store_id)
  );

-- ============================================================================
-- ORDER ITEMS POLICIES
-- ============================================================================

-- Users can see order items for orders they can access
CREATE POLICY order_items_select ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND user_has_store_access(store_id)
    )
  );

-- Users can create order items for orders they can access
CREATE POLICY order_items_insert ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND user_has_store_access(store_id)
    )
  );

-- Users can update order items for orders they can access
CREATE POLICY order_items_update ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND user_has_store_access(store_id)
    )
  );

-- Users can delete order items for orders they can access
CREATE POLICY order_items_delete ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND user_has_store_access(store_id)
    )
  );

