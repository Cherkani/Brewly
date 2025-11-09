# 🗄️ Database Migration Guide

## Method 1: Using Supabase Dashboard (Recommended - Easiest)

### Step 1: Open Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project (ID: `qlvhqgtjqfdfpjordits`)
3. Click on **"SQL Editor"** in the left sidebar (icon looks like `</>`)
4. Click **"New query"**

---

### Step 2: Run Each Migration (in order)

Copy and paste each migration file content into the SQL Editor and click **"Run"**.

#### Migration 1: Initial Schema
```bash
# Copy this file:
supabase/migrations/001_initial_schema.sql
```
- Paste into SQL Editor → Click **RUN**
- This creates: orgs, locations, products, orders, ingredients, etc.

---

#### Migration 2: Suppliers & Purchase Orders
```bash
# Copy this file:
supabase/migrations/002_suppliers_and_purchase_orders.sql
```
- Paste into SQL Editor → Click **RUN**
- This creates: suppliers, purchase_orders tables

---

#### Migration 3: Marketplace & Production
```bash
# Copy this file:
supabase/migrations/003_marketplace_and_production.sql
```
- Paste into SQL Editor → Click **RUN**
- This creates: marketplace_listings, production tables

---

#### Migration 4: Navigation & Billing
```bash
# Copy this file:
supabase/migrations/004_navigation_and_billing.sql
```
- Paste into SQL Editor → Click **RUN**
- This creates: navigation_settings, billing tables

---

#### Migration 5: RLS Helper Functions
```bash
# Copy this file:
supabase/migrations/005_rls_helper_functions.sql
```
- Paste into SQL Editor → Click **RUN**
- This creates: security helper functions

---

#### Migration 6: RLS Policies
```bash
# Copy this file:
supabase/migrations/006_rls_policies.sql
```
- Paste into SQL Editor → Click **RUN**
- This creates: all Row Level Security policies

---

### Step 3: Verify Tables Were Created

After running all migrations, go to:
- **Table Editor** (left sidebar)
- You should see 35+ tables including:
  - ✅ orgs
  - ✅ locations
  - ✅ products
  - ✅ orders
  - ✅ suppliers
  - ✅ ingredients
  - ✅ etc.

---

## Method 2: Using Combined Migration File (Faster)

I've created a combined file with all migrations:

### Step 1: Open the Combined File
```bash
# Location:
supabase/complete_migration.sql
```

### Step 2: Copy All Content

Open the file and copy **everything** (it's about 1000+ lines)

### Step 3: Paste into Supabase SQL Editor

1. Go to SQL Editor in Supabase Dashboard
2. New Query
3. Paste all content
4. Click **RUN** (this will take 10-30 seconds)

---

## Method 3: Using Supabase CLI (Advanced)

If you want to use the CLI properly:

### Step 1: Link Your Project
```bash
cd /Users/cherkaniaymen/Desktop/Brewly/Brewly
supabase link --project-ref qlvhqgtjqfdfpjordits
```

It will ask for your database password. Get it from:
- Supabase Dashboard → Settings → Database → Database password (if you saved it)
- Or reset it: Settings → Database → "Reset database password"

### Step 2: Push Migrations
```bash
supabase db push
```

---

## ✅ Verification Checklist

After running migrations, verify:

### Check Tables Created:
```sql
-- Run this in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 35+ tables.

### Check RLS Enabled:
```sql
-- Run this in SQL Editor
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### Check Functions Created:
```sql
-- Run this in SQL Editor
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

You should see functions like:
- `is_superuser()`
- `user_is_org_owner()`
- `user_in_location()`
- etc.

---

## 🎉 Success!

Once all migrations are complete, your database will have:
- ✅ 35+ tables for all features
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions for access control
- ✅ Proper indexes and constraints
- ✅ Multi-tenant architecture ready

Now you can:
1. Start the frontend: `cd frontend && npm run dev`
2. Sign up for an account
3. Create your first organization
4. Start using Brewly! ☕

---

## 🆘 Troubleshooting

### Error: "relation already exists"
- Some tables already exist
- Safe to ignore or drop and recreate

### Error: "permission denied"
- Make sure you're using the Service Role key
- Or use the Supabase Dashboard SQL Editor (recommended)

### Error: "syntax error"
- Make sure you copied the entire file
- Check for any missing characters

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message in SQL Editor
2. Make sure migrations run in order (1 → 6)
3. Try the combined file method
4. Or run each migration individually

