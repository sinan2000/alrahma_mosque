import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { NOAA_API_KEY } from '@env';

const KABA_LATITUDE = 21.422487;
const KAABA_LONGITUDE = 39.826206;

export default function QiblaScreen() {
    const [compassHeading, setCompassHeading] = useState(0);
    const [magneticDeclination, setMagneticDeclination] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        Magnetometer.addListener((data) => {
            const { x, y } = data;
            let heading = Math.atan2(y, x) * (180 / Math.PI) + 180;
            heading = (heading) % 360;
            setCompassHeading(heading + magneticDeclination);
        });

        async function getPosition(){
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest});
            const { latitude, longitude } = location.coords;

            const declination = await fetchMagneticDeclination(latitude, longitude);
            setMagneticDeclination(declination);

            const qibla = calculateQiblaDirection(latitude, longitude);
            setDirection(qibla);
        };

        getPosition();

        return () => {
            Magnetometer.removeAllListeners();
        };
    }, []);

    const calculateQiblaDirection = (latitude, longitude) => {
        const lonDelta = KAABA_LONGITUDE - longitude;
        const x = Math.cos(degreesToRadians(KABA_LATITUDE)) * Math.sin(degreesToRadians(lonDelta));
        const y = Math.cos(degreesToRadians(latitude)) * Math.sin(degreesToRadians(KABA_LATITUDE)) - Math.sin(degreesToRadians(latitude)) * Math.cos(degreesToRadians(KABA_LATITUDE)) * Math.cos(degreesToRadians(lonDelta));
        console.log(x, y);
        let brng = Math.atan2(x, y);
        brng = radiansToDegrees(brng);
        brng = (brng + 360) % 360;

        return brng;
    };

    const degreesToRadians = (degrees) => {
        return degrees * Math.PI / 180;
    }

    const radiansToDegrees = (radians) => {
        return radians * 180 / Math.PI;
    }

    async function fetchMagneticDeclination (latitude, longitude) {
        const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=${latitude}&lon1=${longitude}&resultFormat=json&key=${NOAA_API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            return data.declination;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const compassRotation = compassHeading - direction;
    // TO CHECK AND ADD COMPASS AT BUILD
    return (
        <View style={styles.container}>
            <Text>Compass Heading: {compassHeading.toFixed(2)}</Text>
            <Text>Qibla Direction: {direction.toFixed(2)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});