import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Svg, Rect } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDayOfYear } from '../utils';
import TrackerRow from '../components/TrackerRow';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PrayerTrackerScreen() {
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));;
    const [prayerData, setPrayerData] = useState([]);
    const [currentData, setCurrentData] = useState([]);
    const [daysInMonth, setDaysInMonth] = useState(0);

    useEffect(() => {
        const getPrayerData = async () => {
            const prayed = await AsyncStorage.getItem('prayed');
            const data = prayed ? JSON.parse(prayed) : {};
            setPrayerData(data);
        }

        getPrayerData();
    }, []);

    useEffect(() => {
        const getDaysInMonth = () => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            setDaysInMonth(date.getDate());
        }
        
        if(currentDate){
            getDaysInMonth();
        }
    }, [currentDate]);

    useEffect(() => {
        const getCurrentData = async () => {
            const year = currentDate.getFullYear();
            const startIndex = getDayOfYear(currentDate) - 1;
            const endIndex = startIndex + daysInMonth;
            const data = prayerData[year].slice(startIndex, endIndex);
            setCurrentData(data);
        };
        if (prayerData[currentDate.getFullYear()]){
            getCurrentData();
        };
    }, [prayerData, currentDate]);

    const PrayerNamesHeader = () => {
        return (
            <View style={styles.prayerNamesHeaderRow}>
                <View style={{paddingHorizontal: 20}} />
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayerName, index) => (
                    <Text key={index} style={styles.prayerName}>
                        {prayerName}
                    </Text>
                ))}
            </View>
        );
    };

    const togglePrayer = (day, index) => {
        // also put if isValid
        const updatedData = { ...prayerData };
        const year = currentDate.getFullYear();
        const currIndex = day + getDayOfYear(currentDate) - 1;
        updatedData[year][currIndex][index] = !updatedData[year][currIndex][index];
        setPrayerData(updatedData);
        AsyncStorage.setItem('aladhan', JSON.stringify(updatedData));
    };

    const renderDays = () => {
        if(!currentDate || !currentData || currentData.length === 0) {
            return null;
        }

        return currentData.map((prayers, dayIndex) => (
                <View key={dayIndex} style={styles.dayRow}>
                    <Text style={styles.dayLabel}>{dayIndex + 1}</Text>
                    <TrackerRow
                        dayIndex={dayIndex}
                        prayers={prayers}
                        onTogglePrayer={togglePrayer}
                    />
                </View>
        ));
    };

    const swipeMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const calculatePrayersCompleted = () => {
        if(!currentDate || !currentData.length) {
            return 0;
        }
        const total = daysInMonth * 5;
        const completed = currentData.flat().filter(Boolean).length;

        return Math.round((completed / total) * 100);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => swipeMonth(-1)}>
                    <FontAwesome name="angle-left" size={40} color="white" />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                    {currentDate && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </Text>
                <TouchableOpacity onPress={() => swipeMonth(1)}>
                    <FontAwesome name="angle-right" size={40} color="white" />
                </TouchableOpacity>
            </View>
            <Svg height="40" width="100%">
                <Rect x="0%" y="0" width={`${calculatePrayersCompleted()}%`} height="100%" fill="green" />
            </Svg>
            <ScrollView style={styles.daysContainer}>
                <PrayerNamesHeader />
                {renderDays()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    monthYearText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    dayRow: {
        flexDirection: 'row',
        marginBottom: 5,
        alignItems: 'center'
    },
    dayLabel: {
        width: 50,
        textAlign: 'right',
        marginRight: 10,
        color: 'white'
    },
    daysContainer: {
        flex: 1
    },
    prayerNamesHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    prayerName: {
        //paddingHorizontal: 15,
        width: 40,
        textAlign: 'center',
        color: 'white'
    },
});