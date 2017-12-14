import React from 'react';
import {Notifications} from 'expo';
import {Alert, Text, View} from 'react-native';
import {StackNavigator} from 'react-navigation';

import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';
import SignUpScreen from '../screens/SignUpScreen';
import colors from '../constants/Colors';
import FriendInfoScreen from '../screens/FriendInfoScreen';
import AddDebtScreen from '../screens/AddDebtScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const RootStackNavigator = StackNavigator(
  {
    Login: {
      screen: LoginScreen,
      routeName: 'Login',
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
    },
    FriendInfo: {
      screen: FriendInfoScreen,
    },
    AddDebt: {
      screen: AddDebtScreen,
      navigationOptions: {
        header: null,
      }
    },
    Statistics: {
      screen: StatisticsScreen,
      navigationOptions: {
        title: 'Statistics',
      }
    },
  },
  {
    mode: 'modal',
  });

export let navigatorRef;

export default class RootNavigator extends React.Component {
  componentDidMount() {
    navigatorRef = this.navigator;
  }

  render(){return <RootStackNavigator ref={nav => this.navigator = nav}/>}
}
