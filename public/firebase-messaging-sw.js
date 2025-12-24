
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
    icon: '/icons/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
