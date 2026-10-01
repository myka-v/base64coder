// Tabs logic
const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

function activateTab(id) {
  tabButtons.forEach(btn => {
    const isActive = btn.dataset.tab === id;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  panels.forEach(p => {
    p.classList.toggle('active', p.id === id);
  });
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// Helpers
function setStatus(el, message, type = '') {
  el.textContent = message;
  el.className = 'status ' + (type || '');
}

function clearStatus(el) {
  el.textContent = '';
  el.className = 'status';
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function sanitizeBase64(str) {
  return str.replace(/\s+/g, '');
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

// Текст → Base64
const teInput = document.getElementById('te-input');
const teOutput = document.getElementById('te-output');
const teEncodeBtn = document.getElementById('te-encode');
const teCopyBtn = document.getElementById('te-copy');
const teClearBtn = document.getElementById('te-clear');
const teStatus = document.getElementById('te-status');

teEncodeBtn.addEventListener('click', () => {
  try {
    const text = teInput.value;
    const encoded = utf8ToBase64(text);
    teOutput.textContent = encoded;
    setStatus(teStatus, 'Успішно закодовано.', 'success');
  } catch (e) {
    teOutput.textContent = '';
    setStatus(teStatus, 'Помилка кодування: ' + e.message, 'error');
  }
});

teCopyBtn.addEventListener('click', async () => {
  const text = teOutput.textContent;
  if (!text) {
    setStatus(teStatus, 'Немає тексту для копіювання.', 'error');
    return;
  }
  try {
    await copyText(text);
    setStatus(teStatus, 'Скопійовано в буфер обміну.', 'success');
  } catch {
    setStatus(teStatus, 'Не вдалося скопіювати.', 'error');
  }
});

teClearBtn.addEventListener('click', () => {
  teInput.value = '';
  teOutput.textContent = '';
  clearStatus(teStatus);
});

// Base64 → Текст
const tdInput = document.getElementById('td-input');
const tdOutput = document.getElementById('td-output');
const tdDecodeBtn = document.getElementById('td-decode');
const tdCopyBtn = document.getElementById('td-copy');
const tdClearBtn = document.getElementById('td-clear');
const tdStatus = document.getElementById('td-status');

tdDecodeBtn.addEventListener('click', () => {
  try {
    const raw = tdInput.value;
    const b64 = sanitizeBase64(raw);
    if (!b64) {
      setStatus(tdStatus, 'Введіть base64.', 'error');
      tdOutput.textContent = '';
      return;
    }
    const decoded = base64ToUtf8(b64);
    tdOutput.textContent = decoded;
    setStatus(tdStatus, 'Успішно декодовано.', 'success');
  } catch (e) {
    tdOutput.textContent = '';
    setStatus(tdStatus, 'Помилка декодування: ' + e.message, 'error');
  }
});

tdCopyBtn.addEventListener('click', async () => {
  const text = tdOutput.textContent;
  if (!text) {
    setStatus(tdStatus, 'Немає тексту для копіювання.', 'error');
    return;
  }
  try {
    await copyText(text);
    setStatus(tdStatus, 'Скопійовано в буфер обміну.', 'success');
  } catch {
    setStatus(tdStatus, 'Не вдалося скопіювати.', 'error');
  }
});

tdClearBtn.addEventListener('click', () => {
  tdInput.value = '';
  tdOutput.textContent = '';
  clearStatus(tdStatus);
});

// Файл → Base64
const feDrop = document.getElementById('fe-drop');
const feFileInput = document.getElementById('fe-file');
const feInfo = document.getElementById('fe-info');
const feOutput = document.getElementById('fe-output');
const feEncodeBtn = document.getElementById('fe-encode');
const feCopyBtn = document.getElementById('fe-copy');
const feClearBtn = document.getElementById('fe-clear');
const feStatus = document.getElementById('fe-status');

let selectedFile = null;

feDrop.addEventListener('click', () => feFileInput.click());
feFileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    selectedFile = file;
    feInfo.textContent = `Обрано: ${file.name} (${file.size} байт, ${file.type || 'невідомий тип'})`;
    clearStatus(feStatus);
  }
});

['dragenter', 'dragover'].forEach(evt =>
  feDrop.addEventListener(evt, (e) => {
    e.preventDefault();
    feDrop.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach(evt =>
  feDrop.addEventListener(evt, (e) => {
    e.preventDefault();
    feDrop.classList.remove('dragover');
  })
);
feDrop.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) {
    selectedFile = file;
    feFileInput.files = e.dataTransfer.files;
    feInfo.textContent = `Обрано: ${file.name} (${file.size} байт, ${file.type || 'невідомий тип'})`;
    clearStatus(feStatus);
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const commaIndex = dataUrl.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('Некоректний результат FileReader'));
        return;
      }
      const base64 = dataUrl.slice(commaIndex + 1);
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Помилка читання файлу'));
    reader.readAsDataURL(file);
  });
}

