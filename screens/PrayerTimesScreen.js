import React, { useContext, useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PrayerGrid from '../components/PrayerGrid';
import { PrayerContext } from '../PrayerContext';
import { getKeyForMonth, getKeyForNextImsak, fetchAndStorePrayerTimes, getKeysToFetch, isOffsetDate, getDayOfYear} from '../utils';
import { useTranslation } from 'react-i18next';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import i18n from '../i18n';

const gridNames = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function PrayerTimesScreen( { navigation }) {
  const times = require('../times.json');
  const [nextPrayer, setNextPrayer] = useState('');
  const [timeToNextPrayer, setTimeToNextPrayer] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gregorianDate, setGregorianDate] = useState('');
  const [checkButtonWidth, setCheckButtonWidth] = useState(0);
  const {checkedPrayer, loading, togglePrayer, checkPrayedForDate} = useContext(PrayerContext);
  const countdownRef = useRef(null);
  const { t } = useTranslation();

  const changeDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    checkPrayedForDate(newDate);
    setCurrentDate(newDate);
  }

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
  }

  const updateCheckedPrayer = async (index) => {
    if(!isValidToggle(index)) return;
    const year = currentDate.getFullYear();
    const dayOfYear = getDayOfYear(currentDate) - 1;
    togglePrayer(year, dayOfYear, index);
  }

  const linearGradientProps = () => {
    // Background color based on current prayer
    let colors;
    if (nextPrayer === 'sunrise') {
        colors = ['#c08423', '#aa7f81']
    } else if (nextPrayer === 'dhuhr') {
        colors = ['#a8d1f6', '#bbdaff']
    } else if (nextPrayer === 'asr') {
        colors = ['#75a1f8', '#2d59b5']
    } else if (nextPrayer === 'maghrib') {
        colors = ['#fa9e66', '#f45c43']
    } else {
        colors = ['#12232b', '#3a4881']
    }

    return {
      colors: colors,
      style: styles.linearGradient
    }
  }

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
  };

  const getNextPrayer = () => {
    const now = new Date();
    const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const prayerSeconds = Object.entries(times[currentDate.getMonth()].data[currentDate.getDate() - 1])
      .filter(([prayer, time]) => prayer !== 'day')
      .map(([prayer, time]) => {
      const [hours, minutes] = time.split(':').map(Number);
      return [prayer, hours * 3600 + minutes * 60];
    });
    console.log(prayerSeconds);
    const next = prayerSeconds.find(([_, prayerTime]) => prayerTime > seconds);
    if (next) {
      setNextPrayer(next[0]);
      startCountdown(next[1] - seconds);
    } else {
      setNextPrayer('fajr');
      getNextImsakTime().then(nextImsak => {
        startCountdown(nextImsak + 24*3600 - seconds);
      });
    }
  }

  const startCountdown = (timeToPrayer) => {
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      timeToPrayer--;
      if(timeToPrayer <= 0){
        clearInterval(countdownRef.current);
        getNextPrayer();
        return;
      }
      const hours = Math.floor(timeToPrayer / 3600);
      const minutes = Math.floor((timeToPrayer % 3600) / 60);
      const seconds = timeToPrayer % 60;
      const formattedTime = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setTimeToNextPrayer(formattedTime);
    }, 1000);
    return countdownRef.current;
  }

  useEffect(() => {
    return () => {
      if(countdownRef.current){
        clearInterval(countdownRef.current);
      }
    }
  }, []);

  useEffect(() => {
    const options = { day: 'numeric', month: 'long' };
    const locale = i18n.language === "en" ? 'en-GB' : 'nl-NL';
    
    setGregorianDate(currentDate.toLocaleDateString(locale, options));

    const isToday = isOffsetDate(currentDate, 0);
    if (!isToday) return;
    getNextPrayer();
  }, [currentDate]);

  return (
    <LinearGradient {...linearGradientProps()}>
      <StatusBar style="auto" />

      <View style={styles.container}>

        <View style={styles.celestialContainer}>
          <Image source={require('../assets/logo.png')} style={styles.stelar} />
        </View>

        <View style={styles.upperRow}>
          <Text style={styles.location}>Groningen</Text>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => changeDay(-1)}
          >
            <FontAwesome name="angle-left" size={45} color="white" />
          </TouchableOpacity>

          <View>
            <Text style={styles.date}>{gregorianDate}</Text>
          </View>

          <TouchableOpacity
            onPress={() => changeDay(1)}
          >
            <FontAwesome name="angle-right" size={45} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.prayerContainer}>
          {!loading && Object.entries(times[currentDate.getMonth()].data[currentDate.getDate() - 1]).map(([prayer, time]) => {
            if (prayer === 'day') {
              return;
            }
            const index = prayers.indexOf(prayer);
            const year = currentDate.getFullYear();
            const dayOfYear = getDayOfYear(currentDate) - 1;
            const isChecked = index != undefined ? checkedPrayer[year][dayOfYear][index] : null;
            const isNextPrayer = prayer === nextPrayer && (nextPrayer === 'Imsak' ? isOffsetDate(currentDate, 1) : isOffsetDate(currentDate, 0));
            return (
            <View key={prayer} style={[styles.prayerRow, isNextPrayer ? styles.nextPrayerFocus : {}]}>
              <Text style={styles.prayer}>{prayer.charAt(0).toUpperCase() + prayer.slice(1) }</Text>
              <View style={styles.timeAndCheckContainer}>
                <Text style={[styles.time, prayer === 'sunrise' && {marginRight: checkButtonWidth}]}>{time}</Text>
                {prayer !== 'sunrise' && (
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
          <Text style={styles.nextPrayer}>{t('next')} {timeToNextPrayer}</Text>
        </View>

        {!loading && 
          <PrayerGrid 
            prayerTimes={gridData()} 
            navigation={navigation}
            nextPrayer={nextPrayer}
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
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
  },
  container: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
  },
  date: {
    color: 'white',
    textAlign: 'center',
    fontSize: wp('3.75%'),
  },
  prayerContainer: {
    flex: 1,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.3%'),
    marginHorizontal: - wp('4.5%'),
    backgroundColor: 'transparent',
  },
  prayer: {
    fontSize: wp('4.67%'),
    color: 'white',
    marginLeft: wp('4.5%'),
  },
  time: {
    fontSize: wp('4.67%'),
    color: 'white',
    paddingRight: wp('2.25%'),
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
    fontSize: wp('3.75%'),
  },
  separator: {
    color: 'white',
    fontSize: wp('3.75%'),
  },
  nextPrayer: {
    fontSize: wp('3.75%'),
    color: 'white',
  },
  celestialContainer: {
    height: hp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stelar: {
    width: wp('23%'),
    height: hp('10%'),
    resizeMode: 'contain',
    bottom: 0,
  },
  checkButton: {
    width: hp('2.6%'),
    height: hp('2.6%'),
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
    marginRight: wp('4.5%'),
  },
  nextPrayerFocus: {
    backgroundColor: '#0e9d87',
  }
});