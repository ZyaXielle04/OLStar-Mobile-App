import { useState, useEffect } from 'react';

import {
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ImageBackground,
} from 'react-native';

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';

import {
  ref,
  get,
  update,
} from 'firebase/database';

import * as SecureStore from 'expo-secure-store';

import {
  auth,
  database,
} from '../firebaseConfig';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '../styles/LoginScreen.styles';

import AppModal from '../components/AppModal';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const startRedirect = () => {
    setIsRedirecting(true);
    setCountdown(3);

    let seconds = 3;

    const timer = setInterval(() => {
      seconds--;
      setCountdown(seconds);

      if (seconds <= 0) {
        clearInterval(timer);
        setModalVisible(false);
        navigation.replace('CustomerHome');
      }
    }, 1000);
  };

  useEffect(() => {
    const checkSession = async () => {
      const session = await SecureStore.getItemAsync('olstarUser');

      if (session) {
        const user = JSON.parse(session);
        if (user.role === 'customer') {
          navigation.replace('CustomerHome');
        }
      }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('Please enter email and password.');
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      const snapshot = await get(ref(database, `users/${user.uid}`));

      if (!snapshot.exists()) {
        showModal('User record not found.');
        return;
      }

      const userData = snapshot.val();

      if (userData.role !== 'customer') {
        showModal('Access denied.');
        return;
      }

      await update(ref(database, `users/${user.uid}`), {
        lastLogin: new Date().toISOString(),
      });

      if (rememberMe) {
        await SecureStore.setItemAsync(
          'olstarUser',
          JSON.stringify({
            uid: user.uid,
            fullName: userData.fullName,
            role: userData.role,
          })
        );
      } else {
        await SecureStore.deleteItemAsync('olstarUser');
      }

      showModal(`Welcome back ${userData.firstName} ✨`);
      startRedirect();

    } catch (error) {
      showModal(error.message);
    }
  };

  return (
    <>
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        isRedirecting={isRedirecting}
        countdown={countdown}
        onClose={() => setModalVisible(false)}
      />

      {/*BACKGROUND IMAGE WRAPPER */}
      <ImageBackground
        source={require('../assets/loginBackground.jpg')}
        style={{ flex: 1 , width: '100%', height: '100%' }}
        resizeMode="cover"
      >

        {/* 🔥 DARK OVERLAY (this creates the 0.4 dim effect) */}
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >

          <ScrollView
            style={[styles.container, { paddingTop: insets.top }]}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>

              <Text style={styles.title}>Welcome Back 👋</Text>

              <Text style={styles.subtitle}>
                Login to continue your OLStar journey
              </Text>

              <TextInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
              />

              <View>
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 15, top: 15 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color='rgba(30, 41, 59, 1)'
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => setRememberMe(!rememberMe)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
              >
                <Ionicons
                  name={rememberMe ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={rememberMe ? '#fcdaf6' : 'rgba(30, 41, 59, 1)'}
                />
                <Text style={{ marginLeft: 10, color: 'rgba(30, 41, 59, 1)' }}>
                  Remember me
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  {
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    backgroundColor: pressed ? '#f9a8d4' : 'rgba(30, 41, 59, 1)',
                  },
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>

              <Text style={styles.or}>OR</Text>

              <Pressable style={styles.socialButton}>
                <View style={styles.socialRow}>
                  <Ionicons name="call" size={18} color="#22C55E" />
                  <Text style={styles.socialText}>
                    Continue with Phone Number
                  </Text>
                </View>
              </Pressable>

              <View style={styles.footerContainer}>
                <Text style={[styles.footer, { color: '#fff' }]}>
                  Don’t have an account?
                </Text>

                <Pressable onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.signupText}>Sign up</Text>
                </Pressable>
              </View>

            </View>
          </ScrollView>

        </View>
      </ImageBackground>
    </>
  );
}