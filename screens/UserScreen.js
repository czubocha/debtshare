import React from 'react';
import {View, Text, StyleSheet, TouchableHighlight, ActivityIndicator} from 'react-native';
import * as firebase from 'firebase';
import {NavigationActions} from 'react-navigation';
import {navigatorRef} from '../navigation/RootNavigation';
import colors from '../constants/Colors';
import UserInfoComponent from '../components/UserInfoComponent';
import {Button} from 'react-native-elements';
import LoadingComponent from '../components/LoadingComponent';
import 'firebase/firestore';

export default class UserScreen extends React.Component {
  state = {
    user: {},
    loading: false,
  };

  render() {
    return (
      <View style={styles.container}>
        <UserInfoComponent
          user={this.state.user}/>
        <Button
          title='Logout'
          onPress={this.logout}>
        </Button>
        {this.state.loading && <LoadingComponent/>}
      </View>
    );
  }

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(user);
        console.log(user.uid + ' logged in');
        this.setState({user});
      } else {
        console.log('logged out');
        this.setState({user: {}});
      }
    });
  };

  logout = async () => {
    try {
      // firebase.firestore().collection('users').onSnapshot(() => {})();
      this.setState({loading: true});
      await firebase.auth().signOut();
      console.log('logged out');
      const nav = NavigationActions.navigate({
        routeName: 'Login',
      });
      navigatorRef.dispatch(nav);
    } catch (error) {
      console.error(error);
    }
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
    justifyContent: 'space-between',
    padding: 20,
  },
});
