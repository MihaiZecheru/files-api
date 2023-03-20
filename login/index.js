import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQbDmNR165Y9tzAlLfInNSKYv8a9OTLTM",
  authDomain: "files-api-cce3d.firebaseapp.com",
  projectId: "files-api-cce3d",
  storageBucket: "files-api-cce3d.appspot.com",
  messagingSenderId: "782315339115",
  appId: "1:782315339115:web:fff416cd09641ea91c202e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// change login button based on auth
setTimeout(() => {
  if (auth.currentUser) {
    const btn = document.getElementById("login-header");
    btn.innerText = "Logout";
    btn.onclick = () => {
      auth.signOut();
      window.location.reload();
    };
  }  
}, 500);

const email_box = document.getElementById('email');
const password_box = document.getElementById('password');
const login_button = document.getElementById('login');

function invalidLoginSnackbar() {
  var sb = document.getElementById("invalidLoginSnackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

login_button.addEventListener('click', (e) => {
  const email = email_box.value;
  const password = password_box.value;

  if (!email) {
    email_box.focus();
    return;
  } else if (!password) {
    password_box.focus();
    return;
  }

  signInWithEmailAndPassword(auth, email, password).then(() => {
    window.location.href = '/files';
  }).catch((error) => {
    if (error.message.includes("auth/invalid-email") || error.message.includes("auth/user-not-found") || error.message.includes("auth/wrong-password")) {
      invalidLoginSnackbar();
    }
  });
});

login_button.addEventListener('keydown', (e) => {
  if (e.code === "Tab") {
    e.preventDefault();
    if (e.shiftKey) {
      password_box.focus();
    } else {
      document.querySelector("nav > div > a").focus();
    }
  }
});

email_box.addEventListener('keydown', (e) => {
  if (e.code === "Tab") {
    e.preventDefault();
    if (e.shiftKey) {
      document.querySelector(".d-flex > a:last-child").focus();
    } else {
      password_box.focus();
    }
  }

  if (e.code === "Enter") {
    e.preventDefault();
    login_button.click();
  }
});

password_box.addEventListener('keydown', (e) => {
  if (e.code === "Enter") {
    login_button.click();
  }
});

document.querySelector("nav > div > a").addEventListener('keydown', (e) => {
  if (e.shiftKey && e.code === "Tab") {
    e.preventDefault();
    login_button.focus();
  }
});
