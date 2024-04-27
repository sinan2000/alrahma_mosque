import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const islamicMonths = ["Muharram", "Safar", "Rabi' al-awwal", "Rabi' al-thani", "Jumada al-awwal", "Jumada al-thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HijriScreen() {
    const [hijriData, setHijriData] = useState({});
    const [currentHijri, setCurrentHijri] = useState({});
    const [shouldInitialize, setShouldInitialize] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkStorage = async () => {
            await AsyncStorage.removeItem('Hijri');
            try {
                const item = await AsyncStorage.getItem('Hijri');
                const data = item !== null ? JSON.parse(item) : null;
                if (data) {
                    setHijriData(data);
                } else {
                    const currentDate = new Date();
                    let fullData = {};
                    for (let i = 0; i < 3; i++) {
                        const month = currentDate.getMonth() + i;
                        const year = currentDate.getFullYear();
                        if (month > 12) {
                            month = 1;
                            year++;
                        } else if (month < 1) {
                            month = 12;
                            year--;
                        }
                        const info = await fetchCalendar(month, year);
                        const restructuredData = restructureData(info);
                        fullData = mergeData(fullData, restructuredData);
                    }
                    await AsyncStorage.setItem('Hijri', JSON.stringify(fullData));
                    setHijriData(fullData);
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
        setLoading(true);
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
            console.log(updatedHijriData);
            setHijriData(updatedHijriData);
            await AsyncStorage.setItem('Hijri', JSON.stringify(updatedHijriData));
        }
        setShouldInitialize(false);
        setCurrentHijri({ year: newYear, month: newMonth });
        setLoading(false);
    };

    const renderCalendarCells = () => {
        if (loading || !hijriData || !currentHijri || !currentHijri.year || !currentHijri.month) {
            return null;
        }

        let cells = [];
        const daysInMonth = noDaysInIslamicMonth(currentHijri.month, currentHijri.year);
        const firstDayInGregorian = hijriData[currentHijri.year][currentHijri.month].find(date => date !== null);
        console.log(currentHijri, firstDayInGregorian);
        const formattedDate = firstDayInGregorian.split('-').reverse().join('-');
        const date = new Date(formattedDate);
        const offset = date.getDay() - 1;
        console.log(hijriData);
        console.log(formattedDate, date, offset);

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
        
        let dayNumber = 0;
        for (let i = 0; i < 6; i++) {
            let week = [];
            for (let j = 0; j < 7; j++) {
                let cellDayNumber;
                if (i === 0 && j < offset) {
                    cellDayNumber = null;
                } else if (dayNumber < daysInMonth) {
                    dayNumber++;
                    cellDayNumber = dayNumber;
                }

                week.push(
                    <View key={`cell-${i}-${j}`} style={styles.cell}>
                        {cellDayNumber && <Text style={styles.textInCell}>{cellDayNumber}</Text>}
                    </View>        
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
                {!loading && renderCalendarCells()}
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
        margin: 2,
    },
    dayHeader: {
        width: 50,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    textInCell: {
        textAlign: 'center',
        margin: 'auto'
    }
});