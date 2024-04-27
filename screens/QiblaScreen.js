import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

const KABA_LATITUDE = 21.422487;
const KAABA_LONGITUDE = 39.826206;
const { width, height } = Dimensions.get('window');

export default function QiblaScreen() {
    const [subscription, setSubscription] = useState(null);
    const [magnetometer, setMagnetometer] = useState(0);
    const [direction, setDirection] = useState(null);
    const [compassLayout, setCompassLayout] = useState({width: 0, height: 0});

    useEffect(() => {
        _toggle();
        getLocationAndCalculateQibla();
        return () => {
            _unsubscribe();
        };
    }, []);

    useEffect(() => {
        console.log('Direction: ', direction);
    }, [direction]);

    async function getLocationAndCalculateQibla() {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return;
        }
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const { latitude, longitude } = location.coords;
        const qibla = calculateQiblaDirection(latitude, longitude);
        setDirection(qibla);
    };

    const calculateQiblaDirection = (latitude, longitude) => {
        const lonDelta = KAABA_LONGITUDE - longitude;
        const x = Math.cos(degreesToRadians(KABA_LATITUDE)) * Math.sin(degreesToRadians(lonDelta));
        const y = Math.cos(degreesToRadians(latitude)) * Math.sin(degreesToRadians(KABA_LATITUDE)) -
                 Math.sin(degreesToRadians(latitude)) * Math.cos(degreesToRadians(KABA_LATITUDE)) * Math.cos(degreesToRadians(lonDelta));
        let brng = Math.atan2(x, y);
        brng = radiansToDegrees(brng);
        brng = (brng + 360) % 360;
        return brng;
    };

    const degreesToRadians = (degrees) => {
        return degrees * Math.PI / 180;
    };

    const radiansToDegrees = (radians) => {
        return radians * 180 / Math.PI;
    };

    const calculatePointerPosition = (angleDegrees, radius, pointerSize) => {
        const angleRadians = degreesToRadians(angleDegrees) - Math.PI / 2; // Adjusting angle to point upwards
        // Subtract half the size of the pointer to ensure the tip of the pointer image (assuming it's the center of the image) aligns with the edge of the compass.
        const adjustedRadius = radius - pointerSize / 2; 
        const left = adjustedRadius * Math.cos(angleRadians) + radius; // Offset to the edge of the compass
        const top = adjustedRadius * Math.sin(angleRadians) + radius; // Offset to the edge of the compass
        return { 
            left: left - styles.compassPointer.width / 2, 
            top: top - styles.compassPointer.height / 2, 
        };
      };
      

    const _toggle = () => {
        if (subscription) {
            _unsubscribe();
        } else {
            _subscribe();
        }
    };

    const _subscribe = () => {
        setSubscription(
            Magnetometer.addListener((data) => {
                setMagnetometer(_angle(data));
            })
        );
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    }

    const _angle = (magnetometer) => {
        let angle = 0;
        if (magnetometer) {
            let {x, y, z} = magnetometer;
            if (Math.atan2(y, x) >= 0) {
                angle = Math.atan2(y, x) * (180 / Math.PI);
            } else {
                angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
            }
        }
        return Math.round(angle);
    };

    const _direction = (degree) => {
        if (degree >= 22.5 && degree < 67.5) {
            return 'NE';
        } else if (degree >= 67.5 && degree < 112.5) {
            return 'E';
        } else if (degree >= 112.5 && degree < 157.5) {
            return 'SE';
        }
        else if (degree >= 157.5 && degree < 202.5) {
            return 'S';
        }
        else if (degree >= 202.5 && degree < 247.5) {
            return 'SW';
        }
        else if (degree >= 247.5 && degree < 292.5) {
            return 'W';
        }
        else if (degree >= 292.5 && degree < 337.5) {
            return 'NW';
        }
        else {
            return 'N';
        }
    };

    const _degree = (magnetometer) => {
        return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
    }

    return (
        <View style={styles.container}>
            <View style={styles.directionRow}>
                <Text style={styles.directionText}>
                    {_direction(_degree(magnetometer))}
                </Text>
            </View>
            <View style={styles.compassRow} onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setCompassLayout({
                    width: width,
                    height: width,
                })
            }}>
                <Image 
                    source={require("../assets/compass_bg.png")} 
                    style={[styles.compassBackground, {transform: [{ rotate: `${360 - magnetometer}deg` }]}]} />
                
                {direction && (
                    <View style={{
                        position: 'absolute',
                        width: compassLayout.width,
                        height: compassLayout.width,
                        justifyContent: 'center',
                        alignItems: 'center',
                    
                    }}>
                        <Image 
                        source={require('../assets/compass_pointer.png')} 
                        style={[
                            styles.compassPointer,
                            {
                                ...calculatePointerPosition(360 - direction - magnetometer, compassLayout.width / 2, Math.max(styles.compassPointer.width, styles.compassPointer.height)),
                            }
                        ]} 
                        />
                    </View>
                )}
                <Text style={styles.degreeText}>
                    {_degree(magnetometer)}°
                </Text>
            </View>
            <View style={styles.emptyRow}></View>
        </View>
    );
};

const pointerImageWidth = height / 26;
const pointerImageHeight = height / 26;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    directionRow: {
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    directionText: {
        color: '#fff',
        fontSize: height / 26,
        fontWeight: 'bold',
    },
    compassRow: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: width,
    },
    compassPointer: {
        position: 'absolute',
        height: pointerImageHeight,
        width: pointerImageWidth,
        resizeMode: 'contain',
    },
    degreeText: {
        color: '#fff',
        fontSize: height / 27,
        textAlign: 'center',
        position: 'absolute',
    },
    compassBackground: {
        height: width - 80,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'contain',
    },
    emptyRow: {
        flex: 1,
    },
});