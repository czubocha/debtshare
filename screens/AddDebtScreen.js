import React from 'react';
import {Button as NButton, Container, Header, Icon, Input, Item, Left} from 'native-base';
import {Avatar, Button as RNEButton, CheckBox, List, ListItem} from 'react-native-elements';
import {FlatList, StyleSheet, View} from 'react-native';
import 'firebase/firestore';
import * as firebase from 'firebase';
import colors from '../constants/Colors';

export default class AddDebtComponent extends React.Component {
  state = {
    friends: [],
    filterText: '',
    checked: false,
  };

  render() {
    const user = this.props.navigation.state.params.user;
    return (
      <Container>
        <Header searchBar rounded>
          <NButton transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name="arrow-back" style={{fontSize: 35, marginRight: 10, marginLeft: 5}}/>
          </NButton>
          <Item>
            <Icon name="ios-search"/>
            <Input
              placeholder="Search"
              onChangeText={this.onFilterChange}/>
            <Icon name="ios-people"/>
          </Item>
        </Header>
        <FlatList
          keyExtractor={item => item.email}
          renderItem={this.renderRow}
          data={this.state.friends.filter(user => user.name.toLowerCase().startsWith(this.state.filterText.toLowerCase()))}
        />
        <View style={styles.buttons}>
          <CheckBox
            title='Split considering yourself'
            checked={this.state.checked}
            textStyle={{fontSize: 10}}
            containerStyle={{backgroundColor: 'transparent'}}
            onPress={this.onCheckboxPress}
          />
          <RNEButton title='Split' borderRadius={20} raised containerViewStyle={{flex: 1}} onPress={this.split}/>
        </View>
      </Container>
    );
  }

  componentWillMount = async () => {
    const user = this.props.navigation.state.params.user;
    const db = firebase.firestore();
    const unsubscribe = await db.collection('users').doc(user.email).collection('friends').onSnapshot(
      (querySnapshot) => {
        querySnapshot.docChanges.forEach((change) => {
            if (change.type === 'modified') {
              this.state.friends.forEach((friend, index) => {
                if (friend.name === change.doc.data().name) {
                  this.setState(prevState => ({friends: [...prevState.friends.slice(0, index), ...prevState.friends.slice(index + 1), change.doc.data()]}));
                }
              });
            }
            if (change.type === 'added') {
              this.setState(prevState => ({friends: [...prevState.friends, change.doc.data()]}));
            }
          }
        );
        this.setState({loading: false});
        // unsubscribe();
      }
    );
  };

  onCheckboxPress = () => this.setState({checked: !this.state.checked});

  onFilterChange = (filterText) => this.setState({filterText});

  renderRow = ({item, index}) => (
    <ListItem
      avatar={(item.photoURL) ?
        <Avatar rounded source={{uri: item.photoURL}}/> :
        <Avatar rounded icon={{name: 'user', type: 'font-awesome'}}/>}
      key={item.email}
      title={item.name}
      subtitle={item.email}
      switchButton
      hideChevron
      switched={item.switched}
      onSwitch={() => this.markSwitched(index)}
    />
  );

  markSwitched = index => {
    console.log(this.state.friends[index]);
    const friends = this.state.friends;
    friends[index].switched = !friends[index].switched;
    this.setState(friends);
    // this.setState(prevState => prevState.friends[index].switched);
  };

  split = () => {
    this.state.friends.forEach(friend => {
      friend.switched && console.log(friend);
    });
  };
}


const styles = StyleSheet.create({
  buttons: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    backgroundColor: colors.tabIconDefault,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});

