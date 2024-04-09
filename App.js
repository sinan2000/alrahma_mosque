import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import PrayerTimesScreen from './screens/PrayerTimesScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="PrayerTimes">
        <Drawer.Screen name="PrayerTimes" component={PrayerTimesScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
