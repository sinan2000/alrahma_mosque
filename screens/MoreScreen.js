import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const Item = ( {title, description, icon, onPress} ) => {
    return(
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <Image source={icon} style={styles.icon} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            <AntDesign name="right" size={24} color="black" />
        </TouchableOpacity>
    );
};

export default function MoreScreen({ navigation }) {
    return(
    <View style={styles.container}>
      <Item 
        title='99 Names of Allah SWT'
        description='Learn the beautiful names of Allah SWT'
        icon={require('../assets/names.png')}
        onPress={() => navigation.navigate('NamesScreen')}
      />
      <Item 
        title='Dua and Dhikr'
        description='Learn the supplications and remembrances'
        icon={require('../assets/dua.png')}
        onPress={() => navigation.navigate('DuaScreen')}
      />
      <Item 
        title='Settings'
        description='Change the settings of the app'
        icon={require('../assets/settings.png')}
        onPress={() => navigation.navigate('SettingsScreen')}
      />
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f1f6',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F7F7F7',
      padding: 20,
      marginTop: 20,
      borderRadius: 10,
      marginHorizontal: 15,
    },
    icon: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    textContainer: {
      flex: 1,
      paddingHorizontal: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    description: {
      fontSize: 14,
      color: 'gray',
    },
  });
  