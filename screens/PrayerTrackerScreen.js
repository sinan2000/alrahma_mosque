import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import { getDayOfYear } from '../utils';
import { PrayerContext } from '../PrayerContext';
import TrackerRow from '../components/TrackerRow';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const screenWidth = Dimensions.get('window').width;
const margin = screenWidth * 0.1;
const maxBarWidth = screenWidth  - (margin * 2);

const window = Dimensions.get('window');
const height_scale = window.height / 100;
const width_scale = window.width / 100;

export default function PrayerTrackerScreen({ route }) {
    const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const {checkedPrayer, togglePrayer, checkPrayedForDate} = useContext(PrayerContext);
    const [year, setYear] = useState(new Date().getFullYear());
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(0);
    const { nextPrayer } = route.params;
    const { t } = useTranslation();

    useEffect(() => {
        const updates = () => {
            const newYear = currentDate.getFullYear();
            const start = getDayOfYear(currentDate);
            const daysInMonth = new Date(newYear, currentDate.getMonth() + 1, 0).getDate();
            const end = start + daysInMonth - 1;

            setYear(newYear);
            setStartIndex(start);
            setEndIndex(end);
            checkPrayedForDate(currentDate);
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
                <View style={{paddingHorizontal: width_scale * 4.7}} />
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

    const isValidToggle = (dayIndex, prayerIndex) => {
        console.log(dayIndex, prayerIndex, nextPrayer);
        const today = new Date();
        const day = new Date(year, currentDate.getMonth(), dayIndex + 1);
        const isFutureDate = day > today;
        if (isFutureDate) {
            return false;
        }
        console.log(day.toDateString(), today.toDateString());
        if(day.toDateString() === today.toDateString()) {
            const prayers = ['Imsak', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const current_index = prayers.indexOf(nextPrayer) - 1;
            return prayerIndex <= current_index;
        }
        return true;
    };

    const updateCheckedPrayer = async (dayIndex, prayerIndex) => {
        if(!isValidToggle(dayIndex, prayerIndex)) return;
        const year = currentDate.getFullYear();
        const changeDay = new Date(year, currentDate.getMonth(), dayIndex + 1);
        const dayOfYear = getDayOfYear(changeDay);
        togglePrayer(year, dayOfYear, prayerIndex);
    };

    const getMonthName = (date) => {
        const locale = `${i18n.language}-${i18n.language === 'nl' ? 'NL' : 'GB'}`;
        const options = { month: 'long' };
        return date.toLocaleDateString(locale, options);
      };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => swipeMonth(-1)}>
                    <FontAwesome name="angle-left" size={40} color="black" />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                    {currentDate && `${getMonthName(currentDate)} ${currentDate.getFullYear()}`}
                </Text>
                <TouchableOpacity onPress={() => swipeMonth(1)}>
                    <FontAwesome name="angle-right" size={40} color="black" />
                </TouchableOpacity>
            </View>
            <Text style={{textAlign: 'center', marginBottom: height_scale * 2, fontWeight: 'bold',}}>
                {t('completion')}
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
                    fontSize={width_scale * 4.7}
                    fontWeight="bold"
                    x={screenWidth / 2}
                    y="20"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {`${calculatePrayersCompleted()}%`}
                </SvgText>
            </Svg>
            <PrayerNamesHeader />
            <ScrollView style={styles.daysContainer}>
                {renderDays()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: width_scale * 2.35,
        backgroundColor: '#f2f1f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height_scale * 2,
    },
    monthYearText: {
        fontSize: width_scale * 4.2,
        fontWeight: 'bold',
        color: 'black'
    },
    dayRow: {
        flexDirection: 'row',
        marginBottom: height_scale * 1,
        justifyContent: 'space-between',
        backgroundColor: '#dddee3',
        borderRadius: 10,
    },
    dayLabel: {
        marginTop: height_scale * 1,
        //textAlign: 'right',
        marginLeft: width_scale * 4.7,
        color: 'black',
        fontSize: width_scale * 4.7,
        fontWeight: 'bold',
    },
    daysContainer: {
        flex: 1,
        marginTop: height_scale,
    },
    prayerNamesHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: width_scale * 2.35,
        marginTop: height_scale * 1.5,
    },
    prayerName: {
        textAlign: 'center',
        color: 'black',
        fontSize: width_scale * 3.7,
    },
});