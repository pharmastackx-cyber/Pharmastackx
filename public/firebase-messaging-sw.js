
// Import the Firebase app and messaging libraries
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

// Your web app's Firebase configuration
// This needs to be here for the service worker to work
const firebaseConfig = {
  apiKey: "AIzaSyABreq9YVCdK7k_t6bShsigK8Rmiiz5Um0",
  authDomain: "pharmastackx-a3beb.firebaseapp.com",
  projectId: "pharmastackx-a3beb",
  storageBucket: "pharmastackx-a3beb.appspot.com",
  messagingSenderId: "438683670037",
  appId: "1:438683670037:web:1424ea0ad070281c5de01c",
};

// Initialize the Firebase app in the service worker
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// The service worker can listen for background messages here if needed
// For now, it just needs to be present to handle notifications
