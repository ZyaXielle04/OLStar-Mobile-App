import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/ConfirmModal.styles';

export default function ConfirmModal({
  visible,
  title = "Confirm",
  message,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>

        <View style={styles.container}>

          <Ionicons name="warning-outline" size={40} color="#FF4D6D" />

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>

            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>

          </View>

        </View>

      </View>
    </Modal>
  );
}