import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Svg, Rect } from 'react-native-svg';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PrayerTrackerScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [prayerData, setPrayerData] = useState({});
    const [daysInMonth, setDaysInMonth] = useState(0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Text>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.monthYearText}>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
                <TouchableOpacity>
                    <Text>Next</Text>
                </TouchableOpacity>
            </View>
            <Svg height="40" width="100%">
                <Rect x="0" y="0" width="100%" height="100%" fill="green" />
            </Svg>
            <ScrollView style={styles.daysContainer}>
                
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