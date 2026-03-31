/*
 * 宠物医师网云课堂 - 小鹅通课程解锁 v4
 * 店铺: appNp5phRsW3061
 * 
 * 修复:
 *   v4: 修正 QX 正则 .+ → .* 确保匹配
 *        覆盖 DRM 视频 CDN encrypt-k-vod.xet.tech
 *        处理小程序端 + H5 WebView 双通道
 */

var url = $request.url;
var isResp = typeof $response !== "undefined";

function removeExper(s) {
  if (!s || typeof s !== "string") return s;
  return s.replace(/[&?]exper=\d+/gi, "");
}

function patchObj(obj) {
  if (!obj || typeof obj !== "object") return;
  var keys = {
    is_buy: 1, had_sub: 1, is_subscribe: 1, subscribe: 1,
    is_free: 1, sell_type: 0,
    is_try: 0, try_listen: 0, try_see: 0,
    part_try_length: 0, part_try_url: "",
    showAllTryAlert: false, show_all_try_alert: false,
    forbid_drag: 0, forbid_change_speed: 0,
    is_lock: 0, have_password: 0, is_password: 0,
    is_permission: 1,
    available: 1,
    is_public: 1
  };
  for (var k in keys) {
    if (obj.hasOwnProperty(k)) {
      obj[k] = keys[k];
    }
  }
  if (obj.product_try_info) {
    if (typeof obj.product_try_info === "object") {
      obj.product_try_info.is_try = 0;
      obj.product_try_info.part_try_length = 0;
      obj.product_try_info.part_try_url = "";
    } else {
      obj.product_try_info = {};
    }
  }
  if (obj.price !== undefined) obj.price = 0;
  if (obj.line_price !== undefined) obj.line_price = 0;
}

function deepPatch(obj, depth) {
  if (!obj || typeof obj !== "object" || depth > 6) return;
  patchObj(obj);
  if (Array.isArray(obj)) {
    obj.forEach(function(item) { deepPatch(item, depth + 1); });
  } else {
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && typeof obj[k] === "object" && obj[k] !== null) {
        deepPatch(obj[k], depth + 1);
      }
    }
  }
}

// ===== 1. video.detail_info.get =====
if (/xe\.course\.business\.video\.detail_info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_try = 0;
      j.data.payment_url = "";
      if (j.data.product_try_info && typeof j.data.product_try_info === "object") {
        j.data.product_try_info = {};
      }
      if (j.data.video_info) {
        j.data.video_info.video_audio_url = removeExper(j.data.video_info.video_audio_url);
      }
      body = JSON.stringify(j);
    }
  } catch (e) {}
  $done({ body: body });
}

// ===== 2. resource.available.get =====
else if (/xe\.course\.business\.resource\.available\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_buy = 1;
      j.data.is_free = 1;
      j.data.sell_type = 0;
      j.data.is_permission = 1;
      j.data.is_public = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ===== 3. has_buy =====
else if (/xe\.transaction\.user\.has_buy/i.test(url) && isResp) {
  $done({ body: JSON.stringify({ code: 0, msg: "", data: 1 }) });
}

// ===== 4. goods.info.get =====
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

// ===== 5. try_resource_status =====
else if (/try_resource_status\.get/i.test(url) && isResp) {
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

// ===== 6. parent.info.get =====
else if (/xe\.course\.business\.parent\.info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      deepPatch(j.data, 0);
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ===== 7. get_play_info =====
else if (/resource\.config\.get_play_info/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.play_fast_state = 1;
      j.data.play_multiple_state = 1;
      j.data.user_play_finish = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ===== 8. core.info.get =====
else if (/xe\.course\.business\.core\.info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      deepPatch(j.data, 0);
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ===== 9. composite_info.get =====
else if (/xe\.course\.business\.composite_info\.get/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      deepPatch(j.data, 0);
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ===== 10. subscribe.check =====
else if (/xe\.course\.business\.subscribe\.check/i.test(url) && isResp) {
  $done({ body: JSON.stringify({ code: 0, msg: "success", data: 1 }) });
}

// ===== 11. e_course.subscribe.get =====
else if (/xe\.course\.business\.e_course\.subscribe\.get/i.test(url) && isResp) {
  $done({ body: JSON.stringify({ code: 0, msg: "success", data: { is_subscribe: 1, subscribe: 1 } }) });
}

// ===== 12. crowd/get_user_resource_auth =====
else if (/crowd\/get_user_resource_auth/i.test(url) && isResp) {
  $done({ body: JSON.stringify({ code: 0, msg: "success", data: { has_auth: 1, is_auth: 1, permission_visit: 1, permission_comment: 1, permission_buy: 1 } }) });
}

// ===== 13. svip =====
else if (/xe\.svip/i.test(url) && isResp) {
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

// ===== 14. H5 通用 =====
else if (/h5\.xiaoe(cloud|know)\.com/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      deepPatch(j.data, 0);
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ===== fallback =====
else {
  $done({});
}
