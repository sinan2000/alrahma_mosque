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
import QiblaScreen from './screens/QiblaScreen';
import MoreScreen from './screens/MoreScreen';
import NamesScreen from './screens/NamesScreen';
import DuaScreen from './screens/DuaScreen';
import HijriScreen from './screens/HijriScreen';
import { PrayerProvider } from './PrayerContext';
import { getKeysToFetch, fetchAndStorePrayerTimes, getHijriDate, getMonthlyCalendar } from './utils';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next'; 
//import db from './firebaseConfig';
//import { collection, getDocs } from 'firebase/firestore';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isSplashScreenVisible, setSplashScreenVisibility] = useState(true);
  const { t } = useTranslation();

  let [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_300Light,
    OpenSans_500Medium,
    OpenSans_700Bold,
  });

  function PrayerStackScreen() {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="PrayerTimes" 
          component={PrayerTimesScreen} 
          options={{ 
            headerShown: true, 
            title: t('times')
          }} 
        />
        <Stack.Screen 
          name="PrayerTracker" 
          component={PrayerTrackerScreen} 
          options={{ 
            headerShown: true, 
            title: t('tracker'),
          }}
        />
      </Stack.Navigator>
    );
  }
  
  function MoreStackScreen() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="More"
          component={MoreScreen}
          options={{
            headerShown: true,
            title: t('more'),
          }}
        />
        <Stack.Screen
          name="Names"
          component={NamesScreen}
          options={{
            headerShown: true,
            title: t('names'),
          }}
        />
        <Stack.Screen
          name="Dua"
          component={DuaScreen}
          option={{
            headerShown: true,
            title: t('duas'),
          }}
        />
        <Stack.Screen 
          name="PrayerTracker" 
          component={PrayerTrackerScreen} 
          options={{ 
            headerShown: true, 
            title: t('tracker'),
          }}
        />
      </Stack.Navigator>
    );
  }

  useEffect(() => {
    // Splash Screen
    SplashScreen.preventAutoHideAsync();

    setTimeout(() => {
      setSplashScreenVisibility(false);
      SplashScreen.hideAsync();
    }, 2000);
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
      //const location = await getLocation();
      //if (location) {
      //  await setCityAndCountry(location);
      //} else {
      await AsyncStorage.setItem('city', 'Groningen');
      await AsyncStorage.setItem('country', 'Netherlands');
      //}
    };

    const retrieveLocation = async () => {
      const city = await AsyncStorage.getItem('city');
      const country = await AsyncStorage.getItem('country');
      return {city, country};
    }

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

    const retrieveDb = async () => {
      const monthYear = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
      const querySnapshot = await getDocs(collection(db, 'prayerTimes'));
      querySnapshot.forEach((doc) => {
        if (doc.id === monthYear) {
          const data = doc.data();
          console.log(data);
        }
      });
    };

    const checkPrayerTimes = async () => {
      const { city, country } = await retrieveLocation();
      if (city == 'Groningen' && country == 'Netherlands') {
        retrieveDb();
      } else {
       checkAladhan();
      }
    };

    const fetchAndStoreHijriData = async (hijri, year, month) => {
      if (!hijri[year] || !hijri[year][month]) {
        const { calendar, appendix } = await getMonthlyCalendar(year, month);
        if (!hijri[year]) {
          hijri[year] = {};
        }
        hijri[year][month] = { calendar, holidays: appendix };
      }
    };

    const checkHijri = async () => {
      const storedData = await AsyncStorage.getItem('Hijri') || '{}';
      let hijri = JSON.parse(storedData);
      const today = new Date();
      const hijriDate = await getHijriDate(today);

      const prevMonth = hijriDate.month === 1 ? 12 : hijriDate.month - 1;
      const prevYear = hijriDate.month === 1? hijriDate.year - 1 : hijriDate.year;
      const nextMonth = hijriDate.month === 12 ? 1 : hijriDate.month + 1;
      const nextYear = hijriDate.month === 12 ? hijriDate.year + 1 : hijriDate.year;

      await Promise.all([
        fetchAndStoreHijriData(hijri, prevYear, prevMonth),
        fetchAndStoreHijriData(hijri, hijriDate.year, hijriDate.month),
        fetchAndStoreHijriData(hijri, nextYear, nextMonth)
      ]);

      await AsyncStorage.setItem('Hijri', JSON.stringify(hijri));
    };

    checkStorage();
    checkAladhan();
    //checkPrayerTimes();
    checkHijri();
  }, []);

  if (!fontsLoaded || isSplashScreenVisible) {
    return <LocalSplashScreen />;
  }

  return (
    <PrayerProvider>
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
            tabBarLabel: t('times'),
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
        <Tab.Screen 
          name='Qibla' 
          component={QiblaScreen} 
          options={{
            headerShown: true,
            title: t('qibla'),
            tabBarLabel: t('qibla'),
            tabBarActiveTintColor: '#0e9d87',
            tabBarIcon: ({ focused, color, size }) => (
              <Image 
                source={require('./assets/qibla.png')}
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
        <Tab.Screen 
          name='Hijri'
          component={HijriScreen}
          options={{
            headerShown: true,
            title: t('hijri'),
            tabBarLabel: t('calendar'),
            tabBarActiveTintColor: '#0e9d87',
            tabBarIcon: ({ focused, color, size }) => (
              <Image 
                source={require('./assets/hijri.png')}
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
        <Tab.Screen
          name='Additional' 
          component={MoreStackScreen} 
          options={{
            headerShown: false,
            tabBarLabel: t('more'),
            tabBarActiveTintColor: '#0e9d87',
            tabBarIcon: ({ focused, color, size }) => (
              <Image 
                source={require('./assets/more.png')}
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
    </PrayerProvider>
  );
}
