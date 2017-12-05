import React from 'react';
import {View, Text, StyleSheet, TouchableHighlight, ActivityIndicator, Alert} from 'react-native';
import * as firebase from 'firebase';
import {NavigationActions} from 'react-navigation';
import {navigatorRef} from '../navigation/RootNavigation';
import Modal from 'react-native-modal';
import colors from '../constants/Colors';
import UserInfoComponent from '../components/UserInfoComponent';
import {Button, FormInput, FormLabel} from 'react-native-elements';
import LoadingComponent from '../components/LoadingComponent';
import 'firebase/firestore';
import {SecureStore} from 'expo';

export default class UserScreen extends React.Component {
  state = {
    user: {},
    loading: false,
    listenerWork: false,
    unsubscribe: {},
    passwordModalVisible: false,
    newPassword: '',
    name: '',
    nameModalVisible: false,
    notificationsModalVisible: false,
    balanceLimit: 0,
    daysToNotification: 5,
  };

  render() {
    return (
        <View style={styles.container}>
          <UserInfoComponent
              user={this.state.user}/>
          <Button
              title='Change notifications settings'
              raised
              borderRadius={20}
              onPress={this.setNotificationsModal}
              buttonStyle={{marginBottom: 5}}/>
          <Button
              title='Change name'
              raised
              borderRadius={20}
              onPress={this.setNameModal}/>
          <Button
              title='Change password'
              raised
              borderRadius={20}
              onPress={this.setPasswordModal}
              buttonStyle={{marginBottom: 5, marginTop: 5}}/>
          <Button
              title='Logout'
              raised
              borderRadius={20}
              onPress={this.logout}/>
          <Modal
              isVisible={this.state.passwordModalVisible}
              onBackdropPress={this.setPasswordModal}>
            <View style={styles.modal}>
              <FormLabel>New password</FormLabel>
              <FormInput
                  secureTextEntry
                  onChangeText={text => this.setState({newPassword: text})}
                  onSubmitingEditing={this.updatePassword}
                  returnKeyType='done'/>
              <Button
                  title='Save'
                  borderRadius={20}
                  raised
                  onPress={this.updatePassword}
                  buttonStyle={{marginTop: 5}}/>
            </View>
          </Modal>
          <Modal
              isVisible={this.state.nameModalVisible}
              onBackdropPress={this.setNameModal}>
            <View style={styles.modal}>
              <FormLabel>New name</FormLabel>
              <FormInput
                  onChangeText={text => this.setState({name: text})}
                  onSubmitingEditing={this.updateName}
                  returnKeyType='done'/>
              <Button
                  title='Save'
                  borderRadius={20}
                  raised
                  onPress={this.updateName}
                  buttonStyle={{marginTop: 5}}/>
            </View>
          </Modal>
          <Modal
              isVisible={this.state.notificationsModalVisible}
              onBackdropPress={this.setNotificationsModal}>
            <View style={styles.modal}>
              <FormLabel>Balance limit</FormLabel>
              <FormInput
                  value={this.state.balanceLimit}
                  onChangeText={text => this.setState({balanceLimit: text})}
                  keyboardType='numeric'
                  returnKeyType='next'/>
              <FormLabel>Days to notify friend</FormLabel>
              <FormInput
                  value={this.state.daysToNotification}
                  onChangeText={text => this.setState({daysToNotification: text})}
                  keyboardType='numeric'
                  onSubmitingEditing={this.updateNotifications}
                  returnKeyType='done'/>
              <Button
                  title='Save'
                  borderRadius={20}
                  raised
                  onPress={this.updateNotifications}
                  buttonStyle={{marginTop: 5}}/>
            </View>
          </Modal>
          {this.state.loading && <LoadingComponent/>}
        </View>
    );
  }

  componentWillMount = () => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      // console.log('user screen listener: ', user.uid + ' logged in');
      this.setState({user});
      this.loadSettings();
      unsubscribe();
    });
  };

  setPasswordModal = () => {
    this.setState({passwordModalVisible: !this.state.passwordModalVisible});
  };

  setNameModal = () => {
    this.setState({nameModalVisible: !this.state.nameModalVisible});
  };

  setNotificationsModal = () => {
    this.setState({notificationsModalVisible: !this.state.notificationsModalVisible});
  };

  loadSettings = async () => {
    const db = firebase.firestore();
    await db.collection('users').doc(this.state.user.email).onSnapshot((data) => {
      const user = data.data();
      const limit = user.limit = user.limit.toString();
      const days = user.daysToNotification = user.daysToNotification.toString();
      this.setState({balanceLimit: limit, daysToNotification: days});
    });
  };

  updateName = () => {
    const db = firebase.firestore();
    try {
      this.state.user.updateProfile({
        displayName: this.state.name,
      });
      db.collection('users').doc(this.state.user.email).update({
        name: this.state.name,
      });
      Alert.alert('Name changed!', '', [{text: 'Okey', onPress: () => this.setNameModal()}]);
    } catch (error) {
      console.log(error);
    }
  };

  updatePassword = async () => {
    try {
      await this.state.user.updatePassword(this.state.newPassword);
      Alert.alert('Password changed!',
          [{text: 'Okey', onPress: () => this.setPasswordModal()}]);
    } catch (error) {
      Alert.alert('Error', error.message,
          [{text: 'Okey', onPress: () => this.setPasswordModal()}]);
    }
  };

  updateNotifications = async () => {
    const db = firebase.firestore();
    let limit = String(this.state.balanceLimit).replace(',', '.');
    limit = parseFloat(limit);
    let days = String(this.state.daysToNotification).replace(',', '.');
    days = parseFloat(days);
    try {
      db.collection('users').doc(this.state.user.email).update(
          {
            limit: limit,
            daysToNotification: days,
          }
      );
      this.setNotificationsModal();
    } catch (error) {
      console.log(error);
    }
  };

  logout = async () => {
    try {
      this.setState({loading: true});
      await firebase.auth().signOut();
      const nav = NavigationActions.navigate({
        routeName: 'Login',
      });
      navigatorRef.dispatch(nav);
    } catch (error) {
      console.error(error);
    }
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
    justifyContent: 'space-between',
    padding: 20,
  },
  modal: {
    paddingBottom: 30,
    borderRadius: 20,
    backgroundColor: colors.primaryColor,
  }
});
