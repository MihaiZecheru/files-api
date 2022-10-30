import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

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
const storage = getStorage(app);
const auth = getAuth();

const form = document.querySelector("form"),
fileInput = document.querySelector(".file-input"),
progressArea = document.querySelector(".progress-area"),
uploadedArea = document.querySelector(".uploaded-area");

function addFileInfoToFirestore(email, file, size, downloadURL) {
  const db = getFirestore();
  const collectionsRef = collection(db, email);
  addDoc(collectionsRef, {
    email,
    name: file.name,
    size: size,
    type: file.name.substring(file.name.lastIndexOf(".") + 1),
    url: downloadURL,
    date: Timestamp.fromDate(new Date())
  });
}

function uuid4() {
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  if (uuid[0] in ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
    uuid = "a" + uuid.slice(1);
  }
  return;
}

function showSnackBar() {
  var sb = document.getElementById("snackbar");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

function showFileError() {
  var sb = document.getElementById("file-error");
  sb.className = "show";
  setTimeout(() => { sb.className = sb.className.replace("show", "") }, 3000);
}

String.prototype.format = function(b) {
  return this.replace("{0}", b);
}

function generateProgressHTML(name, fileLoaded, red) {
  const uuid = uuid4();
  return { uuid, progressHTML:
    `<li class="row" ${red ? "style='background: salmon!important;'" : ""}>
      <i class="fas fa-file-alt"></i>
      <div class="content">
        <div class="details">
          <span class="name">${name} • Uploading</span>
          <div>
            <span class="percent">${fileLoaded}%</span>
            <span class="material-symbols-outlined close ${uuid}">close</span>
          </div>
        </div>
        {0}    
      </div>
    </li>`.format(red ? "" : `<div class="progress-bar"><div class="progress" style="width: ${fileLoaded}%"></div></div>`)
  };
}

function generateUploadHTML(name, fileSize) {
  const uuid = uuid4();
  return { uuid, uploadedHTML:
    `<li class="row">
      <div class="content upload">
        <i class="fas fa-file-alt"></i>
        <div class="details">
          <span class="name ${uuid}">${name} • Uploaded</span>
          <span class="size">${fileSize}</span>
        </div>
      </div>
      <span class="material-symbols-outlined link ${uuid}" tabindex="0">link</span>
      <i class="fas fa-check"></i>
    </li>`
  };
}

function addStopDownloadEventListener(uuid, uploadTask) {
  document.querySelector(`span.close.${uuid}`).addEventListener("click", () => {
    uploadTask.cancel();
    document.querySelector(`span.close.${uuid}`).parentElement.parentElement.parentElement.parentElement.remove();
  });
}

function addCopyLinkEventListener(uuid, filename, downloadURL) {
  const elements = document.querySelectorAll(`span.${uuid}`);
  const copylink_button = elements[1];
  const viewfullname_button = elements[0];
  viewfullname_button.title = filename;
  copylink_button.addEventListener("click", () => {
    navigator.clipboard.writeText(downloadURL).then(() => {
      showSnackBar();
    });
  });
  const copylink_buttons = document.querySelectorAll("span.material-symbols-outlined.link");
  copylink_buttons[copylink_buttons.length - 1].addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        document.querySelector(".d-flex > a:last-child").focus();
      } else {
        document.querySelector("nav > div > a").focus();
      }
    }
  });
}

form.addEventListener("click", () =>{
  fileInput.click();
});

fileInput.onchange = async ({ target }) => {
  let file = target.files[0];
  if (file) {
    let fileName = file.name;
    
    if (fileName.length >= 11) {
      let splitName = fileName.split('.');
      fileName = splitName[0].substring(0, 12) + " ... " + splitName[1];
    }

    // only allow files less than 50MB
    if (file.size > 50000000) {
      showFileError();
    } else {
      await uploadFile(fileName, file);
    }
  }
}

async function uploadFile(shortened_filename, file) {
  const fileRef = ref(storage, file.name);
  const uploadTask = uploadBytesResumable(fileRef, file);

  const updateProgress = (progress, red = false) => {
    let { progressHTML, uuid } = generateProgressHTML(shortened_filename, progress, red);
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;
    addStopDownloadEventListener(uuid, uploadTask);
  }

  let total_file_size, loaded_file_size = 0;
  await uploadTask.on("state_changed", (snapshot) => {
    loaded_file_size = snapshot.bytesTransferred;
    total_file_size = snapshot.totalBytes;
    const progress = Math.round((loaded_file_size / total_file_size) * 100, 2);
    updateProgress(progress);
  }, (error) => {
    if (error.message.endsWith("(storage/unknown)")) window.location.reload(); // user cancelled upload
    updateProgress(0, true);
    console.log(`ERROR: ${error.message}`);
    uploadedArea.classList.remove("onprogress");
  }, async () => {
    // done uploading
    progressArea.innerHTML = "";
    
    let fileTotal = Math.floor(total_file_size / 1000);
    let fileSize;
    
    if (fileTotal < 1024) {
      fileSize = fileTotal + " KB";
    } else {
      fileSize = (loaded_file_size / (1024 * 1024)).toFixed(2) + " MB";
    }

    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    if (auth.currentUser) {
      addFileInfoToFirestore(auth.currentUser.email, file, fileSize, downloadURL);
    }

    let { uploadedHTML, uuid } = generateUploadHTML(shortened_filename, fileSize);
    uploadedArea.classList.remove("onprogress");
    uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    addCopyLinkEventListener(uuid, file.name, downloadURL);
  });
}

document.body.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  form.parentElement.style.scale = "1.1";
  form.parentElement.parentElement.style.border = ".2em dashed #fff";
});

document.body.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  form.parentElement.style.scale = "1";
  form.parentElement.parentElement.style.border = "none";
});

document.body.addEventListener("drop", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  form.parentElement.style.scale = "1";
  form.parentElement.parentElement.style.border = "none";

  const files = e.dataTransfer.files;
  if (files.length > 1) {
    showTooManyFilesError();
    return;
  }

  const file = files[0];
  let fileName = file.name;
    
  if (fileName.length >= 11) {
    let splitName = fileName.split('.');
    fileName = splitName[0].substring(0, 12) + " ... " + splitName[1];
  }
  
  // only allow files less than 50MB
  if (file.size > 50000000) {
    showFileError();
  } else {
    await uploadFile(fileName, file);
  }
});

document.querySelector(".d-flex > a:last-child").addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    
    if (e.shiftKey) {
      document.querySelector(".d-flex > a").focus();
      return;
    }

    const next_ele = document.querySelector("span.material-symbols-outlined.link");
    if (next_ele) {
      next_ele.focus();
    } else {
      document.querySelector("nav > div > a").focus(); 
    }
  }
});

document.querySelector("nav > div > a").addEventListener("keydown", (e) => {
  if (e.shiftKey && e.key === "Tab") {
    e.preventDefault();
    const next_ele = document.querySelector("span.material-symbols-outlined.link");
    if (next_ele) {
      next_ele.focus();
    } else {
      document.querySelector(".d-flex > a:last-child").focus();
    }
  }
});