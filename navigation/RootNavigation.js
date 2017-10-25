// @flow

import {Notifications, Facebook} from 'expo';
import React from 'react';
import {View, Text, Button, Alert} from 'react-native';
import {StackNavigator} from 'react-navigation';

// import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

const LoginScreen = ({navigation}) => (
  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
    <Text>Login Screen</Text>
    <Button
      title="Login with Facebook"
      onPress={() => logIn(navigation)}
    />
  </View>
);

const logIn = async (navigation) => {
  const { type, token } = await Facebook.logInWithReadPermissionsAsync('232916540574459',
    {behavior: 'web'});
  console.log(type);
  if (type === 'success') {
    // Get the user's name using Facebook's Graph API
    // const response = await fetch(
    //   `https://graph.facebook.com/me?access_token=${token}`);
    // Alert.alert(
    //   'Logged in!',
    //   `Hi ${(await response.json()).name}! Your token is ${response.json().token}.`,
    // );
    navigation.navigate('Tabs');
  }
};

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: LoginScreen,
    },
    Tabs: {
      screen: MainTabNavigator,
    }
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
      },
    }),
  }
);

export default class RootNavigator extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  render() {
    return <RootStackNavigator/>;
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
