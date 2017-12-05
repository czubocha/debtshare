import React from 'react';
import {Image} from 'react-native';
import {AppLoading, Asset, Font} from 'expo';
import {FontAwesome} from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import * as firebase from 'firebase/index';
import RootNavigator from './navigation/RootNavigation';
import MainTabNavigator from './navigation/MainTabNavigator';

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

function cacheFonts(fonts) {
  return fonts.map(font => Font.loadAsync(font));
}

const firebaseConfig = {
  apiKey: 'AIzaSyCOGVNsrV3lj-IzTk_wAOx66K3s4lwN3DA',
  authDomain: 'debtshare.firebaseapp.com',
  projectId: 'debtshare'
};

const originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(body) {
  if (body === '') {
    originalSend.call(this);
  } else {
    originalSend.call(this, body);
  }
};

export default class App extends React.Component {
  state = {
    isReady: false,
  };

  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      require('./assets/images/robot-dev.png'),
      require('./assets/images/robot-prod.png'),
    ]);

    const fontAssets = cacheFonts([FontAwesome.font,
      {'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')},
    ]);

    window.Image = () => {
    };

    firebase.initializeApp(firebaseConfig);

    await Promise.all([...imageAssets, ...fontAssets]);
  }

  render() {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this._loadAssetsAsync}
          onFinish={() => this.setState({isReady: true})}
          onError={console.warn}
        />
      );
    }

    return <RootNavigator user={this.state.user}/>;
    // console.log('render changed ', this.state.user ? this.state.user.email : 'user null');
    // return this.state.user ? <MainTabNavigator/> : <RootNavigator/>;
  }
}
