import React from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, Text} from 'react-native';
import colors from '../constants/Colors';
import {Button, FormInput, FormLabel, FormValidationMessage} from 'react-native-elements';

const CredentialsFormComponent = ({onEmailChange, onPasswordChange, submitHandler, submitText, validationMessageEmailVisible, validationMessagePasswordVisible, validationMessageEmail, validationMessagePassword, onEmailFocus, onPasswordFocus}) => (
  <View>
    <FormLabel>Email</FormLabel>
    <FormInput
      placeholder='e.g. john@gmail.com'
      keyboardType='email-address'
      returnKeyType='next'
      onChangeText={onEmailChange}
      onSubmitEditing={passwordInputFocus}/>
    {validationMessageEmailVisible && <FormValidationMessage>{validationMessageEmail}</FormValidationMessage>}
    <FormLabel>Password</FormLabel>
    <FormInput
      placeholder='password'
      secureTextEntry
      returnKeyType='send'
      onChangeText={onPasswordChange}
      onSubmitEditing={submitHandler}
      ref={passwordInputRef}/>
    {validationMessagePasswordVisible && <FormValidationMessage>{validationMessagePassword}</FormValidationMessage>}
    <Button
      title={submitText}
      borderRadius={20}
      raised
      onPress={submitHandler}
      buttonStyle={styles.button}>
    </Button>
  </View>
);

const passwordInputFocus = () => this.passwordInput.focus();

const passwordInputRef = (input) => this.passwordInput = input;

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
  },
});

export default CredentialsFormComponent;
