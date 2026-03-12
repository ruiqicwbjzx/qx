# qx

Quantumult X scripts.

## Files

- `quantumultx_course_extract.js`: intercepts `https://goodminiapp.wendao101.com/course_detail/detail`, extracts `directoryName` and `courseDirectoryUrl`, then sends them as a notification without modifying the original response body.
- `quantumultx_course_extract.min.js`: minified release build for Quantumult X subscription use. This is obfuscation-by-minification, not strong encryption.

## Quantumult X

```conf
[rewrite_local]
^https:\/\/goodminiapp\.wendao101\.com\/course_detail\/detail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/quantumultx_course_extract.min.js

[mitm]
hostname = goodminiapp.wendao101.com
```
