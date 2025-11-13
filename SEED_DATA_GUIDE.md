# 🌱 Seed Data Guide

## 📦 What's Included

The `seed_complete.sql` file populates **ALL** tables with realistic dummy data for development and testing.

---

## 🚀 How to Load the Seed Data

### **Step 1: Open Supabase Dashboard**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: `qlvhqgtjqfdfpjordits`

### **Step 2: Run the Seed Script**
1. Click **SQL Editor** (left sidebar)
2. Click **"+ New query"**
3. Open `supabase/seed_complete.sql` from your project
4. Copy **ALL** content (~900 lines)
5. Paste into SQL Editor
6. Click **"RUN"**
7. Wait ~10-20 seconds
8. You should see a success message! ✅

---

## 📊 Data Summary

### **Organizations (3)**
- Downtown Coffee Co. (Pro Plan)
- Mountain Brew (Basic Plan)
- Coastal Café (Enterprise Trial)

### **Locations (5)**
- Main Street Store (Downtown)
- Plaza Location (Downtown)
- Mountain View Café (Mountain Brew)
- Beachside Coffee (Coastal)
- Harbor Café (Coastal)

### **Products (27)**
- Espresso, Cappuccino, Latte, Americano
- Mocha, Flat White, Macchiato
- Cold Brew, Iced Latte, Nitro Cold Brew
- Matcha Latte, Chai Latte
- Croissants, Muffins, Cookies
- Bagels, Avocado Toast, Acai Bowl
- And more...

### **Modifiers**
- **Milk Options**: Whole, Skim, Oat, Almond, Soy, Coconut
- **Sweeteners**: Sugar, Honey, Vanilla, Caramel, Hazelnut, Maple
- **Extra Shots**: Single, Double
- **Toppings**: Whipped Cream, Chocolate Drizzle, Cinnamon, etc.

### **Inventory (20 Ingredients)**
- Coffee beans (Arabica, Robusta)
- Milk varieties (Whole, Oat, Almond)
- Syrups (Vanilla, Caramel, Hazelnut)
- Supplies (Cups, Lids, Whipped Cream)
- Pastries (Croissants, Muffins, Bagels)

### **Suppliers (6)**
- Premium Coffee Imports ⭐ 5.0
- Dairy Fresh Co. ⭐ 4.5
- Packaging Solutions Inc. ⭐ 4.8
- Sweet Syrups Ltd. ⭐ 4.7
- Bakery Wholesale ⭐ 4.6
- Mountain Coffee Roasters ⭐ 4.9

### **Orders (12)**
- **Active**: 1 queued, 1 in progress, 1 ready
- **Recent**: 2 paid/completed
- **History**: 7 completed orders from last week

### **Purchase Orders (6)**
- 3 received orders
- 1 confirmed order
- 1 sent order
- 1 draft order

### **Additional Data**
- ✅ Order items with modifiers
- ✅ Payments (cash, card, mobile)
- ✅ Order status history
- ✅ Inventory transactions (purchases, sales, waste, adjustments)
- ✅ Low stock alerts (3 active)
- ✅ Recipes for popular drinks
- ✅ KDS tokens for each location
- ✅ Marketplace listings (4 items)
- ✅ Production items (4 batches)
- ✅ Navigation settings
- ✅ Billing records (5 invoices)

---

## 🎯 Test Scenarios You Can Try

### **1. POS System**
- Location: Main Street Store
- Browse 12 products
- Add items to cart
- Apply modifiers (Oat Milk +$0.50, Vanilla Syrup +$0.30)
- Process payment

### **2. Order Management**
- View 12 orders in different statuses
- Update order status (queued → in progress → ready → paid)
- View order history
- See payment details

### **3. Inventory Management**
- Check 20 ingredients with stock levels
- See low stock alerts (3 active)
- View transaction history
- Track usage patterns

### **4. Supplier Management**
- Browse 6 suppliers with ratings
- View purchase orders (6 POs in various states)
- Track order status
- See supplier performance

### **5. Recipes**
- View 3 recipes (Cappuccino, Latte, Mocha)
- See ingredient quantities
- Check preparation instructions
- Calculate costs

### **6. Analytics** (Data Ready)
- Sales by day/week/month
- Popular products
- Revenue trends
- Inventory turnover
- Order patterns

### **7. Marketplace**
- View 4 marketplace listings
- Coffee beans for sale
- Branded merchandise
- Gift cards

