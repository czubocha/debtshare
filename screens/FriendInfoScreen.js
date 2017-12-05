import React from 'react';
import {Keyboard, Clipboard, StyleSheet, View, Alert, TextInput} from 'react-native';
import colors from '../constants/Colors';
import {Avatar, Button, FormInput, FormLabel} from 'react-native-elements';
import {Body, Container, Content, Form, Item, Left, List, ListItem, Picker, Right, Text} from 'native-base';
import Modal from 'react-native-modal';
import * as firebase from 'firebase';
import 'firebase/firestore';
import LoadingComponent from '../components/LoadingComponent';

export default class FriendInfoScreen extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.state.params.friendChosen.name,
  });

  state = {
    modalVisible: false,
    description: '',
    amount: 0,
    category: '',
    keyboardActive: false,
    loading: false,
    debts: [],
    balance: '',
    editModalVisible: false,
    selectedDebt: {},
    oldDebtAmount: 0,
    docId: '',
  };

  render() {
    const user = this.props.navigation.state.params.friendChosen;
    return (
        <Container
            style={styles.container}>
          <Content>
            {/*<View style={styles.container}>*/}
            <View style={styles.rowView}>
              {(user.photoURL) ?
                  <Avatar xlarge rounded source={{uri: user.photoURL}}/> :
                  <Avatar xlarge rounded icon={{name: 'user', type: 'font-awesome'}}/>}
              <View style={styles.userDetails}>
                <Text h2>{user.name}</Text>
                <Text h4>{user.email}</Text>
                <Text h1>Balance: {this.state.balance > 0 && '+'}{this.state.balance}</Text>
                <View style={{alignSelf: 'stretch'}}>
                  <Button
                      title='Copy SMS template'
                      onPress={this.copySmsTemplate}
                      raised
                      borderRadius={20}/>
                </View>
              </View>
            </View>
            <Button
                title='Add debt'
                large
                onPress={this.setModalVisible}
                raised
                borderRadius={20}
                buttonStyle={styles.addDebtButton}/>
            <Modal
                isVisible={this.state.modalVisible}
                onBackdropPress={this.setModalVisible}>
              <View style={styles.modal}>
                <FormLabel>Description</FormLabel>
                <FormInput
                    onChangeText={this.onDescriptionChange}
                    returnKeyType='next'/>
                <FormLabel>Amount</FormLabel>
                <FormInput
                    keyboardType='numeric'
                    onChangeText={this.onChangeAmount}
                    returnKeyType='done'/>
                <Form>
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
                </Form>
                <Button
                    title='Add'
                    raised
                    onPress={this.addDebt}
                    borderRadius={20}/>
                {this.state.loading && <LoadingComponent/>}
              </View>
            </Modal>
            <Modal
                isVisible={this.state.editModalVisible}
                onBackdropPress={this.setEditModalVisible}>
              <View style={styles.modal}>
                <FormLabel>Description</FormLabel>
                <FormInput
                    value={this.state.description}
                    onChangeText={this.onDescriptionChange}
                    returnKeyType='next'/>
                <FormLabel>Amount</FormLabel>
                <FormInput
                    value={String(this.state.amount)}
                    keyboardType='numeric'
                    onChangeText={this.onChangeAmount}
                    returnKeyType='done'/>
                <Form>
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
                </Form>
                <Button
                    title='Save'
                    raised
                    onPress={this.saveDebt}
                    containerViewStyle={styles.saveButton}
                    borderRadius={20}/>
                <Button
                    title='Delete'
                    raised
                    onPress={this.deleteDebt}
                    borderRadius={20}/>
                {this.state.loading && <LoadingComponent/>}
              </View>
            </Modal>
            <List
                style={styles.list}
                dataArray={this.state.debts}
                renderRow={(debt) =>
                    <ListItem
                        avatar
                        button
                        onPress={() => this.setEditModalVisible(debt)}
                        style={styles.listItem}>
                      <Left>
                        {debt.category === 'Food' && <Avatar rounded icon={{name: 'cutlery', type: 'font-awesome'}}/>}
                        {debt.category === 'Cleaning agents' &&
                        <Avatar rounded icon={{name: 'bathtub', type: 'font-awesome'}}/>}
                        {debt.category === 'Electronics' &&
                        <Avatar rounded icon={{name: 'desktop', type: 'font-awesome'}}/>}
                        {debt.category === 'Other' && <Avatar rounded icon={{name: 'circle', type: 'font-awesome'}}/>}
                        {debt.category === 'Repayment of debt' &&
                        <Avatar rounded icon={{name: 'money', type: 'font-awesome'}}/>}
                        {debt.category === '' && <Avatar rounded icon={{name: 'circle', type: 'font-awesome'}}/>}
                      </Left>
                      <Body>
                      <Text>{debt.description}</Text>
                      {debt.timestamp &&
                      <Text note>
                        {/*{debt.timestamp.getDate()}.*/}
                        {/*{debt.timestamp.getMonth() + 1}.*/}
                        {/*{debt.timestamp.getFullYear()}{' '}*/}
                        {/*{debt.timestamp.getHours()}:*/}
                        {/*{debt.timestamp.getMinutes()}*/}
                        {debt.timestamp.toLocaleString()}
                      </Text>}
                      </Body>
                      <Right>
                        <Text>{debt.amount}</Text>
                      </Right>
                    </ListItem>
                }>
            </List>
          </Content>
          {this.state.loading && <LoadingComponent/>}
        </Container>
    );
  }

  componentDidMount = () => {
    this.getDebts();
    // Keyboard.addListener('keyboardWillShow', this.changeKeyboardState);
    // Keyboard.addListener('keyboardWillHide', this.changeKeyboardState);
  };

  setEditModalVisible = (debt) => {
    this.setState({editModalVisible: !this.state.editModalVisible});
    if (debt) {
      this.setState({amount: debt.amount});
      this.setState({description: debt.description});
      this.setState({category: debt.category});
      this.setState({docId: debt.id});
      this.setState({oldDebtAmount: debt.amount});
    }
  };

  getSmsValue = () => {
    return `Hey! Do you remember your debt? Please give me ${this.state.balance} at the next opportunity`;
  };

  copySmsTemplate = () => {
    Clipboard.setString(this.getSmsValue());
    Alert.alert('Copied!');
  };

  getDebts = async () => {
    this.setLoading();
    const friend = this.props.navigation.state.params.friendChosen;
    const user = this.props.navigation.state.params.user;
    // console.log(friend);
    // console.log(user);
    const db = firebase.firestore();
    const updateDebts = db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email).collection('debts').orderBy('timestamp', 'desc').onSnapshot(
            (querySnapshot) => {
              this.setState({debts: []});
              querySnapshot.forEach((doc) => {
                const debt = doc.data();
                debt.id = doc.id;
                this.setState(prevState => ({debts: [...prevState.debts, debt]}));
              });
            });

    const updateBalance = db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email).onSnapshot(
            doc => {
              this.setState({balance: 0});
              this.setState({balance: doc.data().balance});
            });

    await Promise.all([updateBalance, updateDebts]);
    this.setLoading();
  };

  changeKeyboardState = async () => {
    await this.setState({keyboardActive: !this.state.keyboardActive});
  };

  setModalVisible = async () => {
    if (!this.state.keyboardActive) {
      await this.setState({modalVisible: !this.state.modalVisible});
    }
  };

  onCategoryChange = (category) => {
    this.setState({category});
  };

  onChangeAmount = (amount) => this.setState({amount});

  onDescriptionChange = (description) => this.setState({description});

  setLoading = async () => {
    await this.setState({loading: !this.state.loading});
  };

  saveDebt = async () => {
    this.setLoading();
    const friend = this.props.navigation.state.params.friendChosen;
    const user = this.props.navigation.state.params.user;
    let amount = String(this.state.amount).replace(',', '.');
    amount = parseFloat(amount);

    const db = firebase.firestore();
    const userRef = await db.collection('users').doc(user.email).get();
    const name = userRef.get('name');
    const updateDebt = db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email)
        .collection('debts').doc(this.state.docId).update({
          description: this.state.description,
          amount: amount,
          category: this.state.category,
          rewritten: false,
        });

    const updateBalance = db.collection('users').doc(user.email).collection('friends').doc(friend.email).update({
      balance: Number((this.state.balance + amount - this.state.oldDebtAmount).toFixed(2)),
    });
    await Promise.all([updateDebt, updateBalance]);
    this.setLoading();
    this.sendPushNotification(name, friend, db, amount, this.state.description, 'update');
    this.setEditModalVisible();
  };

  addDebt = async () => {
    this.setLoading();
    const friend = this.props.navigation.state.params.friendChosen;
    const user = this.props.navigation.state.params.user;
    let amount = String(this.state.amount).replace(',', '.');
    amount = parseFloat(amount);
    const db = firebase.firestore();
    const userRef = await db.collection('users').doc(user.email).get();
    const name = userRef.get('name');
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
    } else {
      await db.collection('users').doc(user.email)
          .collection('friends').doc(friend.email)
          .collection('debts').add({
            description: this.state.description,
            amount: amount,
            category: this.state.category,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            rewritten: false,
          });

      await db.collection('users').doc(user.email)
          .collection('friends').doc(friend.email)
          .update({
            balance: Number((this.state.balance + amount).toFixed(2)),
          });

      this.setLoading();
      console.log('lol');
      this.sendPushNotification(name, friend, db, amount, this.state.description, 'new');
      this.setModalVisible();
    }
  };

  deleteDebt = async () => {
    this.setLoading();
    const friend = this.props.navigation.state.params.friendChosen;
    const user = this.props.navigation.state.params.user;
    let amount = String(this.state.amount).replace(',', '.');
    amount = parseFloat(amount);
    const db = firebase.firestore();

    const userRef = await db.collection('users').doc(user.email).get();
    const name = userRef.get('name');

    const deleteDebt = db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email)
        .collection('debts').doc(this.state.docId).delete();

    const updateBalance = db.collection('users').doc(user.email)
        .collection('friends').doc(friend.email)
        .update({
          balance: Number((this.state.balance - amount).toFixed(2)),
        });

    await Promise.all([deleteDebt, updateBalance]);
    this.setLoading();
    this.sendPushNotification(name, friend, db, amount, this.state.description, 'delete');
    this.setEditModalVisible();
  };

  getExpoToken = async (db, friend) => {
    db = firebase.firestore();
    const docRef = await db.collection('users').doc(friend.email).get();
    return docRef.get('token');
  };

  sendPushNotification = async (name, friend, db, amount, description, operation) => {
    const token = await this.getExpoToken(db, friend);
    const expoEndpoint = 'https://exp.host/--/api/v2/push/send';
    let title = '';
    switch (operation) {
      case 'update':
        title = 'Debt on debtshare has been updated!';
        break;
      case 'new':
        title = 'You got new debt on debtshare!';
        break;
      case 'delete':
        title = 'Debt on debtshare has been deleted!';
        break;
    }
    const httpParams = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: title,
        body: `${amount} for ${name} for ${description}`,
        badge: 0,
      })
    };
    try {
      let response = await fetch(expoEndpoint, httpParams);
      let responseJson = await response.json();
    } catch (error) {
      console.error(error);
    }
  };
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    backgroundColor: colors.primaryColor,
  },
  modal: {
    backgroundColor: colors.primaryColor,
    paddingBottom: 30,
    borderRadius: 20,
  },
  rowView: {
    // flex: 1,
    flexDirection: 'row',
    padding: 10,
  },
  userDetails: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addDebtButton: {
    alignSelf: 'stretch',
    marginBottom: 5,
  },
  listItem: {
    marginLeft: 0,
    paddingLeft: 5,
  },
  list: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  saveButton: {
    marginBottom: 5,
  },
});