import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TrackerRow({ dayIndex, prayers, onTogglePrayer }) {
    return (
        <View style={styles.rowContainer}>
            {prayers.map((isPrayerDone, prayerIndex) => (
            <TouchableOpacity
                key={prayerIndex}
                style={styles.prayerCell}
                onPress={() => onTogglePrayer(dayIndex, prayerIndex)}
            >
                <View style={isPrayerDone ? styles.prayed : styles.notPrayed} />
            </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10
    },
    prayerCell: {
      width: 40,
      height: 30,
      borderRadius: 15,
      marginLeft: 5,
      borderColor: '#323234',
      borderWidth: 5,
      justifyContent: 'center',
      alignItems: 'center'
    },
    prayed: {
      backgroundColor: 'green'
    },
    notPrayed: {
      backgroundColor: 'grey'
    }
  });