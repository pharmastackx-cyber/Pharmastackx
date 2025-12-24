
// Scripts for Firebase v9+
self.importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyABreq9YVCdK7k_t6bShsigK8Rmiiz5Um0",
  authDomain: "pharmastackx-a3beb.firebaseapp.com",
  projectId: "pharmastackx-a3beb",
  storageBucket: "pharmastackx-a3beb.appspot.com",
  messagingSenderId: "438683670037",
  appId: "1:438683670037:web:1424ea0ad070281c5de01c",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    data: {
        // This is the important part: we're passing the URL from the
        // remote payload to the notification's data object.
        url: payload.data.url
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // This is the new code to broadcast a message to the app
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    if (windowClients && windowClients.length) {
      windowClients.forEach((client) => {
        client.postMessage({
          type: 'NEW_DISPATCH_REQUEST'
        });
      });
    }
  });

  // By returning a promise, we keep the service worker alive until the message is sent.
  return promiseChain;
});

// This is the new event listener for notification clicks.
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);

  // Close the notification when it's clicked.
  event.notification.close();

  // This looks for the url we passed in the data object.
  const urlToOpen = event.notification.data.url || '/';

  // This will open the URL in a new window/tab.
  // If a window with that URL is already open, it will focus that window.
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clientList) => {
    let client = null;

    for (let i = 0; i < clientList.length; i++) {
      if (clientList[i].url === urlToOpen) {
        client = clientList[i];
        break;
      }
    }

    if (client) {
      return client.focus();
    } else {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});
