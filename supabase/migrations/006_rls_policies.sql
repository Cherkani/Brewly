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

