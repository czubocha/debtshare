import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {Avatar, Text} from 'react-native-elements';

const UserInfoComponent = ({user}) => (
  <View style={styles.container}>
    {(user.photoURL) ?
      <Avatar xlarge rounded source={{uri: user.photoURL}}/> :
      <Avatar xlarge rounded icon={{name: 'user', type: 'font-awesome'}}/>}
    {user.displayName && <Text h2>{user.displayName}</Text>}
    <Text h4>{user.email}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

export default UserInfoComponent;