import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

export default function LocalSplashScreen () {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,//Dimensions.get('window').width / 2,
    height: 200,//Dimensions.get('window').height / 5,
  },
});