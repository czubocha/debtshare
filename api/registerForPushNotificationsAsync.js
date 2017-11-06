import {Permissions, Notifications} from 'expo';
import * as firebase from 'firebase';

// Example server, implemented in Rails: https://git.io/vKHKv
const PUSH_ENDPOINT = 'https://expo-push-server.herokuapp.com/tokens';

export default (async function registerForPushNotificationsAsync() {
  // Android remote notification permissions are granted during the app
  // install, so this will only ask on iOS
  let {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);

  // Stop here if the user did not grant permissions
  if (status !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync();

  // let logged = null;

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      // console.log('user logged in!');
      const db = firebase.firestore();
      console.log('saving ', token, ' in firestore for ', user.email);
      await db.collection('users').doc(user.email).update({
        token: token
      });
    } else {
      console.log('token not sent, not logged');
    }
  });

  // console.log(logged);
  //
  // if(logged) {
  //   const db = firebase.firestore();
  //   console.log('saving token for ', logged.email);
  //   await db.collection('users').doc(logged.email).update({
  //     token: token
  //   });
  // }

  // POST the token to our backend so we can use it to send pushes from there
  // return fetch(PUSH_ENDPOINT, {
  //   method: 'POST',
  //   headers: {
  //     Accept: 'application/json',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     token: {
  //       value: token,
  //     },
  //   }),
  // });
});
