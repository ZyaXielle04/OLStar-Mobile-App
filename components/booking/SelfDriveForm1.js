import { View, Text, TextInput, Pressable } from 'react-native';

export default function SelfDriveForm1({ onBack }) {
  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>
        Self Drive Booking
      </Text>

      <TextInput placeholder="Pickup Date" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Return Date" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />

      <Pressable onPress={onBack} style={{ marginTop: 20 }}>
        <Text style={{ color: 'red' }}>Go Back</Text>
      </Pressable>
    </View>
  );
}