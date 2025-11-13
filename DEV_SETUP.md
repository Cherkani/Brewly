# 🛠️ Development Setup Guide

This guide will help you set up your development environment with test data and easy context switching.

---

## 📋 **Step-by-Step Setup**

### **Step 1: Run Migrations**

First, create all the database tables:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `qlvhqgtjqfdfpjordits`
3. Click **SQL Editor** (left sidebar)
4. Click **"+ New query"**
5. Open `supabase/complete_migration.sql` on your computer
6. Copy **ALL** content (1363 lines)
7. Paste into SQL Editor
8. Click **"RUN"**
9. Wait ~30 seconds for completion

---

### **Step 2: Load Seed Data**

Load sample organizations, locations, and products:

1. Stay in **SQL Editor**
2. Click **"+ New query"**
3. Open `supabase/seed.sql` on your computer
4. Copy **ALL** content
5. Paste into SQL Editor
6. Click **"RUN"**
7. You should see a success message! ✅

---

### **Step 3: Verify Data**

Check that data was loaded:

1. Go to **Table Editor** (left sidebar)
2. You should see tables like:
   - `orgs` (3 organizations)
   - `locations` (5 locations)
   - `products` (10+ products)
   - `suppliers` (3 suppliers)
   - etc.

---

### **Step 4: Start Frontend**

```bash
cd /Users/cherkaniaymen/Desktop/Brewly/Brewly/frontend
npm install  # if not already done
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 **Using the Dev Context Switcher**

When you open the app in development mode, you'll see a **🔧 Dev Tools** panel in the bottom-right corner.

### **Features:**

1. **Select Organization**
   - Downtown Coffee Co.
   - Mountain Brew
   - Coastal Café

2. **Select Location**
   - Automatically filters based on selected organization
   - Shows location name and address

3. **Select Role**
   - Owner (full access)
   - Admin (management access)
   - Cashier (POS access)

4. **Context is Saved**
   - Your selection is saved to localStorage
   - Persists across page refreshes
   - Other components can access it using `useDevContext()` hook

### **Example:**

```
1. Select "Downtown Coffee Co." as organization
2. Select "Main Street Store" as location
3. Select "Admin" as role
4. Now navigate to /pos or /inventory
5. The app will use your selected context!
```

---

## 📊 **Sample Data Overview**

### **Organizations Created:**

#### 1. **Downtown Coffee Co.**
- **ID:** `00000000-0000-0000-0000-000000000001`
- **Plan:** Pro
- **Locations:**
  - Main Street Store (ID: `10000000-0000-0000-0000-000000000001`)
  - Plaza Location (ID: `10000000-0000-0000-0000-000000000002`)

#### 2. **Mountain Brew**
- **ID:** `00000000-0000-0000-0000-000000000002`
- **Plan:** Basic
- **Locations:**
  - Mountain View Café (ID: `10000000-0000-0000-0000-000000000003`)

#### 3. **Coastal Café**
- **ID:** `00000000-0000-0000-0000-000000000003`
- **Plan:** Enterprise (Trial)
- **Locations:**
  - Beachside Coffee (ID: `10000000-0000-0000-0000-000000000004`)
  - Harbor Café (ID: `10000000-0000-0000-0000-000000000005`)

---

### **Products (Main Street Store)**

| Product | Category | Sizes | Base Price |
|---------|----------|-------|------------|
| Espresso | Coffee | S, M | $2.50-3.00 |
| Cappuccino | Coffee | S, M, L | $3.50-4.50 |
| Latte | Coffee | S, M, L | $3.50-4.50 |
| Americano | Coffee | S, M, L | $2.80-3.80 |
| Mocha | Coffee | M, L | $4.50-5.00 |
| Croissant | Pastry | - | $3.20 |
| Blueberry Muffin | Pastry | - | $2.80 |

---

### **Modifiers Available**

#### **Milk Options** (+$0.00-0.50)
- Whole Milk
- Skim Milk
- Oat Milk (+$0.50)
- Almond Milk (+$0.50)
- Soy Milk (+$0.40)

#### **Sweeteners** (+$0.00-0.30)
- Sugar
- Honey (+$0.20)
- Vanilla Syrup (+$0.30)
- Caramel Syrup (+$0.30)
- Hazelnut Syrup (+$0.30)

#### **Extra Shots** (+$0.50-1.00)
- Extra Shot (+$0.50)
- Double Shot (+$1.00)

#### **Toppings** (+$0.10-0.30)
- Whipped Cream (+$0.30)
- Chocolate Drizzle (+$0.20)
- Cinnamon (+$0.10)

---

### **Suppliers**

1. **Premium Coffee Imports**
   - Contact: John Smith
   - Rating: 5.0 ⭐
   - Specialty: Coffee beans

2. **Dairy Fresh Co.**
   - Contact: Sarah Johnson
   - Rating: 4.5 ⭐
   - Specialty: Milk products

3. **Packaging Solutions Inc.**
   - Contact: Mike Brown
   - Rating: 4.8 ⭐
   - Specialty: Cups, lids, packaging

---

### **Sample Orders**

3 orders are pre-created in "Main Street Store":

1. **Order #1001** - Alice Cooper
   - Status: Queued
   - 2x Cappuccino (Medium)
   - Total: $7.50

2. **Order #1002** - Bob Dylan
   - Status: In Progress
   - 1x Latte (Large)
   - 2x Croissant
   - Total: $11.30

3. **Order #1003** - Charlie Brown
   - Status: Ready
   - 1x Americano (Medium)
   - Total: $3.80

---

## 🔧 **How to Use Dev Context in Your Code**

### **In React Components:**

```typescript
'use client'

