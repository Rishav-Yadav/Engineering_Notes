const STORAGE_KEYS = {
  topic: 'engineeringNotebook.topic',
  question: 'engineeringNotebook.question',
  technicalNotes: 'engineeringNotebook.technicalNotes',
  personalNotes: 'engineeringNotebook.personalNotes',
  lastUpdated: 'engineeringNotebook.lastUpdated',
};

const topicInput = document.querySelector('#topicInput');
const questionInput = document.querySelector('#questionInput');
const technicalNotes = document.querySelector('#technicalNotes');
const personalNotes = document.querySelector('#personalNotes');
const lastUpdated = document.querySelector('#lastUpdated');
const copyButton = document.querySelector('#copyButton');
const copyStatus = document.querySelector('#copyStatus');
const clearSession = document.querySelector('#clearSession');
const updateTimestamp = document.querySelector('#updateTimestamp');

function saveField(key, value) {
  sessionStorage.setItem(key, value);
}

function restoreSession() {
  topicInput.value = sessionStorage.getItem(STORAGE_KEYS.topic) || '';
  questionInput.value = sessionStorage.getItem(STORAGE_KEYS.question) || '';
  technicalNotes.innerHTML = sessionStorage.getItem(STORAGE_KEYS.technicalNotes) || '';
  personalNotes.value = sessionStorage.getItem(STORAGE_KEYS.personalNotes) || '';
  lastUpdated.textContent = sessionStorage.getItem(STORAGE_KEYS.lastUpdated) || 'Not yet updated';
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

function setTimestamp() {
  const timestamp = formatTimestamp();
  lastUpdated.textContent = timestamp;
  saveField(STORAGE_KEYS.lastUpdated, timestamp);
}

function autosaveInputs() {
  topicInput.addEventListener('input', () => saveField(STORAGE_KEYS.topic, topicInput.value));
  questionInput.addEventListener('input', () => saveField(STORAGE_KEYS.question, questionInput.value));
  technicalNotes.addEventListener('input', () => saveField(STORAGE_KEYS.technicalNotes, technicalNotes.innerHTML));
  personalNotes.addEventListener('input', () => saveField(STORAGE_KEYS.personalNotes, personalNotes.value));
}

async function copyQuestion() {
  const text = questionInput.value.trim();

  if (!text) {
    copyStatus.textContent = 'Nothing to copy. Add a question first.';
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Question copied to clipboard.';
  } catch (error) {
    questionInput.select();
    document.execCommand('copy');
    copyStatus.textContent = 'Question copied using fallback clipboard method.';
  }

  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 2800);
}

function clearSessionData() {
  Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
  topicInput.value = '';
  questionInput.value = '';
  technicalNotes.innerHTML = '';
  personalNotes.value = '';
  lastUpdated.textContent = 'Not yet updated';
  copyStatus.textContent = 'Session cleared for this tab.';

  window.setTimeout(() => {
    copyStatus.textContent = '';
  }, 2400);
}

restoreSession();
autosaveInputs();
copyButton.addEventListener('click', copyQuestion);
clearSession.addEventListener('click', clearSessionData);
updateTimestamp.addEventListener('click', setTimestamp);
