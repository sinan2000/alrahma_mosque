import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'expo-vector-icons/MaterialCommunityIcons';

export default function PrayerTimesScreen() {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState('');
  const [timeToNextPrayer, setTimeToNextPrayer] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const countdownRef = useRef(null);

  const getNextPrayer = () => {
    const now = new Date();
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const prayerSeconds = Object.entries(prayerTimes).map(([prayer, time]) => {
      const [hours, minutes] = time.split(':').map(Number);
      return [prayer, hours * 3600 + minutes * 60];
    });

    const next = prayerSeconds.find(([_, prayerTime]) => prayerTime > currentSeconds);

    if (next) {
      setNextPrayer(next[0]);
      startCountdown(next[1] - currentSeconds);
    } else {
      setNextPrayer('Imsak');
      startCountdown(prayerSeconds[0][1] + 24 * 3600 - currentSeconds);
    }
  }

  const startCountdown = (timeToNextPrayer) => {
    let totalSeconds = timeToNextPrayer;

    const countdown = setInterval(() => {
      totalSeconds--;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = (totalSeconds % 60);

      const formattedTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setTimeToNextPrayer(`${formattedTime}`);

      if (totalSeconds === 0) {
        clearInterval(countdown);
      }
    }, 1000);

    return countdownRef.current;
  }

  const changeDay = (direction) => {
    const month = new Date().getMonth();
    if (selectedDay + direction < 1 || selectedDay + direction >= new Date(new Date().getFullYear(), month + 1, 0).getDate()) {
      return;
    }
    setSelectedDay(selectedDay + direction);
  }

  useEffect(() => {
    const fetchInfo = async () => {
      const city = await AsyncStorage.getItem('city');
      setCity(city);
    };

    fetchInfo();

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = JSON.parse(await AsyncStorage.getItem('Aladhan'));
      const date = new Date();
      const day = date.getDate() - 1 + selectedDay;

      setPrayerTimes({
        "Imsak": data[day].timings.Imsak.split(' ')[0],
        "Sunrise": data[day].timings.Sunrise.split(' ')[0],
        "Dhuhr": data[day].timings.Dhuhr.split(' ')[0],
        "Asr": data[day].timings.Asr.split(' ')[0],
        "Maghrib": data[day].timings.Maghrib.split(' ')[0],
        "Isha": data[day].timings.Isha.split(' ')[0],
      });

      const hijriInfo = data[day].date.hijri;
      setHijriDate(`${hijriInfo.day} ${hijriInfo.month.en} ${hijriInfo.year} ${hijriInfo.designation.abbreviated}`);
      setGregorianDate(`${day + 1} ${date.toLocaleString('default', { month: 'long' })}`)
    };

    fetchInfo();
  }, [selectedDay]);

  useEffect(() => {
    if (selectedDay !== 0)
    {
      return;
    }
    if(prayerTimes) {
      getNextPrayer();
    }
  }, [prayerTimes]);

  return (
    //<View style={styles.container}>
    <ImageBackground
      source={require('../assets/background3.jpg')}
      style={styles.container}
    >
      <Text style={styles.location}>{city}</Text>
      <Text style={styles.nextPrayer}>Next prayer in {timeToNextPrayer}</Text>

      <View style={styles.dateRow}>
        <TouchableOpacity
          onPress={() => changeDay(-1)}
        >
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>

        <View>
          <Text style={styles.date}>{gregorianDate}</Text>
          <Text style={styles.date}>{hijriDate}</Text>
        </View>

        <TouchableOpacity
          onPress={() => changeDay(1)}
        >
          <Icon name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {prayerTimes && Object.entries(prayerTimes).map(([prayer, time]) => (
        <View key={prayer} style={styles.prayerRow}>
          <Text style={styles.prayer}>{prayer}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      ))}
      <StatusBar style="auto" />
    </ImageBackground>
    //</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f9f9'
  },
  location: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 20,
    marginBottom: 8,
    color: '#5e807f'
  },
  nextPrayer: {
    fontSize: 20,
    marginBottom: 16,
    fontFamily: 'OpenSans_500Medium',
    color: '#073935'
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  date: {
    textAlign: 'center',
    fontSize: 16
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1'
  },
  prayer: {
    fontSize: 20
  },
  time: {
    fontSize: 20
  }
});