/*
Quantumult X

[task_local]
0 0 * * * https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/bitboo_quantumultx_decrypt.js, tag=BitBoo, enabled=false, argument=secret=bitboo8888oobtib

[rewrite_local]
^https:\/\/81\.71\.98\.184\/api_v2\/node_list url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/bitboo_quantumultx_decrypt.js

[mitm]
hostname = 81.71.98.184

Default behavior:
1. Decrypt the current response body when used as `script-response-body`.
2. Fetch `api_v2/node_list`, decrypt it, convert share nodes to Quantumult X lines,
   and save the result into `$prefs` when used as `task_local`.

Supported arguments:
- secret=bitboo8888oobtib
- nodeBody=<base64 request body>
- nodeUrl=https://81.71.98.184/api_v2/node_list
- mode=task|request|response
*/

const BitBooQX = (() => {
  const DEFAULTS = {
    mode: "",
    secret: "bitboo8888oobtib",
    nodeUrl: "https://81.71.98.184/api_v2/node_list",
    nodeBody:
      "Y7D/a1Ybbq9pCLiHV4tKi7MlQbSLWhBxBX9qpceeivSLmIRioCQXx2NlbwZ1zwkBcNdBwpkmW2LvQIngcDZ2LUbCYgb6kyEt42NfoYhA6Pw7cyQDbRMx1zjx9drpSQSbZOVUOLP63RaGJlu8RD/uJrhnBtCxnnLTd28yPlIWp3t9SpypWJbd+obDrUTqZDFRHj96fvn+l5jrL151xbk/ZU2CPyc0vlMsXrjd0gHJDO0=",
    userAgent: "Dart/3.8 (dart:io)",
    storeKey: "bitboo_qx_nodes",
    requestKey: "bitboo_qx_last_request",
    jsonKey: "bitboo_qx_last_json"
  };

  const SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
  ];

  const INV_SBOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
  ];

  const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
  const KEY = [0x17, 0x12, 0xea, 0x6d, 0xbb, 0x9c, 0xea, 0xbb, 0x17, 0x12, 0xea, 0x6d, 0xbb, 0x9c, 0xea, 0xbb,
    0x17, 0x12, 0xea, 0x6d, 0xbb, 0x9c, 0xea, 0xbb, 0x17, 0x12, 0xea, 0x6d, 0xbb, 0x9c, 0xea, 0xbb];
  const ZERO_IV = new Array(16).fill(0);
  const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  function parseArguments(argumentText) {
    const out = {};
    if (!argumentText) return out;
    const pairs = String(argumentText).split("&");
    for (const pair of pairs) {
      if (!pair) continue;
      const index = pair.indexOf("=");
      if (index === -1) {
        out[safeDecodeURIComponent(pair)] = "";
        continue;
      }
      const key = safeDecodeURIComponent(pair.slice(0, index));
      const value = safeDecodeURIComponent(pair.slice(index + 1));
      out[key] = value;
    }
    return out;
  }

  function safeDecodeURIComponent(value) {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return value;
    }
  }

  function mergeConfig() {
    return Object.assign({}, DEFAULTS, parseArguments(typeof $argument === "string" ? $argument : ""));
  }

  function utf8Encode(text) {
    const out = [];
    for (let i = 0; i < text.length; i += 1) {
      let code = text.charCodeAt(i);
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
        const next = text.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
          i += 1;
        }
      }
      if (code <= 0x7f) {
        out.push(code);
      } else if (code <= 0x7ff) {
        out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code <= 0xffff) {
        out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        out.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        );
      }
    }
    return out;
  }

  function utf8Decode(bytes) {
    let result = "";
    for (let i = 0; i < bytes.length; i += 1) {
      const byte1 = bytes[i];
      if (byte1 <= 0x7f) {
        result += String.fromCharCode(byte1);
        continue;
      }
      if (byte1 >= 0xc2 && byte1 <= 0xdf) {
        const byte2 = bytes[++i];
        result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        continue;
      }
      if (byte1 >= 0xe0 && byte1 <= 0xef) {
        const byte2 = bytes[++i];
        const byte3 = bytes[++i];
        result += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
        continue;
      }
      const byte2 = bytes[++i];
      const byte3 = bytes[++i];
      const byte4 = bytes[++i];
      const codePoint =
        ((byte1 & 0x07) << 18) |
        ((byte2 & 0x3f) << 12) |
        ((byte3 & 0x3f) << 6) |
        (byte4 & 0x3f);
      const adjusted = codePoint - 0x10000;
      result += String.fromCharCode(0xd800 + (adjusted >> 10), 0xdc00 + (adjusted & 0x3ff));
    }
    return result;
  }

  function base64Decode(input) {
    if (typeof Buffer !== "undefined") {
      return Array.from(Buffer.from(String(input).trim(), "base64"));
    }
    const clean = String(input).replace(/\s+/g, "");
    const out = [];
    for (let i = 0; i < clean.length; i += 4) {
      const c1 = clean[i];
      const c2 = clean[i + 1];
      const c3 = clean[i + 2];
      const c4 = clean[i + 3];
      const n1 = BASE64_ALPHABET.indexOf(c1);
      const n2 = BASE64_ALPHABET.indexOf(c2);
      const n3 = c3 === "=" ? 0 : BASE64_ALPHABET.indexOf(c3);
      const n4 = c4 === "=" ? 0 : BASE64_ALPHABET.indexOf(c4);
      const bits = (n1 << 18) | (n2 << 12) | (n3 << 6) | n4;
      out.push((bits >> 16) & 0xff);
      if (c3 !== "=") out.push((bits >> 8) & 0xff);
      if (c4 !== "=") out.push(bits & 0xff);
    }
    return out;
  }

  function base64Encode(bytes) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(Uint8Array.from(bytes)).toString("base64");
    }
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i];
      const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
      const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      const bits = (b1 << 16) | (b2 << 8) | b3;
      out += BASE64_ALPHABET[(bits >> 18) & 0x3f];
      out += BASE64_ALPHABET[(bits >> 12) & 0x3f];
      out += i + 1 < bytes.length ? BASE64_ALPHABET[(bits >> 6) & 0x3f] : "=";
      out += i + 2 < bytes.length ? BASE64_ALPHABET[bits & 0x3f] : "=";
    }
    return out;
  }

  function bytesToWord(bytes, offset) {
    return (
      (((bytes[offset] << 24) >>> 0) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]) >>> 0
    );
  }

  function wordToBytes(word) {
    return [(word >>> 24) & 0xff, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff];
  }

  function subWord(word) {
    return (
      (((SBOX[(word >>> 24) & 0xff] << 24) >>> 0) |
        (SBOX[(word >>> 16) & 0xff] << 16) |
        (SBOX[(word >>> 8) & 0xff] << 8) |
        SBOX[word & 0xff]) >>> 0
    );
  }

  function rotWord(word) {
    return (((word << 8) | (word >>> 24)) >>> 0);
  }

  function keyExpansion(keyBytes) {
    const nk = keyBytes.length / 4;
    const nr = nk + 6;
    const words = [];
    for (let i = 0; i < nk; i += 1) {
      words.push(bytesToWord(keyBytes, i * 4));
    }
    for (let i = nk; i < 4 * (nr + 1); i += 1) {
      let temp = words[i - 1];
      if (i % nk === 0) {
        temp = (subWord(rotWord(temp)) ^ (RCON[(i / nk) - 1] << 24)) >>> 0;
      } else if (nk > 6 && i % nk === 4) {
        temp = subWord(temp);
      }
      words.push((words[i - nk] ^ temp) >>> 0);
    }
    const roundKeys = [];
    for (let r = 0; r <= nr; r += 1) {
      roundKeys.push([
        ...wordToBytes(words[r * 4]),
        ...wordToBytes(words[r * 4 + 1]),
        ...wordToBytes(words[r * 4 + 2]),
        ...wordToBytes(words[r * 4 + 3])
      ]);
    }
    return roundKeys;
  }

  function addRoundKey(state, roundKey) {
    const out = new Array(16);
    for (let i = 0; i < 16; i += 1) {
      out[i] = state[i] ^ roundKey[i];
    }
    return out;
  }

  function invShiftRows(state) {
    return [
      state[0], state[13], state[10], state[7],
      state[4], state[1], state[14], state[11],
      state[8], state[5], state[2], state[15],
      state[12], state[9], state[6], state[3]
    ];
  }

  function invSubBytes(state) {
    return state.map((value) => INV_SBOX[value]);
  }

  function gfMul(a, b) {
    let p = 0;
    let left = a;
    let right = b;
    for (let i = 0; i < 8; i += 1) {
      if (right & 1) p ^= left;
      const hi = left & 0x80;
      left = (left << 1) & 0xff;
      if (hi) left ^= 0x1b;
      right >>= 1;
    }
    return p;
  }

  function invMixColumns(state) {
    const out = new Array(16);
    for (let c = 0; c < 4; c += 1) {
      const i = c * 4;
      const a0 = state[i];
      const a1 = state[i + 1];
      const a2 = state[i + 2];
      const a3 = state[i + 3];
      out[i] = gfMul(a0, 0x0e) ^ gfMul(a1, 0x0b) ^ gfMul(a2, 0x0d) ^ gfMul(a3, 0x09);
      out[i + 1] = gfMul(a0, 0x09) ^ gfMul(a1, 0x0e) ^ gfMul(a2, 0x0b) ^ gfMul(a3, 0x0d);
      out[i + 2] = gfMul(a0, 0x0d) ^ gfMul(a1, 0x09) ^ gfMul(a2, 0x0e) ^ gfMul(a3, 0x0b);
      out[i + 3] = gfMul(a0, 0x0b) ^ gfMul(a1, 0x0d) ^ gfMul(a2, 0x09) ^ gfMul(a3, 0x0e);
    }
    return out;
  }

  function decryptBlock(block, roundKeys) {
    const rounds = roundKeys.length - 1;
    let state = Array.from(block);
    state = addRoundKey(state, roundKeys[rounds]);
    for (let round = rounds - 1; round > 0; round -= 1) {
      state = invShiftRows(state);
      state = invSubBytes(state);
      state = addRoundKey(state, roundKeys[round]);
      state = invMixColumns(state);
    }
    state = invShiftRows(state);
    state = invSubBytes(state);
    state = addRoundKey(state, roundKeys[0]);
    return state;
  }

  function subBytes(state) {
    return state.map((value) => SBOX[value]);
  }

  function shiftRows(state) {
    return [
      state[0], state[5], state[10], state[15],
      state[4], state[9], state[14], state[3],
      state[8], state[13], state[2], state[7],
      state[12], state[1], state[6], state[11]
    ];
  }

  function xtime(value) {
    return value & 0x80 ? (((value << 1) ^ 0x1b) & 0xff) : ((value << 1) & 0xff);
  }

  function mixSingle(value) {
    return xtime(value) ^ value;
  }

  function mixColumns(state) {
    const out = new Array(16);
    for (let c = 0; c < 4; c += 1) {
      const i = c * 4;
      const a0 = state[i];
      const a1 = state[i + 1];
      const a2 = state[i + 2];
      const a3 = state[i + 3];
      out[i] = xtime(a0) ^ mixSingle(a1) ^ a2 ^ a3;
      out[i + 1] = a0 ^ xtime(a1) ^ mixSingle(a2) ^ a3;
      out[i + 2] = a0 ^ a1 ^ xtime(a2) ^ mixSingle(a3);
      out[i + 3] = mixSingle(a0) ^ a1 ^ a2 ^ xtime(a3);
    }
    return out;
  }

  function encryptBlock(block, roundKeys) {
    const rounds = roundKeys.length - 1;
    let state = Array.from(block);
    state = addRoundKey(state, roundKeys[0]);
    for (let round = 1; round < rounds; round += 1) {
      state = subBytes(state);
      state = shiftRows(state);
      state = mixColumns(state);
      state = addRoundKey(state, roundKeys[round]);
    }
    state = subBytes(state);
    state = shiftRows(state);
    state = addRoundKey(state, roundKeys[rounds]);
    return state;
  }

  function aesCbcDecrypt(cipherBytes, keyBytes, ivBytes) {
    if (cipherBytes.length % 16 !== 0) {
      throw new Error("cipher length must be a multiple of 16");
    }
    const roundKeys = keyExpansion(keyBytes);
    const plain = [];
    let previous = ivBytes.slice();
    for (let i = 0; i < cipherBytes.length; i += 16) {
      const block = cipherBytes.slice(i, i + 16);
      const decrypted = decryptBlock(block, roundKeys);
      for (let j = 0; j < 16; j += 1) {
        plain.push(decrypted[j] ^ previous[j]);
      }
      previous = block;
    }
    const pad = plain[plain.length - 1];
    if (pad >= 1 && pad <= 16) {
      let valid = true;
      for (let i = 0; i < pad; i += 1) {
        if (plain[plain.length - 1 - i] !== pad) {
          valid = false;
          break;
        }
      }
      if (valid) return plain.slice(0, plain.length - pad);
    }
    return plain;
  }

  function aesCbcEncrypt(plainBytes, keyBytes, ivBytes) {
    const remainder = plainBytes.length % 16;
    const pad = remainder === 0 ? 16 : 16 - remainder;
    const data = plainBytes.concat(new Array(pad).fill(pad));
    const roundKeys = keyExpansion(keyBytes);
    const cipher = [];
    let previous = ivBytes.slice();
    for (let i = 0; i < data.length; i += 16) {
      const block = new Array(16);
      for (let j = 0; j < 16; j += 1) {
        block[j] = data[i + j] ^ previous[j];
      }
      const encrypted = encryptBlock(block, roundKeys);
      cipher.push(...encrypted);
      previous = encrypted;
    }
    return cipher;
  }

  function decryptBase64Payload(base64Text) {
    const plainBytes = aesCbcDecrypt(base64Decode(String(base64Text).trim()), KEY, ZERO_IV);
    return utf8Decode(plainBytes);
  }

  function encryptJsonPayload(text) {
    const cipher = aesCbcEncrypt(utf8Encode(text), KEY, ZERO_IV);
    return base64Encode(cipher);
  }

  function normalizeSecret(secret) {
    const bytes = utf8Encode(String(secret || ""));
    const key = bytes.slice(0, 16);
    while (key.length < 16) key.push(0);
    return key;
  }

  function decryptLink(encUrl, secret) {
    const payload = String(encUrl || "").startsWith("enc://") ? String(encUrl).slice(6) : String(encUrl || "");
    const key = normalizeSecret(secret);
    const plainBytes = aesCbcDecrypt(base64Decode(payload), key, ZERO_IV);
    return utf8Decode(plainBytes);
  }

  function convertToQuantumultX(name, link) {
    let current = String(link || "").replace(/=@/g, "@");
    if (current.includes("#")) {
      current = current.split("#", 1)[0];
    }
    const qIndex = current.indexOf("?");
    if (qIndex === -1) {
      throw new Error("invalid node link: missing query string");
    }
    const main = current.slice(0, qIndex);
    const params = current.slice(qIndex + 1);
    const marker = "host%3D";
    const markerIndex = params.indexOf(marker);
    if (markerIndex === -1) {
      throw new Error("invalid node link: missing host%3D");
    }
    const rawHost = params.slice(markerIndex + marker.length);
    const hostJson = JSON.stringify({ Host: rawHost });
    return (
      main +
      "?plugin=obfs-local;obfs%3Dhttp;obfs-host%3D" +
      encodeURIComponent(hostJson) +
      ";obfs-uri%3D/#" +
      encodeURIComponent(String(name || "BitBoo"))
    );
  }

  function safeJsonParse(text) {
    try {
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  }

  function buildNodeContent(jsonObject, secret) {
    const shareNodes = (((jsonObject || {}).data || {}).share_node || []);
    if (!Array.isArray(shareNodes)) {
      throw new Error("response does not contain data.share_node");
    }
    const lines = [];
    for (const node of shareNodes) {
      try {
        const realLink = decryptLink(node.link, secret);
        lines.push(convertToQuantumultX(node.node_name || "BitBoo", realLink));
      } catch (error) {
        log(`skip node: ${error.message}`);
      }
    }
    return lines.join("\n");
  }

  function enrichResponseText(text, secret) {
    const parsed = safeJsonParse(text);
    if (!parsed || !parsed.data || !Array.isArray(parsed.data.share_node)) {
      return text;
    }
    parsed.data.share_node = parsed.data.share_node.map((node) => {
      const next = Object.assign({}, node);
      try {
        const realLink = decryptLink(node.link, secret);
        next.decrypted_link = realLink;
        next.quantumultx_link = convertToQuantumultX(node.node_name || "BitBoo", realLink);
      } catch (error) {
        next.decrypt_error = error.message;
      }
      return next;
    });
    return JSON.stringify(parsed, null, 2);
  }

  function notify(title, subtitle, message) {
    if (typeof $notify === "function") {
      $notify(title, subtitle, message);
    } else {
      log([title, subtitle, message].filter(Boolean).join(" | "));
    }
  }

  function log(message) {
    console.log(String(message));
  }

  function setValue(key, value) {
    if (typeof $prefs !== "undefined" && $prefs && typeof $prefs.setValueForKey === "function") {
      $prefs.setValueForKey(String(value), key);
    }
  }

  function done(value) {
    if (typeof $done === "function") {
      $done(value);
    }
  }

  function previewText(text, maxLines) {
    const lines = String(text || "").split("\n");
    return lines.slice(0, maxLines).join("\n");
  }

  function inferMode(config) {
    if (config.mode) return config.mode;
    if (typeof $response !== "undefined") return "response";
    return "task";
  }

  async function fetchNodeList(config) {
    if (typeof $task === "undefined" || !$task || typeof $task.fetch !== "function") {
      throw new Error("$task.fetch is unavailable in the current environment");
    }
    let host = "81.71.98.184";
    try {
      host = new URL(config.nodeUrl).host || host;
    } catch (_) {}
    const request = {
      url: config.nodeUrl,
      method: "POST",
      headers: {
        "user-agent": config.userAgent,
        "content-type": "application/json",
        "accept-encoding": "gzip",
        host
      },
      body: config.nodeBody
    };
    return $task.fetch(request);
  }

  async function runTaskMode(config) {
    const requestPlain = decryptBase64Payload(config.nodeBody);
    setValue(config.requestKey, requestPlain);
    log(`node_list request:\n${requestPlain}`);

    const response = await fetchNodeList(config);
    const decrypted = decryptBase64Payload(response.body || "");
    const parsed = safeJsonParse(decrypted);
    if (!parsed) {
      throw new Error("decrypted node_list response is not valid JSON");
    }

    const content = buildNodeContent(parsed, config.secret);
    setValue(config.storeKey, content);
    setValue(config.jsonKey, decrypted);

    const count = content ? content.split("\n").filter(Boolean).length : 0;
    log(`Quantumult X nodes:\n${content || "(empty)"}`);
    notify("BitBoo", `节点 ${count} 条`, previewText(content || decrypted, 4));
    done({ content });
  }

  function runRequestMode(config) {
    const requestPlain = decryptBase64Payload(config.nodeBody);
    setValue(config.requestKey, requestPlain);
    log(requestPlain);
    notify("BitBoo", "请求体已解密", requestPlain);
    done({ body: requestPlain });
  }

  function runResponseMode(config) {
    const encryptedBody = typeof $response !== "undefined" && $response ? $response.body : "";
    const decrypted = decryptBase64Payload(encryptedBody || "");
    const output = enrichResponseText(decrypted, config.secret);
    setValue(config.jsonKey, output);
    log(output);
    done({ body: output });
  }

  async function entry() {
    const config = mergeConfig();
    const mode = inferMode(config);
    try {
      if (mode === "request") {
        runRequestMode(config);
        return;
      }
      if (mode === "response") {
        runResponseMode(config);
        return;
      }
      await runTaskMode(config);
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      notify("BitBoo", "执行失败", message);
      log(message);
      done();
    }
  }

  return {
    DEFAULTS,
    decryptBase64Payload,
    encryptJsonPayload,
    decryptLink,
    convertToQuantumultX,
    buildNodeContent,
    enrichResponseText,
    entry
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BitBooQX;
}

if (typeof $done === "function") {
  BitBooQX.entry();
}
