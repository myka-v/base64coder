const TRANSLATIONS = window.I18N_TRANSLATIONS || {};
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS);
const LANGUAGE_STORAGE_KEY = 'base64-tool-language';

let currentLanguage = DEFAULT_LANGUAGE;

// ===== Допоміжні функції для перекладів =====

function getNestedValue(object, path) {
  return path.split('.').reduce((value, key) => (value && value[key] !== undefined) ? value[key] : undefined, object);
}

function translate(key, variables = {}) {
  let value = getNestedValue(TRANSLATIONS[currentLanguage], key);

  if (typeof value !== 'string') {
    return key;
  }

  Object.entries(variables).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });

  return value;
}

function getBrowserLanguage() {
  const languages = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const language of languages) {
    const shortLanguage = language.toLowerCase().split('-')[0];

    if (SUPPORTED_LANGUAGES.includes(shortLanguage)) {
      return shortLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }

  return getBrowserLanguage();
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    const value = translate(key);

    if (element.matches('input, textarea')) {
      element.value = value;
    } else {
      element.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });

  const languageSelect = document.getElementById('language-select');
  languageSelect.value = currentLanguage;
  languageSelect.setAttribute('aria-label', translate('language.label'));

  const decodeOutput = document.getElementById('dec-output');

  if (decodeOutput.dataset.isPlaceholder === 'true') {
    decodeOutput.textContent = translate('decode.resultPlaceholder');
  }
}

function changeLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    language = DEFAULT_LANGUAGE;
  }

  currentLanguage = language;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  applyTranslations();
}

document.getElementById('language-select').addEventListener('change', event => {
  changeLanguage(event.target.value);
});

// ===== Загальні функції =====

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `status ${type}`;
}

function clearStatus(element) {
  element.textContent = '';
  element.className = 'status';
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  return uint8ToBase64(bytes);
}

function base64ToUtf8(base64) {
  const bytes = base64ToUint8(base64);
  return new TextDecoder().decode(bytes);
}

function uint8ToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function sanitizeBase64(value) {
  return value.replace(/\s+/g, '');
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => {
      reject(reader.error || new Error(translate('messages.fileReadError')));
    };

    reader.readAsArrayBuffer(file);
  });
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => {
      reject(reader.error || new Error(translate('messages.fileReadError')));
    };

    reader.readAsText(file);
  });
}

function selectedFileText(file) {
  return translate('messages.selectedFile', {
    name: file.name,
    size: file.size,
    type: file.type || translate('messages.unknownType')
  });
}

function bindFileDrop(dropElement, inputElement, onFileSelected) {
  dropElement.addEventListener('click', () => inputElement.click());

  inputElement.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      onFileSelected(file);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropElement.addEventListener(eventName, event => {
      event.preventDefault();
      dropElement.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropElement.addEventListener(eventName, event => {
      event.preventDefault();
      dropElement.classList.remove('dragover');
    });
  });

  dropElement.addEventListener('drop', event => {
    const file = event.dataTransfer.files && event.dataTransfer.files[0];

    if (file) {
      onFileSelected(file);
    }
  });
}

// ===== Вкладки =====

const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

function activateTab(id) {
  tabButtons.forEach(button => {
    const active = button.dataset.tab === id;

    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === id);
  });
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => activateTab(button.dataset.tab));
});

// ===== Кодування =====

const encTextarea = document.getElementById('enc-textarea');
const encFileInput = document.getElementById('enc-file');
const encDrop = document.getElementById('enc-drop');
const encFileInfo = document.getElementById('enc-file-info');
const encOutput = document.getElementById('enc-output');
const encRunButton = document.getElementById('enc-run');
const encCopyButton = document.getElementById('enc-copy');
const encDownloadButton = document.getElementById('enc-download');
const encClearButton = document.getElementById('enc-clear');
const encStatus = document.getElementById('enc-status');

let encSelectedFile = null;

function setEncodeFile(file) {
  encSelectedFile = file;
  encFileInfo.textContent = selectedFileText(file);
  clearStatus(encStatus);
}

bindFileDrop(encDrop, encFileInput, setEncodeFile);

encRunButton.addEventListener('click', async () => {
  try {
    encOutput.textContent = translate('messages.processing');
    clearStatus(encStatus);

    let result;
    let sourceIsFile = false;
    let sourceFileName = '';

    if (encSelectedFile) {
      sourceIsFile = true;
      sourceFileName = encSelectedFile.name;

      const buffer = await fileToArrayBuffer(encSelectedFile);
      result = uint8ToBase64(new Uint8Array(buffer));
    } else {
      result = utf8ToBase64(encTextarea.value);
    }

    encOutput.textContent = result;
    encOutput.dataset.sourceIsFile = sourceIsFile ? '1' : '0';
    encOutput.dataset.sourceFileName = sourceFileName;

    setStatus(encStatus, translate('messages.encoded'), 'success');
  } catch (error) {
    encOutput.textContent = '';
    setStatus(
      encStatus,
      translate('messages.encodeError', { error: error.message }),
      'error'
    );
  }
});

encCopyButton.addEventListener('click', async () => {
  const result = encOutput.textContent;

  if (!result || result === translate('messages.processing')) {
    setStatus(encStatus, translate('messages.noResultCopy'), 'error');
    return;
  }

  try {
    await copyText(result);
    setStatus(encStatus, translate('messages.copied'), 'success');
  } catch {
    setStatus(encStatus, translate('messages.copyFailed'), 'error');
  }
});

