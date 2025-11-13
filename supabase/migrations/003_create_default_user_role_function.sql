-- ============================================================================
-- BREWLY - CREATE DEFAULT USER ROLE FUNCTION
-- ============================================================================
-- Function to automatically create a default cashier role for new users
-- ============================================================================

-- Function that can be called to ensure a user has a default role
-- This function runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION ensure_default_user_role()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
  first_org_id UUID;
  first_store_id UUID;
  existing_role_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if user already has a default role
  SELECT id INTO existing_role_id
  FROM user_roles
  WHERE user_id = current_user_id
    AND is_default = true
  LIMIT 1;

  -- If user already has a default role, return early
  IF existing_role_id IS NOT NULL THEN
    RETURN;
  END IF;

  -- Get the "Default" organization
  SELECT id INTO first_org_id
  FROM orgs
  WHERE name = 'Default'
  LIMIT 1;

  -- If "Default" organization doesn't exist, try first org as fallback
  IF first_org_id IS NULL THEN
    SELECT id INTO first_org_id
    FROM orgs
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- If no organization exists, return early
  IF first_org_id IS NULL THEN
    RAISE NOTICE 'No organizations found, cannot create default role';
    RETURN;
  END IF;

  -- Get "Main Street Store" for the Default org
  SELECT id INTO first_store_id
  FROM stores
  WHERE org_id = first_org_id
    AND name = 'Main Street Store'
    AND is_active = true
  LIMIT 1;

  -- If "Main Street Store" doesn't exist, try first active store as fallback
  IF first_store_id IS NULL THEN
    SELECT id INTO first_store_id
    FROM stores
    WHERE org_id = first_org_id
      AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- If no store exists, return early
  IF first_store_id IS NULL THEN
    RAISE NOTICE 'No active stores found, cannot create default role';
    RETURN;
  END IF;

  -- Create default cashier role
  INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
  VALUES (current_user_id, 'cashier', first_org_id, first_store_id, true)
  ON CONFLICT (user_id, role, org_id, store_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_default_user_role() TO authenticated;

