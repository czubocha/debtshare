import React from 'react';
import {StyleSheet, KeyboardAvoidingView} from 'react-native';
import colors from '../constants/Colors';
import firebase from 'firebase';
import CredentialsFormComponent from '../components/CredentialsFormComponent';
import {FormInput, FormLabel} from 'react-native-elements';
import 'firebase/firestore';

export default class SignUpScreen extends React.Component {
  state = {
    name: '',
    email: '',
    password: '',
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
          submitText='Sign up'/>
      </KeyboardAvoidingView>
    );
  }

  onNameChange = (name) => this.setState({name});

  onEmailChange = (email) => this.setState({email});

  onPasswordChange = (password) => this.setState({password});

  signUp = async () => {
    const db = firebase.firestore();
    try {
      const user = await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
      await user.updateProfile({displayName: this.state.name});
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        name: user.displayName
      });
    } catch (error) {
      console.error(error.code);
      console.error(error.message);
    }
    this.props.navigation.navigate('Main');
    console.log(this.state.email + ' ' + this.state.password + ' signed up');
  };
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
  },
});