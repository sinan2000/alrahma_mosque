import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import PrayerTimesScreen from './screens/PrayerTimesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, OpenSans_400Regular, OpenSans_300Light, OpenSans_500Medium, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import * as SplashScreen from 'expo-splash-screen';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  let [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_300Light,
    OpenSans_500Medium,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }
      let location = await Location.getCurrentPositionAsync({});
      return location;
    };

    const setCityAndCountry = async (location) => {
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
      if (await AsyncStorage.getItem('Aladhan')) {
        return;
      }
      const city = await AsyncStorage.getItem('city');
      const country = await AsyncStorage.getItem('country');
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const response = await fetch(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=2`);
      while (!response.ok) {
        response = await fetch(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=2`);
      }
      const data = await response.json();
      if (data) {
        const day = date.getDate() - 1;
        await AsyncStorage.setItem('Aladhan', JSON.stringify(data.data));
      }
    };

    checkStorage();
    checkAladhan();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator 
        initialRouteName='PrayerTimes'
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#0e9d87' },
        }}
      >
        <Tab.Screen 
          name='Prayer Times' 
          component={PrayerTimesScreen} 
          options={{
            tabBarLabel: 'Prayer Times',
            tabBarActiveTintColor: '#a0f0e0',
          }}  
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
