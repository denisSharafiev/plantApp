import { Stack } from 'expo-router';
import { Provider } from 'jotai';
import React from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaProvider>
      <Provider>
        <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}}>
          <Stack.Screen 
            name="index" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="tabs" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="plant/[id]" 
            options={{ headerShown: false }} 
          />
        </Stack>
      </Provider>
    </SafeAreaProvider>
  );
}