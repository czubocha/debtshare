/* eslint-disable indent */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

let db = admin.firestore();

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

      db.collection('users').doc(friendId)
        .collection('friends').doc(userId)
        .get().then(friend => {

        const updateBalance = db.collection('users').doc(friendId)
          .collection('friends').doc(userId)
          .update({
            balance: friend.data().balance + newDebt.amount,
          });

        const rewriteDebt = db.collection('users').doc(friendId)
          .collection('friends').doc(userId)
          .collection('debts').doc(debtId)
          .set(newDebt);

        return Promise.all([updateBalance, rewriteDebt]);
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

      db.collection('users').doc(friendId)
        .collection('friends').doc(userId)
        .get().then(friend => {

        const updateBalance = db.collection('users').doc(friendId)
          .collection('friends').doc(userId)
          .update({
            balance: friend.data().balance + prevAmount + newDebt.amount,
          });

        const rewriteDebt = db.collection('users').doc(friendId)
          .collection('friends').doc(userId)
          .collection('debts').doc(debtId)
          .set(newDebt);

        return Promise.all([updateBalance, rewriteDebt]);
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

          db.collection('users').doc(friendId)
            .collection('friends').doc(userId)
            .get().then(friend => {

            const updateBalance = db.collection('users').doc(friendId)
              .collection('friends').doc(userId)
              .update({
                balance: friend.data().balance + amount,
              });

            const deleteDebt = db.collection('users').doc(friendId)
              .collection('friends').doc(userId)
              .collection('debts').doc(debtId)
              .delete();

            return Promise.all([updateBalance, deleteDebt]);
          });
        }
      }
    );
    return -1;
  });

exports.createUserProfile = functions.auth.user().onCreate(event => {
  const user = event.data;
  return db.collection('users').doc(user.email).set({
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photoURL: user.photoURL,
    events: [],
  });
});
