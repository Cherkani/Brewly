# Brewly Mobile - React Native Coffee Shop Management App

A comprehensive React Native mobile application for coffee shop management, built with **Clean Architecture** principles and modern best practices.

## 🎯 Project Overview

Brewly Mobile is the mobile counterpart to the Brewly web application, providing coffee shop owners and staff with on-the-go access to:

- **Point of Sale (POS)** - Process orders quickly from mobile devices
- **Order Management** - Track and update order status in real-time
- **Inventory Tracking** - Monitor stock levels on the go
- **Dashboard & Analytics** - View business metrics anywhere
- **Multi-location Support** - Manage multiple store locations

## 🏗️ Architecture

This project follows **Clean Architecture** principles with a clear separation of concerns:

```
src/
├── lib/
│   ├── domain/                  # Business Logic Layer
│   │   ├── entities/            # Domain models (Product, Order, User)
│   │   ├── repositories/        # Repository interfaces
│   │   └── use-cases/           # Business use cases
│   ├── application/             # Application Layer
│   │   └── hooks/               # React hooks for data fetching
│   ├── infrastructure/          # Infrastructure Layer
│   │   ├── supabase/            # Supabase client & repositories
│   │   │   ├── repositories/    # Repository implementations
│   │   │   └── mappers/         # Data mappers
│   │   └── state/               # State management (Zustand)
│   └── shared/                  # Shared utilities
│       ├── utils/               # Helper functions
│       └── constants/           # App constants
└── presentation/                # Presentation Layer
    ├── navigation/              # Navigation structure
    ├── screens/                 # Screen components
    ├── components/              # Reusable components
    └── theme/                   # Theme & styles
```

### Architecture Layers

#### 1. **Domain Layer** (`lib/domain/`)
- Contains core business logic and entities
- Pure TypeScript classes with no external dependencies
- Defines repository interfaces (contracts)
- Houses business use cases

**Example:**
```typescript
// Domain Entity
class Product {
  canBeOrdered(): boolean
  calculateTotalPrice(sizeId: string, modifiers: string[]): number
  validateModifierSelection(modifiers: string[]): ValidationResult
}
```

#### 2. **Application Layer** (`lib/application/`)
- Contains application-specific business rules
- React hooks for data fetching and state management
- Orchestrates between domain and infrastructure

**Example:**
```typescript
// Application Hook
export function useProducts(activeOnly: boolean) {
  const { currentLocation } = useAppStore();
  return useQuery({
    queryKey: ['products', currentLocation?.id],
    queryFn: () => productRepository.findByLocation(currentLocation.id, activeOnly)
  });
}
```

#### 3. **Infrastructure Layer** (`lib/infrastructure/`)
- Implements technical details
- Supabase integration for data persistence
- State management with Zustand
- Data mapping between database and domain entities

**Example:**
```typescript
// Repository Implementation
class ProductRepository implements IProductRepository {
  async findByLocation(locationId: string): Promise<Product[]> {
    const { data } = await supabase.from('products')...
    return data.map(productMapper.toDomain);
  }
}
```

#### 4. **Presentation Layer** (`presentation/`)
- React Native UI components
- Screen components
- Navigation configuration
- Theme and styling

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   cd frontend_native
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on your device:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📱 Features

### Authentication
- Email/password sign-in
- User registration
- Password reset
- Secure token storage with Expo SecureStore

### Dashboard
- Order statistics (queued, in progress, ready)
- Location selector
- Quick actions menu
- Real-time updates

### Point of Sale (POS)
- Product catalog browsing
- Product search and filtering
- Cart management
- Order creation
- Payment processing

### Orders Management
- Order listing with filters
- Real-time order status updates
- Order details view
- Status progression (queued → in_progress → ready → paid → completed)

### Multi-location Support
- Switch between locations
- Location-specific data
- Role-based access control

## 🛠️ Tech Stack

### Core
- **React Native** (0.73.2) - Mobile framework
- **Expo** (~50.0.0) - Development platform
- **TypeScript** (5.3.0) - Type safety

### Navigation
- **React Navigation** (6.x) - Navigation library
  - Native Stack Navigator
  - Bottom Tabs Navigator
  - Type-safe navigation

