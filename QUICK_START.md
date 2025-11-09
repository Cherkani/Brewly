# Brewly - Quick Start Guide

Get up and running with Brewly in minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon/public` key

### 3. Configure Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_NAME=Brewly
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Migrations

In Supabase Dashboard → **SQL Editor**, run each file in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_suppliers_and_purchase_orders.sql`
3. `supabase/migrations/003_marketplace_and_production.sql`
4. `supabase/migrations/004_navigation_and_billing.sql`
5. `supabase/migrations/005_rls_helper_functions.sql`
6. `supabase/migrations/006_rls_policies.sql`

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📊 Add Sample Data

### Create Organization & Location

In Supabase **SQL Editor**:

```sql
-- 1. Sign up through the app first, then get your user_id
SELECT id, email FROM auth.users;

-- 2. Create organization
INSERT INTO orgs (id, name) VALUES 
  (gen_random_uuid(), 'My Coffee Shop')
RETURNING id;

-- 3. Add yourself as owner (use org_id from above)
INSERT INTO org_members (org_id, user_id, role) VALUES 
  ('YOUR_ORG_ID', 'YOUR_USER_ID', 'owner');

-- 4. Create location
INSERT INTO locations (org_id, name, address) VALUES 
  ('YOUR_ORG_ID', 'Main Street', '123 Main St')
RETURNING id;

-- 5. Add yourself to location
INSERT INTO location_members (location_id, user_id, role) VALUES 
  ('YOUR_LOCATION_ID', 'YOUR_USER_ID', 'admin');
```

### Add Product Sizes

```sql
INSERT INTO sizes (org_id, location_id, name) VALUES
  ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'Small'),
  ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'Medium'),
  ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'Large')
RETURNING id;
```

### Add Sample Products

```sql
-- Create Americano
INSERT INTO products (org_id, location_id, name, category, is_active) 
VALUES ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'Americano', 'Coffee', true)
RETURNING id;

-- Add prices (use product_id from above and size_ids from earlier)
INSERT INTO product_prices (org_id, location_id, product_id, size_id, price_cents) VALUES
  ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'PRODUCT_ID', 'SMALL_SIZE_ID', 300),
  ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'PRODUCT_ID', 'MEDIUM_SIZE_ID', 350),
  ('YOUR_ORG_ID', 'YOUR_LOCATION_ID', 'PRODUCT_ID', 'LARGE_SIZE_ID', 400);
```

---

## 🎯 Test the App

1. **Sign Up**: Create your account at `/auth/signup`
2. **Select Location**: Choose your location from the dropdown
3. **View POS**: Go to `/pos` to see the Point of Sale interface
4. **Add Products**: Click products to add them to the cart
5. **Create Order**: Click checkout to process (payment integration pending)

---

## 📁 Project Structure

```
Brewly/
├── frontend/
│   ├── app/                    # Pages
│   │   ├── page.tsx           # Landing page
│   │   └── pos/               # POS interface ✅
│   ├── components/            # UI Components ✅
│   │   ├── ui/                # Base components
│   │   ├── catalog/           # Product components
│   │   └── pos/               # Cart components
│   └── lib/
│       ├── domain/            # Business logic ✅
│       ├── infrastructure/    # Data access ✅
│       ├── application/       # Services & Hooks ✅
│       └── shared/            # Utilities ✅
└── supabase/
    └── migrations/            # Database schema ✅
```

---

## 🎨 What's Included

### ✅ Fully Implemented

- **Database Schema**: 35+ tables with RLS
- **Clean Architecture**: 4-layer separation
- **Domain Entities**: Product, Order, Ingredient, etc.
- **Repositories**: Data access with interfaces
- **State Management**: Zustand stores
- **POS Interface**: Working point of sale
- **Product Catalog**: Grid view with cards
- **Cart Management**: Add, remove, update items

### 🚧 To Be Implemented

- Authentication pages
- Order management interface
- Inventory tracking UI
- Supplier management
- Reports & analytics
- Payment processing
- Kitchen Display System

---

## 📚 Learn More

- **Architecture**: `docs/ARCHITECTURE.md`
- **Full Setup**: `docs/SETUP_GUIDE.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Summary**: `PROJECT_SUMMARY.md`

---

## 🆘 Troubleshooting

### "Missing environment variables"
→ Create `frontend/.env.local` with Supabase credentials

### "No products showing"
→ Run migrations and add sample data

### "Permission denied"
→ Make sure you're added to an organization and location

### "Cannot connect to Supabase"
→ Check your project URL and API key are correct

---

## 🎉 Next Steps

1. **Customize**: Modify products, categories, and prices
2. **Explore**: Check out the clean architecture implementation
3. **Build**: Add new features following the architecture
4. **Deploy**: Push to Vercel when ready

---

## 💡 Tips

- **Use the POS**: Go to `/pos` to test the interface
- **Check Console**: Browser DevTools for debugging
- **Supabase Studio**: View data in real-time
- **Read Docs**: Comprehensive guides in `/docs`

---

**Questions?** Check the documentation or open an issue!

**Happy Brewing! ☕**

