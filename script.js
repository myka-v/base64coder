// Tabs
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

// UTF‑8 текст ↔ base64
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

// Бінарні дані (Uint8Array) ↔ base64
function uint8ToBase64(u8) {
  let binary = '';
  for (let i = 0; i < u8.length; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function sanitizeBase64(str) {
  return str.replace(/\s+/g, '');
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ===== Кодування (Encode) =====

const encTextarea = document.getElementById('enc-textarea');
const encFileInput = document.getElementById('enc-file');
const encDrop = document.getElementById('enc-drop');
const encFileInfo = document.getElementById('enc-file-info');
const encOutput = document.getElementById('enc-output');
const encRunBtn = document.getElementById('enc-run');
const encCopyBtn = document.getElementById('enc-copy');
const encDownloadBtn = document.getElementById('enc-download');
const encClearBtn = document.getElementById('enc-clear');
const encStatus = document.getElementById('enc-status');

let encSelectedFile = null;

// File select / drag-drop
encDrop.addEventListener('click', () => encFileInput.click());
encFileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    encSelectedFile = file;
    encFileInfo.textContent = `Обрано: ${file.name} (${file.size} байт, ${file.type || 'невідомий тип'})`;
    clearStatus(encStatus);
  }
});

['dragenter', 'dragover'].forEach(evt =>
  encDrop.addEventListener(evt, (e) => {
    e.preventDefault();
    encDrop.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach(evt =>
  encDrop.addEventListener(evt, (e) => {
    e.preventDefault();
    encDrop.classList.remove('dragover');
  })
);
encDrop.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) {
    encSelectedFile = file;
    encFileInput.files = e.dataTransfer.files;
    encFileInfo.textContent = `Обрано: ${file.name} (${file.size} байт, ${file.type || 'невідомий тип'})`;
    clearStatus(encStatus);
  }
});

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Помилка читання файлу'));
    reader.readAsArrayBuffer(file);
  });
}

encRunBtn.addEventListener('click', async () => {
  try {
    encOutput.textContent = 'Обробка...';
    clearStatus(encStatus);

    let base64Result = '';
    let sourceIsFile = false;
    let sourceFileName = '';
    let sourceIsBinary = false;

    if (encSelectedFile) {
      sourceIsFile = true;
      sourceFileName = encSelectedFile.name;
      const arrayBuffer = await fileToArrayBuffer(encSelectedFile);
      const u8 = new Uint8Array(arrayBuffer);
      base64Result = uint8ToBase64(u8);
      sourceIsBinary = true;
    } else {
      const text = encTextarea.value;
      base64Result = utf8ToBase64(text);
      sourceIsBinary = false;
    }

    encOutput.textContent = base64Result;

    // Метадані для завантаження
    encOutput.dataset.sourceIsFile = sourceIsFile ? '1' : '0';
    encOutput.dataset.sourceFileName = sourceFileName || '';
    encOutput.dataset.sourceIsBinary = sourceIsBinary ? '1' : '0';

    setStatus(encStatus, 'Успішно закодовано.', 'success');
  } catch (e) {
    encOutput.textContent = '';
    setStatus(encStatus, 'Помилка кодування: ' + e.message, 'error');
  }
});

encCopyBtn.addEventListener('click', async () => {
  const text = encOutput.textContent;
  if (!text || text === 'Обробка...') {
    setStatus(encStatus, 'Немає результату для копіювання.', 'error');
    return;
  }
  try {
    await copyText(text);
    setStatus(encStatus, 'Скопійовано в буфер обміну.', 'success');
  } catch {
    setStatus(encStatus, 'Не вдалося скопіювати.', 'error');
  }
});

encDownloadBtn.addEventListener('click', () => {
  const text = encOutput.textContent;
  if (!text || text === 'Обробка...') {
    setStatus(encStatus, 'Немає результату для завантаження.', 'error');
    return;
  }

  const sourceIsFile = encOutput.dataset.sourceIsFile === '1';
  const sourceFileName = encOutput.dataset.sourceFileName || '';

  let filename = 'results.base64';
  if (sourceIsFile && sourceFileName) {
    filename = sourceFileName + '.base64';
  }

  const blob = new Blob([text], { type: 'text/plain' });
  downloadBlob(blob, filename);
  setStatus(encStatus, 'Файл завантажено.', 'success');
});

encClearBtn.addEventListener('click', () => {
  encTextarea.value = '';
  encSelectedFile = null;
  encFileInput.value = '';
  encFileInfo.textContent = '';
  encOutput.textContent = '';
  encOutput.dataset.sourceIsFile = '';
  encOutput.dataset.sourceFileName = '';
  encOutput.dataset.sourceIsBinary = '';
  clearStatus(encStatus);
});

// ===== Декодування (Decode) =====

const decTextarea = document.getElementById('dec-textarea');
const decFileInput = document.getElementById('dec-file');
const decDrop = document.getElementById('dec-drop');
const decFileInfo = document.getElementById('dec-file-info');
const decOutput = document.getElementById('dec-output');
const decRunBtn = document.getElementById('dec-run');
const decCopyBtn = document.getElementById('dec-copy');
const decDownloadBtn = document.getElementById('dec-download');
const decClearBtn = document.getElementById('dec-clear');
const decStatus = document.getElementById('dec-status');

