import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as firebase from 'firebase';
import colors from '../constants/Colors';

const HomeScreen = () => (
  <View style={styles.container}>
    <Text>Home!</Text>
  </View>
);

const isUserLoggedIn = () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {

    } else {

    }
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
});

export default HomeScreen;
