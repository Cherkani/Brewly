# Brewly - API Reference

## Domain Entities

### Product

Represents a product in the catalog (coffee, food items, etc.)

#### Properties

```typescript
class Product {
  id: string
  orgId: string
  locationId: string
  name: string
  category: string
  image: string | null
  isActive: boolean
  prices: ProductPrice[]
  modifierGroups: ModifierGroup[]
  createdAt: Date
}
```

#### Methods

- `canBeOrdered(): boolean` - Check if product can be ordered
- `getPriceForSize(sizeId: string): number | null` - Get price for a specific size
- `getAvailableSizes()` - Get all available sizes
- `hasModifiers(): boolean` - Check if product has modifiers
- `calculateTotalPrice(sizeId, modifierIds)` - Calculate total price with modifiers
- `validateModifierSelection(modifierIds)` - Validate modifier selection

### Order

Represents a customer order

#### Properties

```typescript
class Order {
  id: string
  orgId: string
  locationId: string
  number: number
  status: OrderStatus
  cashierId: string | null
  items: OrderItem[]
  discountInCents: number
  notes: string | null
  createdAt: Date
}
```

#### Methods

- `calculateSubtotal(): number` - Calculate subtotal before discount
- `calculateTotal(): number` - Calculate total after discount
- `canBeEdited(): boolean` - Check if order can be edited
- `canBeCancelled(): boolean` - Check if order can be cancelled
- `getNextPossibleStatuses(): OrderStatus[]` - Get valid next statuses

### Ingredient

Represents an inventory item

#### Properties

```typescript
class Ingredient {
  id: string
  orgId: string
  locationId: string
  name: string
  unit: string
  onHand: number
  lowStockThreshold: number
  unitCostInCents: number
  createdAt: Date
}
```

#### Methods

- `isOutOfStock(): boolean` - Check if out of stock
- `isLowStock(): boolean` - Check if low on stock
- `getStockStatus()` - Get current stock status
- `calculateStockValue(): number` - Calculate total value of on-hand stock

## Repository Interfaces

### IProductRepository

#### Methods

```typescript
interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findByLocation(locationId: string, activeOnly?: boolean): Promise<Product[]>
  findByCategory(locationId: string, category: string): Promise<Product[]>
  getCategories(locationId: string): Promise<string[]>
  create(data: CreateProductDTO): Promise<Product>
  update(id: string, data: UpdateProductDTO): Promise<Product>
  delete(id: string): Promise<void>
  search(locationId: string, query: string): Promise<Product[]>
}
```

#### DTOs

**CreateProductDTO**:
```typescript
{
  orgId: string
  locationId: string
  name: string
  category: string
  image?: string | null
  isActive?: boolean
  prices?: Array<{
    sizeId: string
    priceInCents: number
  }>
  modifierGroupIds?: string[]
}
```

**UpdateProductDTO**:
```typescript
{
  name?: string
  category?: string
  image?: string | null
  isActive?: boolean
}
```

### IOrderRepository

#### Methods

```typescript
interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  findByLocation(locationId: string, filters?: OrderFilters): Promise<Order[]>
  findByStatus(locationId: string, status: OrderStatus): Promise<Order[]>
  getRecent(locationId: string, limit?: number): Promise<Order[]>
  create(data: CreateOrderDTO): Promise<Order>
  update(id: string, data: UpdateOrderDTO): Promise<Order>
  updateStatus(id: string, status: OrderStatus): Promise<Order>
  delete(id: string): Promise<void>
  addPayment(data: AddPaymentDTO): Promise<void>
  getCountByStatus(locationId: string): Promise<Record<OrderStatus, number>>
  subscribeToOrders(locationId: string, callback: (order: Order) => void): () => void
}
```

#### DTOs

**CreateOrderDTO**:
```typescript
{
  orgId: string
  locationId: string
  cashierId: string
  items: Array<{
    productId: string
    sizeId: string
    quantity: number
    basePriceInCents: number
    modifierIds: string[]
  }>
  discountInCents?: number
  notes?: string | null
}
```

**AddPaymentDTO**:
```typescript
{
  orderId: string
  method: 'cash' | 'credit_card' | 'debit_card' | 'mobile_payment'
  amountInCents: number
}
```

### IIngredientRepository

#### Methods

```typescript
interface IIngredientRepository {
  findById(id: string): Promise<Ingredient | null>
  findByLocation(locationId: string): Promise<Ingredient[]>
  findLowStock(locationId: string): Promise<Ingredient[]>
  findOutOfStock(locationId: string): Promise<Ingredient[]>
  create(data: CreateIngredientDTO): Promise<Ingredient>
  update(id: string, data: UpdateIngredientDTO): Promise<Ingredient>
  delete(id: string): Promise<void>
  adjustInventory(data: AdjustInventoryDTO): Promise<Ingredient>
  search(locationId: string, query: string): Promise<Ingredient[]>
  getTotalValue(locationId: string): Promise<number>
}
```

## Use Cases

### CreateOrderUseCase

Creates a new order with validation and price calculation.

#### Input

```typescript
interface CreateOrderInput {
  orgId: string
  locationId: string
  cashierId: string
  items: Array<{
    productId: string
    sizeId: string
    quantity: number
    modifierIds: string[]
  }>
  discountInCents?: number
  notes?: string | null
}
```

#### Usage

```typescript
const useCase = new CreateOrderUseCase(orderRepo, productRepo)
const order = await useCase.execute(input)
```

#### Validation

- Validates all required fields
- Checks product availability
- Validates modifier selections
- Calculates prices accurately

