import React from 'react';
import FriendInfoScreen from '../screens/FriendInfoScreen';
import {StackNavigator} from 'react-navigation';

const FriendInfoNavigator = StackNavigator(
  {
    FriendInfo: {
      screen: FriendInfoScreen
    }
  });

const FriendInfo = () => (<FriendInfoNavigator/>);

export default FriendInfo;
