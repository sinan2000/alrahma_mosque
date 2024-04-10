import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import PrayerTimesScreen from './screens/PrayerTimesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

export default function App() {
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

  return (
    <NavigationContainer>
      <Tab.Navigator 
        initialRouteName='PrayerTimes'
        screenOptions={{
          tabBarActiveTintColor: '#0b3d91',
          tabBarStyle: { backgroundColor: '#0b3d91' },
        }}
      >
        <Tab.Screen 
          name='PrayerTimes' 
          component={PrayerTimesScreen} 
          options={{
            tabBarLabel: 'Prayer Times',
            tabBarActiveTintColor: 'white',
          }}  
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
