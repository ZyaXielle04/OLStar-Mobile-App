import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

import { styles } from '../styles/CustomerSettings.styles';
import BottomNav from '../components/BottomNav';
import ConfirmModal from '../components/ConfirmModal';

export default function CustomerSettings({ navigation }) {

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('olstarUser');
    setShowLogoutModal(false);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        <Text style={styles.title}>Settings ⚙️</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable style={styles.item}>
            <Text>Edit Profile</Text>
          </Pressable>

          <Pressable style={styles.item}>
            <Text>Change Password</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App</Text>

          <Pressable style={styles.item}>
            <Text>Notifications</Text>
          </Pressable>

          <Pressable style={styles.item}>
            <Text>Privacy Policy</Text>
          </Pressable>
        </View>

        {/* LOGOUT BUTTON */}
        <Pressable
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

      </View>

      <BottomNav />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

    </SafeAreaView>
  );
}