import React, { useState, useEffect } from 'react';
import { ScrollView, View,  Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHijriDate, getMonthlyCalendar, getEachDateIndex } from '../utils';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const window = Dimensions.get('window');
const heightScale = window.height/ 100;
const widthScale = window.width / 100;
 
const islamicMonths = ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HijriScreen() {
    const [hijriDate, setHijriDate] = useState({ day: null, month: null, year: null});
    const [hijriCalendar, setHijriCalendar] = useState({});
    const [focusedDate, setFocusedDate] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        const fetchHijriData = async () => {
            try{
            const today = new Date();
            const date = await getHijriDate(today);
            setHijriDate(date);
            setFocusedDate(date.day);

            const storage = await AsyncStorage.getItem('Hijri') || '{}';
            let hijri = JSON.parse(storage);
            setHijriCalendar(hijri);
            } catch (error) {
                alert(t('notconnected'));
            }
        };

        fetchHijriData();
    }, []);

    const fetchAndStoreHijriData = async (year, month) => {
        const { calendar, appendix } = await getMonthlyCalendar(year, month);

        const newHijri = {...hijriCalendar};
        if (!newHijri[year]) {
            newHijri[year] = {};
        }
        newHijri[year][month] = { calendar, holidays: appendix };
        setHijriCalendar(newHijri);
    };

    const updateMonth = async (direction) => {
        setFocusedDate('');
        let {day, month, year} = hijriDate;
        if (month + direction > 12) {
            month = 1;
            year++;
        } else if (month + direction < 1) {
            month = 12;
            year--;
        } else {
            month += direction;
        }

        if(!hijriCalendar[year] || !hijriCalendar[year][month]) {
            await fetchAndStoreHijriData(year, month);
        }
        setHijriDate({day, month, year});
    };

    const handleFocusedDate = (date) => {
        const noDays = hijriCalendar[hijriDate.year][hijriDate.month].calendar.length;
        if (date < 1 || date > noDays) return;
        setFocusedDate(date);
    };

    const renderCalendarCells = () => {
        if(!hijriDate.year || !hijriDate.month || !hijriCalendar[hijriDate.year] || !hijriCalendar[hijriDate.year][hijriDate.month]) return null;

        let cells = [];
        const {day, month, year} = getEachDateIndex(hijriCalendar[hijriDate.year][hijriDate.month].calendar[0]);
        const dayOfWeek = new Date(year, month - 1, day).getDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        console.log(new Date(year, month - 1, day), dayOfWeek, offset);
        const numberOfDays = hijriCalendar[hijriDate.year][hijriDate.month].calendar.length;

        let dayHeaders = daysOfWeek.map((day, index) => (
            <Text key={`day-header-${index}`} style={styles.dayHeader}>
                {day}
            </Text>
        ));
    
        cells.push(
            <View key="day-headers" style={styles.weekRow}>
                {dayHeaders}
            </View>
        );

        let count = 0;
        for (let i = 0; i < 6; i++) {
            let week = [];
            for (let j = 0; j < 7; j++) {
                if (i === 5 && j === 0 && count >= numberOfDays) break;
                let day = null;
                if (i === 0 && j >= offset) {
                    count++;
                    day = count;
                } else if (i > 0 && count < numberOfDays) {
                    count++;
                    day = count;
                } else if (count >= numberOfDays) {
                    count++;
                }
                const presser = count;
                week.push(
                    <TouchableOpacity 
                        key={`cell-${i}-${j}`} 
                        style={[styles.cell, focusedDate === presser ? {backgroundColor: '#0e9d87'} : {}]} 
                        onPress={() => handleFocusedDate(presser)}>
                        {day && <Text style={styles.textInCell}>{day}</Text>}
                    </TouchableOpacity>        
                );
            }
            cells.push(
                <View key={`row-${i}`} style={styles.weekRow}>
                    {week}
                </View>
            );
        }
        return cells;
    };

    const renderSelectedDate = () => {
        if(!hijriDate.year || !hijriDate.month || !hijriCalendar[hijriDate.year] || !hijriCalendar[hijriDate.year][hijriDate.month]) return null;

        if (focusedDate === '') return null;
        const data = hijriCalendar[hijriDate.year][hijriDate.month].calendar[focusedDate - 1];
        const { day, month, year } = getEachDateIndex(data);
        const display = new Date(year, month - 1, day);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const locale = `${i18n.language}-${i18n.language === 'nl' ? 'NL' : 'GB'}`;
        const formattedDate = display.toLocaleDateString(locale, options);
        return (
            <View style={styles.selectedDateContainer}>
                <View style={styles.selectedDateTextContainer}>
                    <Text style={styles.selectedDateText}>{formattedDate}</Text>
                </View>
            </View>
        )
    }

    const renderHolidays = () => {
        if(!hijriDate.year || !hijriDate.month || !hijriCalendar[hijriDate.year] || !hijriCalendar[hijriDate.year][hijriDate.month]) return null;
        const data = hijriCalendar[hijriDate.year][hijriDate.month];
        if (!data || !data.holidays || data.holidays.length === 0) return null;

        return (
            <View style={styles.holidaysContainer}>
                <Text style={styles.holidaysHeader}>{t('holidays')}</Text>
                {data.holidays.map((holiday, index) => {
                    const dateIndex = holiday.date;
                    const gregorianDate = data.calendar[dateIndex - 1];
                    const { day, month, year } = getEachDateIndex(gregorianDate);
                    const display = new Date(year, month - 1, day);
                    const options = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    };
                    const locale = `${i18n.language}-${i18n.language === 'nl' ? 'NL' : 'GB'}`;
                    const formattedDate = display.toLocaleDateString(locale, options);
                    return (
                    <View key={`holiday-${index}`} style={styles.holidayItem}>
                        <Text style={styles.holidayName}>{holiday.name}</Text>
                        <Text style={styles.holidayDate}>{holiday.date} {islamicMonths[hijriDate.month - 1]} {hijriDate.year} | {formattedDate}</Text>
                    </View>
                    );
                })}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => updateMonth(-1)}
                >
                    <FontAwesome name="angle-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.monthText}>{hijriDate && islamicMonths[hijriDate.month - 1]}</Text>
                <Text style={styles.yearText}>{hijriDate && hijriDate.year}</Text>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => updateMonth(1)}    
                >
                    <FontAwesome name="angle-right" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
                {renderCalendarCells()}
            </View>
            {renderSelectedDate()}
            {renderHolidays()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f1f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: widthScale * 3.5,
        backgroundColor: '#eaeaea',
    },
    monthText: {
        fontSize: 22,
    },
    yearText: {
        fontSize: 18,
    },
    navButton: {
        padding: widthScale * 2.3,
    },
    calendarGrid: {
        padding: widthScale * 3.5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    cell: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        margin: widthScale * 0.4,
    },
    dayHeader: {
        width: 50,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: heightScale,
    },
    textInCell: {
        textAlign: 'center',
        margin: 'auto',
        fontWeight: 'bold',
    },
    selectedDateContainer: {
        alignItems: 'center',
    },
    selectedDateText: {
        color: 'black',
        fontSize: widthScale * 3.7,
    },
    selectedDateTextContainer: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 10,
        padding: widthScale * 2.3,
    },
    holidaysContainer: {
        padding: widthScale * 2.3,
        width: '100%',
    },
    holidaysHeader: {
        fontSize: widthScale * 4.2,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: heightScale,
        textAlign: 'center',
    },
    holidayName: {
        fontSize: widthScale * 4.2,
        fontWeight: 'bold',
        color: 'black',
    },
    holidayDate: {
        fontSize: widthScale * 3.2,
        color: 'gray',
        marginTop: heightScale * 0.5,
    },
    holidayItem: {
        padding: widthScale * 2.3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cccccc',
        marginBottom: heightScale,
        alignItems: 'flex-start',
        marginHorizontal: widthScale * 2.3,
    },
});