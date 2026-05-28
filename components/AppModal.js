import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '../styles/AppModal.styles';

export default function AppModal({
  visible,
  message,
  isRedirecting,
  countdown,
  onClose,
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>

          <Ionicons name="sparkles" size={42} color="#fcdaf6" />

          <Text style={styles.modalTitle}>OLStar</Text>

          <Text style={styles.modalText}>{message}</Text>

          {isRedirecting ? (
            <Text style={styles.countdownText}>
              Redirecting in {countdown}...
            </Text>
          ) : (
            <Pressable
              style={styles.modalButton}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>
                Got it
              </Text>
            </Pressable>
          )}

        </View>
      </View>
    </Modal>
  );
}