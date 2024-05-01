import React from 'react';
import {ScrollView} from 'react-native';
import MenuItem from '../components/MenuItem';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

export default function MoreScreen({ navigation }) {
    const { t } = useTranslation();

    return (
      <ScrollView 
        style={{
          flex: 1,
          backgroundColor: '#f2f1f6',
        }}
      >
        <MenuItem 
          title='Tracker'
          description='Keep track of your prayers'
          iconName={require('../assets/tracker.png')}
          onPress={() => navigation.navigate('PrayerTracker')}
        />
        <MenuItem 
          title={t('names')}
          description={t('names2')}
          iconName={require('../assets/names.png')}
          onPress={() => navigation.navigate('Names')}
        />
        <MenuItem 
          title={t('duas')}
          description={t('duas2')}
          iconName={require('../assets/dua.png')}
          onPress={() => navigation.navigate('Dua')}
        />
        <MenuItem 
          title={t('donations')}
          description={t('donations2')}
          iconName={require('../assets/sadaqah.png')}
          onPress={() => Linking.openURL('https://alrahma.nl/steun-ons/')}
        />
        <MenuItem 
          title={t('language')}
          iconName={require('../assets/language.png')}
          languageOptions={[t('english'), t('dutch')]}
        />
      </ScrollView>
    );
};