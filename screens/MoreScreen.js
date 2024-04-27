import React from 'react';
import {ScrollView} from 'react-native';
import MenuItem from '../components/MenuItem';
import * as Linking from 'expo-linking';

export default function MoreScreen({ navigation }) {
    return (
      <ScrollView 
        style={{
          flex: 1,
          backgroundColor: '#f2f1f6',
        }}
      >
        <MenuItem 
          title='99 Names of Allah SWT'
          description='Learn the beautiful names of Allah SWT'
          iconName={require('../assets/names.png')}
          onPress={() => navigation.navigate('Names')}
        />
        <MenuItem 
          title='Dua and Dhikr'
          description='Learn the supplications and remembrances'
          iconName={require('../assets/dua.png')}
          onPress={() => navigation.navigate('Dua')}
        />
        <MenuItem 
          title='Donations'
          description='Donate to the Islamic Center Al-Rahma Groningen Foundation'
          iconName={require('../assets/sadaqah.png')}
          onPress={() => Linking.openURL('https://alrahma.nl/steun-ons/')}
        />
        <MenuItem 
          title='Change Language'
          iconName={require('../assets/language.png')}
          languageOptions={['English', 'Dutch']}
        />
      </ScrollView>
    );
};