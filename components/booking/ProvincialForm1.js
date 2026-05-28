import { View, Text, TextInput, Pressable } from 'react-native';

export default function ProvincialForm1({ onBack }) {
  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>
        Provincial Driver Booking
      </Text>

      <TextInput placeholder="Province / Destination" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Travel Date" style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />

      <Pressable onPress={onBack} style={{ marginTop: 20 }}>
        <Text style={{ color: 'red' }}>Go Back</Text>
      </Pressable>
    </View>
  );
}