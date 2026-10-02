window.I18N_TRANSLATIONS = window.I18N_TRANSLATIONS || {};

window.I18N_TRANSLATIONS.en = {
  page: {
    title: 'Base64 Encoder and Decoder',
    subtitle: 'Encode and decode text and files in base64. Everything works directly in your browser.'
  },
  language: {
    label: 'Language'
  },
  tabs: {
    encode: 'Encode to Base64',
    decode: 'Decode Base64'
  },
  encode: {
    textLabel: 'Text to encode',
    textPlaceholder: 'Enter text to encode to base64...',
    fileLabel: 'Or choose a file',
    filePriority: 'If a file is selected, the text field is ignored.',
    resultLabel: 'Result (base64)'
  },
  decode: {
    textLabel: 'Base64 to decode',
    textPlaceholder: 'Enter base64 to decode into text...',
    fileLabel: 'Or choose a file containing base64',
    filePriority: 'If a file is selected, the text field is ignored. The file must contain base64, with or without line breaks.',
    resultLabel: 'Result (text/file)',
    resultPlaceholder: 'The result will appear here after decoding.'
  },
  fileDrop: {
    message: 'Drop a file here or click to choose one'
  },
  buttons: {
    encode: 'Encode',
    decode: 'Decode',
    copy: 'Copy',
    download: 'Download file',
    clear: 'Clear'
  },
  messages: {
    encoded: 'Successfully encoded.',
    decoded: 'Successfully decoded.',
    binaryDecoded: 'Successfully decoded (binary file).',
    downloaded: 'File downloaded.',
    copied: 'Copied to clipboard.',
    processing: 'Processing...',
    noResultCopy: 'There is no result to copy.',
    noResultDownload: 'There is no result to download.',
    noInput: 'Enter base64 or choose a file.',
    selectFile: 'Choose a file.',
    copyFailed: 'Could not copy to clipboard.',
    binaryCopyUnsupported: 'The result is a binary file. Copying it as text is not supported. Download the file instead.',
    encodeError: 'Encoding error: {error}',
    decodeError: 'Decoding error: {error}',
    fileReadError: 'Error reading the file',
    invalidFileReaderResult: 'Invalid FileReader result',
    resultPlaceholder: 'The result will appear here after decoding.',
    selectedFile: 'Selected: {name} ({size} bytes, {type})',
    unknownType: 'unknown type'
  }
};