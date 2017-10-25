// @flow

import React from 'react';
import {Image} from 'react-native';
import {AppLoading, Asset, Font} from 'expo';
import {FontAwesome} from '@expo/vector-icons';
import RootNavigation from './navigation/RootNavigation';

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

    return (
      <RootNavigation/>
    );
  }
}
