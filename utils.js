import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

function getKeyForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}_${month.toString().padStart(2, '0')}`;
}

function getKeyForNextImsak() {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = tomorrow.getMonth() + 1;

    return `${year}_${month.toString().padStart(2, '0')}`;
}
  
function getKeysToFetch(today) {
    const keys = [getKeyForMonth(today)];
  
    if (today.getDate() < 10) {
      const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      keys.unshift(getKeyForMonth(previousMonth));
    }
  
    if (today.getDate() > 20) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      keys.push(getKeyForMonth(nextMonth));
    }
  
    return keys;
}

async function fetchPrayerTimesFromAPI(monthKey) {
    const city = await AsyncStorage.getItem('city');
    const country = await AsyncStorage.getItem('country');
    const [part1, part2] = monthKey.split('_');
    const year = parseInt(part1, 10);
    const month = parseInt(part2, 10);
    const response = await fetch(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=2`);
    while (!response.ok) {
       response = await fetch(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=2`);
    }
    const data = await response.json();
    return data.data;
}

async function fetchAndStorePrayerTimes(monthKey, aladhan) {
    const prayerTimes = await fetchPrayerTimesFromAPI(monthKey);
    aladhan[monthKey] = prayerTimes;
}  

const getKeysToPrayed = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const keys = [year];

    if (month === 0 && day <= 20) {
        keys.unshift(year - 1);
    }

    if (month === 11 && day >= 11) {
        keys.push(year + 1);
    }

    return keys;
};

const generatePrayed = (year) => {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const days = isLeapYear ? 366 : 365;
    const array = new Array(days).fill().map(() => [0, 0, 0, 0, 0]);
    return array;
};

function isOffsetDate(date, offset) {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + offset);

    const compare0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compare1 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    return compare0.getTime() === compare1.getTime();
}

function getDayOfYear (date) {
    return Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24));
};

function getEachDateIndex (date) {
    const parts = date.split('-');
    return {
        year: parseInt(parts[2], 10),
        month: parseInt(parts[1], 10),
        day: parseInt(parts[0], 10)
    };
};

async function getHijriDate (date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const response = await fetch(`http://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`);
    const data = await response.json();
    const hijriDate = data.data.hijri.date;
    const result = getEachDateIndex(hijriDate);
    return result;
};

async function getMonthlyCalendar (hijriYear, hijriMonth) {
    const response = await fetch(`http://api.aladhan.com/v1/hToGCalendar/${hijriMonth}/${hijriYear}`);
    const json = await response.json();
    const apiData = json.data;
    const calendar = [];
    const appendix = [];

    apiData.forEach((element, index) => {
        const { hijri, gregorian } = element;
        calendar.push(gregorian.date);
        if (hijri.holidays) {
            hijri.holidays.forEach((holiday) => {
                appendix.push({
                    name: holiday,
                    date: index + 1
                })
            });
        }
    })

    return { calendar, appendix };
};

export {getKeyForMonth, getKeyForNextImsak, getKeysToFetch, fetchAndStorePrayerTimes, getKeysToPrayed, generatePrayed, isOffsetDate, getDayOfYear, getHijriDate, getMonthlyCalendar, getEachDateIndex};