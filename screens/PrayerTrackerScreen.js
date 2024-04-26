import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import { getDayOfYear } from '../utils';
import { PrayerContext } from '../PrayerContext';
import TrackerRow from '../components/TrackerRow';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const screenWidth = Dimensions.get('window').width;
const margin = screenWidth * 0.1;
const maxBarWidth = screenWidth  - (margin * 2);

export default function PrayerTrackerScreen() {
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const {checkedPrayer, loading, togglePrayer, checkPrayedForDate} = useContext(PrayerContext);
    const [year, setYear] = useState(new Date().getFullYear());
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);

    useEffect(() => {
        const updates = () => {
            const newYear = currentDate.getFullYear();
            const start = getDayOfYear(currentDate);
            const daysInMonth = new Date(newYear, currentDate.getMonth() + 1, 0).getDate();
            const end = start + daysInMonth - 1;

            setYear(newYear);
            setStartIndex(start);
            setEndIndex(end);
        };

        updates();
    }, [currentDate]);

    const swipeMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const calculatePrayersCompleted = () => {
        // if ... return 0
        const prayers = checkedPrayer[year].slice(startIndex, endIndex);

        const total = (endIndex - startIndex) * 5;
        const completed = prayers.flat().filter(Boolean).length;

        return Math.round((completed / total) * 100);
    };

    const calculateBarWidth = () => {
        const filledWidth = calculatePrayersCompleted() / 100 * maxBarWidth;
        return filledWidth;
    }

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

    const renderDays = () => {
        // return null
        const data = checkedPrayer[year].slice(startIndex, endIndex);

        return data.map((prayers, dayIndex) => (
                <View key={dayIndex} style={styles.dayRow}>
                    <Text style={styles.dayLabel}>{dayIndex + 1}</Text>
                    <TrackerRow
                        dayIndex={dayIndex}
                        prayers={prayers}
                        onTogglePrayer={updateCheckedPrayer}
                    />
                </View>
        ));
    };

    const updateCheckedPrayer = async (dayIndex, prayerIndex) => {
        const year = currentDate.getFullYear();
        const changeDay = new Date(year, currentDate.getMonth(), dayIndex + 1);
        const dayOfYear = getDayOfYear(changeDay);
        togglePrayer(year, dayOfYear, prayerIndex);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => swipeMonth(-1)}>
                    <FontAwesome name="angle-left" size={40} color="black" />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                    {currentDate && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </Text>
                <TouchableOpacity onPress={() => swipeMonth(1)}>
                    <FontAwesome name="angle-right" size={40} color="black" />
                </TouchableOpacity>
            </View>
            <Text style={{textAlign: 'center', marginBottom: 10, fontWeight: 'bold',}}>
                Prayer Completion Rate
            </Text>
            <Svg height="40" width="100%">
                <Rect
                    x={margin}
                    y="0"
                    width={maxBarWidth}
                    height="100%"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                />
                <Rect 
                    x={margin} 
                    y="0" 
                    width={calculateBarWidth()} 
                    height="100%" 
                    fill="#0e9d87" 
                />
                <SvgText
                    fill="black"
                    stroke="none"
                    fontSize="20"
                    fontWeight="bold"
                    x={screenWidth / 2}
                    y="20"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {`${calculatePrayersCompleted()}%`}
                </SvgText>
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
        backgroundColor: '#f2f1f6',
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
        color: 'black'
    },
    dayRow: {
        flexDirection: 'row',
        marginBottom: 5,
        justifyContent: 'space-between',
        backgroundColor: '#dddee3',
        borderRadius: 10,
        marginBottom: 10,
    },
    dayLabel: {
        marginTop: 10,
        //textAlign: 'right',
        marginLeft: 20,
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    daysContainer: {
        flex: 1,
        marginTop: 10,
    },
    prayerNamesHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    prayerName: {
        //paddingHorizontal: 15,
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
    },
});