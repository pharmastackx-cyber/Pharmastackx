
// Import the Workbox caching logic from the auto-generated sw.js
self.importScripts('sw.js');

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

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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
        url: payload.data.url
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // Broadcast a message to the app
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

  return promiseChain;
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

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
