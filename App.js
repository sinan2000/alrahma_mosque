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
    SplashScreen.preventAutoHideAsync();

    setTimeout(() => {
      setSplashScreenVisibility(false);
      SplashScreen.hideAsync();
    }, 200); // TODO: Change to 1500
  }, []);

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

    const checkPrayed = async () => {
      let prayed = await AsyncStorage.getItem('prayed');
      if (prayed){
        return;
      }
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      prayed[year] = {};
      prayed[year][month] = {};
      prayed[year][month][day] = [0, 0, 0, 0, 0];

      await AsyncStorage.setItem('prayed', JSON.stringify(prayed));
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
