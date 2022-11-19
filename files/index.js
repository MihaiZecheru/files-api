import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";

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
const auth = getAuth();

function uuid4() {
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  if (uuid[0] in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
    uuid = "a" + uuid.slice(1);
  }
  return uuid;
}

function showSnackbar() {
  var sb = document.getElementById("snackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

function finishLoading() {
  document.getElementById("loading").style.display = "none";
  document.querySelector("table").style.display = "table";
}

function createTableRow(doc, num) {
  const row = document.createElement("tr");
  const number = document.createElement("th");
  const name = document.createElement("td");
  const extension = document.createElement("td");
  const size = document.createElement("td");
  const date = document.createElement("td");
  const link = document.createElement("td");
  
  const copy_uuid = uuid4().trim();
  const download_uuid = uuid4().trim();

  number.setAttribute("scope", "row");
  number.innerText = num;
  name.innerText = doc.name.substring(0, doc.name.indexOf("."));
  extension.innerText = doc.type;
  size.innerText = doc.size;
  date.innerText = doc.date.toDate().toLocaleString().replace(/,/g, "");
  link.innerHTML = `<div class="link-col"><span class="material-symbols-outlined close" id="${copy_uuid}" tabindex="0">link</span><a href="${doc.url}" target="_blank">View</a><a href="#" data-url="${doc.url}" data-name="${doc.name}" id="${download_uuid}"><span class="material-symbols-outlined">file_download</span></a></div>`;

  row.appendChild(number);
  row.appendChild(name);
  row.appendChild(extension);
  row.appendChild(size);
  row.appendChild(date);
  row.appendChild(link);

  return { row, copy_uuid, download_uuid };
}

function download(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function download_blob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  download(url, filename);
}

function populateTable(docs) {
  if (!docs.length) {
    finishLoading();
    return;
  }

  document.querySelector("tbody").innerHTML = "";
  for (let i = 0; i < docs.length; i++) {
    const { row, copy_uuid, download_uuid } = createTableRow(docs[i], i + 1);
    document.querySelector("tbody").appendChild(row);

    function copy_link(key) {
      if (key === "Enter" || !key) {
        navigator.clipboard.writeText(docs[i].url);
        showSnackbar();
      }
    }

    document.getElementById(copy_uuid).addEventListener("click", (e) => { copy_link(false) });
    document.getElementById(copy_uuid).addEventListener("keypress", (e) => { copy_link(e.key) });

    document.getElementById(download_uuid).addEventListener("click", async () => {
      const url = "https://cors-anywhere.herokuapp.com/" + document.getElementById(download_uuid).getAttribute("data-url");
      const filename = document.getElementById(download_uuid).getAttribute("data-name");
      const blob = await fetch(url, {
        method: 'GET',
        headers: {
          'Origin': 'https://127.0.0.1:5500/files'
        }
      }).then((r) => r.blob());
      download_blob(blob, filename);
    });
  }

  // tabbing
  document.querySelector("tbody tr:last-child > td:last-child span:last-child").parentElement.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (!e.shiftKey) {
        document.querySelector("nav > div > a").focus();
      } else {
        document.querySelector("tbody tr:last-child > td:last-child a").focus();
      }
    }
  });

  // hide spinner and show table
  finishLoading();
}

document.querySelector("nav > div > a").addEventListener("keydown", (e) => {
  if (e.key === "Tab" && e.shiftKey) {
    e.preventDefault();
    document.querySelector("tbody tr:last-child > td:last-child span:last-child").parentElement.focus();
  }
});

async function getFileData(email) {
  const db = getFirestore();
  const collectionsRef = collection(db, email);

  let docs = [];
  await getDocs(query(collectionsRef, orderBy('date'), limit(50))).then((res) => {
    res.forEach((doc) => {
      docs.push(doc.data());
    });
  });
  return docs;
}

// sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCurrentUser() {
  let tries = 15;
  while (!auth.currentUser && tries > 0) {
    await sleep(100);
    tries--;
  }

  if (auth.currentUser) {
    return auth.currentUser;
  } else {
    throw new Error("Could not get current user"); 
  }
}

getCurrentUser().then(async (user) => {
  populateTable(await getFileData(user.email));
}).catch(async () => {
  if (!auth.currentUser) {
    window.location.href = "/login";
  } else {
    populateTable(await getFileData(auth.currentUser.email));
  }
});

document.getElementById("search-button").addEventListener("click", () => {
  const query = document.getElementById("search-box").value;
  const re = new RegExp(query, "i");
  const rows = document.querySelectorAll("tbody tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.children[1].innerText;
    const extension = row.children[2].innerText;
    const size = row.children[3].innerText;
    const date = row.children[4].innerText;
    if (name.match(re) || extension.match(re) || size.match(re) || date.match(re)) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  }
});

document.getElementById("search-button").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("search-button").click();
  }
});

document.body.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.code === "KeyF") {
    e.preventDefault();
    document.getElementById("search-box").focus();
  }
});

document.getElementById("search-box").addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("search-box").blur();
  }

  if (e.key === "Enter") {
    document.getElementById("search-button").click();
  }
});
