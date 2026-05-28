import { useEffect } from 'react';

import {
  Text,
  Pressable,
  StatusBar,
  View,
  ImageBackground,
} from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../styles/SplashScreen.styles';

export default function SplashScreen({ navigation }) {

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    navigation.replace('Login');
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require('../assets/SplashScreen/splash1.jpg')}
        style={styles.background}
        resizeMode="cover"
      >

        <SafeAreaView style={styles.container}>

          <View style={styles.overlay}>

            <View style={styles.content}>

              <MaskedView
                maskElement={
                  <Text style={styles.title}>OLStar</Text>
                }
              >
                <LinearGradient
                  colors={['#df95da', '#87c7de', '#92a7dd']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.title, { opacity: 0 }]}>
                    OLStar
                  </Text>
                </LinearGradient>
              </MaskedView>

              <Text style={styles.subtitle}>
                Explore the world with ease ✈️
              </Text>

              <Text style={styles.description}>
                Discover amazing destinations, book tours,
                and experience unforgettable journeys with OLStar Travel & Tours.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  {
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    backgroundColor: pressed ? '#f9a8d4' : '#fcdaf6',
                  },
                ]}
                onPress={handleGetStarted}
              >
                <Text style={styles.buttonText}>
                  Get Started
                </Text>
              </Pressable>

            </View>

          </View>

        </SafeAreaView>

      </ImageBackground>
    </>
  );
}