import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const Item = ({ title, description, iconName, onPress }) => {
    return (
      <View>
        <TouchableOpacity style={styles.row} onPress={onPress}>
          <Image source={iconName} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <AntDesign name="right" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.description}>{description}</Text>
      </View>
    );
  };

export default function MoreScreen({ navigation }) {
    return(
    <View style={styles.container}>
      <Item 
        title='99 Names of Allah SWT'
        description='Learn the beautiful names of Allah SWT'
        iconName={require('../assets/names.png')}
        onPress={() => navigation.navigate('NamesScreen')}
      />
      <Item 
        title='Dua and Dhikr'
        description='Learn the supplications and remembrances'
        iconName={require('../assets/dua.png')}
        onPress={() => navigation.navigate('DuaScreen')}
      />
      <Item 
        title='Settings'
        description='Change the settings of the app'
        iconName={require('../assets/settings.png')}
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
        borderRadius: 10,
        marginHorizontal: 25,
        marginTop: 20,
        marginBottom: 10,
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        marginRight: 10, // space between the icon and the title
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1, // ensures title takes up the available space between icon and arrow
    },
    description: {
        fontSize: 14,
        color: 'gray',
        paddingHorizontal: 35, // aligns horizontally with the row content
        //paddingBottom: 20, // space between the description and next row
    },
  });
  