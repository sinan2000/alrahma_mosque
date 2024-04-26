import React, { useContext, useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PrayerGrid from '../components/PrayerGrid';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';
import { PrayerContext } from '../PrayerContext';
import { getKeyForMonth, getKeyForNextImsak, fetchAndStorePrayerTimes, getKeysToFetch, isOffsetDate, getDayOfYear} from '../utils';

const gridNames = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
const prayers = ['Imsak', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function PrayerTimesScreen( { navigation }) {
  const [city, setCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState('');
  const [timeToNextPrayer, setTimeToNextPrayer] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkButtonWidth, setCheckButtonWidth] = useState(0);
  const {checkedPrayer, loading, togglePrayer, checkPrayedForDate} = useContext(PrayerContext);
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

  const changeDay = (direction) => {
    // Changes the selected day
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    checkTimesForNewDate(newDate);
    checkPrayedForDate(newDate);
    setCurrentDate(newDate);
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

  const isValidToggle = (index) => {
    const today = new Date();
    const isFutureDate = currentDate > today;
    if (isFutureDate) {
      return false;
    }
    if (currentDate.toDateString() === today.toDateString()) {
      const current_index = prayers.indexOf(nextPrayer) - 1;
      return index <= current_index;
    }
    return true;
  };

  const updateCheckedPrayer = async (index) => {
    if (!isValidToggle(index)) return;
    const year = currentDate.getFullYear();
    const dayOfYear = getDayOfYear(currentDate) - 1;
    togglePrayer(year, dayOfYear, index);
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
    const currentDay = today.getDay();
    const diffToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);

    const weekData = [];
    for (let i = 0; i < 5; i++){
      const prayers = [];
      for (let j = 0; j < 7; j++){
        let day = new Date(monday);
        day.setDate(day.getDate() + j);

        const year = day.getFullYear();
        const dayOfYear = getDayOfYear(day) - 1;
        
        const exists = checkedPrayer[year] && checkedPrayer[year][dayOfYear];
        const data = exists ? checkedPrayer[year][dayOfYear] : [0, 0, 0, 0, 0];
        prayers.push(data[i]);
      }
      
      weekData.push({
        time: gridNames[i],
        days: prayers
      });
    }

    return weekData;
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
    const isToday = isOffsetDate(currentDate, 0);

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
            const year = currentDate.getFullYear();
            const dayOfYear = getDayOfYear(currentDate) - 1;
            const isChecked = index != undefined ? checkedPrayer[year][dayOfYear][index] : null;
            const isNextPrayer = prayer === nextPrayer && (nextPrayer === 'Imsak' ? isOffsetDate(currentDate, 1) : isOffsetDate(currentDate, 0));
            return (
            <View key={prayer} style={[styles.prayerRow, isNextPrayer ? styles.nextPrayerFocus : {}]}>
              <Text style={styles.prayer}>{prayer}</Text>
              <View style={styles.timeAndCheckContainer}>
                <Text style={[styles.time, prayer === 'Sunrise' && {marginRight: checkButtonWidth}]}>{time}</Text>
                {prayer !== 'Sunrise' && (
                   <CheckButton 
                    isChecked={isChecked} 
                    onPress={() => updateCheckedPrayer(index)} 
                    />
                )}
              </View>
            </View>
            );
          })}
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.nextPrayer}>Next prayer in {timeToNextPrayer}</Text>
        </View>

        {!loading && 
          <PrayerGrid 
            prayerTimes={gridData()} 
            navigation={navigation}
          />}
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