import { Stack } from 'expo-router';
import { Provider } from 'jotai';
import React, { useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationService } from '../services/notificationService';
import { plantEventsService } from '../services/plantEventsService';

export default function RootLayout() {

  useEffect(() => {
    // Инициализируем сервисы при запуске приложения
    const initializeApp = async () => {
      await plantEventsService.initialize();
      await NotificationService.requestPermissions();
    };

    initializeApp().catch(console.error);
  }, []);

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
          <Stack.Screen name="index" />
          <Stack.Screen name="tabs" />
          <Stack.Screen name="plant/[id]" />
          <Stack.Screen name="plant/calendar/[id]" />
        </Stack>
      </Provider>
    </SafeAreaProvider>
  );
}