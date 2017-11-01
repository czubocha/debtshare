import React from 'react';
import {BlurView} from 'expo';
import {ActivityIndicator, StyleSheet} from 'react-native';

const LoadingComponent = () => (
  <BlurView style={StyleSheet.absoluteFill}>
    <ActivityIndicator
      style={styles.indicator}
      size='large'/>
  </BlurView>
);

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoadingComponent;
