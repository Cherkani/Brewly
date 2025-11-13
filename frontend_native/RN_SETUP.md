# React Native Setup Guide

## ✅ Package Updates Complete

All packages have been updated to match **Expo SDK 54** requirements.

## 📦 Install Dependencies

```bash
cd frontend_native
npm install
```

## 🔐 Environment Variables

Create a `.env` file in `frontend_native/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://qlvhqgtjqfdfpjordits.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** For Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## 🚀 Running the App

### Option 1: Expo Go (Easiest - Recommended)

1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Scan the QR code** with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option 2: iOS Simulator (Mac only)

```bash
npm run ios
```

**Requirements:**
- Xcode installed
- iOS Simulator available

### Option 3: Android Emulator

**First, set up Android Studio:**

1. Install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK through Android Studio
3. Set environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. Add to `~/.zshrc` to make permanent:
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
   source ~/.zshrc
   ```

5. **Then run:**
   ```bash
   npm run android
   ```

## ⚠️ Troubleshooting

### Android SDK Not Found

If you see `Failed to resolve the Android SDK path`:

**Solution 1:** Use Expo Go (easiest)
- No Android Studio needed
- Just install Expo Go app and scan QR code

**Solution 2:** Install Android Studio
- Follow Option 3 above
- Make sure `ANDROID_HOME` is set correctly

### Package Version Warnings

If you see version mismatch warnings:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Metro Bundler Issues

```bash
# Clear cache and restart
npm start -- --clear
```

## 📱 Testing on Physical Device

1. Make sure your phone and computer are on the same WiFi network
2. Run `npm start`
3. Scan QR code with Expo Go app
4. App will load on your device!

## 🎯 Next Steps

After the app is running:

1. **Test Authentication:**
   - Sign up / Sign in
   - Verify Supabase connection

2. **Test Features:**
   - Dashboard
   - Product catalog
   - Orders
   - POS system

3. **Development:**
   - Hot reload is enabled
   - Changes reflect immediately
   - Use React Native Debugger for debugging

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Go App](https://expo.dev/client)

---

**Happy Coding! ☕📱**

