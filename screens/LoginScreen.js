import {BlurView, Facebook, Notifications, SecureStore} from 'expo';
import React from 'react';
import {
  StyleSheet, KeyboardAvoidingView, ActivityIndicator, Button as RNButton,
  TouchableWithoutFeedback, Keyboard, View, Alert
} from 'react-native';
import firebase from 'firebase';
import colors from '../constants/Colors';
import LogoComponent from '../components/LogoComponent';
import CredentialsFormComponent from '../components/CredentialsFormComponent';
import {Button, SocialIcon} from 'react-native-elements';
import LoadingComponent from '../components/LoadingComponent';
import registerForPushNotificationsAsync from "../api/registerForPushNotificationsAsync";

const appId = '232916540574459';
const tokenName = 'token';

export default class LoginScreen extends React.Component {
  state = {
    email: '',
    password: '',
    loading: false,
    fbLoading: false,
    validationMessageEmailVisible: false,
    validationMessagePasswordVisible: false,
    validationMessageEmail: '',
    validationMessagePassword: '',
  };

  render() {
    return (
        <KeyboardAvoidingView
            behavior='padding'
            style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>
              <LogoComponent/>
              <SocialIcon
                  title='Sign In With Facebook'
                  button
                  loading={this.state.fbLoading}
                  type='facebook'
                  onPress={this.logInWithFb}
              />
              <CredentialsFormComponent
                  onEmailChange={this.onEmailChange}
                  onPasswordChange={this.onPasswordChange}
                  submitHandler={this.signInWithCredentials}
                  submitText='Login'
                  validationMessageEmail={this.state.validationMessageEmail}
                  validationMessagePassword={this.state.validationMessagePassword}
                  validationMessageEmailVisible={this.state.validationMessageEmailVisible}
                  validationMessagePasswordVisible={this.state.validationMessagePasswordVisible}/>
              <RNButton
                  title={`Don't have account? Sign up`}
                  onPress={this.navToSignUp}
              />
              {this.state.loading && <LoadingComponent/>}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
  }

  componentWillMount = () => {
    this.setState({loading: true});
    console.log('auth listener in loginScreen created');
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      // console.log('login screen listener: user logged in, navigate to Main');
      console.log('auth state changed');
      if (user && user.emailVerified) {
        this.props.navigation.navigate('Main');
        console.log('notifications registered')
        this._notificationSubscription = this._registerForPushNotifications();
      }
      else {
        this._notificationSubscription && this._notificationSubscription.remove();
      }
      unsubscribe();
    });
    this.setState({loading: false});

  };

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
    console.log(`Push notification ${origin} with data: ${JSON.stringify(data)}`);
    Alert.alert('Notification', `You received notification from ${origin}`);
  };

  onEmailChange = (email) => {
    this.setState({validationMessageEmailVisible: false});
    this.setState({validationMessageEmail: ''});
    this.setState({email});
  };

  onPasswordChange = (password) => {
    this.setState({validationMessagePasswordVisible: false});
    this.setState({validationMessagePassword: ''});
    this.setState({password});
  };

  navToSignUp = () => this.props.navigation.navigate('SignUp');

  signInWithCredentials = async () => {
    this.setState({loading: true});
    try {
      const user = await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      if (!user.emailVerified) {
        this.setState({loading: false});
        Alert.alert(
            'Confirm sign up',
            'Check you mailbox, click verification link and come back here'
        );
      } else {
        this.props.navigation.navigate('Main');
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          this.setState({validationMessageEmailVisible: true});
          this.setState({validationMessageEmail: error.message});
          break;
        case 'auth/user-not-found':
          this.setState({validationMessageEmailVisible: true});
          this.setState({validationMessageEmail: error.message});
          break;
        case 'auth/wrong-password':
          this.setState({validationMessagePasswordVisible: true});
          this.setState({validationMessagePassword: error.message});
          break;
      }
    }
    this.setState({loading: false});
  };

  logInWithFb = async () => {
    this.setState({fbLoading: true});
    const db = firebase.firestore();
    try {
      const {type, token} = await Facebook.logInWithReadPermissionsAsync(appId);
      if (type === 'success') {
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        const user = await firebase.auth().signInWithCredential(credential);
        if (!user.emailVerified) {
          await db.collection('users').doc(user.email).set({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            events: [],
            limit: 20,
            daysToNotification: 5,
            friendsNotification: [],
          });
          await user.sendEmailVerification();
          this.setState({loading: false});
          Alert.alert(
              'Confirm sign up',
              'Check you mailbox, click verification link and come back here'
          );
          console.log('sent');
        } else {
          this.props.navigation.navigate('Main');
        }
      }
    } catch (error) {
      Alert.alert('Something went wrong', 'Try again');
      console.error(error);
    }
    this.setState({fbLoading: false});
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryColor,
    flex: 1,
  },
});
