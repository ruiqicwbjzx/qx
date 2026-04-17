# qx

Quantumult X scripts.

## Files

- `quantumultx_course_extract.js`: intercepts `https://goodminiapp.wendao101.com/course_detail/detail`, extracts `directoryName` and `courseDirectoryUrl`, then sends them as a notification without modifying the original response body.
- `quantumultx_course_extract.min.js`: minified release build for Quantumult X subscription use. This is obfuscation-by-minification, not strong encryption.
- `wendao_course.conf`: Quantumult X subscription file that imports the rewrite rule and MITM hostname.
- `bitboo_quantumultx_decrypt.js`: Quantumult X script for BitBoo AES-CBC payload decryption and node conversion.
- `bitboo.conf`: Quantumult X subscription file for the BitBoo decrypt script.
- `yizhi_unlock.js`: 易知课堂(yizhiknow.com)付费视频解锁脚本，拦截付费状态/课程详情/课时列表接口响应并修改为已购买状态。
- `yizhi_unlock.conf`: 易知课堂 QX 订阅配置文件。

## Subscription

Use this URL in Quantumult X resource subscription:

`https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/wendao_course.conf`

BitBoo subscription:

`https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/bitboo.conf`

易知课堂 subscription:

`https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.conf`

## Quantumult X

```conf
[rewrite_local]
^https:\/\/goodminiapp\.wendao101\.com\/course_detail\/detail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/quantumultx_course_extract.min.js

[mitm]
hostname = goodminiapp.wendao101.com
```
