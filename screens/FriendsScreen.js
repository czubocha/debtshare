import React from 'react';
import {Alert, StyleSheet, Text, TouchableWithoutFeedback, View, Keyboard} from 'react-native';
import {Header, Icon, Input, Item, Button as NBButton, Left, Body, Right, Container} from 'native-base';
import {Button, FormInput, FormLabel, FormValidationMessage} from 'react-native-elements';
import FriendsListComponent from '../components/FriendsListComponent';
import Modal from 'react-native-modal';
import * as firebase from 'firebase';
import 'firebase/firestore';
import colors from '../constants/Colors';
import {SecureStore} from 'expo';
import {NavigationActions} from 'react-navigation';
import {navigatorRef} from '../navigation/RootNavigation';
import LoadingComponent from '../components/LoadingComponent';

export default class FriendsScreen extends React.Component {
  state = {
    loading: false,
    user: {},
    friends: [],
    modalVisible: false,
    filterText: '',
    searchText: '',
    validation: false,
    userFound: {},
    friendInfoVisible: false,
    friendChosen: {},
  };

  render() {
    return <View style={styles.container}>
      <Container>
        <FriendsListComponent
          friends={this.state.friends}
          onFilterChange={this.setFilterText}
          filterText={this.state.filterText}
          onFriendAdd={this.setModalVisible}
          showFriendInfo={this.showFriendInfo}/>
        <Modal
          isVisible={this.state.modalVisible}
          onBackdropPress={this.setModalVisible}>
          {this.state.loading && <LoadingComponent/>}
          <View style={styles.modalContainer}>
            <FormLabel>Email</FormLabel>
            <FormInput
              keyboardType='email-address'
              returnKeyType='send'
              onChangeText={this.setSearchText}/>
            {this.state.validation && <FormValidationMessage>
              {'This is your friend already'}
            </FormValidationMessage>}
            <Button
              title='Add'
              onPress={this.add}
              style={styles.modalAddButton}
              raised
              borderRadius={20}/>
            {this.state.loading && <LoadingComponent/>}
          </View>
        </Modal>
        <Button
          large
          raised
          borderRadius={20}
          title='Add friend'
          onPress={this.setModalVisible}/>
      </Container>
    </View>;
  }

  componentDidMount = async () => {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
              this.setState({user});
              this.getFriends();
          } else {
              this.setState({user});
          }
      });
  };

  showFriendInfo = async (friendChosen) => {
    const nav = NavigationActions.navigate({
      routeName: 'FriendInfo',
      params: {
        friendChosen,
        user: this.state.user
      },
    });
    navigatorRef.dispatch(nav);
    await this.setState({friendChosen: friendChosen});
  };

  setModalVisible = () => this.setState({modalVisible: !this.state.modalVisible});

  setFilterText = (filterText) => {
    this.setState({filterText});
  };

  setSearchText = (searchText) => {
    this.setState({validation: false});
    this.setState({searchText});
  };

  add = async () => {
    this.setState({loading: true});
    const db = firebase.firestore();
    try {
      if (this.state.friends.filter(friend => friend.email === this.state.searchText).length === 0) {
        const querySnapshot = await db.collection('users').where('email', '==', this.state.searchText).get();
        if (!querySnapshot.empty) {
          querySnapshot.forEach(async doc => {
            const newFriend = doc.data();
            await db.collection('users').doc(this.state.user.email).collection('friends').doc(newFriend.email).set({
              uid: newFriend.uid,
              email: newFriend.email,
              name: newFriend.name,
              balance: 0,
              photoURL: newFriend.photoURL,
            });
          });

          Keyboard.dismiss;
          Alert.alert('Friend added!', '', [{text: 'OK', onPress: this.setModalVisible}]);
        } else {
          Alert.alert('There is no such user!', '', [{text: 'Okey :('}]);
        }
      } else {
        this.setState({validation: true});
      }
    } catch (error) {
      console.error('Error searching user: ', error);
    }
    this.setState({loading: false});
  };

  getFriends = async () => {
    const db = firebase.firestore();
    const unsubscribe = await db.collection('users').doc(this.state.user.email).collection('friends').orderBy('balance').onSnapshot(
      (querySnapshot) => {
        querySnapshot.docChanges.forEach((change) => {
            if (change.type === 'modified') {
              this.state.friends.forEach((friend, index) => {
                if (friend.name === change.doc.data().name) {
                  this.setState(prevState => ({friends: [...prevState.friends.slice(0, index), ...prevState.friends.slice(index + 1), change.doc.data()]}));
                }
              });
            }
            if (change.type === 'added') {
              this.setState(prevState => ({friends: [...prevState.friends, change.doc.data()]}));
            }
          }
        );
        this.setState({loading: false});
        // unsubscribe();
      }
    );
  };

}

const styles = StyleSheet.create({
  modalContainer: {
    // flex: 1,
    padding: 20,
    backgroundColor: colors.primaryColor,
    borderRadius: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
    backgroundColor: colors.primaryColor,
  },
  modalAddButton: {
    marginTop: 10,
  },
});
