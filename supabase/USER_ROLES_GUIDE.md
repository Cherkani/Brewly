# User Roles Management Guide

## How to Alter User Roles in Supabase

This guide explains how to manage user roles using SQL in the Supabase SQL Editor.

## Finding a User's Auth ID

First, you need to find the user's UUID from the `auth.users` table:

```sql
-- List all users with their emails
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

Or search for a specific user:

```sql
-- Find user by email
SELECT id, email 
FROM auth.users 
WHERE email = 'user@example.com';
```

## User Role Structure

The `user_roles` table links users to roles with organization and store context:

- **superadmin**: `org_id = NULL`, `store_id = NULL`
- **developer**: `org_id = NULL`, `store_id = NULL`
- **admin**: `org_id = <org_id>`, `store_id = NULL` (can access all stores in org)
- **cashier**: `org_id = <org_id>`, `store_id = <store_id>` (single store only)

## Creating User Roles

### 1. Create a Superadmin

```sql
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',  -- Replace with actual auth.users.id
  'superadmin',
  NULL,
  NULL,
  true
);
```

### 2. Create a Developer

```sql
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',
  'developer',
  NULL,
  NULL,
  true
);
```

### 3. Create an Admin (for a specific organization)

```sql
-- First, get the organization ID
SELECT id, name FROM orgs;

-- Then create admin role
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',
  'admin',
  '00000000-0000-0000-0000-000000000001',  -- Replace with org_id
  NULL,
  true
);
```

### 4. Create a Cashier (for a specific store)

```sql
-- First, get the store ID
SELECT id, name, org_id FROM stores;

-- Then create cashier role
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',
  'cashier',
  '00000000-0000-0000-0000-000000000001',  -- Replace with org_id
  '10000000-0000-0000-0000-000000000001',  -- Replace with store_id
  true
);
```

## Updating User Roles

### Change a User's Role

```sql
-- Update existing role
UPDATE user_roles
SET role = 'admin',
    org_id = '00000000-0000-0000-0000-000000000001',
    store_id = NULL
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND is_default = true;
```

### Change a Cashier's Store

```sql
-- Move cashier to different store
UPDATE user_roles
SET store_id = '10000000-0000-0000-0000-000000000002'  -- New store_id
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND role = 'cashier'
  AND is_default = true;
```

### Change Default Role

```sql
-- Remove default flag from current default
UPDATE user_roles
SET is_default = false
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND is_default = true;

-- Set new default role
UPDATE user_roles
SET is_default = true
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND role = 'admin'
  AND org_id = '00000000-0000-0000-0000-000000000001';
```

## Adding Multiple Roles to a User

A user can have multiple roles. For example, a user could be both an admin and a cashier:

```sql
-- User is admin of org 1
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  false  -- Not default
);

-- Same user is also cashier at store 1
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',
  'cashier',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  true  -- This is the default (what they login as)
);
```

## Viewing User Roles

### View All Roles for a User

```sql
SELECT 
  ur.id,
  ur.role,
  o.name as org_name,
  s.name as store_name,
  ur.is_default,
  u.email
FROM user_roles ur
LEFT JOIN orgs o ON ur.org_id = o.id
LEFT JOIN stores s ON ur.store_id = s.id
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'user@example.com'
ORDER BY ur.is_default DESC, ur.created_at;
```

### View All Users and Their Roles

```sql
SELECT 
  u.email,
  ur.role,
  o.name as organization,
  s.name as store,
  ur.is_default
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN orgs o ON ur.org_id = o.id
LEFT JOIN stores s ON ur.store_id = s.id
ORDER BY u.email, ur.is_default DESC;
```

## Deleting User Roles

### Remove a Specific Role

```sql
DELETE FROM user_roles
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND role = 'cashier'
  AND store_id = '10000000-0000-0000-0000-000000000001';
```

### Remove All Roles for a User

```sql
DELETE FROM user_roles
WHERE user_id = 'USER-AUTH-UUID-HERE';
```

## Common Scenarios

### Scenario 1: Promote Cashier to Admin

```sql
-- Step 1: Get their current org_id and store_id
SELECT org_id, store_id FROM user_roles 
WHERE user_id = 'USER-AUTH-UUID-HERE' AND role = 'cashier';

-- Step 2: Create admin role (keep org_id, remove store_id)
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
SELECT 
  user_id,
  'admin',
  org_id,
  NULL,
  true
FROM user_roles
WHERE user_id = 'USER-AUTH-UUID-HERE' 
  AND role = 'cashier'
  AND is_default = true;

-- Step 3: Remove default from cashier role
UPDATE user_roles
SET is_default = false
WHERE user_id = 'USER-AUTH-UUID-HERE' 
  AND role = 'cashier';
```

### Scenario 2: Transfer Cashier to Different Store

```sql
UPDATE user_roles
SET store_id = '10000000-0000-0000-0000-000000000002'  -- New store
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND role = 'cashier'
  AND is_default = true;
```

### Scenario 3: Make Developer a Cashier for Testing

```sql
-- Add cashier role (keep developer role)
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'USER-AUTH-UUID-HERE',
  'cashier',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  true  -- Set as default to login as cashier
);

-- Optionally, remove default from developer role
UPDATE user_roles
SET is_default = false
WHERE user_id = 'USER-AUTH-UUID-HERE'
  AND role = 'developer';
```

## Quick Reference: Organization and Store IDs

```sql
-- Get all organizations
SELECT id, name FROM orgs;

-- Get all stores
SELECT id, name, org_id FROM stores ORDER BY org_id, name;

-- Get stores for a specific organization
SELECT id, name FROM stores 
WHERE org_id = '00000000-0000-0000-0000-000000000001';
```

## Important Notes

1. **Default Role**: Only one role should have `is_default = true` per user. This is what they login as.

2. **Cashier Requirement**: Cashiers MUST have both `org_id` and `store_id` set.

3. **Admin Access**: Admins have `org_id` set but `store_id = NULL`, meaning they can access all stores in that org.

4. **Developer/Superadmin**: Both have `org_id = NULL` and `store_id = NULL`, meaning they can access everything.

5. **Multiple Roles**: A user can have multiple roles, but only one should be marked as default.

## Example: Complete User Setup

```sql
-- 1. Find user
SELECT id, email FROM auth.users WHERE email = 'john@example.com';

-- 2. Create cashier role (default login)
INSERT INTO user_roles (user_id, role, org_id, store_id, is_default)
VALUES (
  'abc123-def456-...',  -- From step 1
  'cashier',
  '00000000-0000-0000-0000-000000000001',  -- Downtown Coffee Co.
  '10000000-0000-0000-0000-000000000001',  -- Main Street Store
  true
);

-- 3. Verify
SELECT 
  u.email,
  ur.role,
  o.name as org,
  s.name as store,
  ur.is_default
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN orgs o ON ur.org_id = o.id
LEFT JOIN stores s ON ur.store_id = s.id
WHERE u.email = 'john@example.com';
```

