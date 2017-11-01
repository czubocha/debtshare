import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import FriendsListComponent from '../components/FriendsListComponent';
import * as firebase from 'firebase';
import 'firebase/firestore';

export default class FriendsScreen extends React.Component {
  state = {
    users: [],
  };

  render() {
    return (
      <FriendsListComponent
        users={this.state.users}/>
    );
  }

  componentDidMount = () => {
    this.getUsers();
  };

  getUsers = () => {
    const db = firebase.firestore();
    const unsubscribe = db.collection('users').onSnapshot((querySnapshot) => {
      querySnapshot.docChanges.forEach((change) => {
        console.log(change.doc.data());
        this.setState(prevState => ({users: [...prevState.users, change.doc.data()]}));
      });
      console.log(this.state.users);
      // unsubscribe();
      // console.log('Current users: ', this.state.users.name.join(', '));
    });
  };

  items = ['Simon Mignolet', 'Nathaniel Clyne', 'Dejan Lovren', 'Mama Sakho', 'Emre Can'];

}

const styles = StyleSheet.create({});
