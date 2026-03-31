/*
 * 宠物医师网云课堂 - 小鹅通课程解锁脚本 v3
 * 店铺 AppID: appNp5phRsW3061
 * 小程序 AppID: wxb08125788fd533c7
 * 
 * 核心原理:
 *   1. 修改 resource.available.get 返回 is_buy=1 → 解除试看弹窗
 *   2. 修改 video.detail_info.get 中 is_try=0 并移除 part_try_url
 *   3. 修改 video_urls 和 m3u8 链接中的 exper 参数 → 突破 CDN 试看时长限制
 *   4. 伪造 has_buy → 告诉客户端已购买
 */

var url = $request.url;
var isResp = typeof $response !== "undefined";

if (!isResp) {
  $done({});
}

// 移除 URL 中的 exper 参数 (CDN 试看限制)
function removeExper(s) {
  if (!s) return s;
  return s.replace(/[&?]exper=\d+/g, "");
}

// Base64 变种解码 (小鹅通特殊编码: $→+, @→/, #→=)
function xeB64Decode(s) {
  if (!s) return s;
  var t = s.replace(/__ba$/, "");
  t = t.replace(/\$/g, "+").replace(/@/g, "/").replace(/#/g, "=");
  try {
    return $utils.base64Decode ? $utils.base64Decode(t) : atob(t);
  } catch(e) {
    return s;
  }
}

function xeB64Encode(s) {
  if (!s) return s;
  try {
    var t = $utils.base64Encode ? $utils.base64Encode(s) : btoa(s);
    t = t.replace(/\+/g, "$").replace(/\//g, "@").replace(/=/g, "#");
    return t + "__ba";
  } catch(e) {
    return s;
  }
}

// === 1. 核心: video.detail_info.get — 移除试看限制 + 修改视频URL ===
if (/xe\.course\.business\.video\.detail_info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      var d = j.data;
      d.is_try = 0;
      d.payment_url = "";
      
      if (d.product_try_info) {
        d.product_try_info.is_try = 0;
        d.product_try_info.part_try_length = 0;
        d.product_try_info.part_try_url = "";
      }
      
      // 修改 video_urls 中的 exper 参数
      if (d.video_urls) {
        try {
          var decoded = xeB64Decode(d.video_urls);
          decoded = removeExper(decoded);
          d.video_urls = xeB64Encode(decoded);
        } catch(e) {}
      }
      
      // 视频信息
      if (d.video_info) {
        if (d.video_info.video_audio_url) {
          d.video_info.video_audio_url = removeExper(d.video_info.video_audio_url);
        }
      }
      
      body = JSON.stringify(j);
    }
  } catch (e) {}
  $done({ body: body });
}

// === 2. resource.available.get — 伪造已购买 ===
else if (/xe\.course\.business\.resource\.available\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_buy = 1;
      j.data.is_free = 1;
      j.data.sell_type = 0;
      j.data.is_permission = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 3. has_buy — 伪造已购买 ===
else if (/xe\.transaction\.user\.has_buy/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    j.data = 1;
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 4. goods.info.get — 标记为免费 ===
else if (/xe\.course\.business\.goods\.info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_free = 1;
      j.data.price = 0;
      j.data.is_try = 0;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 5. try_resource_status — 关闭试看试听标记 ===
else if (/xe\.course\.business\.avoidlogin\.e_course\.try_resource_status\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.try_listen = 0;
      j.data.try_see = 0;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 6. parent.info.get — 修改课程目录中的试看标记 ===
else if (/xe\.course\.business\.parent\.info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      if (j.data.product_info) {
        j.data.product_info.is_try = 0;
        j.data.product_info.try_length = 0;
      }
      if (j.data.parent_columns && Array.isArray(j.data.parent_columns)) {
        j.data.parent_columns.forEach(function(col) {
          if (col) col.is_try = 0;
        });
      }
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 7. subscribe.check — 伪造已订阅 ===
else if (/xe\.course\.business\.subscribe\.check\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data !== undefined) {
      j.data = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 8. e_course.subscribe — 伪造已订阅 ===
else if (/xe\.course\.business\.e_course\.subscribe\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0) {
      if (typeof j.data === "object" && j.data) {
        j.data.is_subscribe = 1;
        j.data.subscribe = 1;
      } else {
        j.data = 1;
      }
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 9. get_play_info — 解除播放限制 ===
else if (/xe\.course\.business\.resource\.config\.get_play_info/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.play_fast_state = 1;
      j.data.play_multiple_state = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 10. m3u8 请求 — 移除 exper 试看参数 (URL 重写) ===
else if (/c-vod.*\.xiaoeknow\.com.*\.m3u8.*exper=/i.test(url) && !isResp) {
  var newUrl = removeExper(url);
  $done({ url: newUrl });
}

// === 11. SVIP 信息 ===
else if (/xe\.svip\.(info|c)\./i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0) {
      if (!j.data) j.data = {};
      j.data.is_svip = 1;
      j.data.svip_type = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 12. 用户权限 ===
else if (/\/crowd\/get_user_resource_auth/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    if (!j.data) j.data = {};
    j.data.has_auth = 1;
    j.data.is_auth = 1;
    j.data.permission_visit = 1;
    j.data.permission_comment = 1;
    j.data.permission_buy = 1;
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === fallback ===
else {
  $done({});
}
