import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import colors from '../constants/Colors';
import LoadingComponent from "../components/LoadingComponent";

export default class StatisticsScreen extends React.Component {
  state = {
    statistics: {},
      loading: false,
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Maybe you are wondering...</Text>
        <View style={styles.answers}>
          <View style={styles.block}>
            <Text>who you owe the most money: {this.state.statistics.maxFriend}</Text>
            <Text>and how much: {this.state.statistics.maxBalance}</Text>
          </View>
          <View style={styles.block}>
            <Text>who owes you most money: {this.state.statistics.minFriend}</Text>
            <Text>and how much: {this.state.statistics.minBalance}</Text>
          </View>
          <View style={styles.block}>
            <Text>what you lend the most money: {this.state.statistics.maxFriendCategoryName}</Text>
            <Text>and how much: {this.state.statistics.maxFriendCategoryAmount}</Text>
          </View>
          <View style={styles.block}>
            <Text>what you borrow the most money: {this.state.statistics.minMyCategoryName}</Text>
            <Text>and how much: {this.state.statistics.minMyCategoryAmount}</Text>
          </View>
        </View>
          {this.state.loading && <LoadingComponent/>}
      </View>
    );
  }

  componentWillMount = async () => {
      this.setState({loading: true});
      await this.requestStats();
      this.setState({loading: false});
  };

  requestStats = async () => {
    const user = this.props.navigation.state.params.user;
    try {
      const response = await fetch('https://us-central1-debtshare.cloudfunctions.net/calculateStatistics',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email
          })
        });
      const responseJson = await response.json();
      this.setState({statistics: responseJson});
      // console.log(this.state.statistics);
    } catch (error) {
      console.error(error);
    }
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor,
    padding: 20,
  },
  header: {
    fontSize: 35,
    paddingBottom: 20,
  },
  answers: {
    flex: 1,
    justifyContent: 'space-between',
  },
  block: {
    flex: 1,
  },
});
