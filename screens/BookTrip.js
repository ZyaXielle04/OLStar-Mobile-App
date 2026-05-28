import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { styles } from '../styles/BookTrip.styles';

// import reusable forms
import AirportTransferForm1 from '../components/booking/AirportTransferForm1';
import SelfDriveForm1 from '../components/booking/SelfDriveForm1';
import MetroForm1 from '../components/booking/MetroForm1';
import ProvincialForm1 from '../components/booking/ProvincialForm1';

export default function BookTrip() {

  const [activeForm, setActiveForm] = useState(null);

  const renderServiceCard = ({ title, description, icon, image, formType }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() => setActiveForm(formType)}
      >

        <Image source={image} style={styles.cardImage} />

        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={24} color="#ff4d4d" />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        <Text style={styles.cardDesc}>{description}</Text>

        <View style={styles.cardButton}>
          <Text style={styles.cardButtonText}>Select</Text>
        </View>

      </Pressable>
    );
  };

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'airport':
        return <AirportTransferForm1 onBack={() => setActiveForm(null)} />;

      case 'selfdrive':
        return <SelfDriveForm1 onBack={() => setActiveForm(null)} />;

      case 'metro':
        return <MetroForm1 onBack={() => setActiveForm(null)} />;

      case 'provincial':
        return <ProvincialForm1 onBack={() => setActiveForm(null)} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="airplane" size={28} color="#ff4d4d" />
          <Text style={styles.title}>Book a Trip</Text>
        </View>

        {/* SWITCH VIEW */}
        {!activeForm ? (
          <>
            {renderServiceCard({
              title: 'Airport Transfer',
              description: 'Fast airport pickup and drop-off.',
              icon: 'airplane-outline',
              image: require('../assets/airportTransfer.jpeg'),
              formType: 'airport',
            })}

            {renderServiceCard({
              title: 'Self Drive',
              description: 'Drive your own rental car.',
              icon: 'car-outline',
              image: require('../assets/selfDrive.jpg'),
              formType: 'selfdrive',
            })}

            {renderServiceCard({
              title: 'Metro Manila Driver',
              description: 'Professional driver in Metro Manila.',
              icon: 'person-outline',
              image: require('../assets/metro.png'),
              formType: 'metro',
            })}

            {renderServiceCard({
              title: 'Provincial Driver',
              description: 'Long-distance provincial trips.',
              icon: 'map-outline',
              image: require('../assets/provincial.png'),
              formType: 'provincial',
            })}
          </>
        ) : (
          renderActiveForm()
        )}

      </ScrollView>
    </SafeAreaView>
  );
}