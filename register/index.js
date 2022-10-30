import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQbDmNR165Y9tzAlLfInNSKYv8a9OTLTM",
  authDomain: "files-api-cce3d.firebaseapp.com",
  projectId: "files-api-cce3d",
  storageBucket: "files-api-cce3d.appspot.com",
  messagingSenderId: "782315339115",
  appId: "1:782315339115:web:fff416cd09641ea91c202e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const email_box = document.getElementById('email');
const password_box = document.getElementById('password');
const confirm_password_box = document.getElementById('confirm-password');
const register_button = document.getElementById('register');

function passwordsDontMatchSnackbar() {
  var sb = document.getElementById("passwordsDontMatchSnackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

function emailExistsSnackbar() {
  var sb = document.getElementById("emailExistsSnackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

function invalidEmailSnackbar() {
  var sb = document.getElementById("invalidEmailSnackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

function weakPasswordSnackbar() {
  var sb = document.getElementById("weakPasswordSnackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

register_button.addEventListener('click', (e) => {
  const email = email_box.value;
  const password = password_box.value;
  const confirm_password = confirm_password_box.value;

  if (!email) {
    email_box.focus();
    return;
  } else if (!password) {
    password_box.focus();
    return;
  } else if (!confirm_password) {
    confirm_password_box.focus();
    return;
  }

  if (password !== confirm_password) {
    passwordsDontMatchSnackbar();
  } else {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password).then(() => {
      window.location.href = '/login';
    }).catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        emailExistsSnackbar();
      } else if (error.code === 'auth/invalid-email') {
        invalidEmailSnackbar();
      } else if (error.code === 'auth/weak-password') {
        weakPasswordSnackbar();
      }
    });
  }
});

register_button.addEventListener('keydown', (e) => {
  if (e.code === "Tab") {
    e.preventDefault();
    if (e.shiftKey) {
      confirm_password_box.focus();
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
});

document.querySelector("nav > div > a").addEventListener('keydown', (e) => {
  if (e.shiftKey && e.code === "Tab") {
    e.preventDefault();
    register_button.focus();
  }
});

new Promise((r) => {
  email_box.blur();
  setTimeout(() => {
    email_box.value = "";
    password_box.value = "";
    email_box.focus();
    r();
  }, 1000);
});

email_box.addEventListener('keydown', (e) => {
  if (e.code === "Enter") {
    register_button.click();
  }
});

password_box.addEventListener('keydown', (e) => {
  if (e.code === "Enter") {
    register_button.click();
  }
});

confirm_password_box.addEventListener('keydown', (e) => {
  if (e.code === "Enter") {
    register_button.click();
  }
});