# Contributing to Brewly Mobile

Thank you for your interest in contributing to Brewly Mobile! This document provides guidelines and best practices for contributing to the project.

## Code of Conduct

- Be respectful and professional
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain code quality standards

## Getting Started

1. Read the `README.md` and `ARCHITECTURE.md` thoroughly
2. Set up your development environment
3. Understand the clean architecture patterns
4. Review existing code to understand conventions

## Development Workflow

### 1. Before Starting

- Check existing issues or create a new one
- Discuss major changes before implementing
- Ensure you understand the requirements

### 2. Branch Strategy

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Making Changes

Follow these principles:

#### Clean Architecture Rules

1. **Domain Layer**
   - Keep it pure (no external dependencies)
   - Only TypeScript allowed
   - Well-documented public methods
   - Comprehensive business logic

2. **Application Layer**
   - Use React hooks pattern
   - Depend only on Domain
   - Minimal business logic

3. **Infrastructure Layer**
   - Implement domain interfaces
   - Handle all external dependencies
   - Keep implementations private

4. **Presentation Layer**
   - Use Application hooks
   - No direct repository access
   - Keep components focused

#### Code Style

```typescript
// ✅ Good: Clear interface, business logic in domain
interface IProductRepository {
  findById(id: string): Promise<Product | null>;
}

class Product {
  canBeOrdered(): boolean {
    return this.isActive && this.prices.length > 0;
  }
}

// ❌ Bad: Business logic in repository
class ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const product = await this.fetch(id);
    // Don't put business logic here!
    if (product.isActive && product.prices.length > 0) {
      // ...
    }
  }
}
```

### 4. Writing Tests

```typescript
// Unit test for domain entity
describe('Order', () => {
  it('should calculate total correctly', () => {
    const order = new Order(/* ... */);
    expect(order.calculateTotal()).toBe(expectedTotal);
  });
});

// Integration test for hook
describe('useOrders', () => {
  it('should fetch orders for location', async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => {
      expect(result.current.orders).toHaveLength(3);
    });
  });
});
```

### 5. Commit Messages

Follow conventional commits:

```
feat: add order filtering by status
fix: resolve cart total calculation bug
docs: update architecture documentation
refactor: simplify product mapper
test: add tests for CreateOrderUseCase
```

## File Organization

### Creating New Files

1. **Domain Entity**
```typescript
// src/lib/domain/entities/NewEntity.ts
export class NewEntity {
  constructor(/* ... */) {}
  
  // Business methods
  someBusinessLogic(): boolean {
    // ...
  }
}
```

2. **Repository Interface**
```typescript
// src/lib/domain/repositories/INewRepository.ts
export interface INewRepository {
  findById(id: string): Promise<NewEntity | null>;
}
```

3. **Repository Implementation**
```typescript
// src/lib/infrastructure/supabase/repositories/NewRepository.ts
export class NewRepository implements INewRepository {
  async findById(id: string): Promise<NewEntity | null> {
    // Implementation
  }
}
```

4. **Application Hook**
```typescript
// src/lib/application/hooks/useNewEntity.ts
export function useNewEntity(id: string) {
  return useQuery({
    queryKey: ['newEntity', id],
    queryFn: () => repository.findById(id),
  });
}
```

5. **Screen Component**
```typescript
// src/presentation/screens/feature/FeatureScreen.tsx
export function FeatureScreen() {
  const { data } = useNewEntity(id);
  return <View>...</View>;
}
```

### Export Pattern

Always use index files:

```typescript
// src/lib/domain/entities/index.ts
export * from './Product';
export * from './Order';
export * from './NewEntity';
```

## Styling Guidelines

### Use Theme System

```typescript
// ✅ Good: Use theme
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary[600],
  }
});

// ❌ Bad: Hardcoded values
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#4F46E5',
  }
});
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { View } from 'react-native';
import { theme } from '@theme/index';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export function MyComponent({ title }: Props) {
  // Hooks
  const { data } = useSomeHook();
  
  // Handlers
  const handlePress = () => {
    // ...
  };
  
  // Render
  return <View>...</View>;
}

// 4. Styles
const styles = StyleSheet.create({
  // ...
});
```

## Common Patterns

### Data Fetching

```typescript
export function useOrders(status?: OrderStatus) {
  const { currentLocation } = useAppStore();
  
  return useQuery({
    queryKey: ['orders', currentLocation?.id, status],
    queryFn: () => repository.findByLocation(
      currentLocation!.id,
      status
    ),
    enabled: !!currentLocation,
    staleTime: 30 * 1000,
  });
}
```

### Data Mutation

```typescript
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrderDTO) => 
      createOrderUseCase.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}
```

### Error Handling

```typescript
const { data, error, isLoading } = useOrders();

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

return <OrdersList orders={data} />;
```

## Pull Request Process

### Before Submitting

- [ ] Code follows clean architecture principles
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Code is formatted (run `npm run lint`)
- [ ] Documentation updated if needed
- [ ] Tested on both iOS and Android

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Follows clean architecture
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No linting errors
```

## Review Process

1. Submit PR with clear description
2. Automated checks must pass
3. Code review by maintainers
4. Address feedback
5. Approval and merge

## Questions?

- Check existing documentation
- Search closed issues
- Ask in team chat
- Create a discussion thread

## Resources for Contributors

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Query Guide](https://tanstack.com/query/latest/docs/react/overview)

Thank you for contributing! 🎉

