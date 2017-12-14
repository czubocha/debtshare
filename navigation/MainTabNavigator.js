import React from 'react';
import {Platform, Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {TabNavigator, TabBarBottom} from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import FriendsScreen from '../screens/FriendsScreen';
import UserScreen from '../screens/UserScreen';
import FriendInfoScreen from '../screens/FriendInfoScreen';
import FriendInfo from './FriendInfoNavigator';
import {Notifications} from 'expo';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

const RootTabNavigator = TabNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Friends: {
      screen: FriendsScreen,
    },
    Settings: {
      screen: UserScreen,
    },
  },
  {
    navigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused}) => {
        const {routeName} = navigation.state;
        let iconName;
        switch (routeName) {
        case 'Home':
          iconName = Platform.OS === 'ios'
            ? `ios-information-circle${focused ? '' : '-outline'}`
            : 'md-information-circle';
          break;
        case 'Friends':
          iconName = Platform.OS === 'ios'
            ? `ios-link${focused ? '' : '-outline'}`
            : 'md-link';
          break;
        case 'Settings':
          iconName = Platform.OS === 'ios'
            ? `ios-options${focused ? '' : '-outline'}`
            : 'md-options';
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{marginBottom: -3}}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: true,
    swipeEnabled: true,
  }
);

export default class MainTabNavigator extends React.Component {
  render() {
    return <RootTabNavigator/>;
  }
}
