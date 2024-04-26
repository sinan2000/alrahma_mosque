import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, OpenSans_400Regular, OpenSans_300Light, OpenSans_500Medium, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import LocalSplashScreen from './screens/SplashScreen';
import PrayerTimesScreen from './screens/PrayerTimesScreen';
import PrayerTrackerScreen from './screens/PrayerTrackerScreen';
import { getKeysToFetch, fetchAndStorePrayerTimes, getKeysToPrayed, generatePrayed } from './utils';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PrayerStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PrayerTimes" 
        component={PrayerTimesScreen} 
        options={{ 
          headerShown: true, 
          title: 'Prayer Times'
        }} 
      />
      <Stack.Screen 
        name="PrayerTracker" 
        component={PrayerTrackerScreen} 
        options={{ 
          headerShown: true, 
          title: 'Prayer Tracker',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isSplashScreenVisible, setSplashScreenVisibility] = useState(true);

  let [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_300Light,
    OpenSans_500Medium,
    OpenSans_700Bold,
  });

  useEffect(() => {
    // Splash Screen
    SplashScreen.preventAutoHideAsync();

    setTimeout(() => {
      setSplashScreenVisibility(false);
      SplashScreen.hideAsync();
    }, 200); // TODO: Change to 1500
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      // Get current location of user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }
      let location = await Location.getCurrentPositionAsync({});
      return location;
    };

    const setCityAndCountry = async (location) => {
      // Get city and country from location
      const { latitude, longitude } = location.coords;
      const reverseGeocode = await Location.reverseGeocodeAsync({ 
        latitude: latitude, 
        longitude: longitude
      });
      if (reverseGeocode) {
        const city = reverseGeocode[0].city;
        const country = reverseGeocode[0].country;
        await AsyncStorage.setItem('city', city);
        await AsyncStorage.setItem('country', country);
      }
    };

    const checkStorage = async () => {
      // Check if city and country are stored
      const storedCity = await AsyncStorage.getItem('city');
      const storedCountry = await AsyncStorage.getItem('country');
      if (storedCity && storedCountry) {
        return;
      }
      const location = await getLocation();
      if (location) {
        await setCityAndCountry(location);
      } else {
        await AsyncStorage.setItem('city', 'Groningen');
        await AsyncStorage.setItem('country', 'Netherlands');
      }
    };

    const checkAladhan = async () => {
      // Prayer times for previous, current and next month
      const storedData = await AsyncStorage.getItem('Aladhan') || '{}';
      const aladhan = JSON.parse(storedData);
      const today = new Date();
      const keysToFetch = getKeysToFetch(today);
      let update = false;
      for (const key of keysToFetch) {
        if (!aladhan[key]) {
          await fetchAndStorePrayerTimes(key, aladhan);
          update = true;
        }
      }

      if(update) {
        await AsyncStorage.setItem('Aladhan', JSON.stringify(aladhan));
      }
    };

    const checkPrayed = async () => {
      // Check if prayed data is stored
      let prayed = await AsyncStorage.getItem('prayed');
      prayed = prayed ? JSON.parse(prayed) : {};
      const now = new Date();
      const years = getKeysToPrayed(now);

      let update = false;

      years.forEach((year) => {
        if (!prayed[year]) {
          prayed[year] = generatePrayed(year);
          update = true;
        }
      })
      
      if(update){
        await AsyncStorage.setItem('prayed', JSON.stringify(prayed));
      }
    };

    checkStorage();
    checkPrayed();
    checkAladhan();
  }, []);

  if (!fontsLoaded || isSplashScreenVisible) {
    return <LocalSplashScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator 
        initialRouteName='PrayerTimes'
        screenOptions={{
          tabBarActiveTintColor: '#0e9d87',
          tabBarStyle: { backgroundColor: '#f3f4f8' },
        }}
      >
        <Tab.Screen 
          name='Prayer Times' 
          component={PrayerStackScreen} 
          options={{
            headerShown: false,
            tabBarLabel: 'Prayer Times',
            tabBarActiveTintColor: '#0e9d87',
            tabBarIcon: ({ focused, color, size }) => (
              <Image 
                source={require('./assets/islamic.png')}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#0e9d87' : color
                }}
              />
            ),
            tabBarActiveTintColor: '#0e9d87',
          }}  
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
