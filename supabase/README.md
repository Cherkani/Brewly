# Brewly Database Schema

## Overview

Simplified database schema with just the essential tables: Organizations, Stores, Products, and Orders.

## User Roles

- **superadmin**: Full system access, can manage everything
- **admin**: Manages a specific organization and can switch between stores in that org
- **developer**: Can switch between any organization and store (for development/testing)
- **cashier**: Assigned to one specific store, cannot switch

## Default Login Behavior

All users login as **cashier** by default. The `user_roles` table has an `is_default` flag to mark which role/store should be used for default login.

## Tables

### `orgs`
Organizations (tenants) - each coffee shop chain.

### `stores`
Physical store locations within organizations.

### `user_roles`
User role assignments with organization and store context.
- `org_id` and `store_id` are NULL for superadmin/developer
- `org_id` is set, `store_id` is NULL for admin (can access all stores in org)
- Both `org_id` and `store_id` are set for cashier (single store only)
- `is_default` marks the default role/store for login

### `products`
Product catalog with organization and store separation.

### `orders`
Customer orders with organization and store separation.

### `order_items`
Line items for orders.

## Running Migrations

1. Run `001_initial_schema.sql` to create tables
2. Run `002_rls_policies.sql` to enable RLS and create policies
3. Run `seed.sql` to populate with sample data

## Setting Up Users

After a user signs up via Supabase Auth, see **[USER_ROLES_GUIDE.md](./USER_ROLES_GUIDE.md)** for detailed instructions on managing user roles.

Quick examples:

```sql
-- Example: Create a cashier user
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default) VALUES
('USER-AUTH-ID', 'cashier', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', true);

-- Example: Create an admin user
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default) VALUES
('USER-AUTH-ID', 'admin', '00000000-0000-0000-0000-000000000001', NULL, true);

-- Example: Create a developer user
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default) VALUES
('USER-AUTH-ID', 'developer', NULL, NULL, true);

-- Example: Create a superadmin user
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default) VALUES
('USER-AUTH-ID', 'superadmin', NULL, NULL, true);
```

## RLS Policies

- **Superadmin**: Full access to everything
- **Developer**: Can view and manage all organizations and stores
- **Admin**: Can view and manage their organization and all stores in it
- **Cashier**: Can only view and manage their assigned store

