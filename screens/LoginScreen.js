import {BlurView, Facebook, SecureStore} from 'expo';
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
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        SecureStore.setItemAsync('user', JSON.stringify(user));
        // console.log('login screen listener: user logged in, navigate to Main');
        this.props.navigation.navigate('Main');
      }
    });
    this.setState({loading: false});
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
      await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      this.props.navigation.navigate('Main');
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
    try {
      const {type, token} = await Facebook.logInWithReadPermissionsAsync(appId);
      if (type === 'success') {
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        await firebase.auth().signInWithCredential(credential);
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
