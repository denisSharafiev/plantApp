import { Stack } from 'expo-router';
import { Provider } from 'jotai';
import React, { useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { plantEventsService } from '../services/plantEventsService';

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    // Инициализируем сервис событий при запуске приложения
    plantEventsService.initialize().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <Provider>
        <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}}>
          <Stack.Screen name="index" />
          <Stack.Screen name="tabs" />
          <Stack.Screen name="plant/[id]" />
          <Stack.Screen name="plant/calendar/[id]" />
        </Stack>
      </Provider>
    </SafeAreaProvider>
  );
}