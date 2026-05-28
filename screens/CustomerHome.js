import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '../styles/CustomerHome.styles';
import BottomNav from '../components/BottomNav';

export default function CustomerHome() {

  return (
    <SafeAreaView style={styles.safeArea}>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to OLStar ✈️</Text>
          <Text style={styles.subtitle}>
            Travel & Tours made simple, elegant, and reliable
          </Text>
        </View>

        {Array.from({ length: 15 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <Text>Card #{i + 1}</Text>
          </View>
        ))}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}