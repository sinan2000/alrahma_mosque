import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TrackerRow({ dayIndex, prayers, onTogglePrayer }) {
    return (
        <View style={styles.rowContainer}>
            {prayers.map((isPrayerDone, prayerIndex) => (
            <TouchableOpacity
                key={prayerIndex}
                style={[styles.prayerCell, isPrayerDone ? styles.prayed : styles.notPrayed]}
                onPress={() => onTogglePrayer(dayIndex, prayerIndex)}
            >
            </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingVertical: 10,
      paddingHorizontal: 5,
    },
    prayerCell: {
      width: 25,
      height: 25,
      borderRadius: 15,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 21,
    },
    prayed: {
      backgroundColor: '#0e9d87',
    },
    notPrayed: {
      backgroundColor: 'transparent',
    }
  });