### UpdateOrderStatusUseCase

Updates order status with business rule validation.

#### Input

```typescript
interface UpdateOrderStatusInput {
  orderId: string
  newStatus: OrderStatus
}
```

#### Usage

```typescript
const useCase = new UpdateOrderStatusUseCase(orderRepo)
const order = await useCase.execute(input)
```

#### Validation

- Validates status transitions
- Only allows valid next statuses
- Prevents invalid state changes

## State Management

### App Store

Global application state.

```typescript
interface AppState {
  user: User | null
  organizations: Organization[]
  currentOrganization: Organization | null
  locations: Location[]
  currentLocation: Location | null
  sidebarOpen: boolean
  isLoading: boolean
}
```

#### Methods

- `setUser(user)` - Set current user
- `setCurrentOrganization(org)` - Set active organization
- `setCurrentLocation(location)` - Set active location
- `toggleSidebar()` - Toggle sidebar visibility
- `reset()` - Reset to initial state

#### Usage

```typescript
import { useAppStore } from '@/lib/infrastructure/state/stores/appStore'

function MyComponent() {
  const { currentLocation, setCurrentLocation } = useAppStore()
  
  // Use state and actions
}
```

### POS Store

Point of Sale cart state.

```typescript
interface POSState {
  cart: CartItem[]
  discountInCents: number
  notes: string
  isProcessingOrder: boolean
}
```

#### Methods

- `addToCart(item)` - Add item to cart
- `updateCartItem(index, updates)` - Update cart item
- `removeFromCart(index)` - Remove from cart
- `clearCart()` - Clear entire cart
- `setDiscount(amount)` - Set discount amount
- `getSubtotal()` - Calculate subtotal
- `getTotal()` - Calculate total with discount

#### Usage

```typescript
import { usePOSStore } from '@/lib/infrastructure/state/stores/posStore'

function POSComponent() {
  const { cart, addToCart, getTotal } = usePOSStore()
  
  const handleAddProduct = (product) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      // ... other fields
    })
  }
}
```

## Utility Functions

### Currency Utilities

```typescript
// Format cents as currency
formatCents(cents: number, locale?: string, currency?: string): string

// Format dollars as currency
formatDollars(dollars: number, locale?: string, currency?: string): string

// Convert cents to dollars
centsToDollars(cents: number): number

// Convert dollars to cents
dollarsToCents(dollars: number): number
```

#### Usage

```typescript
import { formatCents } from '@/lib/shared/utils/currency'

const price = formatCents(399) // "$3.99"
```

### Class Name Utility

```typescript
// Merge Tailwind classes
cn(...inputs: ClassValue[]): string
```

#### Usage

```typescript
import { cn } from '@/lib/shared/utils/cn'

const className = cn(
  'base-class',
  isActive && 'active-class',
  'override-class'
)
```

## Supabase Client Utilities

### getCurrentUserContext()

Get current user with organizations and locations.

```typescript
const context = await getCurrentUserContext()
// Returns:
{
  user: User,
  organizations: Array<{ org_id, role }>,
  locations: Array<{ location_id, role, locations: {...} }>
}
```

### isUserSuperuser(userId)

Check if user is a platform superuser.

```typescript
const isSuperuser = await isUserSuperuser(userId)
```

### getCurrentOrg() / setCurrentOrg(orgId)

Get/set current organization from localStorage.

```typescript
const orgId = getCurrentOrg()
setCurrentOrg('new-org-id')
```

### getCurrentLocation() / setCurrentLocation(locationId)

Get/set current location from localStorage.

```typescript
const locationId = getCurrentLocation()
setCurrentLocation('new-location-id')
```

## Error Handling

### Common Error Types

```typescript
// Validation Error
throw new Error('Invalid input: ...')

// Not Found Error
throw new Error('Resource not found: ...')

// Permission Error
throw new Error('Unauthorized: ...')

// Business Rule Violation
throw new Error('Cannot transition from X to Y')
```

### Best Practices

```typescript
try {
  const result = await repository.findById(id)
  if (!result) {
    throw new Error(`Product not found: ${id}`)
  }
  return result
} catch (error) {
  console.error('Error fetching product:', error)
  throw error
}
```

## Type Definitions

### OrderStatus

```typescript
type OrderStatus = 
  | 'queued' 
  | 'in_progress' 
  | 'ready' 
  | 'paid' 
  | 'completed' 
  | 'cancelled'
```

### UserRole

```typescript
type UserRole = 'owner' | 'admin' | 'cashier' | 'superuser'
```

### PaymentMethod

```typescript
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'mobile_payment'
```

## Best Practices

### 1. Always Use Repository Interfaces

```typescript
// Good: Depend on interface
constructor(private productRepo: IProductRepository) {}

// Bad: Depend on concrete implementation
constructor(private productRepo: ProductRepository) {}
```

### 2. Validate in Use Cases

```typescript
// Good: Validation in use case
class CreateProductUseCase {
  execute(input) {
    this.validateInput(input)
    // ... business logic
  }
}

// Bad: Validation in repository
// Repositories should focus on data access only
```

### 3. Use Mappers for Data Transformation

```typescript
// Good: Use mapper
const product = productMapper.toDomain(dbProduct)

// Bad: Manual transformation in multiple places
const product = new Product(
  dbProduct.id,
  dbProduct.org_id,
  // ...
)
```

### 4. Handle Errors Appropriately

```typescript
// Good: Specific error messages
throw new Error(`Product ${productId} not found`)

// Bad: Generic errors
throw new Error('Error')
```

