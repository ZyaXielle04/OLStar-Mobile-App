import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/BottomNav.styles';
import { useState, useRef, useCallback } from 'react';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const [fabOpen, setFabOpen] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const actionAnim = useRef(new Animated.Value(0)).current;

  const activeScreen = route.name;

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(actionAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    setFabOpen(!fabOpen);
  };

  const closeFab = useCallback(() => {
    if (fabOpen) {
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(actionAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      setFabOpen(false);
    }
  }, [fabOpen, rotateAnim, actionAnim]);

  // Close FAB when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        // When screen loses focus, close FAB
        closeFab();
      };
    }, [closeFab])
  );

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '315deg'],
  });

  const NavItem = ({ name, screen, label }) => {
    const isActive = activeScreen === screen;

    return (
      <Pressable
        onPress={() => navigation.navigate(screen)}
        style={styles.navItem}
      >
        <View style={[styles.circle, isActive && styles.activeCircle]}>
          <Ionicons
            name={name}
            size={22}
            color={isActive ? '#ff4d4d' : '#222'}
          />
        </View>

        <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.navWrapper}>

      {/* FAB */}
      <View style={styles.fabContainer}>

        <Animated.View
          style={[
            styles.fabAction,
            {
              opacity: actionAnim,
              transform: [{
                translateY: actionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <Ionicons name="analytics-outline" size={20} color="#fff" />
          <Text style={styles.fabActionText}>My Points</Text>
        </Animated.View>

        <Pressable
          onPress={() => {
            setFabOpen(false);
            navigation.navigate('BookTrip');
          }}
        >
          <Animated.View
            style={[
              styles.fabAction,
              {
                opacity: actionAnim,
                transform: [
                  {
                    translateY: actionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="airplane" size={20} color="#fff" />
            <Text style={styles.fabActionText}>Book a Trip</Text>
          </Animated.View>
        </Pressable>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <Pressable style={styles.fab} onPress={toggleFab}>
            <Ionicons name={fabOpen ? 'close' : 'add'} size={28} color="#fff" />
          </Pressable>
        </Animated.View>

      </View>

      {/* NAV ITEMS */}
      <View style={styles.nav}>
        <NavItem
          name="grid"
          screen="CustomerHome"
          label="Dashboard"
        />

        <NavItem
          name="calendar"
          screen="CustomerBookings"
          label="My Bookings"
        />

        <NavItem
          name="settings"
          screen="CustomerSettings"
          label="Settings"
        />
      </View>

    </View>
  );
}