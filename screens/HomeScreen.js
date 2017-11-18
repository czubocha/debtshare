import React from 'react';
import {
  FlatList, ListView,
  StyleSheet, TouchableOpacity,
  View, Text
} from 'react-native';
import * as firebase from 'firebase';
import colors from '../constants/Colors';
import {Avatar, Button, List, ListItem} from 'react-native-elements';
import {navigatorRef} from '../navigation/RootNavigation';
import {NavigationActions} from 'react-navigation';
import LoadingComponent from '../components/LoadingComponent';

export default class HomeScreen extends React.Component {
  state = {
    user: {},
    loading: false,
    events: [],
  };

  data = [
    {
      id: '1',
      type: 'friend',
      user: 'Brent',
      email: 't@t.pl',
      amount: null,
      description: null,
      timestamp: '12.11.2017'
    },
    {
      id: '2',
      type: 'debt',
      user: 'Brent',
      email: 'tomasz.czubocha@gmail.com',
      amount: 15,
      description: 'mydlo i powidlo',
      timestamp: '12.11.2017'
    },
    {
      id: '3',
      type: 'friend',
      user: 'Brent',
      email: 'x@x.pl',
      amount: 2,
      description: 'papier',
      timestamp: '15.11.2017'
    },
  ];


  renderRow = ({item}) => {
    return (
      <TouchableOpacity style={styles.rowButton} onPress={() => this.showFriend(item)}>
        <View style={styles.rowContainer}>
          <View style={{}}>
            {(item.photoURL) ?
              <Avatar containerStyle={styles.rowAvatar} rounded source={{uri: item.photoURL}}/> :
              <Avatar containerStyle={styles.rowAvatar} medium rounded icon={{name: 'user', type: 'font-awesome'}}/>}
          </View>
          <View style={styles.rowTextContainer}>
            <Text numberOfLines={2} style={styles.rowText}>
              {this.eventText(item)}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp.getMilliseconds()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent events</Text>
        <View style={styles.list}>
          {(this.state.events.length === 0 && this.state.loading === false) &&
          <Text>You have no recent events :({'\n'}
            When your friend changes you with debt you will notice it here
          </Text>}
          <FlatList
            data={this.state.events}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={this.renderRow}
          />
        </View>
        <View style={styles.buttons}>
          <Button large title='Show statistics' borderRadius={20} raised onPress={this.showStatistics}/>
          <Button large title='Add debt' borderRadius={20} raised onPress={this.addDebt}/>
        </View>
        {this.state.loading && <LoadingComponent/>}
      </View>
    );
  }

  eventText = item => {
    switch (item.type) {
    case 'friend':
      return item.user + ' added you to friends!';
    case 'create':
      return item.user + ' charged you with ' + item.amount + ' debt for ' + item.description;
    case 'edit':
      return item.user + ' edited debt ' + item.amount + ' for ' + item.description;
    case 'delete':
      return item.user + ' deleted debt ' + item.amount + ' for ' + item.description;
    }
  };


  componentDidMount = async () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user});
        this.loadEvents();
      } else {
        this.setState({user});
      }
    });
  };

  loadEvents = async () => {
    this.setState({loading: true});
    const db = firebase.firestore();
    try {
      const userDoc = await db.collection('users').doc(this.state.user.email).get();
      await this.setState({events: userDoc.data().events});
      console.log(this.state.events);
    } catch (error) {
      console.log(error);
    }
    this.setState({loading: false});
  };

  showStatistics = () => {
    const nav = NavigationActions.navigate({
      routeName: 'Statistics',
      params: {
        user: this.state.user
      },
    });
    navigatorRef.dispatch(nav);
  };

  addDebt = () => {
    console.log(this.state.events);
    const nav = NavigationActions.navigate({
      routeName: 'AddDebt',
      params: {
        user: this.state.user
      },
    });
    navigatorRef.dispatch(nav);
  };

  showFriend = async item => {
    this.setState({loading: true});
    const db = firebase.firestore();
    const friend = await db.collection('users').doc('t@t.pl').get();
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
    paddingTop: 20,
    padding: 10,
  },
  title: {
    paddingLeft: 5,
    fontSize: 40,
  },
  rowContainer: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    height: 65,
    flexDirection: 'row',
    borderRadius: 20,
    margin: 2,
    padding: 2,
    backgroundColor: colors.light,

  },
  rowAvatar: {
    marginLeft: 5,
    marginRight: 10,
  },
  rowText: {
    flex: 1,
    flexWrap: 'wrap',
    backgroundColor: 'transparent'
  },
  list: {
    flex: 7,
  },
  rowTextContainer: {
    width: 0,
    flexGrow: 1,
  },
  timestamp: {
    color: colors.dark,
    backgroundColor: 'transparent',
  },
  buttons: {
    flex: 3,
    justifyContent: 'space-between'
  }
});
