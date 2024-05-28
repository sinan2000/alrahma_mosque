
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAmxVa2Pmgh83XpUDRlChN58WqTqNp21g4",
    authDomain: "al-rahma-f4145.firebaseapp.com",
    projectId: "al-rahma-f4145",
    storageBucket: "al-rahma-f4145.appspot.com",
    messagingSenderId: "1097316538793",
    appId: "1:1097316538793:web:4d0893517c7a4384ffccb8"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db;