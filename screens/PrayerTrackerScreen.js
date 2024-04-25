import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Svg, Rect } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDayOfYear } from '../utils';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PrayerTrackerScreen() {
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));;
    const [prayerData, setPrayerData] = useState({});
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
        if (!currentDate) {
            return;
        }
        const getDaysInMonth = () => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            setDaysInMonth(date.getDate());
        }
        getDaysInMonth();
    }, [currentDate]);

    const togglePrayer = (day, index) => {
        // also put if isValid
        const updatedData = { ...prayerData };
        const year = currentDate.getFullYear();
        updatedData[year][day][index] = !updatedData[year][key][index];
        setPrayerData(updatedData);
        AsyncStorage.setItem('aladhan', JSON.stringify(updatedData));
    };

    const renderDays = () => {
        if(!currentDate || prayerData.length === 0) {
            return null;
        }
        const year = currentDate.getFullYear();
        const startIndex = getDayOfYear(currentDate) - 1;
        const endIndex = startIndex + daysInMonth;

        const data = prayerData[year]?.slice(startIndex, endIndex) || [];
        console.log(data);
        return data.map((prayers, dayIndex) => (
                <View key={dayIndex} style={styles.dayRow}>
                    <Text style={styles.dayLabel}>{dayIndex + 1}</Text>
                    {prayers.map((isPrayerDone, prayerIndex) => (
                        <TouchableOpacity 
                            key={prayerIndex} 
                            style={styles.prayerCell}
                            onPress={() => togglePrayer(startIndex + dayIndex, prayerIndex)}    
                        >
                            <View style={isPrayerDone ? styles.prayed : styles.notPrayed} />
                        </TouchableOpacity>
                    ))}
                </View>
        ));
    };

    const swipeMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const calculatePrayersCompleted = () => {
        if(!currentDate || prayerData.length === 0) {
            return null;
        }
        const total = daysInMonth * 5;

        const startIndex = getDayOfYear(currentDate) - 1;
        const endIndex = startIndex + daysInMonth;
        const year = currentDate.getFullYear();
        const completed = prayerData[year]?.slice(startIndex, endIndex).reduce((acc, day) => acc + day.filter(Boolean).length, 0);
        console.log(completed);
        //console.log(Math.round((completed / total) * 100));
        return Math.round((completed / total) * 100);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => swipeMonth(-1)}>
                    <FontAwesome name="angle-left" size={30} color="black" />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                    {currentDate && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </Text>
                <TouchableOpacity onPress={() => swipeMonth(1)}>
                    <FontAwesome name="angle-right" size={30} color="black" />
                </TouchableOpacity>
            </View>
            <Svg height="40" width="100%">
                <Rect x="0" y="0" width={`${calculatePrayersCompleted()}%`} height="100%" fill="green" />
            </Svg>
            <ScrollView style={styles.daysContainer}>
                {renderDays()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    monthYearText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    dayRow: {
        flexDirection: 'row',
        marginBottom: 5,
        alignItems: 'center'
    },
    dayLabel: {
        width: 50,
        textAlign: 'right',
        marginRight: 10
    },
    prayerCell: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 5
    },
    prayed: {
        backgroundColor: 'green'
    },
    notPrayed: {
        backgroundColor: 'grey'
    },
    daysContainer: {
        flex: 1
    }
});