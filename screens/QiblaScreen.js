import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useTranslation } from 'react-i18next';
//import Svg, { Line } from 'react-native-svg';


/*
                        <Svg height={compassLayout.height} width={compassLayout.width} style={styles.svgContainer}>
                            <Line
                                x1={drawQiblaLine().x1}
                                y1={drawQiblaLine().y1}
                                x2={drawQiblaLine().x2}
                                y2={drawQiblaLine().y2}
                                stroke="green"
                                strokeWidth="2"
                                originX={`${drawQiblaLine().x1}`}
                                originY={`${drawQiblaLine().y1}`}
                                rotation={`${drawQiblaLine().rotation}`}
                            />
                        </Svg>
*/

const KABA_LATITUDE = 21.422487;
const KAABA_LONGITUDE = 39.826206;
const { width, height } = Dimensions.get('window');
const pointerImageWidth = 40;
const pointerImageHeight = height / 26;

export default function QiblaScreen() {
    const [subscription, setSubscription] = useState(null);
    const [magnetometer, setMagnetometer] = useState(0);
    const [direction, setDirection] = useState(null);
    const [compassLayout, setCompassLayout] = useState({width: 0, height: 0});
    const { t } = useTranslation();

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

    const calculatePointerPosition = () => {
        const radius = (width - 80) / 2;
        const radians = degreesToRadians(360 - magnetometer + direction);
        const offsetX = radius * Math.cos(radians);
        const offsetY = radius * Math.sin(radians);
        const adjustedX = radius + offsetX - (pointerImageWidth / 2);
        const adjustedY = radius + offsetY - (pointerImageHeight / 2);
        return {
            left: adjustedX,
            top: adjustedY ,
        }
    };

    const drawQiblaLine = () => {
        const compassCenterX = (width - 80) / 2;
        const compassCenterY = compassLayout.height / 2; // Assuming height is the diameter of the compass view

        const { adjustedX, adjustedY } = calculatePointerPosition();
        const angle = 350 - magnetometer - direction;
    
        // Return the line start and end points
        return {
            x1: compassCenterX,
            y1: compassCenterY,
            x2: adjustedX,
            y2: adjustedY,
            rotation: angle,
        };
    };

    const degreesToRadians = (degrees) => {
        return degrees * Math.PI / 180;
    };

    const radiansToDegrees = (radians) => {
        return radians * 180 / Math.PI;
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

    const _direction = () => {
        if (!direction) {
            return t('calc');
        } else {
            const response = `${t('isat')}${Math.round(direction)}°`;
            return response;
        }
    };

    const _degree = (magnetometer) => {
        return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
    };

    return (
        <View style={styles.container}>
            <View style={styles.directionRow}>
                <Text style={styles.directionText}>
                    {_direction()}
                </Text>
            </View>
            <View style={styles.compassRow} onLayout={(event) => {
                const { width,height } = event.nativeEvent.layout;
                console.log(width, height);
                setCompassLayout({
                    width: width,
                    height: height,
                })
            }}>
                <Image 
                    source={require("../assets/compass_bg.png")} 
                    style={[styles.compassBackground, {transform: [{ rotate: `${360 - magnetometer}deg` }]}]} />
                
                {direction && (<>
                    <View style={{
                        position: 'absolute',
                        width: compassLayout.width,
                        height: compassLayout.width,
                        justifyContent: 'center',
                        alignItems: 'center',
                    
                    }}>
                        <Image 
                        source={require('../assets/pointer.png')} 
                        style={[
                            styles.compassPointer,
                            calculatePointerPosition(),
                            {transform: [{ rotate: `${350 - magnetometer - direction}deg` }]}
                        ]} 
                        />
                        
                    </View>
                    </>
                )}
                <Text style={styles.degreeText}>
                    {_degree(magnetometer)}°
                </Text>
            </View>
            <View style={styles.emptyRow}></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'darkgrey',
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
        width: width - 80,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'contain',
    },
    emptyRow: {
        flex: 1,
    },
    svgContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
});