import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const islamicMonths = ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"]

export default function HijriScreen() {
    const [hijriData, setHijriData] = useState({});
    const [currentHijri, setCurrentHijri] = useState({});
    const [shouldInitialize, setShouldInitialize] = useState(true);

    useEffect(() => {
        const checkStorage = async () => {
            try {
                const data = await AsyncStorage.getItem('Hijri');
                if (data) {
                    setHijriData(JSON.parse(data));
                } else {
                    const currentDate = new Date();
                    const month = currentDate.getMonth() + 1;
                    const year = currentDate.getFullYear();
                    const info = await fetchCalendar(month, year);
                    const restructuredData = restructureData(info);
                    await AsyncStorage.setItem('Hijri', JSON.stringify(restructuredData));
                    setHijriData(info);
                }
            } catch (error) {
                console.error(error);
            }
        };

        checkStorage().then(() => {
            const calendar = initializeCalendar(hijriData);
            if (calendar) {
                setCurrentHijri(calendar);
            }
        });
    }, []);

    useEffect(() => {
        if (hijriData && shouldInitialize) {
            const calendar = initializeCalendar(hijriData);
            if (calendar) {
                setCurrentHijri(calendar);
            }
        }
    }, [hijriData]);

    const initializeCalendar = (hijriData) => {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;
        for (const year in hijriData) {
            for (const month in hijriData[year]) {
                if(hijriData[year][month].includes(formattedDate)) {
                    return {year, month};
                }
            }
        }
        return null;
    };

    const fetchCalendar = async (month, year) => {
        try {
            response = await fetch(`http://api.aladhan.com/v1/gToHCalendar/${month}/${year}`);
            const json = await response.json();
            return json.data;
        } catch (error) {
            console.error(error);
        }
    };

    const restructureData = (response) => {
        const Hijri = {};

        response.forEach((data) => {
            const { hijri, gregorian } = data;
            const year = hijri.year;
            const month = hijri.month.number;
            const day = parseInt(hijri.day, 10) - 1;

            if (!Hijri[year]) {
                Hijri[year] = {};
            }
            if (!Hijri[year][month]) {
                Hijri[year][month] = new Array(30).fill(null);
            }

            Hijri[year][month][day] = gregorian.date;
        })

        return Hijri;
    }

    const getGregorianDate = (direction) => {
        const { year, month } = currentHijri;
        const dates = hijriData[year][month];

        let targetDate = null;
        if (direction === -1) {
            targetDate = dates.find(date => date!== null);
        } else {
            for (let i = dates.length - 1; i >= 0; i--) {
                if (dates[i] !== null) {
                    targetDate = dates[i];
                    break;
                }
            }
        }

        if (!targetDate) {
            return null;
        }

        const [day, monthIndex, yearIndex] = targetDate.split('-').map(num => parseInt(num, 10));
        if((direction === -1 && day > 1) || (direction === 1 && day < new Date(yearIndex, monthIndex, 0).getDate())) {
            return { month: monthIndex, year: yearIndex };
        } else {
            if (direction === -1) {
                const prevDate = new Date(yearIndex, monthIndex - 2, 1);
                return { month: prevDate.getMonth() + 1, year: prevDate.getFullYear() };
            } else {
                const nextDate = new Date(yearIndex, monthIndex, 1);
                return { month: nextDate.getMonth() + 1, year: nextDate.getFullYear() };
            
            }
        }
    }

    const mergeData = (existingData, newData) => {
        let current = JSON.parse(JSON.stringify(existingData));

        for (const year of Object.keys(newData)) {
            if (!current[year]) {
                current[year] = {};
            }
            for (const month of Object.keys(newData[year])) {
                if (!current[year][month]) {
                    current[year][month] = newData[year][month];
                }

                newData[year][month].forEach((date, index) => {
                    if (date && !current[year][month][index]) {
                        current[year][month][index] = date;
                    }
                });
            }
        }

        return current;
    };

    const isIslamicLeapYear = (year) => {
        const leapYear = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
        return leapYear.includes(year % 30);
    };

    const noDaysInIslamicMonth = (month, year) => {
        if (month % 2 === 1) {
            return 30;
        } else if (month === 12 && isIslamicLeapYear(year)) {
            return 30;
        }
        return 29;
    };

    const currentDaysInIslamicMonth = (month, year) => {
        const data = hijriData[year][month];
        let count = 0;
        data.forEach((date) => {
            if (date) {
                count++;
            }
        });
        return count;
    };

    const updateMonth = async (direction) => {
        let newMonth = parseInt(currentHijri.month) + direction;
        let newYear = parseInt(currentHijri.year);
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        const { month, year } = getGregorianDate(direction);

        if(!hijriData[newYear] || !hijriData[newYear][newMonth] || noDaysInIslamicMonth(newMonth, newYear) !== currentDaysInIslamicMonth(newMonth, newYear)) {
            const apiData = await fetchCalendar(month, year);
            const newMonthData = restructureData(apiData);

            const updatedHijriData = mergeData(hijriData, newMonthData);
            setHijriData(updatedHijriData);
        }
        setShouldInitialize(false);
        setCurrentHijri({ year: newYear, month: newMonth });
    };

    const renderEmptyCells = () => {
        // Assuming a 6x7 grid for the calendar (6 weeks, 7 days a week)
        let cells = [];
        for (let i = 0; i < 6; i++) {
            let week = [];
            for (let j = 0; j < 7; j++) {
                week.push(<View key={`cell-${i}-${j}`} style={styles.cell} />);
            }
            cells.push(
                <View key={`row-${i}`} style={styles.weekRow}>
                    {week}
                </View>
            );
        }
        return cells;
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => updateMonth(-1)}
                >
                    <FontAwesome name="angle-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.monthText}>{islamicMonths[currentHijri.month - 1]}</Text>
                <Text style={styles.yearText}>{currentHijri.year}</Text>
                <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => updateMonth(1)}    
                >
                    <FontAwesome name="angle-right" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
                {renderEmptyCells()}
            </View>

        </View>
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
        padding: 15,
        backgroundColor: '#eaeaea',
    },
    monthText: {
        fontSize: 22,
    },
    yearText: {
        fontSize: 18,
    },
    navButton: {
        padding: 10,
    },
    calendarGrid: {
        padding: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
    },
});