feEncodeBtn.addEventListener('click', async () => {
  if (!selectedFile) {
    setStatus(feStatus, 'Оберіть файл.', 'error');
    return;
  }
  try {
    feOutput.textContent = 'Кодування...';
    const base64 = await fileToBase64(selectedFile);
    feOutput.textContent = base64;
    setStatus(feStatus, 'Файл успішно закодовано.', 'success');
  } catch (e) {
    feOutput.textContent = '';
    setStatus(feStatus, 'Помилка кодування файлу: ' + e.message, 'error');
  }
});

feCopyBtn.addEventListener('click', async () => {
  const text = feOutput.textContent;
  if (!text || text.startsWith('Кодування')) {
    setStatus(feStatus, 'Немає base64 для копіювання.', 'error');
    return;
  }
  try {
    await copyText(text);
    setStatus(feStatus, 'Скопійовано в буфер обміну.', 'success');
  } catch {
    setStatus(feStatus, 'Не вдалося скопіювати.', 'error');
  }
});

feClearBtn.addEventListener('click', () => {
  selectedFile = null;
  feFileInput.value = '';
  feInfo.textContent = '';
  feOutput.textContent = '';
  clearStatus(feStatus);
});

// Base64 → Файл
const fdInput = document.getElementById('fd-input');
const fdFilename = document.getElementById('fd-filename');
const fdMime = document.getElementById('fd-mime');
const fdOutput = document.getElementById('fd-output');
const fdDecodeBtn = document.getElementById('fd-decode');
const fdClearBtn = document.getElementById('fd-clear');
const fdStatus = document.getElementById('fd-status');

function base64ToBlob(base64, mime) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime || 'application/octet-stream' });
}

fdDecodeBtn.addEventListener('click', () => {
  try {
    const raw = fdInput.value;
    const b64 = sanitizeBase64(raw);
    if (!b64) {
      setStatus(fdStatus, 'Введіть base64.', 'error');
      fdOutput.textContent = 'Файл буде доступний для завантаження після декодування.';
      return;
    }

    const mime = (fdMime.value || '').trim() || 'application/octet-stream';
    const blob = base64ToBlob(b64, mime);
    const url = URL.createObjectURL(blob);

    let filename = (fdFilename.value || '').trim();
    if (!filename) {
      const ext = mimeToExtension(mime);
      filename = 'download' + (ext ? '.' + ext : '');
    }

    fdOutput.innerHTML = '';
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.textContent = `Завантажити файл: ${filename}`;
    link.className = 'link';
    fdOutput.appendChild(link);

    const info = document.createElement('div');
    info.className = 'small';
    info.style.marginTop = '8px';
    info.textContent = `Розмір: ${blob.size} байт, тип: ${mime}`;
    fdOutput.appendChild(info);

    setStatus(fdStatus, 'Файл готовий до завантаження.', 'success');
  } catch (e) {
    fdOutput.textContent = 'Файл буде доступний для завантаження після декодування.';
    setStatus(fdStatus, 'Помилка декодування: ' + e.message, 'error');
  }
});

function mimeToExtension(mime) {
  const map = {
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/json': 'json',
    'application/pdf': 'pdf',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'application/zip': 'zip',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/octet-stream': 'bin'
  };
  return map[mime] || '';
}

fdClearBtn.addEventListener('click', () => {
  fdInput.value = '';
  fdFilename.value = '';
  fdMime.value = '';
  fdOutput.textContent = 'Файл буде доступний для завантаження після декодування.';
  clearStatus(fdStatus);
});