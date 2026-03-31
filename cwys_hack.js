/*
 * 宠物医师网云课堂 - 小鹅通知识店铺 课程解锁脚本 v2
 * 平台: 小鹅通 (xiaoe-tech)
 * 店铺 AppID: appfL026g452976
 * 小程序 AppID: wxb08125788fd533c7
 * 
 * 功能:
 *   1. 伪造购买状态 → 绕过试看限制，观看完整视频
 *   2. 消除试看弹窗 (试看已结束/订阅系列课)
 *   3. 解除快进限制 (forbidDrag)
 *   4. 解除倍速限制 (forbidChangeSpeed)
 *   5. 伪造用户权限/SVIP 会员
 *   6. 强制开启免登录/游客模式
 */

var url = $request.url;
var isResp = typeof $response !== "undefined";

if (!isResp) {
  $done({});
}

// 通用: 深度遍历修改所有购买/试看/限制字段
function patchResource(obj) {
  if (!obj || typeof obj !== "object") return;
  
  // 购买状态
  if ("is_buy" in obj) obj.is_buy = 1;
  if ("had_sub" in obj) obj.had_sub = 1;
  if ("had_buy" in obj) obj.had_buy = 1;
  if ("hasBuy" in obj) obj.hasBuy = 1;
  if ("has_buy" in obj) obj.has_buy = 1;
  if ("subscribe_state" in obj) obj.subscribe_state = 1;
  
  // 试看
  if ("is_try" in obj) obj.is_try = 0;
  if ("isTry" in obj) obj.isTry = 0;
  if ("try_time" in obj) obj.try_time = 0;
  if ("try_seconds" in obj) obj.try_seconds = 0;
  if ("part_try_length" in obj) obj.part_try_length = 0;
  if ("showAllTryAlert" in obj) obj.showAllTryAlert = false;
  
  // 如果有试看 URL 但没完整 URL，把试看 URL 清掉让客户端用完整 URL
  if ("part_try_url" in obj) obj.part_try_url = "";
  
  // 售卖类型
  if ("sale_type" in obj) obj.sale_type = 0;
  if ("price" in obj && typeof obj.price === "number") obj.price = 0;
  if ("price" in obj && typeof obj.price === "string") obj.price = "0";
  
  // 播放限制
  if ("forbid_drag" in obj) obj.forbid_drag = 0;
  if ("forbidDrag" in obj) obj.forbidDrag = false;
  if ("forbid_change_speed" in obj) obj.forbid_change_speed = 0;
  if ("forbidChangeSpeed" in obj) obj.forbidChangeSpeed = false;
  if ("forbid_copy" in obj) obj.forbid_copy = 0;
  
  // 锁定/密码
  if ("is_lock" in obj) obj.is_lock = 0;
  if ("has_password" in obj) obj.has_password = 0;
  if ("need_password" in obj) obj.need_password = 0;
  
  // 可用性
  if ("available" in obj && typeof obj.available === "number") obj.available = 1;
  if ("available" in obj && typeof obj.available === "boolean") obj.available = true;
}

function deepPatch(obj, depth) {
  if (!obj || typeof obj !== "object" || depth > 5) return;
  patchResource(obj);
  if (Array.isArray(obj)) {
    obj.forEach(function(item) { deepPatch(item, depth + 1); });
  } else {
    Object.keys(obj).forEach(function(key) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        deepPatch(obj[key], depth + 1);
      }
    });
  }
}

// === 1. 资源详情: 核心 — 伪造购买 + 移除试看限制 + 解除播放限制 ===
if (/app\.xiaoe-tech\.com.*\/get_single_resource_info/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      deepPatch(j.data, 0);
      
      // 确保 available_info 标记为可用
      if (j.data.availableInfo) {
        j.data.availableInfo.available = 1;
      }
      if (j.data.available_info) {
        j.data.available_info.available = 1;
      }
      
      // 确保 detailInfo 已购买
      if (j.data.detailInfo) {
        j.data.detailInfo.is_buy = 1;
        j.data.detailInfo.had_sub = 1;
      }
      
      body = JSON.stringify(j);
    }
  } catch (e) {}
  $done({ body: body });
}

// === 2. 购买状态查询: 伪造已购买 ===
else if (/app\.xiaoe-tech\.com.*\/xe\.transaction\.user\.has_buy/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    j.data = 1;
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 3. 用户权限: 伪造全部权限 ===
else if (/app\.xiaoe-tech\.com.*\/crowd\/get_user_resource_auth/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    if (!j.data) j.data = {};
    j.data.has_auth = 1;
    j.data.is_auth = 1;
    j.data.auth_type = 0;
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 4. 免登录模式: 强制开启游客访问 ===
else if (/app\.xiaoe-tech\.com.*\/wxa\/notLoginStatus/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    if (!j.data) j.data = {};
    j.data.enable_tourist = 1;
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 5. 课程落地页资源信息: 伪造已购买 ===
else if (/app\.xiaoe-tech\.com.*\/get_resource_info\/1\.0\.0/i.test(url) && isResp) {
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

// === 6. 营销资源信息: 伪造已购买 ===
else if (/app\.xiaoe-tech\.com.*\/marketing\/get_resource_info/i.test(url) && isResp) {
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

// === 7. SVIP 会员信息: 伪造超级会员 ===
else if (/app\.xiaoe-tech\.com.*\/xe\.svip\.(info|c)\./i.test(url) && isResp) {
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

// === 8. 课程列表/任务列表: 解锁所有内容 ===
else if (/app\.xiaoe-tech\.com.*(\/course_list|\/task_list)/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      var list = Array.isArray(j.data) ? j.data : (j.data.list || j.data.data || []);
      if (Array.isArray(list)) {
        list.forEach(function(item) { deepPatch(item, 0); });
      }
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 9. H5 页面内的接口 (*.h5.xiaoeknow.com) — 通用深度修改 ===
else if (/h5\.xiaoeknow\.com/i.test(url) && isResp) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      deepPatch(j.data, 0);
    }
    body = JSON.stringify(j);
  } catch (e) {
    // 非 JSON 响应，直接放行
  }
  $done({ body: body });
}

// === fallback ===
else {
  $done({});
}
