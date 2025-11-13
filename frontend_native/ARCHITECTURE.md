# Brewly Mobile - Architecture Documentation

## Overview

This document provides an in-depth explanation of the architectural decisions, patterns, and principles used in Brewly Mobile.

## Clean Architecture Principles

### Why Clean Architecture?

1. **Independence**: Business logic doesn't depend on frameworks
2. **Testability**: Business rules can be tested without UI, database, or external services
3. **Maintainability**: Clear separation makes code easier to understand and modify
4. **Flexibility**: Easy to swap implementations (e.g., switch from Supabase to Firebase)

### The Dependency Rule

**Dependencies point inward**:
```
Presentation → Application → Domain ← Infrastructure
```

- **Domain** has no dependencies on other layers
- **Application** depends only on Domain
- **Infrastructure** depends only on Domain (implements interfaces)
- **Presentation** depends on Application and Infrastructure

## Layer Details

### 1. Domain Layer

**Purpose**: Contains enterprise business logic

**Components**:
- **Entities**: Core business objects with behavior
- **Repository Interfaces**: Contracts for data access
- **Use Cases**: Application-specific business rules

**Rules**:
- No framework dependencies
- No external library dependencies (except TypeScript)
- Pure business logic only
- All public methods should be well-documented

**Example Entity**:
```typescript
export class Order {
  constructor(
    public readonly id: string,
    public readonly status: OrderStatus,
    public readonly items: OrderItem[],
    // ...
  ) {}

  // Business rules
  calculateTotal(): number { ... }
  canBeEdited(): boolean { ... }
  getNextPossibleStatuses(): OrderStatus[] { ... }
}
```

### 2. Application Layer

**Purpose**: Orchestrates business logic for the application

**Components**:
- **Hooks**: React hooks that connect UI to business logic
- **Services**: Optional application services

**Rules**:
- Can use React and React Query
- Depends only on Domain layer
- No direct database access
- No UI rendering logic

**Example Hook**:
```typescript
export function useOrders(status?: OrderStatus) {
  const { currentLocation } = useAppStore();
  
  return useQuery({
    queryKey: ['orders', currentLocation?.id, status],
    queryFn: () => orderRepository.findByLocation(
      currentLocation!.id,
      status
    ),
    enabled: !!currentLocation,
  });
}
```

### 3. Infrastructure Layer

**Purpose**: Implements technical details

**Components**:
- **Supabase Client**: Database connection
- **Repositories**: Implement domain repository interfaces
- **Mappers**: Convert between database and domain models
- **State Stores**: Zustand stores for global state

**Rules**:
- Implements domain interfaces
- Contains all framework-specific code
- Handles data persistence
- No business logic

**Example Repository**:
```typescript
export class ProductRepository implements IProductRepository {
  async findByLocation(
    locationId: string,
    activeOnly: boolean
  ): Promise<Product[]> {
    const { data } = await supabase
      .from('products')
      .select(this.PRODUCT_SELECT)
      .eq('location_id', locationId);
    
    return data.map(productMapper.toDomain);
  }
}
```

**Example Mapper**:
```typescript
export function toDomain(data: any): Product {
  return new Product(
    data.id,
    data.org_id,
    data.location_id,
    data.name,
    data.category,
    // Map nested relations
    mapPrices(data.product_prices),
    mapModifierGroups(data.product_modifier_groups),
    new Date(data.created_at)
  );
}
```

### 4. Presentation Layer

**Purpose**: UI and user interaction

**Components**:
- **Navigation**: React Navigation configuration
- **Screens**: Full-screen components
- **Components**: Reusable UI components
- **Theme**: Styling system

**Rules**:
- Uses Application hooks for data
- No direct repository access
- Handles user input
- Renders UI

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access

**Benefits**:
- Decouples business logic from data source
- Easy to test with mock repositories
- Can switch data sources without changing business logic

**Implementation**:
```typescript
// Domain: Define interface
interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  create(data: CreateOrderDTO): Promise<Order>
}

// Infrastructure: Implement interface
class OrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    // Supabase implementation
  }
}
```

### 2. Use Case Pattern

**Purpose**: Encapsulate business operations

**Benefits**:
- Single Responsibility Principle
- Reusable business logic
- Easy to test

**Implementation**:
```typescript
export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(data: CreateOrderDTO): Promise<Order> {
    // Validate
    if (data.items.length === 0) {
      throw new Error('Order must have items');
    }
    
    // Business rules
    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new Error('Invalid quantity');
      }
    }
    
    // Execute
    return await this.orderRepository.create(data);
  }
}
```

### 3. Mapper Pattern

**Purpose**: Convert between data representations

**Benefits**:
- Keeps domain pure
- Handles data transformation in one place
- Easy to maintain

**Implementation**:
```typescript
// Database → Domain
export function toDomain(dbData: any): Product {
  return new Product(/* ... */);
}

// Domain → Database
export function toPersistence(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    // ...
  };
}
```

### 4. Observer Pattern (React Query + Supabase)

**Purpose**: Real-time updates

