import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PrayerTimesScreen() {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      const city = await AsyncStorage.getItem('city');
      setCity(city);
      
      const data = JSON.parse(await AsyncStorage.getItem('Aladhan'));
      const date = new Date();
      const day = date.getDate() - 1;
      
      setPrayerTimes({
        "Imsak": data[day].timings.Imsak.split(' ')[0],
        "Sunrise": data[day].timings.Sunrise.split(' ')[0],
        "Dhuhr": data[day].timings.Dhuhr.split(' ')[0],
        "Asr": data[day].timings.Asr.split(' ')[0],
        "Maghrib": data[day].timings.Maghrib.split(' ')[0],
        "Isha": data[day].timings.Isha.split(' ')[0],
      });

      const hijriInfo = data[day].date.hijri;
      setHijriDate(`${hijriInfo.day} ${hijriInfo.month.en} ${hijriInfo.year}`);

    };

    fetchInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Mosque Al-Rahma</Text>
      {city ? <Text>{city}</Text> : null}
      {prayerTimes ? (
        <View>
          <Text>Imsak: {prayerTimes.Imsak}</Text>
          <Text>Sunrise: {prayerTimes.Sunrise}</Text>
          <Text>Dhuhr: {prayerTimes.Dhuhr}</Text>
          <Text>Asr: {prayerTimes.Asr}</Text>
          <Text>Maghrib: {prayerTimes.Maghrib}</Text>
          <Text>Isha: {prayerTimes.Isha}</Text>
        </View>
      ) : null}
      {hijriDate ? <Text>{hijriDate}</Text> : null}
      <StatusBar style="auto" />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});