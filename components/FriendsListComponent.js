import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import colors from '../constants/Colors';
import {
  Body, Button, Container, Content, Footer, Header, Icon, Input, InputGroup, Item, Left, List, ListItem, Right, Text,
  Thumbnail
} from 'native-base';
import {Avatar} from 'react-native-elements';
import UserInfoComponent from './UserInfoComponent';
import Modal from 'react-native-modal';

const FriendsListComponent = ({friends, onFilterChange, filterText, onFriendAdd, showFriendInfo}) => (
  <Container>
    <Header searchBar rounded>
      <Item>
        <Icon name="ios-search"/>
        <Input
          placeholder="Search"
          onChangeText={onFilterChange}/>
        <Icon name="ios-people"/>
      </Item>
      <Button
        transparent
        onPress={onFriendAdd}>
        <Icon
          name="ios-person-add"/>
      </Button>
    </Header>
    <Content>
      <List
        dataArray={friends.filter(user => user.name.toLowerCase().startsWith(filterText.toLowerCase()))}
        renderRow={(user) =>
          <ListItem
            avatar
            thumbnails
            button
            style={styles.listItem}
            onPress={() => showFriendInfo(user)}>
            <Left>
              {(user.photoURL) ?
                <Avatar rounded source={{uri: user.photoURL}}/> :
                <Avatar rounded icon={{name: 'user', type: 'font-awesome'}}/>}
            </Left>
            <Body>
            <Text>{user.name}</Text>
            </Body>
            <Right>
              <Text>{user.balance > 0 && '+'}{user.balance}</Text>
            </Right>
          </ListItem>
        }>
      </List>
    </Content>
  </Container>
);

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
  },
  listItem: {
    marginLeft: 0,
    paddingLeft: 5,
  },
  noFriendsText: {
    alignSelf: 'center',
    paddingTop: 30,
  },
});

export default FriendsListComponent;