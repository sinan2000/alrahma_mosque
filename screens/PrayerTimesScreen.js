import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PrayerGrid from '../components/PrayerGrid';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';
import { getKeyForMonth, getKeyForNextImsak, fetchAndStorePrayerTimes, getKeysToFetch, getKeysToPrayed } from '../utils';

const weekPrayers = [
  { time: 'FAJR', days: [false, true, false, true, false, true, false] },
  { time: 'DHUHR', days: [true, true, true, true, false, false, true] },
  { time: 'ASR', days: [true, true, true, true, true, true, true] },
  { time: 'MAGHRIB', days: [true, true, true, true, true, true, true] },
  { time: 'ISHA', days: [true, true, true, true, true, true, true] },
]

const gridNames = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
const prayers = ['Imsak', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function PrayerTimesScreen() {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState('');
  const [timeToNextPrayer, setTimeToNextPrayer] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkButtonWidth, setCheckButtonWidth] = useState(0);
  const [checkedPrayer, setCheckedPrayer] = useState({});
  const [loading, setLoading] = useState(true);
  const [dayOfYear, setDayOfYear] = useState(0);
  const [todayDayOfYear, setTodayDayOfYear] = useState(0);
  const countdownRef = useRef(null);

  const getNextPrayer = () => {
    // Gets the next prayer from the current time
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
      getNextImsakTime().then(nextImsak => {
        startCountdown(nextImsak + 24 * 3600 - currentSeconds);
      });
    }
  }

  const getNextImsakTime = async () => {
    // Gets number of seconds until next imsak time
    const data = JSON.parse(await AsyncStorage.getItem('Aladhan'));
    const date = new Date();
    const day = date.getDate();
    // TODO: Think of last day of month retrieval
    if (length(data) < day) {
      return;
    }
    const key = getKeyForNextImsak();
    const imsakTime = data[key][day].timings.Imsak.split(' ')[0];

    const [hours, minutes] = imsakTime.split(':').map(Number);
    const imsakSeconds = hours * 3600 + minutes * 60;
    return imsakSeconds;
  };

  const startCountdown = (timeToNextPrayer) => {
    // Sets countdown to next prayer
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

  const checkTimesForNewDate = async (date) => {
    // Checks if the prayer times for the new date are available
    const aladhan = JSON.parse(await AsyncStorage.getItem('Aladhan')) || {};
    const keysToFetch = getKeysToFetch(date);
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

  const checkPrayedForNewDate = async (date) => {
      // Check if prayed data is stored
      let prayed = await AsyncStorage.getItem('prayed');
      prayed = prayed ? JSON.parse(prayed) : {};
      const now = new Date();
      const years = getKeysToPrayed(now);

      let update = false;

      years.forEach((year) => {
        if (!prayed[year]) {
          prayed[year] = generatePrayed(year);
          update = true;
        }
      })
      
      if(update){
        await AsyncStorage.setItem('prayed', JSON.stringify(prayed));
      }
  };

  const changeDay = (direction) => {
    // Changes the selected day
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    checkTimesForNewDate(newDate);
    checkPrayedForNewDate(newDate);
    setCurrentDate(newDate);

    const newDayOfYear = Math.ceil((newDate - new Date(newDate.getFullYear(), 0, 1)) / 86400000);	
    setDayOfYear(newDayOfYear);
  };

  const linearGradientProps = () => {
    // Background color based on current prayer
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
    // Styling for stelar object based on current prayer
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

  const getCheckedPrayer = async () => {
    // Sets the checked prayer object
    const object = await AsyncStorage.getItem('prayed');
    const year = new Date().getFullYear();
    const data = object ? JSON.parse(object) : {};
    if (data && data[year]) {
      setCheckedPrayer(data[year]);
      setLoading(false);
    };
  };

  const isValidToggle = (index) => {
  };

  const updateCheckedPrayer = async (index) => {
    if (isValidToggle(index)) {
      return;
    };
    let updatedPrayer = checkedPrayer;
    updatedPrayer[dayOfYear][index] = !updatedPrayer[dayOfYear][index];
    setCheckedPrayer({...updatedPrayer});

    let object = {};
    object[new Date().getFullYear()] = updatedPrayer;
    await AsyncStorage.setItem('prayed', JSON.stringify(object));
  };

  const CheckButton = ({ isChecked, onPress }) => (
    <TouchableOpacity 
      onLayout={(event) => {
        const {width} = event.nativeEvent.layout;
        setCheckButtonWidth(width);
      }}
      onPress={onPress} 
      style={[styles.checkButton, isChecked ? styles.checked : {}]}>
      <AntDesign name="check" size={17} color="black" />
    </TouchableOpacity>
  );

  const gridData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysFromMonday = (dayOfWeek + 6) % 7;
    const monday = todayDayOfYear - daysFromMonday;
    const sunday = monday + 6;
    const data = [];
    for (let i = 0; i < 5; i++) {
      const prayers = [];
      for (let j = 0; j < 7; j++) {
        prayers.push(checkedPrayer[monday + j][i]);
      }
      data.push({ time: gridNames[i], days: prayers });
    }
    return data;
  }

  useEffect(() => {
    const setDay = () => {
      const now = new Date();
      const year = now.getFullYear();
      const start = new Date(year, 0, 1);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const day = Math.floor(diff / oneDay);
      setDayOfYear(day);
      setTodayDayOfYear(day);
    }
    const fetchInfo = async () => {
      const city = await AsyncStorage.getItem('city');
      setCity(city);
      setDay();
      await getCheckedPrayer();
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
      const key = getKeyForMonth(currentDate);
      const day = currentDate.getDate() - 1;

      setPrayerTimes({
        "Imsak": data[key][day].timings.Imsak.split(' ')[0],
        "Sunrise": data[key][day].timings.Sunrise.split(' ')[0],
        "Dhuhr": data[key][day].timings.Dhuhr.split(' ')[0],
        "Asr": data[key][day].timings.Asr.split(' ')[0],
        "Maghrib": data[key][day].timings.Maghrib.split(' ')[0],
        "Isha": data[key][day].timings.Isha.split(' ')[0],
      });

      const hijriInfo = data[key][day].date.hijri;
      setHijriDate(`${hijriInfo.day} ${hijriInfo.month.en} ${hijriInfo.year} ${hijriInfo.designation.abbreviated}`);

      const formatDate = (date) => {
        const options = { month: 'long', day: 'numeric'};
        return date.toLocaleDateString(undefined, options);
      }
      
      setGregorianDate(formatDate(currentDate));
    };

    fetchInfo();
  }, [currentDate]);

  useEffect(() => {
    const today = new Date();
    const isToday = currentDate.getDate() === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();
    if (!isToday || !prayerTimes)
    {
      return;
    }
    getNextPrayer();
  }, [prayerTimes]);

  const celestialBody = getStelarPosition();
  return (
    <LinearGradient {...linearGradientProps()}>
      <StatusBar style="auto" />

      <View style={styles.container}>

        <View style={styles.celestialContainer}>
          <Image source={celestialBody.source} style={[styles.stelar, celestialBody.style]} />
        </View>

        <View style={styles.upperRow}>
          <Text style={styles.location}>{city}</Text>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => changeDay(-1)}
          >
            <FontAwesome name="angle-left" size={45} color="white" />
          </TouchableOpacity>

          <View>
            <Text style={styles.date}>{gregorianDate}</Text>
            <Text style={styles.date}>{hijriDate}</Text>
          </View>

          <TouchableOpacity
            onPress={() => changeDay(1)}
          >
            <FontAwesome name="angle-right" size={45} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.prayerContainer}>
          {prayerTimes && !loading && Object.keys(prayerTimes).length > 0 && Object.entries(prayerTimes).map(([prayer, time]) => {
            const index = prayers.indexOf(prayer);
            const isChecked = index != undefined ? checkedPrayer[dayOfYear][index] : null;
            const isNextPrayer = prayer === nextPrayer;
            return (
            <View key={prayer} style={[styles.prayerRow, isNextPrayer ? styles.nextPrayerFocus : {}]}>
              <Text style={styles.prayer}>{prayer}</Text>
              <View style={styles.timeAndCheckContainer}>
                <Text style={[styles.time, prayer === 'Sunrise' && {marginRight: checkButtonWidth}]}>{time}</Text>
                {prayer != 'Sunrise' ? <CheckButton isChecked={isChecked} onPress={() => updateCheckedPrayer(index)} /> : null}
              </View>
            </View>
            );
          })}
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.nextPrayer}>Next prayer in {timeToNextPrayer}</Text>
        </View>

        {!loading && <PrayerGrid prayerTimes={gridData()} />}
      </View>
    </LinearGradient>
  );
}

