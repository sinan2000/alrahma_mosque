import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PrayerGrid from '../components/PrayerGrid';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';

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
  const [selectedDay, setSelectedDay] = useState(0);
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
      nextImsak = getNextImsakTime();
      startCountdown(nextImsak + 24 * 3600 - currentSeconds);
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
    const imsakTime = data[day].timings.Imsak.split(' ')[0];

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

  const changeDay = (direction) => {
    // Changes the selected day
    const month = new Date().getMonth();
    const day = new Date().getDate();
    if (day + selectedDay + direction < 1 || day + selectedDay + direction > new Date(new Date().getFullYear(), month + 1, 0).getDate()) {
      return;
    }
    setDayOfYear(dayOfYear + direction);
    setSelectedDay(selectedDay + direction);
  }

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
    if (!isValidToggle(index)) {
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

      let prefix;
      switch (selectedDay) {
        case 0:
          prefix = 'Today, ';
          break;
        case 1:
          prefix = 'Tomorrow, ';
          break;
        case -1:
          prefix = 'Yesterday, ';
          break;
        default:
          prefix = '';
      }
      setGregorianDate(`${prefix}${day + 1} ${date.toLocaleString('default', { month: 'long' })}`)
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
    marginTop: 10,
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
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  prayer: {
    fontSize: 20,
    color: 'white',
  },
  time: {
    fontSize: 20,
    color: 'white',
    paddingRight: 10,
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
    bottom: 0,
  },
  checkButton: {
    width: 24,
    height: 24,
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
  },
  nextPrayerFocus: {
    backgroundColor: '#0e9d87',
  }
});