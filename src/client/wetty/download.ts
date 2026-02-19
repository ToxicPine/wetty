import fileType from 'file-type';

const DEFAULT_FILE_BEGIN = '\u001b[5i';
const DEFAULT_FILE_END = '\u001b[4i';

type OnCompleteFile = (bufferCharacters: string) => void;

function showToast(fileName: string, blobUrl: string, duration = 10000): void {
  const el = document.createElement('div');
  el.className = 'wetty-toast';
  el.append('Download ready: ');
  const a = document.createElement('a');
  a.href = blobUrl;
  a.target = '_blank';
  a.download = fileName;
  a.textContent = fileName;
  el.appendChild(a);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function onCompleteFile(bufferCharacters: string): void {
  let fileNameBase64;
  let fileCharacters = bufferCharacters;
  if (bufferCharacters.includes(':')) {
    [fileNameBase64, fileCharacters] = bufferCharacters.split(':');
  }
  try {
    fileCharacters = window.atob(fileCharacters);
  } catch {
    // Assuming it's not base64
  }

  const bytes = new Uint8Array(fileCharacters.length);
  for (let i = 0; i < fileCharacters.length; i += 1) {
    bytes[i] = fileCharacters.charCodeAt(i);
  }

  let mimeType = 'application/octet-stream';
  let fileExt = '';
  const typeData = fileType(bytes);
  if (typeData) {
    mimeType = typeData.mime;
    fileExt = typeData.ext;
  }
  // eslint-disable-next-line no-control-regex
  else if (/^[\x00-\xFF]*$/.test(fileCharacters)) {
    mimeType = 'text/plain';
    fileExt = 'txt';
  }

  let fileName;
  try {
    if (fileNameBase64 !== undefined) {
      fileName = window.atob(fileNameBase64);
    }
  } catch {
    // Filename wasn't base64-encoded
  }

  if (fileName === undefined) {
    const ts = new Date()
      .toISOString()
      .split('.')[0]
      .replace(/-/g, '')
      .replace('T', '')
      .replace(/:/g, '');
    fileName = `file-${ts}${fileExt ? `.${fileExt}` : ''}`;
  }

  const blob = new Blob([new Uint8Array(bytes.buffer)], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  showToast(fileName, blobUrl);
}

export class FileDownloader {
  fileBuffer: string[];
  fileBegin: string;
  fileEnd: string;
  partialFileBegin: string;
  onCompleteFileCallback: OnCompleteFile;

  constructor(
    onCompleteFileCallback: OnCompleteFile = onCompleteFile,
    fileBegin: string = DEFAULT_FILE_BEGIN,
    fileEnd: string = DEFAULT_FILE_END,
  ) {
    this.fileBuffer = [];
    this.fileBegin = fileBegin;
    this.fileEnd = fileEnd;
    this.partialFileBegin = '';
    this.onCompleteFileCallback = onCompleteFileCallback;
  }

  bufferCharacter(character: string): string {
    if (this.fileBuffer.length === 0) {
      if (this.partialFileBegin.length === 0) {
        if (character === this.fileBegin[0]) {
          this.partialFileBegin = character;
          return '';
        }
        return character;
      }

      const nextExpected = this.fileBegin[this.partialFileBegin.length];
      if (character === nextExpected) {
        this.partialFileBegin += character;
        if (this.partialFileBegin === this.fileBegin) {
          this.partialFileBegin = '';
          this.fileBuffer = this.fileBuffer.concat(this.fileBegin.split(''));
          return '';
        }
        return '';
      }

      const data = this.partialFileBegin + character;
      this.partialFileBegin = '';
      return data;
    }

    this.fileBuffer.push(character);
    if (
      this.fileBuffer.length >= this.fileBegin.length + this.fileEnd.length &&
      this.fileBuffer.slice(-this.fileEnd.length).join('') === this.fileEnd
    ) {
      this.onCompleteFileCallback(
        this.fileBuffer
          .slice(
            this.fileBegin.length,
            this.fileBuffer.length - this.fileEnd.length,
          )
          .join(''),
      );
      this.fileBuffer = [];
    }

    return '';
  }

  buffer(data: string): string {
    if (
      this.fileBuffer.length === 0 &&
      this.partialFileBegin.length === 0 &&
      data.indexOf(this.fileBegin[0]) === -1
    ) {
      return data;
    }
    return data.split('').map(this.bufferCharacter.bind(this)).join('');
  }
}
