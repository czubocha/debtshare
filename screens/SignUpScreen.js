import React from 'react';
import {StyleSheet, KeyboardAvoidingView, Alert} from 'react-native';
import colors from '../constants/Colors';
import firebase from 'firebase';
import CredentialsFormComponent from '../components/CredentialsFormComponent';
import {FormInput, FormLabel} from 'react-native-elements';
import 'firebase/firestore';
import LoadingComponent from '../components/LoadingComponent';

export default class SignUpScreen extends React.Component {
  state = {
    name: '',
    email: '',
    password: '',
    validationMessageEmailVisible: false,
    validationMessagePasswordVisible: false,
    validationMessageEmail: '',
    validationMessagePassword: '',
    loading: false,
  };

  render() {
    return (
      <KeyboardAvoidingView behavior='padding' style={styles.container}>
        <FormLabel>Name</FormLabel>
        <FormInput
          onChangeText={this.onNameChange}
          placeholder='e.g. John Snow'
          returnKeyType='next'
        />
        <CredentialsFormComponent
          onEmailChange={this.onEmailChange}
          onPasswordChange={this.onPasswordChange}
          submitHandler={this.signUp}
          submitText='Sign up'
          validationMessageEmail={this.state.validationMessageEmail}
          validationMessagePassword={this.state.validationMessagePassword}
          validationMessageEmailVisible={this.state.validationMessageEmailVisible}
          validationMessagePasswordVisible={this.state.validationMessagePasswordVisible}/>
        {this.state.loading && <LoadingComponent/>}
      </KeyboardAvoidingView>
    );
  }

  onNameChange = (name) => this.setState({name});

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

  setLoading = () => this.setState({loading: !this.state.loading});

  signUp = async () => {
    this.setLoading();
    const db = firebase.firestore();
    try {
      const createdUser = await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
      await createdUser.updateProfile({displayName: this.state.name});
      await db.collection('users').doc(createdUser.email).set({
        uid: createdUser.uid,
        email: createdUser.email,
        name: createdUser.displayName,
        photoURL: createdUser.photoURL,
        events: [],
        limit: 20,
        daysToNotification: 5,
        friendsNotification: [],
      });
      firebase.auth().useDeviceLanguage();
      try {
        await firebase.auth().currentUser.sendEmailVerification();
        this.props.navigation.goBack();
        Alert.alert(
          'Confirm sign up',
          'Check you mailbox, click verification link and come back here'
        );
        // console.log('sent');
      } catch (error) {
        console.log(error)
      }
    } catch (error) {
      switch (error.code) {
      case 'auth/email-already-in-use':
        this.setState({validationMessageEmailVisible: true});
        this.setState({validationMessageEmail: error.message});
        break;
      case 'auth/invalid-email':
        this.setState({validationMessageEmailVisible: true});
        this.setState({validationMessageEmail: error.message});
        break;
      case 'auth/weak-password':
        this.setState({validationMessagePasswordVisible: true});
        this.setState({validationMessagePassword: error.message});
        break;
      }
    }
    this.setLoading();
  };
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
});