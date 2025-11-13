# Brewly - Complete File Index

## 📋 Documentation Files

| File | Description |
|------|-------------|
| `README.md` | Main project documentation and overview |
| `PROJECT_SUMMARY.md` | Complete summary of what's been built |
| `QUICK_START.md` | Fast setup guide (5 minutes) |
| `FILE_INDEX.md` | This file - complete file listing |
| `LICENSE` | MIT License |
| `.gitignore` | Git ignore rules |

### Documentation Folder (`docs/`)

| File | Description |
|------|-------------|
| `ARCHITECTURE.md` | Detailed architecture documentation |
| `SETUP_GUIDE.md` | Step-by-step setup instructions |
| `API_REFERENCE.md` | Complete API and entity reference |

---

## 🗄️ Database (Supabase)

### Migrations (`supabase/migrations/`)

| File | Tables Created | Description |
|------|----------------|-------------|
| `001_initial_schema.sql` | 20+ tables | Core schema: tenancy, catalog, orders, inventory |
| `002_suppliers_and_purchase_orders.sql` | 5 tables | Supplier management and purchase orders |
| `003_marketplace_and_production.sql` | 2 tables | Marketplace listings and production tracking |
| `004_navigation_and_billing.sql` | 3 tables | Navigation settings and billing |
| `005_rls_helper_functions.sql` | Functions & Triggers | RLS helper functions, triggers |
| `006_rls_policies.sql` | Policies | Complete RLS policies for all tables |

**Total**: 6 migration files, 35+ tables

---

## 💻 Frontend Application

### Configuration Files (`frontend/`)

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `ENV_TEMPLATE.md` | Environment variables template |

### App Router (`frontend/app/`)

| File/Folder | Description |
|-------------|-------------|
| `layout.tsx` | Root layout component |
| `page.tsx` | Landing page |
| `globals.css` | Global styles and CSS variables |
| `pos/page.tsx` | Point of Sale interface (full implementation) |

---

## 🏗️ Clean Architecture Layers

### Domain Layer (`frontend/lib/domain/`)

#### Entities (`entities/`)

| File | Class | Description |
|------|-------|-------------|
| `Product.ts` | `Product` | Product with prices and modifiers |
| `ProductPrice.ts` | `ProductPrice` | Size-based pricing |
| `ModifierGroup.ts` | `ModifierGroup` | Modifier categories |
| `Modifier.ts` | `Modifier` | Individual modifiers |
| `Order.ts` | `Order` | Customer orders |
| `OrderItem.ts` | `OrderItem` | Order line items |
| `Ingredient.ts` | `Ingredient` | Inventory items |

#### Repository Interfaces (`repositories/`)

| File | Interface | Methods |
|------|-----------|---------|
| `IProductRepository.ts` | `IProductRepository` | findById, findByLocation, create, update, delete, search |
| `IOrderRepository.ts` | `IOrderRepository` | findById, findByLocation, create, updateStatus, addPayment |
| `IIngredientRepository.ts` | `IIngredientRepository` | findById, findLowStock, adjustInventory |

#### Use Cases (`use-cases/`)

| File | Class | Purpose |
|------|-------|---------|
| `CreateOrderUseCase.ts` | `CreateOrderUseCase` | Create orders with validation |
| `UpdateOrderStatusUseCase.ts` | `UpdateOrderStatusUseCase` | Update order status with rules |

---

### Infrastructure Layer (`frontend/lib/infrastructure/`)

#### Supabase (`infrastructure/supabase/`)

| File | Purpose |
|------|---------|
| `client.ts` | Supabase client and helper functions |

#### Repositories (`infrastructure/supabase/repositories/`)

| File | Implementation |
|------|----------------|
| `ProductRepository.ts` | Complete Product repository with full CRUD |

#### Mappers (`infrastructure/supabase/mappers/`)

| File | Mapper |
|------|--------|
| `productMapper.ts` | Product: DB ↔️ Domain |
| `orderMapper.ts` | Order: DB ↔️ Domain |

#### State Management (`infrastructure/state/stores/`)

| File | Store | Purpose |
|------|-------|---------|
| `appStore.ts` | `useAppStore` | Global app state (user, org, location) |
| `posStore.ts` | `usePOSStore` | POS cart and order state |

---

### Application Layer (`frontend/lib/application/`)

#### Services (`application/services/`)

| File | Service | Methods |
|------|---------|---------|
| `ProductService.ts` | `ProductService` | getProducts, createProduct, updateProduct, deleteProduct |

#### Hooks (`application/hooks/`)

| File | Hooks | Purpose |
|------|-------|---------|
| `useProducts.ts` | `useProducts`, `useProduct`, `useProductsByCategory`, `useCategories` | Product data fetching |

