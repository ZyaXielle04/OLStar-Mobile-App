import { useState, useRef } from 'react';

import { Text, View, TextInput, Pressable, ScrollView, } from 'react-native';

import { createUserWithEmailAndPassword, sendEmailVerification, PhoneAuthProvider, signInWithCredential, } from 'firebase/auth';

import { FirebaseRecaptchaVerifierModal, } from 'expo-firebase-recaptcha';

import { auth, firebaseConfig, database, } from '../firebaseConfig';

import { ref, set } from 'firebase/database';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '../styles/RegisterScreen.styles';

// REUSABLE MODAL
import AppModal from '../components/AppModal';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const recaptchaVerifier = useRef(null);

  // STATES
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otp, setOtp] = useState('');

  // ================= MODAL STATE =================
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ================= PASSWORD RULES =================
  const passwordRules = {
    minLength: password.length >= 8,
    maxLength: password.length <= 32,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  // ================= PASSWORD VALIDATION =================
  const passwordsMatch =
    password &&
    confirmPassword &&
    password === confirmPassword;

  const passwordValid =
    passwordRules.minLength &&
    passwordRules.maxLength &&
    passwordRules.hasUppercase &&
    passwordRules.hasLowercase &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial;

  // ================= REQUIREMENT COMPONENT =================
  const Requirement = ({ met, text }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? '#22C55E' : '#94a3b8'}
        style={{ marginRight: 8 }}
      />

      <Text
        style={{
          color: met ? '#22C55E' : '#94a3b8',
          fontSize: 13,
        }}
      >
        {text}
      </Text>
    </View>
  );

  // ================= HELPERS =================
  const splitName = (name = '') => {
    const parts = name.trim().split(' ');

    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  };

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
        navigation.replace('Login');
      }
    }, 1000);
  };

  // ================= EMAIL REGISTER =================
  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showModal('Please fill in all fields.');
      return;
    }

    if (!passwordValid) {
      showModal('Password does not meet requirements.');
      return;
    }

    if (password !== confirmPassword) {
      showModal('Passwords do not match.');
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;
      const now = new Date().toISOString();

      const { firstName, lastName } = splitName(fullName);

      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        email,
        fullName,
        firstName,
        lastName,
        role: 'customer',
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
      });

      await sendEmailVerification(user);

      showModal('Verification email sent 📩');
      startRedirect();

    } catch (error) {
      showModal(error.message);
    }
  };

  // ================= PHONE OTP =================
  const sendOTP = async () => {
    if (!phoneNumber) {
      showModal('Enter phone number.');
      return;
    }

    try {
      const provider = new PhoneAuthProvider(auth);

      const id = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );

      setVerificationId(id);
      showModal('OTP sent 📱');

    } catch (error) {
      showModal(error.message);
    }
  };

  const verifyOTP = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        otp
      );

      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      const now = new Date().toISOString();

      await set(ref(database, `users/${user.uid}`), {
        uid: user.uid,
        phone: phoneNumber,
        role: 'customer',
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
      });

      showModal('Phone verified 🎉');
      startRedirect();

    } catch (error) {
      showModal('Invalid OTP.');
    }
  };

  return (
    <>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

      {/* ✅ REUSABLE MODAL */}
      <AppModal
        visible={modalVisible}
        message={modalMessage}
        isRedirecting={isRedirecting}
        countdown={countdown}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          <Text style={styles.title}>Create Account ✨</Text>

          <Text style={styles.subtitle}>
            Join OLStar and start your journey
          </Text>

          {/* FULL NAME */}
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#94a3b8"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />

          {/* EMAIL */}
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />

          {/* PASSWORD */}
          <View>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 15,
                top: 15,
              }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#94a3b8"
              />
            </Pressable>
          </View>

          {/* PASSWORD REQUIREMENTS */}
          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: 16,
              padding: 14,
              marginTop: -8,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: '#1e293b',
            }}
          >
            <Text
              style={{
                color: '#f8fafc',
                fontWeight: '600',
                marginBottom: 12,
              }}
            >
              Password Requirements
            </Text>

            <Requirement
              met={passwordRules.minLength}
              text="At least 8 characters"
            />

            <Requirement
              met={passwordRules.maxLength}
              text="Maximum 32 characters"
            />

            <Requirement
              met={passwordRules.hasUppercase}
              text="One uppercase letter"
            />

            <Requirement
              met={passwordRules.hasLowercase}
              text="One lowercase letter"
            />

            <Requirement
              met={passwordRules.hasNumber}
              text="One numeric character"
            />

            <Requirement
              met={passwordRules.hasSpecial}
              text="One special character"
            />

            {/* SUCCESS MESSAGE */}
            {passwordsMatch && passwordValid && (
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: '#1e293b',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color="#22C55E"
                  style={{ marginRight: 8 }}
                />

                <Text
                  style={{
                    color: '#22C55E',
                    fontWeight: '600',
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  Passwords are the same and complied to the password requirements
                </Text>
              </View>
            )}
          </View>

          {/* CONFIRM PASSWORD */}
          <View>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#94a3b8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              style={{
                position: 'absolute',
                right: 15,
                top: 15,
              }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#94a3b8"
              />
            </Pressable>
          </View>

          <Pressable
            style={styles.button}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>
              Create Account
            </Text>
          </Pressable>

          <Text style={styles.or}>OR</Text>

          {/* PHONE */}
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#94a3b8"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Pressable
            style={styles.socialButton}
            onPress={sendOTP}
          >
            <View style={styles.socialRow}>
              <Ionicons
                name="call"
                size={18}
                color="#22C55E"
              />

              <Text style={styles.socialText}>
                Send OTP
              </Text>
            </View>
          </Pressable>

          {verificationId && (
            <>
              <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#94a3b8"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
              />

              <Pressable
                style={styles.button}
                onPress={verifyOTP}
              >
                <Text style={styles.buttonText}>
                  Verify OTP
                </Text>
              </Pressable>
            </>
          )}

        </View>

        {/* FOOTER */}
        <View style={styles.footerContainer}>
          <Text style={styles.footer}>
            Already have an account?
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signupText}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}