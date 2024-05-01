import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';

const PrayerGrid = ({ prayerTimes, navigation, nextPrayer }) => {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Render each day of the week header
  const renderDayHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.prayerNameColumn} />
      {daysOfWeek.map((day, index) => (
        <View key={index} style={styles.dayColumn}>
          <Text style={styles.dayText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  // Render each prayer time row
  const renderPrayerRow = ({ item }) => (
    <View style={styles.prayerRow}>
      <View style={styles.prayerNameColumn}>
        <Text style={styles.prayerText}>{item.time}</Text>
      </View>
      {item.days.map((isPrayerDone, index) => (
        <View key={index} style={styles.dayColumn}>
          <View style={isPrayerDone ? styles.indicatorFilled : styles.indicatorEmpty} />
        </View>
      ))}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('PrayerTracker', { nextPrayer })}
    >
      <View style={styles.container}>
        {renderDayHeader()}
        <FlatList
          data={prayerTimes}
          renderItem={renderPrayerRow}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </TouchableOpacity>
  );
};

const { width, height } = Dimensions.get('window');
const width_scale = width / 100;
const height_scale = height / 100;
// Updated styles for the grid
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.5)', // Replace with the actual color code from your design
    padding: width_scale * 3.7, // Replace with your desired padding
    borderRadius: 10, // Replace with your desired border radius
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width_scale * 2.3, // Adjust as needed
  },
  dayColumn: {
    flex: 1, // Reduce flex number to give less space
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2, // Reduce horizontal padding to tighten the spacing
  },
  prayerNameColumn: {
    //flex: 1,
    flex: 2, // Increase flex number to give more space
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: width_scale * 2.3,
  },
  dayText: {
    color: 'grey',
  },
  prayerText: {
    color: 'grey',
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width_scale * 2.3, // Adjust as needed
  },
  indicatorFilled: {
    width: width_scale * 4.7, // Replace with your desired width
    height: height_scale, // Replace with your desired height
    backgroundColor: '#FFFFFF', // Replace with the actual color code for filled state
    marginHorizontal: 2,
    borderRadius: 5, // Replace with your desired border radius for indicators
  },
  indicatorEmpty: {
    width: width_scale * 4.7, // Replace with your desired width
    height: height_scale, // Replace with your desired height
    backgroundColor: '#FFCDCD', // Replace with the actual color code for empty state
    marginHorizontal: 2,
    borderRadius: 5, // Replace with your desired border radius for indicators
  },
});

export default PrayerGrid;
