
'use strict';

const IV_LENGTH = 16;

function validateEncryptionKey(encryptionKey) {
  if (!encryptionKey || encryptionKey.length !== 32) {
    throw new Error('Invalid or missing encryption key');
  }
}

async function encryptText() {
  const inputText = document.getElementById('inputText').value;
  const encryptionKey = document.getElementById('encryptionKey').value;

  try {
    const encryptedText = await encrypt(inputText, encryptionKey);
    document.getElementById('outputText').value = encryptedText;
  } catch (error) {
    alert(error.message);
  }
}

async function decryptText() {
  const inputText = document.getElementById('inputText').value;
  const encryptionKey = document.getElementById('encryptionKey').value;

  try {
    const decryptedText = await decrypt(inputText, encryptionKey);
    document.getElementById('outputText').value = decryptedText;
  } catch (error) {
    alert(error.message);
  }
}

async function encrypt(text, encryptionKey) {
  validateEncryptionKey(encryptionKey);

  const encoder = new TextEncoder();
  const encodedKey = encoder.encode(encryptionKey);
  const subtleCrypto = window.crypto.subtle;

  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const algorithm = { name: 'AES-CBC', iv: iv };
  const key = await subtleCrypto.importKey('raw', encodedKey, { name: 'AES-CBC' }, false, ['encrypt']);
  const encryptedBuffer = await subtleCrypto.encrypt(algorithm, key, encoder.encode(text));
  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const encryptedText = ivToHex(iv) + ':' + byteArrayToHex(encryptedArray);

  return encryptedText;
}

async function decrypt(text, encryptionKey) {
  validateEncryptionKey(encryptionKey);

  const encoder = new TextEncoder();
  const encodedKey = encoder.encode(encryptionKey);
  const subtleCrypto = window.crypto.subtle;

  const [ivHex, encryptedHexString] = text.split(':');
  const iv = hexToUint8Array(ivHex);
  const algorithm = { name: 'AES-CBC', iv: iv };
  const key = await subtleCrypto.importKey('raw', encodedKey, { name: 'AES-CBC' }, false, ['decrypt']);
  const encryptedArray = hexToUint8Array(encryptedHexString);
  const decryptedBuffer = await subtleCrypto.decrypt(algorithm, key, new Uint8Array(encryptedArray));
  const decryptedText = new TextDecoder().decode(decryptedBuffer);

  return decryptedText;
}

function ivToHex(iv) {
  return Array.from(iv).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function byteArrayToHex(array) {
  return array.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}