---

### Shared Layer (`frontend/lib/shared/`)

#### Types (`shared/types/`)

| File | Purpose |
|------|---------|
| `database.types.ts` | TypeScript database type definitions |

#### Utilities (`shared/utils/`)

| File | Functions | Purpose |
|------|-----------|---------|
| `cn.ts` | `cn()` | Tailwind class merging |
| `currency.ts` | `formatCents()`, `formatDollars()`, etc. | Currency formatting |

---

## 🎨 UI Components

### Base Components (`frontend/components/ui/`)

| File | Component | Variants |
|------|-----------|----------|
| `button.tsx` | `Button` | default, destructive, outline, secondary, ghost, link |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | - |

### Catalog Components (`frontend/components/catalog/`)

| File | Component | Purpose |
|------|-----------|---------|
| `product-card.tsx` | `ProductCard` | Display single product with image, price |
| `product-grid.tsx` | `ProductGrid` | Responsive grid of products |

### POS Components (`frontend/components/pos/`)

| File | Component | Purpose |
|------|-----------|---------|
| `cart-item.tsx` | `CartItem` | Display cart item with quantity controls |
| `cart-summary.tsx` | `CartSummary` | Show totals and checkout button |

---

## 📊 File Statistics

### Total Files Created: **50+**

#### By Category:
- **Documentation**: 8 files
- **Database Migrations**: 6 files
- **Configuration**: 7 files
- **Domain Layer**: 10 files
- **Infrastructure Layer**: 7 files
- **Application Layer**: 2 files
- **UI Components**: 7 files
- **Pages**: 3 files

#### By Type:
- **TypeScript/TSX**: 29 files
- **SQL**: 6 files
- **Markdown**: 8 files
- **Config/JSON**: 7 files

---

## 🎯 Key Implementation Highlights

### ✅ Complete Implementations

1. **Database Schema** - All tables with RLS
2. **Domain Entities** - 7 business entities
3. **Repository Pattern** - 3 repository interfaces
4. **Use Cases** - 2 business use cases
5. **Supabase Integration** - Client, repository, mappers
6. **State Management** - 2 Zustand stores
7. **Product Service** - Full service layer
8. **Product Hooks** - 4 custom hooks
9. **POS Interface** - Complete working POS
10. **UI Components** - 9 reusable components

### 🚧 Placeholder Folders (Ready for Implementation)

- `frontend/components/layout/`
- `frontend/components/inventory/`
- `frontend/components/suppliers/`
- `frontend/components/orders/`
- `frontend/components/marketplace/`
- `frontend/components/production/`

---

## 🔍 How to Navigate

### Starting with Business Logic?
→ Start at `frontend/lib/domain/entities/`

### Need to Understand Data Access?
→ Check `frontend/lib/infrastructure/supabase/`

### Looking for UI Components?
→ Browse `frontend/components/`

### Want to See a Working Feature?
→ Open `frontend/app/pos/page.tsx`

### Need Database Schema?
→ Review `supabase/migrations/`

### Want Architecture Overview?
→ Read `docs/ARCHITECTURE.md`

---

## 📖 Reading Order for New Developers

1. **Start**: `README.md` - Project overview
2. **Quick Setup**: `QUICK_START.md` - Get running
3. **Architecture**: `docs/ARCHITECTURE.md` - Understand structure
4. **Domain**: `frontend/lib/domain/entities/Product.ts` - See business logic
5. **Infrastructure**: `frontend/lib/infrastructure/supabase/repositories/ProductRepository.ts` - Data access
6. **Application**: `frontend/lib/application/hooks/useProducts.ts` - Service layer
7. **UI**: `frontend/app/pos/page.tsx` - See it in action

---

## 🔧 Common File Patterns

### Creating a New Entity
1. Create entity in `lib/domain/entities/`
2. Create repository interface in `lib/domain/repositories/`
3. Create mapper in `lib/infrastructure/supabase/mappers/`
4. Implement repository in `lib/infrastructure/supabase/repositories/`
5. Create service in `lib/application/services/`
6. Create hooks in `lib/application/hooks/`

### Adding a New Feature
1. Design database schema (migration)
2. Create domain entities
3. Implement repositories
4. Create use cases
5. Build UI components
6. Create pages

---

## 📞 Need Help?

- **Architecture Questions**: Check `docs/ARCHITECTURE.md`
- **Setup Issues**: See `docs/SETUP_GUIDE.md`
- **API Usage**: Review `docs/API_REFERENCE.md`
- **Quick Reference**: This file!

---

**Last Updated**: 2025-01-09
**Version**: 0.1.0
**Status**: Core infrastructure complete, ready for feature development

