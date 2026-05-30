// App.js
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CustomerHome from './screens/CustomerHome';
import CustomerBookings from './screens/CustomerBookings';
import CustomerSettings from './screens/CustomerSettings';
import BookTrip from './screens/BookTrip';
import BookingReceipt from './screens/BookingReceipt';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  // Handle app state changes for session-only logins
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        try {
          const session = await SecureStore.getItemAsync('olstarUser');
          if (session) {
            const user = JSON.parse(session);
            // If user didn't check "Remember Me", clear session when app goes to background
            if (!user.rememberMe) {
              console.log('⏰ Session-only login, clearing user data on app background');
              await SecureStore.deleteItemAsync('olstarUser');
            }
          }
        } catch (error) {
          console.error('Error handling app state change:', error);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        
        // Check for persistent login (Remember Me was checked)
        const persistentLogin = await SecureStore.getItemAsync('persistentLogin');
        let session = null;
        
        if (persistentLogin === 'true') {
          // User checked "Remember Me", try to restore session
          session = await SecureStore.getItemAsync('olstarUser');
        } else {
          // User didn't check "Remember Me", only check if there's an active session
          // But don't restore on fresh app start
          session = null;
        }

        if (session && persistentLogin === 'true') {
          const user = JSON.parse(session);
          if (user?.role === 'customer' && user.rememberMe) {
            console.log('✅ Restoring persistent session for user:', user.uid);
            setInitialRoute('CustomerHome');
            setLoading(false);
            return;
          }
        }

        // First time launch or no persistent session
        setInitialRoute(hasLaunched === null ? 'Splash' : 'Login');
      } catch (error) {
        console.error('Bootstrap error:', error);
        setInitialRoute('Login');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  if (loading || !initialRoute) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="CustomerHome" component={CustomerHome} />
          <Stack.Screen name="CustomerBookings" component={CustomerBookings} />
          <Stack.Screen name="CustomerSettings" component={CustomerSettings} />
          <Stack.Screen name="BookTrip" component={BookTrip} />
          <Stack.Screen name="BookingReceipt" component={BookingReceipt} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}