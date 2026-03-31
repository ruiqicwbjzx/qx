/*
 * 宠物医师网云课堂 - 小鹅通知识店铺 课程解锁脚本
 * 平台: 小鹅通 (xiaoe-tech)
 * 店铺 AppID: appfL026g452976
 * 小程序 AppID: wxb08125788fd533c7
 * 
 * 功能:
 *   1. 伪造购买状态 → 免费观看付费课程
 *   2. 解除快进限制 (forbidDrag)
 *   3. 解除倍速限制 (forbidChangeSpeed)
 *   4. 强制开启免登录/游客模式
 *   5. 伪造用户权限
 *   6. 伪造超级会员 (SVIP)
 *
 * Quantumult X 使用:
 *   订阅远程 rewrite 配置即可
 */

var url = $request.url;
var isResp = typeof $response !== "undefined";

if (!isResp) {
  $done({});
}

// === 1. 资源详情: 伪造购买状态 + 解除播放限制 ===
else if (/app\.xiaoe-tech\.com.*\/get_single_resource_info/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      var d = j.data;
      if (d.resource_info) {
        var r = d.resource_info;
        r.is_buy = 1;
        r.had_sub = 1;
        r.had_buy = 1;
        r.sale_type = 0; // free
        r.is_try = 0;
        r.try_time = 0;
        r.try_seconds = 0;
        r.forbid_drag = 0;
        r.forbid_change_speed = 0;
        r.forbid_copy = 0;
        r.has_password = 0;
        r.is_lock = 0;
      }
      if (d.video_info) {
        d.video_info.forbid_drag = 0;
        d.video_info.forbid_change_speed = 0;
      }
      if (d.audio_info) {
        d.audio_info.forbid_drag = 0;
        d.audio_info.forbid_change_speed = 0;
      }
      body = JSON.stringify(j);
    }
  } catch (e) {}
  $done({ body: body });
}

// === 2. 购买状态查询: 伪造已购买 ===
else if (/app\.xiaoe-tech\.com.*\/xe\.transaction\.user\.has_buy/i.test(url)) {
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
else if (/app\.xiaoe-tech\.com.*\/crowd\/get_user_resource_auth/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    if (j.data) {
      j.data.has_auth = 1;
      j.data.is_auth = 1;
      j.data.auth_type = 0;
    } else {
      j.data = { has_auth: 1, is_auth: 1, auth_type: 0 };
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 4. 免登录模式: 强制开启游客访问 ===
else if (/app\.xiaoe-tech\.com.*\/wxa\/notLoginStatus/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    j.code = 0;
    if (j.data) {
      j.data.enable_tourist = 1;
    } else {
      j.data = { enable_tourist: 1 };
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 5. 资源信息 (课程落地页): 伪造已购买 ===
else if (/app\.xiaoe-tech\.com.*\/get_resource_info\/1\.0\.0/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_buy = 1;
      j.data.had_sub = 1;
      j.data.had_buy = 1;
      j.data.sale_type = 0;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 6. 营销资源信息: 伪造已购买 ===
else if (/app\.xiaoe-tech\.com.*\/marketing\/get_resource_info/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_buy = 1;
      j.data.had_sub = 1;
      j.data.sale_type = 0;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 7. SVIP 会员信息: 伪造超级会员 ===
else if (/app\.xiaoe-tech\.com.*\/xe\.svip\.info\.get_by_resource\.detail/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_svip = 1;
      j.data.svip_type = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 8. SVIP 规格列表: 让用户看起来已是会员 ===
else if (/app\.xiaoe-tech\.com.*\/xe\.svip\.c\.specification_list\.get/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.is_svip = 1;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 9. 课程列表/任务列表: 解锁所有内容 ===
else if (/app\.xiaoe-tech\.com.*(\/course_list|\/task_list)/i.test(url)) {
  var body = $response.body;
  try {
    var j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      var list = Array.isArray(j.data) ? j.data : (j.data.list || j.data.data || []);
      list.forEach(function(item) {
        if (item) {
          item.is_buy = 1;
          item.had_sub = 1;
          item.is_lock = 0;
          item.is_try = 0;
          item.sale_type = 0;
        }
      });
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// === 10. 学习记录: 不拦截 ===
else if (/app\.xiaoe-tech\.com.*\/v2\/learnRecord/i.test(url)) {
  $done({});
}

// === 11. H5 视频数据: 直接放行 ===
else if (/iframe\.xiaoeknow\.com.*\/api\/richtext\/get_video_data/i.test(url)) {
  $done({});
}

// === fallback ===
else {
  $done({});
}
