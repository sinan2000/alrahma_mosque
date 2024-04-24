import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, OpenSans_400Regular, OpenSans_300Light, OpenSans_500Medium, OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import LocalSplashScreen from './screens/SplashScreen';
import PrayerTimesScreen from './screens/PrayerTimesScreen';

const Tab = createBottomTabNavigator();

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
      // Check if prayer times data is stored
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
        await AsyncStorage.setItem('Aladhan', JSON.stringify(data.data));
      }
    };

    const generatePrayed = (year) => {
      // Calculates number of days in a given year
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const days = isLeapYear ? 366 : 365;
      const array = new Array(days).fill().map(() => [0, 0, 0, 0, 0]);
      return array;
    };

    const checkPrayed = async () => {
      // Check if prayed data is stored
      let prayed = await AsyncStorage.getItem('prayed');
      prayed = prayed ? JSON.parse(prayed) : {};
      const now = new Date();
      const year = now.getFullYear();
      if (!prayed[year]){
        prayed[year] = generatePrayed(year);
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
          tabBarStyle: { backgroundColor: '#f7f7f7' },
        }}
      >
        <Tab.Screen 
          name='Prayer Times' 
          component={PrayerTimesScreen} 
          options={{
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
