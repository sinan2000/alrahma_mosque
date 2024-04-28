import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import i18n from '../i18n';

const MenuItem = ({ title, description, iconName, onPress, languageOptions }) => {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    if(languageOptions) {
      setExpanded(!expanded);
    } else {
      onPress();
    }
  };

  const changeLanguage= (index) => {
    const newLanguage = index === 0 ? 'en' : 'nl';
    i18n.changeLanguage(newLanguage);
    setExpanded(false);
  }

  const renderLanguageOptions = () => {
    return languageOptions.map((language, index) => (
      <View key={index} style={styles.languageOption}>
        <TouchableOpacity style={[styles.languageTouchable, index === languageOptions.length - 1 && {borderBottomLeftRadius: 15, borderBottomRightRadius: 15}]} onPress={() => changeLanguage(index)}>
          <Text style={styles.languageText}>{language}</Text>
        </TouchableOpacity>
        {index < languageOptions.length - 1 && <View style={styles.divider}></View>}
      </View>
    ));
  }

    return (
      <View>
        <TouchableOpacity style={styles.row} onPress={handlePress}>
          <Image source={iconName} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <AntDesign name={expanded ? "down" : "right"} size={20} color="black" />
        </TouchableOpacity>
        {description && <Text style={styles.description}>{description}</Text>}
        {expanded && renderLanguageOptions()}
      </View>
    );
  };

  const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 25,
        marginTop: 20,
        marginBottom: 0,
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    description: {
        marginTop: 10,
        fontSize: 14,
        color: 'gray',
        paddingHorizontal: 35,
    },
    languageOption: {
      marginTop: 0,
      paddingHorizontal: 45,
    },
    languageTouchable: {
      backgroundColor: '#F7F7F7',
      padding: 10,
    },
    languageText: {
        fontSize: 16,
        color: 'black',
    },
    divider: {
        height: 1,
        backgroundColor: '#cccccc',
    },
  });

  export default MenuItem;