### **8. Production**
- See 4 production batches
- Track production status
- Monitor yield quantities
- View production notes

---

## 📋 Complete Data IDs Reference

### **Organizations**
```
Downtown Coffee Co.: 00000000-0000-0000-0000-000000000001
Mountain Brew:       00000000-0000-0000-0000-000000000002
Coastal Café:        00000000-0000-0000-0000-000000000003
```

### **Locations**
```
Main Street Store:   10000000-0000-0000-0000-000000000001
Plaza Location:      10000000-0000-0000-0000-000000000002
Mountain View Café:  10000000-0000-0000-0000-000000000003
Beachside Coffee:    10000000-0000-0000-0000-000000000004
Harbor Café:         10000000-0000-0000-0000-000000000005
```

### **Sample Product IDs (Main Street)**
```
Espresso:    30000000-0000-0000-0000-000000000001
Cappuccino:  30000000-0000-0000-0000-000000000002
Latte:       30000000-0000-0000-0000-000000000003
Americano:   30000000-0000-0000-0000-000000000004
Mocha:       30000000-0000-0000-0000-000000000005
```

---

## 🔄 Resetting Data

If you want to **reset and reload** the seed data:

### **Option 1: Clean and Reload**
1. Uncomment the `TRUNCATE` statements at the top of `seed_complete.sql`
2. Run the entire script again
3. All data will be replaced

### **Option 2: Manual Cleanup**
```sql
-- In SQL Editor, run:
TRUNCATE TABLE 
  order_item_modifiers, order_items, order_status_history, 
  orders, payments, inventory_tx, alerts, recipe_items, 
  recipes, product_modifier_groups, product_prices, products, 
  modifiers, modifier_groups, sizes, supplier_products, 
  purchase_order_items, purchase_orders, supplier_categories, 
  suppliers, marketplace_listings, production, 
  navigation_permissions, navigation_settings, billing, 
  kds_tokens, location_members, locations, org_members, 
  subscriptions, orgs 
CASCADE;
```
Then run the seed script.

---

## ✅ Verification

After running the seed, verify data loaded correctly:

### **Check Table Counts**
```sql
-- Run in SQL Editor
SELECT 'orgs' as table_name, COUNT(*) as count FROM orgs
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'recipes', COUNT(*) FROM recipes
UNION ALL SELECT 'marketplace_listings', COUNT(*) FROM marketplace_listings
ORDER BY table_name;
```

### **Expected Counts**
| Table | Count |
|-------|-------|
| orgs | 3 |
| locations | 5 |
| products | 27 |
| orders | 12 |
| suppliers | 6 |
| ingredients | 20 |
| purchase_orders | 6 |
| recipes | 3 |
| marketplace_listings | 4 |

---

## 🎨 Using with Dev Context Switcher

After loading seed data, use the **Dev Context Switcher** (bottom-right in dev mode):

1. **Select Organization**: Downtown Coffee Co.
2. **Select Location**: Main Street Store
3. **Select Role**: Admin
4. Navigate to any feature to see data!

---

## 💡 Tips

1. **Start with Main Street Store** - It has the most complete data
2. **Check Orders page** - See 12 orders in different states
3. **Try Inventory** - 3 low stock alerts to test notifications
4. **Browse Suppliers** - 6 suppliers with different ratings
5. **Test POS** - 12 products ready with modifiers

---

## 🆘 Troubleshooting

### **Problem: "ERROR: duplicate key value"**
**Solution:** Data already exists. Either:
- Skip this error (data already loaded)
- Or uncomment `TRUNCATE` statements to reset

### **Problem: "ERROR: foreign key violation"**
**Solution:** 
- Make sure migrations ran first
- Tables must exist before loading seed data
- Run `complete_migration.sql` before `seed_complete.sql`

### **Problem: "No success message shown"**
**Solution:**
- Check for errors in SQL Editor output
- Scroll down to see the success message
- If no errors, data loaded successfully

---

## 🎉 You're Ready!

Your database now has:
- ✅ 3 Organizations with different plans
- ✅ 5 Locations across organizations
- ✅ 27 Products with prices
- ✅ 12 Sample orders
- ✅ 20 Inventory items
- ✅ 6 Suppliers
- ✅ Complete transaction history
- ✅ And much more!

**Start exploring your Brewly app with real data!** ☕

