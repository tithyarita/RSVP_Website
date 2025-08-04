import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
    import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

    // Your Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyBAYWnichIFDWP4EOv3RyZFNqzyUtROCeI",
      authDomain: "rsvp-website-7541d.firebaseapp.com",
      projectId: "rsvp-website-7541d",
      storageBucket: "rsvp-website-7541d.firebasestorage.app",
      messagingSenderId: "519298669065",
      appId: "1:519298669065:web:1e43e4c598af256c2636d8",
      measurementId: "G-MWMKYXF18R"
    };

    const app = initializeApp(firebaseConfig);    
    const db = getFirestore(app);

    export { db, collection, addDoc };
    