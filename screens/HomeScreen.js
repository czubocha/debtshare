import React from 'react';
import {
  FlatList, ListView,
  StyleSheet,
  View,
} from 'react-native';
import * as firebase from 'firebase';
import colors from '../constants/Colors';
import {Button, List, ListItem, Text} from 'react-native-elements';
import {navigatorRef} from '../navigation/RootNavigation';
import {NavigationActions} from 'react-navigation';
import LoadingComponent from '../components/LoadingComponent';

export default class HomeScreen extends React.Component {
  state = {
    user: {},
    loading: false,
  };

  data = [
    {
      type: 'friend',
      user: 'Brent',
      email: 't@t.pl',
      amount: null,
      description: null,
      timestamp: '12.11.2017'
    },
    {
      type: 'debt',
      user: 'Brent',
      email: 'tomasz.czubocha@gmail.com',
      amount: 15,
      description: 'mydlo',
      timestamp: '12.11.2017'
    },
    {
      type: 'friend',
      user: 'Brent',
      email: 'x@x.pl',
      amount: 2,
      description: 'papier',
      timestamp: '15.11.2017'
    },
  ];


  render() {
    return (
      <View style={styles.container}>
        <List>
          {
            this.data.map((item, i) => (
              <ListItem
                key={i}
                title={item.type === 'friend' ? item.user + ' added you to friends!' : item.user + ' charged you with ' + item.amount + ' debt for ' + item.description}
                subtitle={item.timestamp}
                underlayColor={colors.light}
                leftIcon={{name: 'verified-user', color: 'blue', style: {padding: 5}}}
                hideChevron
                onPress={() => this.showFriend(item)}
              />
            ))
          }
        </List>
        {this.state.loading && <LoadingComponent/>}
      </View>
    );
  }


  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user});
      } else {
        this.setState({user});
      }
    });
  };

  showFriend = async item => {
    // console.log(item);
    // console.log(this.state.user);
    this.setState({loading: true});
    const db = firebase.firestore();
    const friend = await db.collection('users').doc('x@x.pl').get();
    const nav = NavigationActions.navigate({
      routeName: 'FriendInfo',
      params: {
        friendChosen: friend.data(),
        user: this.state.user
      },
    });
    navigatorRef.dispatch(nav);
    this.setState({loading: false});
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
});
