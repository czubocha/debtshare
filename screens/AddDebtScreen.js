import React from 'react';
import {Button as NButton, Container, Header, Icon, Input, Item, Left, Picker} from 'native-base';
import {Avatar, Button as RNEButton, CheckBox, FormInput, FormLabel, List, ListItem} from 'react-native-elements';
import {FlatList, KeyboardAvoidingView, StyleSheet, TextInput, View, Alert} from 'react-native';
import 'firebase/firestore';
import * as firebase from 'firebase';
import colors from '../constants/Colors';

export default class AddDebtComponent extends React.Component {
  state = {
    friends: [],
    filterText: '',
    checked: false,
    amount: 0,
    description: '',
    category: '',
  };

  render() {
    const user = this.props.navigation.state.params.user;
    return (
      <Container>
        <Header searchBar rounded>
          <NButton transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name="arrow-back" style={{fontSize: 35, marginRight: 10, marginLeft: 5}}/>
          </NButton>
          <Item>
            <Icon name="ios-search"/>
            <Input
              placeholder="Search"
              onChangeText={this.onFilterChange}/>
            <Icon name="ios-people"/>
          </Item>
        </Header>
        <FlatList
          keyExtractor={item => item.email}
          renderItem={this.renderRow}
          data={this.state.friends.filter(user => user.name.toLowerCase().startsWith(this.state.filterText.toLowerCase()))}
        />
        <KeyboardAvoidingView
          behavior='padding'
          style={styles.footer}>
          <FormLabel>Amount</FormLabel>
          <FormInput
            onChangeText={this.onChangeAmount}
            inputStyle={styles.amountInput}
          />
          <FormLabel>Description</FormLabel>
          <FormInput
            onChangeText={this.onChangeDescription}
            inputStyle={styles.description}
          />
          <Picker
            mode="dropdown"
            placeholder='Select category'
            selectedValue={this.state.category}
            onValueChange={this.onCategoryChange}>
            <Item label="Food" value="Food"/>
            <Item label="Cleaning agents" value="Cleaning agents"/>
            <Item label="Electronics" value="Electronics"/>
            <Item label="Other" value="Other"/>
            <Item label="Repayment of debt" value="Repayment of debt"/>
          </Picker>
          <CheckBox
            title='Split considering yourself'
            checked={this.state.checked}
            // textStyle={{fontSize: 10}}
            containerStyle={{backgroundColor: 'transparent'}}
            onPress={this.onCheckboxPress}
          />
          <RNEButton style={{paddingBottom: 10}} title='Split' borderRadius={20} raised onPress={this.split}/>
        </KeyboardAvoidingView>
      </Container>
    );
  }

  componentWillMount = async () => {
    const user = this.props.navigation.state.params.user;
    const db = firebase.firestore();
    const unsubscribe = await db.collection('users').doc(user.email).collection('friends').onSnapshot(
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

  onCheckboxPress = () => this.setState({checked: !this.state.checked});

  onFilterChange = (filterText) => this.setState({filterText});

  onCategoryChange = category => this.setState({category});

  onChangeDescription = description => this.setState({description});

  onChangeAmount = amount => this.setState({amount});

  renderRow = ({item, index}) => (
    <ListItem
      avatar={(item.photoURL) ?
        <Avatar rounded source={{uri: item.photoURL}}/> :
        <Avatar rounded icon={{name: 'user', type: 'font-awesome'}}/>}
      key={item.email}
      title={item.name}
      subtitle={item.email}
      switchButton
      hideChevron
      switched={item.switched}
      onSwitch={() => this.markSwitched(index)}
    />
  );

  markSwitched = index => {
    console.log(this.state.friends[index]);
    const friends = this.state.friends;
    friends[index].switched = !friends[index].switched;
    this.setState(friends);
    // this.setState(prevState => prevState.friends[index].switched);
  };

  split = async () => {
    const user = this.props.navigation.state.params.user;
    const db = firebase.firestore();
    const friendsToSplit = [];
    this.state.friends.forEach(friend => {
      friend.switched && friendsToSplit.push(friend);
    });
    friendsToSplit.forEach(async friend => {
      const isFriend = await db.collection('users').doc(friend.email)
        .collection('friends').doc(user.email).get();
      if (!isFriend.exists) {
        Alert.alert('Hey!',
          `${friend.name} has not added you to friends`,
          [{
            text: 'Okey :(', onPress: () => {
              this.setModalVisible();
              this.setLoading();
            }
          }]);
        return;
      }
    });
    let total = String(this.state.amount).replace(',', '.');
    total = parseFloat(total);
    const amount = this.state.checked ? total / (friendsToSplit.length + 1) : total / friendsToSplit.length;
    const promises = [];
    friendsToSplit.forEach(friend => {
      promises.push(db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email)
        .collection('debts').add({
          description: this.state.description,
          amount: amount,
          category: this.state.category,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          rewritten: false,
        }));
      promises.push(db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email)
        .update({
          balance: Number((friend.balance + amount).toFixed(2)),
        }));
    });
    await Promise.all(promises);
    console.log('total ', total);
    console.log('amount ', amount);
    friendsToSplit.forEach(friend => {
      console.log(friend);
    });
    promises.forEach(promise => console.log('promise ', promise));
  };
}


const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  buttons: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footer: {
    backgroundColor: 'white',
    padding: 5,
    paddingBottom: 20,
  },
  amountInput: {

  },
  forms: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  }
});

