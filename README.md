# qx

Quantumult X scripts.

## Files

- `quantumultx_course_extract.js`: intercepts `https://goodminiapp.wendao101.com/course_detail/detail` and extracts `directoryName` and `courseDirectoryUrl` from the response body.

## Quantumult X

```conf
[rewrite_local]
^https:\/\/goodminiapp\.wendao101\.com\/course_detail\/detail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/quantumultx_course_extract.js

[mitm]
hostname = goodminiapp.wendao101.com
```