const window = Dimensions.get('window');
const height_scale = window.height / 100;
const width_scale = window.width / 100;
const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: width_scale * 4.5,
    paddingTop: height_scale * 2,
    paddingBottom: height_scale,
  },
  container: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height_scale,
    marginBottom: height_scale * 2,
  },
  date: {
    color: 'white',
    textAlign: 'center',
    fontSize: width_scale * 3.75,
  },
  prayerContainer: {
    flex: 1,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height_scale * 1.25,
    marginHorizontal: -width_scale * 4.5,
    backgroundColor: 'transparent',
  },
  prayer: {
    fontSize: width_scale * 4.67,
    color: 'white',
    marginLeft: width_scale * 4.5,
  },
  time: {
    fontSize: width_scale * 4.67,
    color: 'white',
    paddingRight: width_scale * 2.25,
  },
  bottomRow:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  location: {
    color: 'white',
    fontSize: width_scale * 3.75,
  },
  separator: {
    color: 'white',
    fontSize: width_scale * 3.75,
  },
  nextPrayer: {
    fontSize: width_scale * 3.75,
    color: 'white',
  },
  celestialContainer: {
    height: height_scale * 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stelar: {
    width: width_scale * 23,
    height: height_scale * 10,
    resizeMode: 'contain',
    bottom: 0,
  },
  checkButton: {
    width: height_scale * 2.6,
    height: height_scale * 2.6,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  checked: {
    backgroundColor: 'white',
  },
  timeAndCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: width_scale * 4.5,
  },
  nextPrayerFocus: {
    backgroundColor: '#0e9d87',
  }
});