let decSelectedFile = null;
let decResultType = 'none'; // 'none' | 'text' | 'binary'
let decResultText = '';    // для text
let decResultBytes = null; // Uint8Array для binary
let decSourceFileName = '';

// File select / drag-drop
decDrop.addEventListener('click', () => decFileInput.click());
decFileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    decSelectedFile = file;
    decSourceFileName = file.name;
    decFileInfo.textContent = `Обрано: ${file.name} (${file.size} байт, ${file.type || 'невідомий тип'})`;
    clearStatus(decStatus);
  }
});

['dragenter', 'dragover'].forEach(evt =>
  decDrop.addEventListener(evt, (e) => {
    e.preventDefault();
    decDrop.classList.add('dragover');
  })
);
['dragleave', 'drop'].forEach(evt =>
  decDrop.addEventListener(evt, (e) => {
    e.preventDefault();
    decDrop.classList.remove('dragover');
  })
);
decDrop.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) {
    decSelectedFile = file;
    decSourceFileName = file.name;
    decFileInput.files = e.dataTransfer.files;
    decFileInfo.textContent = `Обрано: ${file.name} (${file.size} байт, ${file.type || 'невідомий тип'})`;
    clearStatus(decStatus);
  }
});

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Помилка читання файлу'));
    reader.readAsText(file);
  });
}

decRunBtn.addEventListener('click', async () => {
  try {
    decOutput.textContent = 'Обробка...';
    decResultType = 'none';
    decResultText = '';
    decResultBytes = null;
    clearStatus(decStatus);

    let base64Input = '';
    let sourceIsFile = false;

    if (decSelectedFile) {
      sourceIsFile = true;
      const text = await readTextFile(decSelectedFile);
      base64Input = sanitizeBase64(text);
    } else {
      const raw = decTextarea.value;
      base64Input = sanitizeBase64(raw);
      sourceIsFile = false;
    }

    if (!base64Input) {
      decOutput.textContent = "Результат з'явиться тут після декодування.";
      setStatus(decStatus, 'Введіть base64 або оберіть файл.', 'error');
      return;
    }

    // Спробуємо декодувати як бінарні дані (універсально)
    const bytes = base64ToUint8(base64Input);

    // Спробуємо інтерпретувати як UTF‑8 текст
    const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    // Якщо вхід був файл — вважаємо результат бінарним (не псуємо текст)
    if (sourceIsFile) {
      decResultType = 'binary';
      decResultBytes = bytes;
      decOutput.textContent = '(Бінарний файл, доступний для завантаження)';
      setStatus(decStatus, 'Успішно декодовано (бінарний файл).', 'success');
    } else {
      // Вхід — текст, показуємо як текст
      decResultType = 'text';
      decResultText = decodedText;
      decOutput.textContent = decodedText;
      setStatus(decStatus, 'Успішно декодовано.', 'success');
    }

    // Метадані для завантаження
    decOutput.dataset.sourceIsFile = sourceIsFile ? '1' : '0';
    decOutput.dataset.sourceFileName = decSourceFileName || '';
  } catch (e) {
    decOutput.textContent = "Результат з'явиться тут після декодування.";
    decResultType = 'none';
    decResultText = '';
    decResultBytes = null;
    setStatus(decStatus, 'Помилка декодування: ' + e.message, 'error');
  }
});

decCopyBtn.addEventListener('click', async () => {
  if (decResultType === 'none') {
    setStatus(decStatus, 'Немає результату для копіювання.', 'error');
    return;
  }

  if (decResultType === 'text') {
    try {
      await copyText(decResultText);
      setStatus(decStatus, 'Скопійовано в буфер обміну.', 'success');
    } catch {
      setStatus(decStatus, 'Не вдалося скопіювати.', 'error');
    }
  } else if (decResultType === 'binary') {
    setStatus(
      decStatus,
      'Результат — бінарний файл. Копіювання як текст не підтримується. Завантажте файл.',
      'error'
    );
  }
});

decDownloadBtn.addEventListener('click', () => {
  if (decResultType === 'none') {
    setStatus(decStatus, 'Немає результату для завантаження.', 'error');
    return;
  }

  const sourceIsFile = decOutput.dataset.sourceIsFile === '1';
  const sourceFileName = decOutput.dataset.sourceFileName || '';

  let filename = 'results.decoded';
  if (sourceIsFile && sourceFileName) {
    filename = sourceFileName + '.decoded';
  }

  if (decResultType === 'text') {
    const blob = new Blob([decResultText], { type: 'text/plain' });
    downloadBlob(blob, filename);
    setStatus(decStatus, 'Файл завантажено.', 'success');
  } else if (decResultType === 'binary') {
    const blob = new Blob([decResultBytes], { type: 'application/octet-stream' });
    downloadBlob(blob, filename);
    setStatus(decStatus, 'Файл завантажено.', 'success');
  }
});

decClearBtn.addEventListener('click', () => {
  decTextarea.value = '';
  decSelectedFile = null;
  decSourceFileName = '';
  decFileInput.value = '';
  decFileInfo.textContent = '';
  decOutput.textContent = "Результат з'явиться тут після декодування.";
  decOutput.dataset.sourceIsFile = '';
  decOutput.dataset.sourceFileName = '';
  decResultType = 'none';
  decResultText = '';
  decResultBytes = null;
  clearStatus(decStatus);
});