# Brewly - Architecture Documentation

## Overview

Brewly follows **Clean Architecture** principles with clear separation between domain logic, infrastructure, and presentation layers.

## Architecture Layers

### 1. Domain Layer (`lib/domain/`)

**Purpose**: Contains pure business logic with NO external dependencies.

**Components**:
- **Entities**: Business objects with methods (e.g., `Product`, `Order`, `Ingredient`)
- **Repository Interfaces**: Contracts for data access (e.g., `IProductRepository`)
- **Use Cases**: Business logic orchestration (e.g., `CreateOrderUseCase`)

**Rules**:
- No imports from infrastructure or presentation layers
- No framework dependencies
- Pure TypeScript/JavaScript
- All business rules live here

**Example**:
```typescript
// Product entity with business logic
export class Product {
  canBeOrdered(): boolean {
    return this.isActive && this.prices.length > 0
  }
  
  validateModifierSelection(modifiers: string[]): ValidationResult {
    // Business validation logic
  }
}
```

### 2. Infrastructure Layer (`lib/infrastructure/`)

**Purpose**: Implements external services and data access.

**Components**:
- **Supabase Client**: Database connection
- **Repositories**: Concrete implementations of repository interfaces
- **Mappers**: Convert between database models and domain entities
- **State Management**: Zustand stores for global state

**Rules**:
- Implements domain interfaces
- Handles external service communication
- Maps data between formats
- No direct business logic

**Example**:
```typescript
// Repository implementation
export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    return productMapper.toDomain(data)
  }
}
```

### 3. Application Layer (`lib/application/`)

**Purpose**: Coordinates use cases and provides application services.

**Components**:
- **Services**: Application-level orchestration
- **Hooks**: React hooks that use services and repositories

**Rules**:
- Coordinates between domain and infrastructure
- Handles application-specific concerns
- Provides API for presentation layer

**Example**:
```typescript
// Application service
export class ProductService {
  async getProducts(locationId: string) {
    return await this.productRepo.findByLocation(locationId)
  }
}
```

### 4. Presentation Layer (`app/`, `components/`)

**Purpose**: UI components and pages.

**Components**:
- **Pages**: Next.js app router pages
- **Components**: React components (UI, layout, domain-specific)

**Rules**:
- Only depends on application layer
- Handles user interaction
- Displays data
- No direct database access

## Data Flow

```
User Action
    ↓
Component (Presentation)
    ↓
Hook (Application)
    ↓
Service (Application)
    ↓
Use Case (Domain)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Infrastructure)
    ↓
Database (Supabase)
```

## Multi-Tenancy Architecture

### Tenancy Levels

1. **Platform**: Superusers with full access
2. **Organization**: Coffee shop chains (tenants)
3. **Location**: Individual stores
4. **Users**: Owners, Admins, Cashiers

### Row-Level Security (RLS)

Every table has `org_id` and/or `location_id` for data isolation:

```sql
-- Example RLS Policy
CREATE POLICY products_select ON products
  FOR SELECT USING (
    is_superuser() OR 
    user_is_org_owner(org_id) OR 
    user_in_location(location_id)
  );
```

### Helper Functions

- `is_superuser()`: Check if user is platform admin
- `user_is_org_owner(org_id)`: Check if user owns organization
- `user_in_location(location_id)`: Check if user has location access
- `can_manage_products(location_id)`: Permission check

## State Management

### Zustand Stores

**App Store** (`appStore.ts`):
- User authentication state
- Current organization/location
- UI state (sidebar, etc.)

**POS Store** (`posStore.ts`):
- Shopping cart
- Order in progress
- Discount and notes

### Why Zustand?

- Simple API
- No boilerplate
- TypeScript support
- DevTools integration
- Persistent state support

## Key Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access behind interfaces.

**Benefits**:
- Testable (mock repositories)
- Swappable implementations
- Centralized data access logic

### 2. Mapper Pattern

**Purpose**: Convert between data formats.

**Benefits**:
- Decouples domain from database schema
- Single source of mapping logic
- Type-safe transformations

### 3. Use Case Pattern

**Purpose**: Encapsulate business operations.

**Benefits**:
- Clear business intent
- Reusable logic
- Easy to test

### 4. Dependency Injection

**Purpose**: Provide dependencies to classes.

**Benefits**:
- Loose coupling
- Testability
- Flexibility

## Database Schema

### Core Tables

#### Tenancy
- `platform_superusers`
- `orgs` (organizations)
- `subscriptions`
- `locations`
- `org_members`
- `location_members`

#### Catalog
- `products`
- `sizes`
- `product_prices`
- `modifier_groups`
- `modifiers`
- `product_modifier_groups`

#### Orders
- `orders`
- `order_items`
- `order_item_modifiers`
- `payments`
- `order_status_history`

#### Inventory
- `ingredients`
- `recipes`
- `recipe_items`
- `inventory_tx`
- `alerts`

#### Suppliers
- `suppliers`
- `supplier_categories`
- `supplier_products`
- `purchase_orders`
- `purchase_order_items`

#### Marketplace
- `marketplace_listings`

#### Production
- `production`

#### Settings
- `navigation_settings`
- `navigation_permissions`
- `billing`
- `kds_tokens`

## API Conventions

### Naming

- **Entities**: PascalCase (e.g., `Product`, `Order`)
- **Interfaces**: Start with `I` (e.g., `IProductRepository`)
- **DTOs**: End with `DTO` (e.g., `CreateProductDTO`)
- **Use Cases**: End with `UseCase` (e.g., `CreateOrderUseCase`)

### Error Handling

```typescript
try {
  const result = await useCase.execute(input)
  return result
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof NotFoundError) {
    // Handle not found
  } else {
    // Handle unexpected errors
  }
}
```

## Testing Strategy

### Unit Tests
- Domain entities
- Use cases
- Utilities

### Integration Tests
- Repositories with test database
- API endpoints

### E2E Tests
- Critical user flows
- POS workflow
- Order management

## Performance Considerations

### Database
- Indexed on `org_id` and `location_id`
- Efficient RLS policies
- Query optimization

### Frontend
- React Server Components where possible
- Client-side caching (React Query)
- Optimistic updates

### Real-time
- Supabase Realtime for live updates
- Filtered subscriptions (RLS applied)

## Security

### Authentication
- Supabase Auth
- JWT tokens
- Secure session management

### Authorization
- Row-Level Security (RLS)
- Role-based permissions
- Helper functions for checks

### Data Protection
- HTTPS only
- Encrypted at rest (Supabase)
- Input validation (Zod schemas)

## Deployment

### Frontend (Vercel)
- Automatic deployments from main branch
- Preview deployments for PRs
- Environment variables configured

### Backend (Supabase)
- Migrations applied automatically
- RLS policies enforced
- Edge functions deployed

## Future Enhancements

1. **Analytics Dashboard**: Sales, inventory, performance metrics
2. **Mobile App**: React Native with shared domain logic
3. **Advanced Reporting**: Custom reports, exports
4. **Integration APIs**: Third-party integrations
5. **AI Features**: Demand forecasting, inventory optimization

