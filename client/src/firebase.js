import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Firebase configuration from the provided image
const firebaseConfig = {
  apiKey: "AIzaSyCKA6I4A-CLHy8Hi5nePMLRdOzsS_2KJAU",
  authDomain: "hackathon-e6a63.firebaseapp.com",
  projectId: "hackathon-e6a63",
  storageBucket: "hackathon-e6a63.appspot.com",
  messagingSenderId: "533298414418",
  appId: "1:533298414418:web:your-app-id", // Replace with actual App ID if needed
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Google Provider
const googleProvider = new GoogleAuthProvider();

// Initialize GitHub Provider
const githubProvider = new OAuthProvider('github.com');

export { auth, googleProvider, githubProvider };