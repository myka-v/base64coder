window.I18N_TRANSLATIONS = window.I18N_TRANSLATIONS || {};

window.I18N_TRANSLATIONS.uk = {
  page: {
    title: 'Кодування та декодування Base64',
    subtitle: 'Кодування та декодування тексту й файлів у base64. Працює повністю в браузері.'
  },
  language: {
    label: 'Мова'
  },
  tabs: {
    encode: 'Кодувати у Base64',
    decode: 'Декодувати Base64'
  },
  encode: {
    textLabel: 'Текст для кодування',
    textPlaceholder: 'Введіть текст для кодування в base64...',
    fileLabel: 'Або оберіть файл',
    filePriority: 'Якщо обрано файл, текст із поля ігнорується.',
    resultLabel: 'Результат (base64)'
  },
  decode: {
    textLabel: 'Base64 для декодування',
    textPlaceholder: 'Введіть base64 для декодування у текст...',
    fileLabel: 'Або оберіть файл (текстовий, з base64)',
    filePriority: 'Якщо обрано файл, текст із поля ігнорується. Файл має містити base64 (можна з переносами).',
    resultLabel: 'Результат (текст/файл)',
    resultPlaceholder: 'Результат з\'явиться тут після декодування.'
  },
  fileDrop: {
    message: 'Перетягніть файл сюди або натисніть, щоб обрати'
  },
  buttons: {
    encode: 'Закодувати',
    decode: 'Декодувати',
    copy: 'Копіювати',
    download: 'Завантажити файл',
    clear: 'Очистити'
  },
  messages: {
    encoded: 'Успішно закодовано.',
    decoded: 'Успішно декодовано.',
    binaryDecoded: 'Успішно декодовано (бінарний файл).',
    downloaded: 'Файл завантажено.',
    copied: 'Скопійовано в буфер обміну.',
    processing: 'Обробка...',
    noResultCopy: 'Немає результату для копіювання.',
    noResultDownload: 'Немає результату для завантаження.',
    noInput: 'Введіть base64 або оберіть файл.',
    selectFile: 'Оберіть файл.',
    copyFailed: 'Не вдалося скопіювати.',
    binaryCopyUnsupported: 'Результат — бінарний файл. Копіювання як текст не підтримується. Завантажте файл.',
    encodeError: 'Помилка кодування: {error}',
    decodeError: 'Помилка декодування: {error}',
    fileReadError: 'Помилка читання файлу',
    invalidFileReaderResult: 'Некоректний результат FileReader',
    resultPlaceholder: 'Результат з\'явиться тут після декодування.',
    selectedFile: 'Обрано: {name} ({size} байт, {type})',
    unknownType: 'невідомий тип'
  }
};