encDownloadButton.addEventListener('click', () => {
  const result = encOutput.textContent;

  if (!result || result === translate('messages.processing')) {
    setStatus(encStatus, translate('messages.noResultDownload'), 'error');
    return;
  }

  const sourceIsFile = encOutput.dataset.sourceIsFile === '1';
  const sourceFileName = encOutput.dataset.sourceFileName;

  const filename = sourceIsFile && sourceFileName
    ? `${sourceFileName}.base64`
    : 'results.base64';

  downloadBlob(new Blob([result], { type: 'text/plain;charset=utf-8' }), filename);
  setStatus(encStatus, translate('messages.downloaded'), 'success');
});

encClearButton.addEventListener('click', () => {
  encTextarea.value = '';
  encSelectedFile = null;
  encFileInput.value = '';
  encFileInfo.textContent = '';
  encOutput.textContent = '';
  encOutput.dataset.sourceIsFile = '';
  encOutput.dataset.sourceFileName = '';
  clearStatus(encStatus);
});

// ===== Декодування =====

const decTextarea = document.getElementById('dec-textarea');
const decFileInput = document.getElementById('dec-file');
const decDrop = document.getElementById('dec-drop');
const decFileInfo = document.getElementById('dec-file-info');
const decOutput = document.getElementById('dec-output');
const decRunButton = document.getElementById('dec-run');
const decCopyButton = document.getElementById('dec-copy');
const decDownloadButton = document.getElementById('dec-download');
const decClearButton = document.getElementById('dec-clear');
const decStatus = document.getElementById('dec-status');

let decSelectedFile = null;
let decResultType = 'none';
let decResultText = '';
let decResultBytes = null;

function setDecodeFile(file) {
  decSelectedFile = file;
  decFileInfo.textContent = selectedFileText(file);
  clearStatus(decStatus);
}

bindFileDrop(decDrop, decFileInput, setDecodeFile);

decRunButton.addEventListener('click', async () => {
  try {
    decOutput.textContent = translate('messages.processing');
    decOutput.dataset.isPlaceholder = 'false';

    decResultType = 'none';
    decResultText = '';
    decResultBytes = null;

    clearStatus(decStatus);

    let base64Input;
    let sourceIsFile = false;
    let sourceFileName = '';

    if (decSelectedFile) {
      sourceIsFile = true;
      sourceFileName = decSelectedFile.name;

      const text = await readTextFile(decSelectedFile);
      base64Input = sanitizeBase64(text);
    } else {
      base64Input = sanitizeBase64(decTextarea.value);
    }

    if (!base64Input) {
      decOutput.textContent = translate('decode.resultPlaceholder');
      decOutput.dataset.isPlaceholder = 'true';

      setStatus(decStatus, translate('messages.noInput'), 'error');
      return;
    }

    const bytes = base64ToUint8(base64Input);

    if (sourceIsFile) {
      decResultType = 'binary';
      decResultBytes = bytes;
      decOutput.textContent = translate('messages.binaryDecoded');

      setStatus(decStatus, translate('messages.binaryDecoded'), 'success');
    } else {
      decResultType = 'text';
      decResultText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      decOutput.textContent = decResultText;

      setStatus(decStatus, translate('messages.decoded'), 'success');
    }

    decOutput.dataset.sourceIsFile = sourceIsFile ? '1' : '0';
    decOutput.dataset.sourceFileName = sourceFileName;
  } catch (error) {
    decOutput.textContent = translate('decode.resultPlaceholder');
    decOutput.dataset.isPlaceholder = 'true';

    decResultType = 'none';
    decResultText = '';
    decResultBytes = null;

    setStatus(
      decStatus,
      translate('messages.decodeError', { error: error.message }),
      'error'
    );
  }
});

decCopyButton.addEventListener('click', async () => {
  if (decResultType === 'none') {
    setStatus(decStatus, translate('messages.noResultCopy'), 'error');
    return;
  }

  if (decResultType === 'binary') {
    setStatus(
      decStatus,
      translate('messages.binaryCopyUnsupported'),
      'error'
    );
    return;
  }

  try {
    await copyText(decResultText);
    setStatus(decStatus, translate('messages.copied'), 'success');
  } catch {
    setStatus(decStatus, translate('messages.copyFailed'), 'error');
  }
});

decDownloadButton.addEventListener('click', () => {
  if (decResultType === 'none') {
    setStatus(decStatus, translate('messages.noResultDownload'), 'error');
    return;
  }

  const sourceIsFile = decOutput.dataset.sourceIsFile === '1';
  const sourceFileName = decOutput.dataset.sourceFileName;

  const filename = sourceIsFile && sourceFileName
    ? `${sourceFileName}.decoded`
    : 'results.decoded';

  if (decResultType === 'binary') {
    downloadBlob(
      new Blob([decResultBytes], { type: 'application/octet-stream' }),
      filename
    );
  } else {
    downloadBlob(
      new Blob([decResultText], { type: 'text/plain;charset=utf-8' }),
      filename
    );
  }

  setStatus(decStatus, translate('messages.downloaded'), 'success');
});

decClearButton.addEventListener('click', () => {
  decTextarea.value = '';
  decSelectedFile = null;
  decFileInput.value = '';
  decFileInfo.textContent = '';

  decOutput.textContent = translate('decode.resultPlaceholder');
  decOutput.dataset.isPlaceholder = 'true';
  decOutput.dataset.sourceIsFile = '';
  decOutput.dataset.sourceFileName = '';

  decResultType = 'none';
  decResultText = '';
  decResultBytes = null;

  clearStatus(decStatus);
});

// ===== Запуск =====

(function initializeApplication() {
  const language = getInitialLanguage();
  changeLanguage(language);

  const decOutput = document.getElementById('dec-output');
  decOutput.dataset.isPlaceholder = 'true';
})();