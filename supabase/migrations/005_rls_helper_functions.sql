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

