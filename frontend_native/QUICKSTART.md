# Brewly Mobile - Quick Start Guide

Get up and running with Brewly Mobile in minutes!

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js (v18 or higher) installed
- ✅ npm or yarn installed
- ✅ Expo CLI: `npm install -g expo-cli`
- ✅ A code editor (VS Code recommended)
- ✅ iOS Simulator (Mac) or Android Studio
- ✅ Supabase project set up

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd frontend_native
npm install
```

This will install all required packages including:
- React Native and Expo
- React Navigation
- Supabase client
- React Query
- Zustand
- And more...

### 2. Configure Environment

Create a `.env` file in the root of `frontend_native`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon/public key

### 3. Start Development Server

```bash
npm start
```

This will:
- Start the Metro bundler
- Show a QR code
- Open Expo DevTools in your browser

### 4. Run on Device/Simulator

**Option A: Physical Device**
1. Install [Expo Go](https://expo.dev/client) on your phone
2. Scan the QR code from the terminal
3. App will load on your device

**Option B: iOS Simulator (Mac only)**
```bash
Press 'i' in the terminal
```

**Option C: Android Emulator**
```bash
Press 'a' in the terminal
```

## Project Structure at a Glance

```
frontend_native/
├── src/
│   ├── lib/
│   │   ├── domain/          # Business logic & entities
│   │   ├── application/     # Hooks & services
│   │   ├── infrastructure/  # Supabase & state
│   │   └── shared/          # Utilities
│   ├── presentation/
│   │   ├── navigation/      # App navigation
│   │   ├── screens/         # Screen components
│   │   ├── components/      # Reusable components
│   │   └── theme/           # Styling system
│   └── App.tsx              # Root component
├── assets/                  # Images, fonts, etc.
├── package.json
├── tsconfig.json
└── app.json
```

## First Steps in the App

### Default Test Flow

1. **Sign Up**
   - Open the app
   - Tap "Sign Up"
   - Enter email, password, and full name
   - Submit

2. **Sign In**
   - Use your credentials
   - You'll be redirected to the dashboard

3. **Explore Features**
   - Dashboard: View stats
   - POS: (Coming soon)
   - Orders: (Coming soon)
   - Menu: Settings and options

## Common Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start --clear

# Run on iOS
npm run ios

# Run on Android
npm run android

# Type check
npm run type-check

# Lint code
npm run lint

# Run tests
npm test
```

## Development Tips

### 1. Hot Reloading

- Shake your device or press Cmd+D (iOS) / Cmd+M (Android)
- Enable "Fast Refresh" in the menu
- Changes will reflect instantly

### 2. Debugging

**React Native Debugger:**
```bash
# Install
brew install --cask react-native-debugger

# Open it and press Cmd+D in simulator
# Select "Debug JS Remotely"
```

**Console Logs:**
```typescript
console.log('Debug:', data);  // Shows in Metro terminal
```

### 3. Path Aliases

Use clean imports:
```typescript
// ✅ Good
import { Product } from '@domain/entities/Product';
import { useAuth } from '@application/hooks/useAuth';

// ❌ Avoid
import { Product } from '../../../lib/domain/entities/Product';
```

### 4. Supabase Setup

Make sure your Supabase database has:
- Tables created (run migrations from `supabase/migrations/`)
- RLS policies set up
- Test data seeded

## Troubleshooting

### Issue: "Unable to resolve module"

**Solution:**
```bash
npm start --clear
# or
rm -rf node_modules && npm install
```

### Issue: TypeScript errors about path aliases

**Solution:**
1. Restart your TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")
2. Check `tsconfig.json` paths are correct

### Issue: "Network request failed"

**Solution:**
1. Check your `.env` file has correct Supabase URL
2. Verify you're not behind a firewall
3. Test Supabase connection in browser

### Issue: App crashes on startup

**Solution:**
1. Check Metro bundler terminal for errors
2. Ensure all dependencies installed: `npm install`
3. Clear cache: `npm start --clear`

## Next Steps

Now that you're set up:

1. **Read the Documentation**
   - [README.md](./README.md) - Full overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into architecture
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

2. **Explore the Codebase**
   - Start with domain entities (`src/lib/domain/entities/`)
   - Look at hooks (`src/lib/application/hooks/`)
   - Check out screens (`src/presentation/screens/`)

3. **Make Your First Change**
   - Pick a simple feature
   - Follow clean architecture patterns
   - Test on both iOS and Android

4. **Join the Team**
   - Ask questions in team chat
   - Review pull requests
   - Share your learnings

## Quick Reference

### Useful Files

- `src/App.tsx` - App entry point
- `src/presentation/navigation/RootNavigator.tsx` - Navigation setup
- `src/lib/infrastructure/supabase/client.ts` - Database client
- `src/presentation/theme/index.ts` - Theme configuration

### Key Concepts

- **Domain Entities**: Business logic (e.g., `Order.calculateTotal()`)
- **Repositories**: Data access (e.g., `OrderRepository.findById()`)
- **Hooks**: React integration (e.g., `useOrders()`)
- **Screens**: UI components (e.g., `DashboardScreen`)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)

## Need Help?

- Check the [README](./README.md)
- Review [Architecture docs](./ARCHITECTURE.md)
- Search existing issues
- Ask in team channels

---

**Happy Coding! ☕️📱**

