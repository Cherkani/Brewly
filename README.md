# Brewly - Coffee Shop SaaS Platform

A comprehensive multi-tenant coffee shop management system built with clean architecture principles.

## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles with clear separation of concerns:

- **Domain Layer**: Pure business logic and entities (no dependencies)
- **Infrastructure Layer**: External services (Supabase, state management)
- **Application Layer**: Use cases and application services
- **Presentation Layer**: React components and Next.js pages

## 🗂️ Project Structure

```
Brewly/
├── frontend/                      # React/Next.js frontend
│   ├── app/                       # Next.js App Router pages
│   ├── components/                # UI components
│   │   ├── ui/                    # Base UI components
│   │   ├── layout/                # Layout components
│   │   ├── pos/                   # Point of Sale components
│   │   ├── inventory/             # Inventory management
│   │   ├── catalog/               # Product catalog
│   │   ├── suppliers/             # Supplier management
│   │   ├── orders/                # Order management
│   │   ├── marketplace/           # Marketplace features
│   │   └── production/            # Production tracking
│   └── lib/
│       ├── domain/                # Domain layer (pure business logic)
│       │   ├── entities/          # Business entities
│       │   ├── repositories/      # Repository interfaces
│       │   └── use-cases/         # Business use cases
│       ├── infrastructure/        # Infrastructure layer
│       │   ├── supabase/          # Supabase implementation
│       │   │   ├── repositories/  # Concrete repositories
│       │   │   └── mappers/       # Data mappers
│       │   └── state/             # State management
│       ├── application/           # Application layer
│       │   ├── services/          # Application services
│       │   └── hooks/             # React hooks
│       └── shared/                # Shared utilities
│           ├── types/             # TypeScript types
│           ├── utils/             # Utility functions
│           ├── constants/         # Constants
│           └── validators/        # Zod schemas
│
├── supabase/                      # Supabase backend
│   ├── migrations/                # Database migrations
│   └── functions/                 # Edge functions
│
└── docs/                          # Documentation
```

## 🔐 Multi-Tenant Architecture

### Tenancy Levels
1. **Platform**: Superusers can manage all organizations
2. **Organization (Tenant)**: Each coffee shop chain is an organization
3. **Location**: Each physical store within an organization
4. **Users**: Roles include Owner, Admin, and Cashier

### Row-Level Security (RLS)
Every table includes:
- `org_id`: Organization-level isolation
- `location_id`: Location-level isolation (where applicable)

RLS policies ensure users can only access data they're authorized to see.

## 📊 Feature Modules

### 1. **Catalog Management**
- Products with multiple sizes
- Modifier groups (toppings, milk types, etc.)
- Dynamic pricing per size
- Product images and categories

### 2. **Point of Sale (POS)**
- Real-time order creation
- Modifier selection
- Multiple payment methods
- Order status tracking

### 3. **Kitchen Display System (KDS)**
- Token-based authentication
- Real-time order updates
- Status workflow (queued → in-progress → ready)

### 4. **Inventory Management**
- Ingredient tracking
- Low stock alerts
- Recipe management
- Automatic deduction on orders

### 5. **Supplier Management**
- Supplier directory
- Rating system
- Product catalog per supplier
- Multi-category support

### 6. **Purchase Orders**
- Create and manage POs
- Track order status
- Expected delivery dates
- Supplier integration

### 7. **Marketplace**
- List surplus inventory
- Discover products from other locations
- Quality certifications
- Expiry tracking

### 8. **Production Tracking**
- Record production batches
- Cost calculation
- Status management
- Expiry dates

### 9. **Analytics & Reports**
- Sales reports
- Inventory analytics
- Product performance
- Cost analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Brewly
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run migrations**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

5. **Start development server**
```bash
cd frontend
npm run dev
```

## 🗃️ Database Schema

### Core Tables

#### Platform & Tenancy
- `platform_superusers`: Platform administrators
- `orgs`: Organizations (tenants)
- `subscriptions`: Subscription plans and billing
- `locations`: Physical store locations
- `org_members`: Organization owners
- `location_members`: Location admins and cashiers

#### Catalog
- `products`: Product definitions
- `sizes`: Size options
- `product_prices`: Pricing per product-size combination
- `modifier_groups`: Modifier categories
- `modifiers`: Individual modifiers
- `product_modifier_groups`: Product-modifier associations

#### Orders
- `orders`: Order headers
- `order_items`: Line items
- `order_item_modifiers`: Selected modifiers
- `payments`: Payment records
- `order_status_history`: Status change tracking

#### Inventory
- `ingredients`: Ingredient master data
- `recipes`: Product recipes
- `recipe_items`: Recipe ingredients and quantities
- `inventory_tx`: Inventory transactions
- `alerts`: Low stock alerts

#### Suppliers
- `suppliers`: Supplier directory
- `supplier_categories`: Supplier category associations
- `supplier_products`: Supplier product catalog

#### Purchase Orders
- `purchase_orders`: PO headers
- `purchase_order_items`: PO line items

#### Marketplace
- `marketplace_listings`: Surplus inventory listings

#### Production
- `production`: Production batch records

#### Settings
- `navigation_settings`: Navigation configuration
- `navigation_permissions`: Role-based navigation
- `billing`: Billing records
- `kds_tokens`: Kitchen Display System tokens

## 🔑 Authentication & Authorization

### Roles
- **Platform Superuser**: Full system access
- **Owner**: Organization-level management
- **Admin**: Location-level management
- **Cashier**: POS and order operations

### Permission Checks
```typescript
// Example: Check if user can manage products
await permissionService.canManageProducts(userId, locationId)
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Supabase)
- Migrations are automatically applied
- Configure production environment variables
- Set up edge functions if needed

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI component library
- **Zustand**: State management
- **Zod**: Schema validation
- **React Query**: Data fetching and caching

### Backend
- **Supabase**: Backend as a Service
  - PostgreSQL database
  - Row-Level Security
  - Real-time subscriptions
  - Authentication
  - Edge functions

## 📖 Development Guidelines

### Clean Architecture Principles

1. **Dependency Rule**: Dependencies point inward
   - Domain has NO external dependencies
   - Infrastructure depends on Domain
   - Application depends on Domain & Infrastructure
   - Presentation depends on Application

2. **Entity Design**: Pure business objects
```typescript
// Good: Pure entity with business logic
class Product {
  canBeOrdered(): boolean {
    return this.isActive && this.prices.length > 0
  }
}

// Bad: Entity with database dependencies
class Product {
  async save() { /* database call */ }
}
```

3. **Repository Pattern**: Abstract data access
```typescript
// Interface in domain layer
interface IProductRepository {
  findById(id: string): Promise<Product | null>
}

// Implementation in infrastructure layer
class SupabaseProductRepository implements IProductRepository {
  // Supabase-specific implementation
}
```

4. **Use Cases**: Orchestrate business logic
```typescript
class CreateProductUseCase {
  execute(data: CreateProductDTO): Promise<Product> {
    // 1. Validate permissions
    // 2. Apply business rules
    // 3. Create entity
    // 4. Persist via repository
  }
}
```

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans
- Supabase team for the excellent BaaS platform

## 📞 Support

For support, email support@brewly.com or open an issue in the repository.

