import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import colors from '../constants/Colors';
import {Container, Footer, Header, List, ListItem} from 'native-base';

const FriendsListComponent = ({users}) => (
  <List

    dataArray={users}
    renderRow={(user) =>
      <ListItem>
        <Text>{user.name}</Text>
      </ListItem>
    }>
  </List>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
});

export default FriendsListComponent;