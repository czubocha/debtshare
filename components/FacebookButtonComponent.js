import React from 'react';
import {Image, TouchableHighlight, StyleSheet} from 'react-native';

const FacebookButtonComponent = ({logInFlow}) => (
  <TouchableHighlight
    underlayColor={'blue'}
    onPress={logInFlow}>
    <Image
      source={require('../assets/icons/facebook-login.png')}
      style={styles.facebook}
      resizeMode='contain'/>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  facebook: {
    width: 280,
    height: 50,
    alignSelf: 'center',
  },
});

export default FacebookButtonComponent;
