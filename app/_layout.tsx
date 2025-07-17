import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications';
import '../global.css';

import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from "expo-constants";
// Prevent splash from auto‑hiding at startup
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [isReady, setIsReady] = useState(false);

 const STRIPE_PUBLISHABLE_KEY ="pk_test_51RRzdKQZjypRCOFDofMT4BuilVjxgNqk5sQVhM0r7LRaVfyyMdBG6I2geLkX6RhGSEzQyylbzwIcUjOvvkwuce1r00TDdIFGXm"
  // Load fonts
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Once fonts loaded, hide splash screen and mark ready
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded]);
 useEffect(() => {
    console.log("BASE_URL:", Constants.manifest?.extra?.BASE_URL);
    console.log("STRIPE_KEY:", STRIPE_PUBLISHABLE_KEY);
    console.log("GOOGLE_CLIENT_ID:", Constants.manifest?.extra?.GOOGLE_CLIENT_ID);
    
    Alert.alert(
      "Env Vars Check",
      `BASE_URL: ${Constants.manifest?.extra?.BASE_URL}\n` +
      `STRIPE_KEY: ${STRIPE_PUBLISHABLE_KEY}\n` +
      `GOOGLE_CLIENT_ID: ${Constants.manifest?.extra?.GOOGLE_CLIENT_ID}`
    );
  }, []);
 
   return (
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
      offset={30}
      successColor="#4CAF50"
      dangerColor="#F44336"
      warningColor="#FF9800"
      normalColor="#333"
      style={{
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 20,
      }}
      textStyle={{ color: '#fff' }}
    >
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.yourapp"
      >
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          {/* This <Stack> handles your (auth), (root_host), (root_cleaner), index, etc. */}
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </StripeProvider>
    </ToastProvider>
  );
}
