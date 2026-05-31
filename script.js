import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const NOTEBOOK_PATH = ['engineering-notebook', 'main'];
const SAVE_DELAY_MS = 1000;
const EMPTY_NOTEBOOK = {
  topic: '',
  question: '',
  technicalNotes: '',
  personalNotes: '',
  lastUpdated: '',
};

const topicInput = document.querySelector('#topicInput');
const questionInput = document.querySelector('#questionInput');
const technicalNotes = document.querySelector('#technicalNotes');
const personalNotes = document.querySelector('#personalNotes');
const lastUpdated = document.querySelector('#lastUpdated');
const copyButton = document.querySelector('#copyButton');
const copyStatus = document.querySelector('#copyStatus');
const cloudStatus = document.querySelector('#cloudStatus');
const saveStatus = document.querySelector('#saveStatus');
const clearNotebook = document.querySelector('#clearNotebook');
const updateTimestamp = document.querySelector('#updateTimestamp');

let notebookRef;
let saveTimer;
let applyingRemoteUpdate = false;
let isCloudReady = false;

function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every((value) => value && !value.startsWith('YOUR_'));
}

function setCloudStatus(isConnected) {
  cloudStatus.classList.toggle('offline', !isConnected);
  cloudStatus.classList.toggle('connected', isConnected);
  cloudStatus.innerHTML = `<span class="status-dot"></span>Cloud Sync: ${isConnected ? 'Connected' : 'Offline'}`;
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function getNotebookData() {
  return {
    topic: topicInput.value,
    question: questionInput.value,
    technicalNotes: technicalNotes.innerHTML,
    personalNotes: personalNotes.value,
    lastUpdated: lastUpdated.textContent === 'Not yet updated' ? '' : lastUpdated.textContent,
  };
}

function renderNotebook(data = EMPTY_NOTEBOOK) {
  applyingRemoteUpdate = true;
  topicInput.value = data.topic || '';
  questionInput.value = data.question || '';
  technicalNotes.innerHTML = data.technicalNotes || '';
  personalNotes.value = data.personalNotes || '';
  lastUpdated.textContent = data.lastUpdated || 'Not yet updated';
  applyingRemoteUpdate = false;
}

async function saveNotebook(data = getNotebookData()) {
  if (!isCloudReady) {
    setSaveStatus('Offline');
    return;
  }

  setSaveStatus('Saving...');

  try {
    await setDoc(notebookRef, {
      ...EMPTY_NOTEBOOK,
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setSaveStatus('Saved');
    setCloudStatus(true);
  } catch (error) {
    console.error("Firestore error:", error);
    setSaveStatus('Save failed');
    setCloudStatus(false);
  }
}

function scheduleSave() {
  if (applyingRemoteUpdate) {
    return;
  }

  window.clearTimeout(saveTimer);
  setSaveStatus('Saving...');
  saveTimer = window.setTimeout(() => saveNotebook(), SAVE_DELAY_MS);
}

function bindAutosave() {
  [topicInput, questionInput, technicalNotes, personalNotes].forEach((field) => {
    field.addEventListener('input', scheduleSave);
  });
}

function subscribeToNotebook() {
  return onSnapshot(notebookRef, (snapshot) => {
    setCloudStatus(true);

    if (snapshot.exists()) {
      renderNotebook(snapshot.data());
    } else {
      renderNotebook();
      saveNotebook(EMPTY_NOTEBOOK);
    }

    if (!snapshot.metadata.hasPendingWrites) {
      setSaveStatus('Saved');
    }
  }, (error) => {
    console.error("Firestore error:", error);
    setCloudStatus(false);
    setSaveStatus('Offline');
  });
}

async function copyCurrentUrl() {
  try {
    await navigator.clipboard.writeText(window.location.href.split('#')[0]);
    copyStatus.textContent = 'Notebook URL copied. Open it on your phone to view the synced content.';
  } catch (error) {
    copyStatus.textContent = 'Unable to copy automatically. Copy the page URL from the address bar.';
  }

  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 5200);
}

async function updateLastUpdated() {
  lastUpdated.textContent = formatTimestamp();
  await saveNotebook();
}

async function clearNotebookData() {
  const confirmed = window.confirm('Clear the shared Engineering Notebook for every synced device?');

  if (!confirmed) {
    return;
  }

  window.clearTimeout(saveTimer);
  renderNotebook();
  await saveNotebook(EMPTY_NOTEBOOK);
}

function initializeCloudSync() {
  if (!isFirebaseConfigured()) {
    setCloudStatus(false);
    setSaveStatus('Offline');
    copyStatus.textContent = 'Add your Firebase credentials in firebase-config.js to enable cloud sync.';
    return;
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  notebookRef = doc(db, ...NOTEBOOK_PATH);
  isCloudReady = true;
  subscribeToNotebook();
}

window.addEventListener('online', () => setCloudStatus(isCloudReady));
window.addEventListener('offline', () => setCloudStatus(false));

bindAutosave();
copyButton.addEventListener('click', copyCurrentUrl);
clearNotebook.addEventListener('click', clearNotebookData);
updateTimestamp.addEventListener('click', updateLastUpdated);
initializeCloudSync();
