import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HijriScreen() {


    return (
        <View style={styles.container}>
            <Text style={styles.monthText}></Text>
            <Text style={styles.yearText}></Text>
            <View style={styles.navigation}>
            </View>
            {/* render days */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthText: {
        fontSize: 24,
    },
    yearText: {
        fontSize: 18,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 20,
    },
    // days grid styles
});