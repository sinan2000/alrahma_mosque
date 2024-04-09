import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

export default function PrayerTimesScreen() {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [hijriDate, setHijriDate] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return null;
    }

    let location = await Location.getLastKnownPositionAsync({});
    return location;
  }

  const setCityAndCountry = async (location) => {
    const { latitude, longitude } = location.coords;
    console.log(latitude, longitude);
    const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (reverseGeocode) {
      setCity(reverseGeocode[0].city);
      setCountry(reverseGeocode[0].country);
    } else {
      setErrorMsg('No known location found');
    }
  }

  const setPrayingTimes = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const response = await fetch(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=2`);
    const data = await response.json();
    if (data) {
      const day = date.getDate() - 1;
      console.log(data)
      setPrayerTimes(data.data[day].timings);
      console.log(data.data[day].timings);
      await setupHijriDate(data.data[day].date.hijri);
    } else {
      setErrorMsg('Error getting prayer times.');
      console.log('error')
    }
  };

  const setupHijriDate = async (data) => {
    const day = data.day;
    const month = data.month.en;
    const year = data.year;
    setHijriDate(`${day} ${month} ${year}`);
  }

  useEffect(() => {
    (async () => {
      const location = await getLocation();
      if (location) {
        await Promise.all([setCityAndCountry(location)]);
        await setPrayingTimes();
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Mosque Al-Rahma</Text>
      {city && <Text>City: {city}</Text>}
      {country && <Text>Country: {country}</Text>}
      {hijriDate && <Text>Hijri Date: {hijriDate}</Text>}
      {prayerTimes && Object.keys(prayerTimes).map((key, index) => (
        <Text key={index}>{key}: {prayerTimes[key]}</Text>
      ))}
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