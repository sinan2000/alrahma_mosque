import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKeysToPrayed, generatePrayed } from './utils';

export const PrayerContext = createContext();

export const PrayerProvider = ( { children } ) => {
    const [checkedPrayer, setCheckedPrayer] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPrayerData = async () => {
            const prayed = await AsyncStorage.getItem('prayed');
            if (prayed) {
                setCheckedPrayer(JSON.parse(prayed));
            } else {
                checkPrayed();
            }
            setLoading(false);
        };

        const checkPrayed = async () => {
            const now = new Date();
            const years = getKeysToPrayed(now);
            let newData = {...checkedPrayer};
            let update = false;

            years.forEach((year) => {
                if(!newData[year]) {
                    newData[year] = generatePrayed(year);
                    update = true;
                }
            });

            if (update) {
                setCheckedPrayer(newData);
                await AsyncStorage.setItem('prayed', JSON.stringify(newData));
            } 
        };


        loadPrayerData();
    }, []);

    const togglePrayer = async (year, dayOfYear, index) => {
        const newData = {...checkedPrayer};
        newData[year][dayOfYear][index] = !newData[year][dayOfYear][index];
        setCheckedPrayer(newData);
        await AsyncStorage.setItem('prayed', JSON.stringify(newData));
    };

    const checkPrayedForDate = async (date) => {
        const years = getKeysToPrayed(date);
        let update = false;
        let prayed = {...checkedPrayer};

        years.forEach((year) => {
            if (!prayed[year]) {
                prayed[year] = generatePrayed(year);
                update = true;
            }
        });

        if (update) {
            setCheckedPrayer(prayed);
            await AsyncStorage.setItem('prayed', JSON.stringify(prayed));
        }
    };

    return (
        <PrayerContext.Provider value={{ checkedPrayer, loading, togglePrayer, checkPrayedForDate }}>
            {children}
        </PrayerContext.Provider>
    );
};