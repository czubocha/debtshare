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

  renderRow = ({item}) => {
    return (
        <TouchableOpacity style={styles.rowButton} onPress={() => this.showFriend(item)}>
          <View style={styles.rowContainer}>
            <View style={{}}>
              {(item.photoURL) ?
                  <Avatar containerStyle={styles.rowAvatar} medium rounded source={{uri: item.photoURL}}/> :
                  <Avatar containerStyle={styles.rowAvatar} medium rounded
                          icon={{name: 'user', type: 'font-awesome'}}/>}
            </View>
            <View style={styles.rowTextContainer}>
              <Text numberOfLines={2} style={styles.rowText}>
                {this.eventText(item)}
              </Text>
              <Text style={styles.timestamp}>
                {/*{`${item.timestamp.getDate()}-${item.timestamp.getMonth()+1}-${item.timestamp.getFullYear()} ${item.timestamp.getHours()}:${item.timestamp.getUTCMinutes()}`}*/}
                {item.timestamp.toLocaleString()}
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
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      this.setState({user});
      this.loadEvents();
      this.sendNotifications();
      unsubscribe();
    });
  };

  loadEvents = async () => {
    this.setState({loading: true});
    const db = firebase.firestore();
    try {
      const userDoc = await db.collection('users').doc(this.state.user.email).onSnapshot(
          async querySnapshot => {
            await this.setState({events: querySnapshot.data().events});
            this.setState({loading: false});
          }
      );
      // console.log(this.state.events);
    } catch (error) {
      console.log(error);
    }
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
    // console.log(this.state.events);
    const nav = NavigationActions.navigate({
      routeName: 'AddDebt',
      params: {
        user: this.state.user
      },
    });
    navigatorRef.dispatch(nav);
  };

  sendNotifications = async () => {
    const db = firebase.firestore();
    const docRef = await db.collection('users').doc(this.state.user.email).get();
    const user = docRef.data();
    const daysToNotification = user.daysToNotification;
    const friendsNotification = user.friendsNotification;
    const friendsRef = await db.collection('users').doc(user.email).collection('friends').get();
    friendsRef.forEach(friendRef => {
      const friend = friendRef.data();
      if (friend.balance > user.limit) {
        // console.log('friend above limit: ', friend.email);
        let foundFriend = null;
        friendsNotification.forEach(data => {
          if (data.email === friend.email)
            foundFriend = data;
        });
        if (!foundFriend) {
          // console.log('friend not found, push ', friend.email);
          friendsNotification.push({email: friend.email, timestamp: new Date()});
        } else {
          const dateComp = new Date(foundFriend.timestamp);
          dateComp.setDate(foundFriend.timestamp.getDate() + daysToNotification);
          // console.log('friend found, no notification');
          // console.log(dateComp);
          // console.log(new Date);
          if (dateComp < new Date) {
            this.sendPushNotification(user, friend, db);
            friendsNotification.splice(friendsNotification.indexOf(foundFriend), 1);
            // console.log('notif sent to ', friend.email);
          }
        }
      }
    });
    db.collection('users').doc(user.email).update(
        {
          friendsNotification: friendsNotification,
        }
    );
  };

  sendPushNotification = async (user, friend, db) => {
    const token = await this.getExpoToken(db, friend);
    const expoEndpoint = 'https://exp.host/--/api/v2/push/send';
    const httpParams = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: `${friend.name} ask you for settling up`,
        body: `You owe ${friend.balance} to ${user.name}`,
      })
    };
    try {
      let response = await fetch(expoEndpoint, httpParams);
      let responseJson = await response.json();
      // console.log('notification response: ', responseJson);
    } catch (error) {
      console.error(error);
    }
  };

  getExpoToken = async (db, friend) => {
    db = firebase.firestore();
    const docRef = await db.collection('users').doc(friend.email).get();
    return docRef.get('token');
  };

  showFriend = async item => {
    this.setState({loading: true});
    const db = firebase.firestore();
    const friend = await db.collection('users').doc(item.email).get();
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
    paddingLeft: 5,
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
