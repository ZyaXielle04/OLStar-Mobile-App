import { View, Text, TextInput, Pressable } from 'react-native';

export default function MetroForm1({ onBack }) {
  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>
        Metro Manila Driver Booking
      </Text>

      <TextInput placeholder="Pickup Point" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Destination" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />

      <Pressable onPress={onBack} style={{ marginTop: 20 }}>
        <Text style={{ color: 'red' }}>Go Back</Text>
      </Pressable>
    </View>
  );
}