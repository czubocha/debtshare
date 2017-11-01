import {Notifications} from 'expo';
import React from 'react';
import {StackNavigator} from 'react-navigation';

import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import SignUpScreen from '../screens/SignUpScreen';
import colors from '../constants/Colors';
import * as firebase from 'firebase/index';

const RootStackNavigator = StackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions:
        {
          header: null,
          gesturesEnabled: false
        }
    },
    SignUp: {
      screen: SignUpScreen,
      navigationOptions: {
        headerTitle: 'Sign up',
        headerStyle: {
          backgroundColor: colors.primaryColor,
        }
      }
    },
    Main: {
      screen: MainTabNavigator,
      navigationOptions:
        {
          header: null,
          gesturesEnabled: false
        }
    }
  },
  {
    mode: 'modal',
  });

const firebaseConfig = {
  apiKey: 'AIzaSyCOGVNsrV3lj-IzTk_wAOx66K3s4lwN3DA',
  authDomain: 'debtshare.firebaseapp.com',
  projectId: 'debtshare'
};

export let navigatorRef;

export default class RootNavigator extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
    firebase.initializeApp(firebaseConfig);
    navigatorRef = this.navigator;
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    return <RootStackNavigator ref={nav => this.navigator = nav}/>;
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({origin, data}) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}

