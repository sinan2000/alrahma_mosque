import AsyncStorage from '@react-native-async-storage/async-storage';

function getKeyForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
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
  
export {getKeyForMonth, getKeyForNextImsak, getKeysToFetch, fetchAndStorePrayerTimes};