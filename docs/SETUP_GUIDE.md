# Brewly - Setup Guide

## Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **yarn**
- **Supabase Account**: [Sign up here](https://supabase.com)
- **Git**

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Brewly
```

## Step 2: Set Up Supabase

### 2.1 Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `brewly` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 2.2 Get Your API Credentials

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (under "Project API")
   - **anon/public key** (under "Project API keys")

### 2.3 Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
cd supabase
supabase db push
```

#### Option B: Using SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Execute each migration file in order:
   - `001_initial_schema.sql`
   - `002_suppliers_and_purchase_orders.sql`
   - `003_marketplace_and_production.sql`
   - `004_navigation_and_billing.sql`
   - `005_rls_helper_functions.sql`
   - `006_rls_policies.sql`

## Step 3: Set Up Frontend

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp ENV_TEMPLATE.md .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_NAME=Brewly
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 4: Create Initial Data

### 4.1 Create a Superuser (Optional)

In Supabase SQL Editor:

```sql
-- First, sign up a user through the app
-- Then get their user_id from auth.users table

-- Make them a superuser
INSERT INTO platform_superusers (user_id)
VALUES ('your-user-id-here');
```

### 4.2 Create Your First Organization

Through the app or SQL:

```sql
-- Create organization
INSERT INTO orgs (id, name)
VALUES (gen_random_uuid(), 'My Coffee Shop')
RETURNING id;

-- Make yourself an owner
INSERT INTO org_members (org_id, user_id, role)
VALUES ('org-id-from-above', 'your-user-id', 'owner');
```

### 4.3 Create a Location

```sql
INSERT INTO locations (org_id, name, address, timezone)
VALUES (
  'your-org-id',
  'Main Street Location',
  '123 Main St, City, State 12345',
  'America/New_York'
)
RETURNING id;

-- Add yourself as an admin
INSERT INTO location_members (location_id, user_id, role)
VALUES ('location-id-from-above', 'your-user-id', 'admin');
```

### 4.4 Create Sizes

```sql
-- Create standard coffee sizes
INSERT INTO sizes (org_id, location_id, name) VALUES
  ('your-org-id', 'your-location-id', 'Small'),
  ('your-org-id', 'your-location-id', 'Medium'),
  ('your-org-id', 'your-location-id', 'Large');
```

### 4.5 Create Sample Products

```sql
-- Create a coffee product
INSERT INTO products (org_id, location_id, name, category, is_active)
VALUES (
  'your-org-id',
  'your-location-id',
  'Americano',
  'Coffee',
  true
)
RETURNING id;

-- Add prices for each size
INSERT INTO product_prices (org_id, location_id, product_id, size_id, price_cents)
VALUES
  ('your-org-id', 'your-location-id', 'product-id', 'small-size-id', 300),
  ('your-org-id', 'your-location-id', 'product-id', 'medium-size-id', 350),
  ('your-org-id', 'your-location-id', 'product-id', 'large-size-id', 400);
```

### 4.6 Create Modifier Groups

```sql
-- Create milk type modifier group
INSERT INTO modifier_groups (org_id, location_id, name, required, min_choices, max_choices)
VALUES (
  'your-org-id',
  'your-location-id',
  'Milk Type',
  true,
  1,
  1
)
RETURNING id;

-- Add milk modifiers
INSERT INTO modifiers (org_id, location_id, group_id, name, price_delta_cents) VALUES
  ('your-org-id', 'your-location-id', 'group-id', 'Whole Milk', 0),
  ('your-org-id', 'your-location-id', 'group-id', 'Almond Milk', 50),
  ('your-org-id', 'your-location-id', 'group-id', 'Oat Milk', 50);

-- Associate with product
INSERT INTO product_modifier_groups (product_id, group_id, sort_order)
VALUES ('product-id', 'group-id', 0);
```

## Step 5: Verify Setup

### 5.1 Test Authentication

1. Go to [http://localhost:3000](http://localhost:3000)
2. Sign up for a new account
3. Check that you're redirected after login

### 5.2 Test Data Access

1. Navigate to the catalog
2. Verify products are visible
3. Try creating an order

### 5.3 Check RLS Policies

Try accessing data from another organization (should fail):

```sql
-- As a non-owner, try to select from another org
SELECT * FROM products WHERE org_id = 'different-org-id';
-- Should return no results due to RLS
```

## Common Issues

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure `.env.local` exists and contains correct values.

### Issue: "Database connection failed"

**Solution**: 
1. Check Supabase project is running
2. Verify URL and API key are correct
3. Check for typos in `.env.local`

### Issue: "No data showing up"

**Solution**:
1. Verify migrations ran successfully
2. Check RLS policies are in place
3. Ensure user has proper organization/location membership

### Issue: "Permission denied"

**Solution**:
1. Check user is member of organization/location
2. Verify RLS helper functions exist
3. Check role assignments

## Development Tools

### Supabase Local Development

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database
supabase db reset
```

### Database Management

Use Supabase Studio (included with local dev):
- Tables: View and edit data
- SQL Editor: Run queries
- Database: View schema
- Auth: Manage users

### Debugging

Enable logging:

```typescript
// In supabase client
const supabase = createClient(url, key, {
  auth: {
    debug: true,
  },
})
```

## Next Steps

1. **Explore the App**: Navigate through different features
2. **Read Documentation**: Check `docs/ARCHITECTURE.md`
3. **Customize**: Modify to fit your needs
4. **Deploy**: Follow deployment guide for production

## Support

- **Documentation**: Check `/docs` folder
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions

