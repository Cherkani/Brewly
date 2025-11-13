import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme/index';

export function POSScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>POS Screen - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.white },
  text: { fontSize: theme.typography.fontSize.lg, color: theme.colors.gray[600] },
});

