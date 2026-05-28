import { useEffect, useState } from 'react';
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
import BookTrip from './screens/BookTrip'

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const session = await SecureStore.getItemAsync('olstarUser');

        if (session) {
          const user = JSON.parse(session);

          if (user?.role === 'customer') {
            setInitialRoute('CustomerHome');
            setLoading(false);
            return;
          }
        }

        setInitialRoute(hasLaunched === null ? 'Splash' : 'Login');
      } catch {
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}