import { useDevContext } from '@/components/dev/DevContextSwitcher'

function MyComponent() {
  const { orgId, locationId, role } = useDevContext()
  
  // Use the context values
  console.log('Current Org:', orgId)
  console.log('Current Location:', locationId)
  console.log('Current Role:', role)
  
  // Fetch data based on context
  // ...
}
```

### **Example: Fetch Products for Selected Location**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useDevContext } from '@/components/dev/DevContextSwitcher'
import { supabase } from '@/lib/infrastructure/supabase/client'

function ProductList() {
  const { locationId } = useDevContext()
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    if (!locationId) return
    
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('location_id', locationId)
      
      setProducts(data || [])
    }
    
    loadProducts()
  }, [locationId])
  
  if (!locationId) {
    return <div>Please select a location using Dev Tools</div>
  }
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

---

## 🎨 **Dev Context Switcher Features**

### **UI Elements:**

- 🏢 **Organization dropdown** - Switch between orgs
- 📍 **Location dropdown** - Filtered by selected org
- 👤 **Role buttons** - Owner, Admin, Cashier
- 💾 **Auto-save** - Context saved to localStorage
- 🔄 **Refresh button** - Reload orgs/locations
- 🧹 **Clear button** - Reset context
- 📊 **Current context display** - Shows active selection
- ➖ **Minimize button** - Hide panel (shows small button)

### **Behavior:**

- ✅ Only visible in development mode
- ✅ Persists across page navigation
- ✅ Emits events when context changes
- ✅ Other components can listen to changes
- ✅ Automatically filters locations by org
- ✅ Resets location when org changes

---

## 🚀 **Quick Start Workflow**

```bash
# 1. Ensure .env.local is set up
cd frontend
cat .env.local  # Should show your Supabase credentials

# 2. Run migrations (in Supabase Dashboard)
# Copy: supabase/complete_migration.sql
# Run in SQL Editor

# 3. Load seed data (in Supabase Dashboard)
# Copy: supabase/seed.sql
# Run in SQL Editor

# 4. Start dev server
npm run dev

# 5. Open browser
# Visit: http://localhost:3000

# 6. Use Dev Tools (bottom-right)
# Select: Downtown Coffee Co. → Main Street Store → Admin

# 7. Navigate to features
# Try: /pos, /inventory, /orders, /suppliers
```

---

## ✅ **Verification Checklist**

After setup, verify everything works:

- [ ] Migrations ran successfully (35+ tables in Supabase)
- [ ] Seed data loaded (3 orgs, 5 locations, 10+ products)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Dev Tools panel visible (bottom-right corner)
- [ ] Can select organizations
- [ ] Can select locations
- [ ] Can switch roles
- [ ] Context persists on page refresh

---

## 🆘 **Troubleshooting**

### **Problem: Dev Tools not showing**

**Solution:**
- Make sure you're in development mode
- Check `NODE_ENV === 'development'`
- Try: `npm run dev` (not `npm run build && npm start`)

### **Problem: No organizations in dropdown**

**Solution:**
- Verify seed data was loaded
- Check Supabase Table Editor → `orgs` table should have 3 rows
- Click "Refresh" button in Dev Tools

### **Problem: Can't select location**

**Solution:**
- Make sure you selected an organization first
- Locations are filtered by organization
- Check that locations exist for that org in `locations` table

### **Problem: Context not persisting**

**Solution:**
- Check browser localStorage (DevTools → Application → Local Storage)
- Should see `dev_context` key
- Clear and set again if needed

---

## 📝 **Next Steps**

Now that your dev environment is set up:

1. ✅ Explore the POS interface (`/pos`)
2. ✅ Check inventory management (`/inventory`)
3. ✅ Review orders (`/orders`)
4. ✅ Manage suppliers (`/suppliers`)
5. ✅ Build new features using the selected context!

---

## 🎉 **You're Ready!**

Your development environment is fully configured with:
- ✅ Multi-tenant database with RLS
- ✅ Sample data for 3 organizations
- ✅ Easy context switching
- ✅ Hot-reload development server
- ✅ Clean architecture structure

**Happy coding! ☕**

