/* eslint-disable indent */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

createEvent = (eventData, eventParams, type) => {
  const userId = eventParams.userId;
  const friendId = eventParams.friendId;
  const debtId = eventParams.debtId;

  let events = [];
  let name = '';
  let photoURL = '';
  let event = {};
  let updateEvents = {};

  db.collection('users').doc(userId).get().then(doc => {
    photoURL = doc.data().photoURL;
    name = doc.data().name;
  })
    .then(() => {
      event = {
        id: debtId,
        type: type,
        user: name,
        photoURL: photoURL,
        email: userId,
        amount: -eventData.amount,
        description: eventData.description,
        timestamp: eventData.timestamp,
      };
      console.log(event);
    })
    .then(() =>
      db.collection('users').doc(friendId).get()
        .then(doc => {
          events = doc.data().events;
          console.log(events);
        })
        .then(() => {
          if (events.length >= 3) {
            events = events.slice(0, 2);
            events.unshift(event);
            updateEvents = db.collection('users').doc(friendId).update(
              {events: events}
            );
          } else {
            events.unshift(event);
            updateEvents = db.collection('users').doc(friendId).update(
              {events: events}
            );
          }
        }));
  return updateEvents;
};

exports.rewriteAddedDebt = functions.firestore
  .document('users/{userId}/friends/{friendId}/debts/{debtId}')
  .onCreate(event => {
    const newDebt = event.data.data();
    const userId = event.params.userId;
    const friendId = event.params.friendId;
    const debtId = event.params.debtId;
    if (!newDebt.rewritten) {
      newDebt.rewritten = true;
      newDebt.amount = -newDebt.amount;

      const updateEvents = createEvent(newDebt, event.params, 'create');

      db.collection('users').doc(friendId)
        .collection('friends').doc(userId)
        .get().then(friend => {

        const updateBalance = db.collection('users').doc(friendId)
          .collection('friends').doc(userId)
          .update({
            balance: Number((friend.data().balance + newDebt.amount).toFixed(2)),
          });

        const rewriteDebt = db.collection('users').doc(friendId)
          .collection('friends').doc(userId)
          .collection('debts').doc(debtId)
          .set(newDebt);

        return Promise.all([updateBalance, rewriteDebt, updateEvents]);
      });
    }
    return -1;
  });

exports.rewriteEditedDebt = functions.firestore
  .document('users/{userId}/friends/{friendId}/debts/{debtId}')
  .onUpdate(event => {
    const newDebt = event.data.data();
    const userId = event.params.userId;
    const friendId = event.params.friendId;
    const debtId = event.params.debtId;
    const prevAmount = event.data.previous.data().amount;
    if (!newDebt.rewritten) {
      newDebt.rewritten = true;
      newDebt.amount = -newDebt.amount;

      const updateEvents = createEvent(newDebt, event.params, 'edit');

      db.collection('users').doc(friendId)
        .collection('friends').doc(userId)
        .get()
        .then(friend => {

          const updateBalance = db.collection('users').doc(friendId)
            .collection('friends').doc(userId)
            .update({
              balance: Number((friend.data().balance + prevAmount + newDebt.amount).toFixed(2)),
            });

          const rewriteDebt = db.collection('users').doc(friendId)
            .collection('friends').doc(userId)
            .collection('debts').doc(debtId)
            .set(newDebt);

          return Promise.all([updateBalance, rewriteDebt, updateEvents]);
        });
    }
    return -1;
  });

