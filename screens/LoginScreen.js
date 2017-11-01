import {BlurView, Facebook, SecureStore} from 'expo';
import React from 'react';
import {StyleSheet, KeyboardAvoidingView, ActivityIndicator, Button as RNButton} from 'react-native';
import firebase from 'firebase';
import colors from '../constants/Colors';
import LogoComponent from '../components/LogoComponent';
import FacebookButtonComponent from '../components/FacebookButtonComponent';
import CredentialsFormComponent from '../components/CredentialsFormComponent';
import {Button, SocialIcon} from 'react-native-elements';
import LoadingComponent from '../components/LoadingComponent';

const appId = '232916540574459';
const tokenName = 'token';

export default class LoginScreen extends React.Component {
  state = {
    email: '',
    password: '',
    loading: false,
    fbLoading: false,
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior='padding'
        style={styles.container}>
        <LogoComponent/>
        <SocialIcon
          title='Sign In With Facebook'
          button
          loading={this.state.fbLoading}
          type='facebook'
          onPress={this.logInFlow}
        />
        <CredentialsFormComponent
          onEmailChange={this.onEmailChange}
          onPasswordChange={this.onPasswordChange}
          submitHandler={this.signInToFirebaseWithCredentials}
          submitText='Login'/>
        <RNButton
          title={`Don't have account? Sign up`}
          onPress={this.navToSignUp}
        />
        {this.state.loading && <LoadingComponent/>}
      </KeyboardAvoidingView>
    );
  }

  onEmailChange = (email) => this.setState({email});

  onPasswordChange = (password) => this.setState({password});

  navToSignUp = () => this.props.navigation.navigate('SignUp');

  signInToFirebaseWithCredentials = async () => {
    this.setState({loading: true});
    try {
      await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      this.props.navigation.navigate('Main');
    } catch (error) {
      console.error(error);
    }
    console.log(this.state.email + ' ' + this.state.password + ' logged in with credentials');
  };

  signInToFirebaseWithToken = async (token) => {
    const credential = firebase.auth.FacebookAuthProvider.credential(token);
    try {
      this.setState({fbLoading: true});
      await firebase.auth().signInWithCredential(credential);
      this.props.navigation.navigate('Main');
    } catch (error) {
      console.error(error);
    }
  };

  logInWithFb = async (appId) => {
    const {type, token} = await Facebook.logInWithReadPermissionsAsync(appId);
    if (type === 'success') {
      SecureStore.setItemAsync(tokenName, token);
    }
    return token;
  };

  logInFlow = async () => {
    const token = await SecureStore.getItemAsync(tokenName);
    if (token) {
      this.signInToFirebaseWithToken(token);
      console.log('logged in from stored token');
    } else {
      const token = this.logInWithFb(appId);
      this.signInToFirebaseWithToken(token);
      console.log('logged in by passed credentials');
    }
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryColor,
    flex: 1,
  },
});
