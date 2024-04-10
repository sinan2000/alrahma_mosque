import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';

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
      // TODO: Switch to next day's Imsak time
      startCountdown(prayerSeconds[0][1] + 24 * 3600 - currentSeconds);
    }
  }

  const startCountdown = (timeToNextPrayer) => {
    clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      timeToNextPrayer--;

      if (timeToNextPrayer <= 0) {
        clearInterval(countdownRef.current);
        getNextPrayer();
        return;
      }

      const hours = Math.floor(timeToNextPrayer / 3600);
      const minutes = Math.floor((timeToNextPrayer % 3600) / 60);
      const seconds = (timeToNextPrayer % 60);

      const formattedTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      setTimeToNextPrayer(formattedTime);
    }, 1000);

    return countdownRef.current;
  }

  const changeDay = (direction) => {
    const month = new Date().getMonth();
    const day = new Date().getDate();
    if (day + selectedDay + direction < 1 || day + selectedDay + direction > new Date(new Date().getFullYear(), month + 1, 0).getDate()) {
      return;
    }
    setSelectedDay(selectedDay + direction);
  }

  const linearGradientProps = () => {
    let colors;
    if (nextPrayer === 'Sunrise') {
        colors = ['#c08423', '#aa7f81']
    } else if (nextPrayer === 'Dhuhr') {
        colors = ['#a8d1f6', '#bbdaff']
    } else if (nextPrayer === 'Asr') {
        colors = ['#75a1f8', '#2d59b5']
    } else if (nextPrayer === 'Maghrib') {
        colors = ['#fa9e66', '#f45c43']
    } else {
        colors = ['#12232b', '#3a4881']
    }

    return {
      colors: colors,
      style: styles.linearGradient
    }
  };

  const getStelarPosition = () => {
    // TODO: Fix height positioning
    let style;
    switch (nextPrayer) {
      case 'Dhuhr':
        style = { alignSelf: 'flex-start' };
        return { source: sunIcon, style: style };
      case 'Asr':
        style = { alignSelf: 'center' };
        return { source: sunIcon, style: style };
      case 'Maghrib':
        style = { alignSelf: 'flex-end' };
        return { source: sunIcon, style: style };
      default:
        style = { alignSelf: 'center' };
        return { source: moonIcon, style: style };
    }
  };

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

  const celestialBody = getStelarPosition();
  return (
    <LinearGradient {...linearGradientProps()}>
      <StatusBar style="auto" />

      <View style={styles.container}>

        <View style={styles.celestialContainer}>
          <Image source={celestialBody.source} style={[styles.stelar, celestialBody.style]} />
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => changeDay(-1)}
          >
            <FontAwesome name="angle-left" size={35} color="white" />
          </TouchableOpacity>

          <View>
            <Text style={styles.date}>{gregorianDate}</Text>
            <Text style={styles.date}>{hijriDate}</Text>
          </View>

          <TouchableOpacity
            onPress={() => changeDay(1)}
          >
            <FontAwesome name="angle-right" size={35} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.prayerContainer}>
          {prayerTimes && Object.keys(prayerTimes).length > 0 && Object.entries(prayerTimes).map(([prayer, time]) => (
            <View key={prayer} style={styles.prayerRow}>
              <Text style={styles.prayer}>{prayer}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.location}>{city}</Text>
          <Text stlye={styles.separator}>|</Text>
          <Text style={styles.nextPrayer}>Next prayer in {timeToNextPrayer}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  container: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  date: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  },
  prayerContainer: {
    flex: 1,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  prayer: {
    fontSize: 20,
    color: 'white',
  },
  time: {
    fontSize: 20,
    color: 'white',
  },
  bottomRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    color: 'white',
    fontSize: 16,
  },
  separator: {
    color: 'white',
    fontSize: 16,
  },
  nextPrayer: {
    fontSize: 16,
    color: 'white',
  },
  celestialContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stelar: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  }
});