exports.deleteDeletedDebt = functions.firestore
  .document('users/{userId}/friends/{friendId}/debts/{debtId}')
  .onDelete(event => {
    const userId = event.params.userId;
    const friendId = event.params.friendId;
    const debtId = event.params.debtId;
    const amount = event.data.previous.data().amount;

    db.collection('users').doc(friendId)
      .collection('friends').doc(userId)
      .collection('debts').doc(debtId).get().then(doc => {

        if (doc.exists) {

          const updateEvents = createEvent(event.data.previous.data(), event.params, 'delete');

          db.collection('users').doc(friendId)
            .collection('friends').doc(userId)
            .get().then(friend => {

            const updateBalance = db.collection('users').doc(friendId)
              .collection('friends').doc(userId)
              .update({
                balance: Number((friend.data().balance + amount).toFixed(2)),
              });

            const deleteDebt = db.collection('users').doc(friendId)
              .collection('friends').doc(userId)
              .collection('debts').doc(debtId)
              .delete();

            return Promise.all([updateBalance, deleteDebt, updateEvents]);
          });
        }
      }
    );
    return -1;
  });

exports.calculateStatistics = functions.https.onRequest((req, res) => {
  const email = req.body.email;
  let maxBalance = Number.MIN_SAFE_INTEGER;
  let minBalance = Number.MAX_SAFE_INTEGER;
  let maxFriend = '';
  let minFriend = '';
  let food = {
    name: 'Food',
    my: 0,
    friend: 0
  };
  let electronics = {
    name: 'Electronics',
    my: 0,
    friend: 0
  };
  let cleaning = {
    name: 'Cleaning agents',
    my: 0,
    friend: 0
  };
  let other = {
    name: 'Other',
    my: 0,
    friend: 0
  };
  let repayments = {
    name: 'Repayment of debt',
    my: 0,
    friend: 0
  };
  let promises = [];
  // console.log(email);
  return db.collection('users').doc(email).collection('friends').get()
    .then(friends => {
      friends.forEach(doc => {
        let temp = doc.data();
        // console.log(temp);
        if (temp.balance > maxBalance) {
          maxBalance = temp.balance;
          maxFriend = temp.name;
        }
        if (temp.balance < minBalance) {
          minBalance = temp.balance;
          minFriend = temp.name;
        }
        promises.push(doc.ref.collection('debts').get());
      });
    })
    .then(() => Promise.all(promises))
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.forEach(doc => {
          const debt = doc.data();
          const amount = debt.amount;
          // console.log('debt amount: ', amount);
          // console.log('deb category: ', debt.category);
          if (amount > 0) {
            switch (debt.category) {
            case 'Food':
              food.friend += amount;
              break;
            case 'Other':
              other.friend += amount;
              break;
            case 'Electronics':
              electronics.friend += amount;
              break;
            case 'Cleaning agents':
              cleaning.friend += amount;
              break;
            case 'Repayment of debt':
              repayments.friend += amount;
              break;
            }
          }
          if (amount < 0) {
            switch (debt.category) {
            case 'Food':
              food.my += amount;
              break;
            case 'Other':
              other.my += amount;
              break;
            case 'Electronics':
              electronics.my += amount;
              break;
            case 'Cleaning agents':
              cleaning.my += amount;
              break;
            case 'Repayment of debt':
              repayments.my += amount;
              break;
            }
          }
        });
      });
    })
    .then(() => {
      const categories = [food, electronics, cleaning, other, repayments];
      // console.log(categories);
      let maxFriendCategoryAmount = Number.MIN_SAFE_INTEGER;
      let minMyCategoryAmount = Number.MAX_SAFE_INTEGER;
      let maxFriendCategoryName = '';
      let minMyCategoryName = '';

      categories.forEach(category => {
        if (category.friend > maxFriendCategoryAmount) {
          maxFriendCategoryAmount = category.friend;
          maxFriendCategoryName = category.name;
        }
        if (category.my < minMyCategoryAmount) {
          minMyCategoryAmount = category.my;
          minMyCategoryName = category.name;
        }
      });

      const response = {
        maxBalance, maxFriend: maxFriend, minBalance, minFriend,
        maxFriendCategoryAmount, maxFriendCategoryName, minMyCategoryAmount, minMyCategoryName
      };
      res.status(200).send(response);
    })
    .catch(error => console.error(error));
});