**Implementation**:
```typescript
useEffect(() => {
  const unsubscribe = orderRepository.subscribeToOrders(
    locationId,
    (order) => {
      // Invalidate cache to trigger refetch
      queryClient.invalidateQueries(['orders']);
    }
  );
  
  return unsubscribe;
}, [locationId]);
```

## State Management

### Two Types of State

1. **Server State** (React Query)
   - Data from backend
   - Cached and synchronized
   - Automatic refetching

2. **Client State** (Zustand)
   - UI state
   - Authentication state
   - Current location selection

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,      // Data fresh for 1 minute
      gcTime: 5 * 60 * 1000,     // Cache for 5 minutes
    },
  },
});
```

### Zustand Store Example

```typescript
interface AppState {
  user: User | null;
  currentLocation: Location | null;
  setUser: (user: User | null) => void;
  setCurrentLocation: (location: Location | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentLocation: null,
  setUser: (user) => set({ user }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
}));
```

## Navigation Architecture

### Structure

```
Root Navigator
├── Auth Stack (not authenticated)
│   ├── Login
│   ├── Sign Up
│   └── Forgot Password
└── Main Tabs (authenticated)
    ├── Home Stack
    │   ├── Dashboard
    │   └── Profile
    ├── POS Stack
    │   ├── POS Main
    │   ├── Product Detail
    │   └── Checkout
    ├── Orders Stack
    │   ├── Orders List
    │   └── Order Detail
    └── Menu Stack
        ├── Menu List
        └── Settings
```

### Type-Safe Navigation

```typescript
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type POSStackParamList = {
  POSMain: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
};

// Type-safe screen props
type POSStackScreenProps<T extends keyof POSStackParamList> =
  NativeStackScreenProps<POSStackParamList, T>;
```

## Data Flow

### Query Flow (Read)

```
1. Screen Component
   ↓
2. Custom Hook (useOrders)
   ↓
3. React Query (cache check)
   ↓
4. Repository (if cache miss)
   ↓
5. Supabase Client
   ↓
6. Mapper (toDomain)
   ↓
7. Domain Entity
   ↓
8. Component Re-renders
```

### Mutation Flow (Write)

```
1. User Action (button press)
   ↓
2. Mutation Hook (useCreateOrder)
   ↓
3. Use Case (CreateOrderUseCase)
   ↓
4. Repository (OrderRepository)
   ↓
5. Supabase Client (INSERT)
   ↓
6. React Query (invalidate cache)
   ↓
7. Automatic Refetch
   ↓
8. UI Update
```

## Error Handling

### Layers

1. **Domain Layer**: Throws business rule violations
2. **Infrastructure Layer**: Catches and transforms database errors
3. **Application Layer**: Exposes errors via React Query
4. **Presentation Layer**: Displays user-friendly messages

### Example

```typescript
// Domain
if (quantity <= 0) {
  throw new Error('Quantity must be positive');
}

// Infrastructure
try {
  await supabase.from('orders').insert(data);
} catch (error) {
  throw new Error(`Failed to create order: ${error.message}`);
}

// Presentation
const { error } = useCreateOrder();

if (error) {
  Alert.alert('Error', error.message);
}
```

## Security

### Authentication

1. Supabase Auth for user management
2. Tokens stored in `Expo SecureStore`
3. Auto-refresh handled by Supabase client

### Authorization

1. Row Level Security (RLS) in Supabase
2. Location-based access control
3. Role-based permissions

### Data Validation

1. Domain entities validate on construction
2. Use cases validate business rules
3. Zod schemas for input validation

## Performance Optimization

### Strategies

1. **React Query Caching**: Reduce unnecessary API calls
2. **Optimistic Updates**: Immediate UI feedback
3. **List Virtualization**: For long lists (use FlatList)
4. **Image Optimization**: Use `expo-image` with caching
5. **Code Splitting**: Lazy load screens
6. **Memoization**: `React.memo` for expensive components

### Example: Optimistic Update

```typescript
const { mutate } = useMutation({
  mutationFn: updateOrderStatus,
  onMutate: async (newStatus) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries(['orders', orderId]);
    
    // Snapshot current value
    const previous = queryClient.getQueryData(['orders', orderId]);
    
    // Optimistically update
    queryClient.setQueryData(['orders', orderId], (old) => ({
      ...old,
      status: newStatus,
    }));
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['orders', orderId],
      context.previous
    );
  },
});
```

## Testing Strategy

### Unit Tests
- Domain entities
- Use cases
- Utility functions

### Integration Tests
- Repositories with mock Supabase
- Hooks with React Query Test Utils

### E2E Tests
- Critical user flows
- Use Detox or Maestro

## Future Enhancements

1. **Offline Support**: Persist data locally, sync when online
2. **Push Notifications**: Order updates
3. **Analytics**: Track user behavior
4. **Feature Flags**: Gradual rollout of features
5. **Internationalization**: Multi-language support

## Resources

- [Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [React Navigation](https://reactnavigation.org/)

---

Last Updated: 2025

