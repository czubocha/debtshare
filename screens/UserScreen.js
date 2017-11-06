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
import {SecureStore} from 'expo';

export default class UserScreen extends React.Component {
  state = {
    user: {},
    loading: false,
    listenerWork: false,
    unsubscribe: {},
  };

  render() {
    return (
      <View style={styles.container}>
        <UserInfoComponent
          user={this.state.user}/>
        <Button
          title='Logout'
          raised
          borderRadius={20}
          onPress={this.logout}/>
        {this.state.loading && <LoadingComponent/>}
      </View>
    );
  }

  componentWillMount = () => {
    this.setState({
      unsubscribe: firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log('user screen listener: ', user.uid + ' logged in');
          this.setState({user});
        } else {
          // console.log('user screen listener: logged out');
          this.setState({user: {}});
        }
      })
    });
  };

  logout = async () => {
    try {
      this.setState({loading: true});
      await firebase.auth().signOut();
      const nav = NavigationActions.navigate({
        routeName: 'Login',
      });
      navigatorRef.dispatch(nav);
      this.state.unsubscribe();
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
