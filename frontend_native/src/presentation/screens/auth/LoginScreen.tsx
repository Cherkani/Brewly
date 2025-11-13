/**
 * Login Screen
 * User authentication screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '@application/hooks/useAuth';
import { theme } from '@theme/index';
import type { AuthStackScreenProps } from '@navigation/types';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isSigningIn, signInError } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn({ email, password });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Brewly</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isSigningIn}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSigningIn}
          />

          <TouchableOpacity
            style={[styles.button, isSigningIn && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSigningIn}
          >
            <Text style={styles.buttonText}>
              {isSigningIn ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  form: {
    gap: theme.spacing[4],
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
  },
  button: {
    backgroundColor: theme.colors.primary[600],
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  linkButton: {
    alignItems: 'center',
    padding: theme.spacing[2],
  },
  linkText: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.sm,
  },
  linkTextBold: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