### State Management
- **Zustand** (4.5.0) - Lightweight state management
- **React Query** (5.17.9) - Server state & caching

### Backend & Data
- **Supabase** (2.39.0) - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)

### Utilities
- **date-fns** (3.2.0) - Date formatting
- **zod** (3.22.4) - Schema validation

## 📂 Project Structure Details

### Domain Entities

```typescript
// Core business entities
Product         // Product catalog items
ProductPrice    // Size-based pricing
Modifier        // Product modifiers (milk type, add-ons)
ModifierGroup   // Modifier collections
Order           // Customer orders
OrderItem       // Individual order items
Location        // Store locations
User            // User accounts
```

### Repository Pattern

All data access follows the repository pattern:

```typescript
interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findByLocation(locationId: string): Promise<Product[]>
  findByCategory(locationId: string, category: string): Promise<Product[]>
  getCategories(locationId: string): Promise<string[]>
}
```

### Use Cases

Business logic is encapsulated in use cases:

```typescript
CreateOrderUseCase       // Create new orders with validation
UpdateOrderStatusUseCase // Update order status with business rules
```

## 🎨 Theming

The app uses a centralized theme system:

```typescript
theme/
├── colors.ts      // Color palette
├── typography.ts  // Font styles
├── spacing.ts     // Spacing scale
└── index.ts       // Main theme export
```

**Usage:**
```typescript
import { theme } from '@theme/index';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.base,
  }
});
```

## 🔐 Authentication Flow

1. User enters credentials
2. `AuthService` validates and calls Supabase Auth
3. Tokens stored securely in `Expo SecureStore`
4. User object mapped to domain entity
5. Global state updated via Zustand
6. Navigation switches to authenticated stack

## 📡 Data Flow

```
User Action
    ↓
Screen Component
    ↓
Custom Hook (useProducts, useOrders)
    ↓
React Query
    ↓
Repository (ProductRepository)
    ↓
Supabase Client
    ↓
Domain Mapper (toDomain)
    ↓
Domain Entity (Product)
    ↓
Component renders
```

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## 📦 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

## 🤝 Development Best Practices

### 1. **Follow Clean Architecture**
- Keep domain layer pure (no external dependencies)
- Use dependency injection
- Implement repository interfaces

### 2. **Type Safety**
- Use TypeScript strictly
- Define proper types for navigation
- Avoid `any` types

### 3. **State Management**
- Use React Query for server state
- Use Zustand for local/global state
- Keep state minimal and normalized

### 4. **Component Structure**
- Keep components small and focused
- Extract reusable logic to hooks
- Use proper React Native styling patterns

### 5. **Error Handling**
- Handle errors gracefully
- Show user-friendly messages
- Log errors for debugging

### 6. **Performance**
- Use `React.memo` for expensive components
- Implement proper list virtualization
- Optimize images with `expo-image`
- Use Hermes JavaScript engine

## 📝 Code Style

- **Imports**: Use path aliases (`@domain/`, `@application/`, etc.)
- **Naming**: PascalCase for components, camelCase for functions
- **Files**: One component per file
- **Comments**: Document complex business logic

## 🔄 Syncing with Web App

The mobile app shares:
- Domain entities
- Business logic
- Database schema
- Authentication system

This ensures consistency across platforms.

## 🐛 Troubleshooting

### Common Issues

**Issue: Metro bundler fails to start**
```bash
# Clear cache
expo start --clear
```

**Issue: TypeScript path aliases not working**
```bash
# Restart TypeScript server in your IDE
# Check tsconfig.json paths configuration
```

**Issue: Supabase connection errors**
```bash
# Verify environment variables
# Check Supabase URL and keys
# Ensure RLS policies are set up
```

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write type-safe code
3. Document complex logic
4. Test your changes
5. Keep commits atomic and well-described

## 📄 License

Private - Brewly Coffee Shop Management System

## 👥 Team Collaboration

### For New Developers

1. **Read this README thoroughly**
2. **Study the architecture diagram**
3. **Review domain entities first**
4. **Understand the data flow**
5. **Follow the existing patterns**

### File Organization

- Keep related files together
- Use index files for clean exports
- Maintain consistent naming conventions
- Document public APIs

---

**Built with ❤️ for coffee shop management**

