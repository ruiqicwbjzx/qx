# qx

Quantumult X scripts.

## Files

- `quantumultx_course_extract.js`: intercepts `https://goodminiapp.wendao101.com/course_detail/detail`, extracts `directoryName` and `courseDirectoryUrl`, then sends them as a notification without modifying the original response body.
- `quantumultx_course_extract.min.js`: minified release build for Quantumult X subscription use. This is obfuscation-by-minification, not strong encryption.
- `wendao_course.conf`: Quantumult X subscription file that imports the rewrite rule and MITM hostname.
- `bitboo_quantumultx_decrypt.js`: Quantumult X script for BitBoo AES-CBC payload decryption and node conversion.
- `bitboo.conf`: Quantumult X subscription file for the BitBoo decrypt script.

## Subscription

Use this URL in Quantumult X resource subscription:

`https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/wendao_course.conf`

BitBoo subscription:

`https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/bitboo.conf`

## Quantumult X

```conf
[rewrite_local]
^https:\/\/goodminiapp\.wendao101\.com\/course_detail\/detail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/quantumultx_course_extract.min.js

[mitm]
hostname = goodminiapp.wendao101.com
```
