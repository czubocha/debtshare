import React from 'react';
import {Image, Text, View, StyleSheet} from 'react-native';

const LogoComponent = () => (
  <View style={styles.logoView}>
    <Image
      style={styles.logo}
      source={require('../assets/icons/app-icon.png')}/>
    <Text style={styles.title}>debtshare</Text>
  </View>
);

const styles = StyleSheet.create({
  logoView: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  title: {
    fontSize: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
});

export default LogoComponent;