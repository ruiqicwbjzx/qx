/**
 * 兵器王者 (wxcfb0cdea6a581432) — Quantumult X 脚本 v3
 * 
 * 基于真实抓包数据重写，拦截服务端 API 响应
 *
 * 配置见 bqwz_quantumultx.conf
 */

const url = $request.url;
const isReq = typeof $request.body !== 'undefined' && typeof $response === 'undefined';
const isResp = typeof $response !== 'undefined';

// ================================================================
// 1. /api/user/get_user_info — 篡改用户资源（核心）
// ================================================================
if (/\/api\/user\/get_user_info/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      let d = j.data;
      d.coin = 99999999;            // 金币
      d.gem = 99999999;             // 钻石
      d.boss_fragment = 99999;      // Boss碎片
      d.three_ore_card = 99999;     // 矿石卡
      d.max_level = 999;            // 最高关卡
      d.level = 999;                // 等级
      d.star = 9999;                // 星星
      d.max_star = 9999;            // 最高星级
      d.fight_num = 99999;          // 战斗次数
      d.weapon_score = 999999;      // 武器评分

      // 道具数量全部拉满
      if (d.user_goods && Array.isArray(d.user_goods)) {
        d.user_goods.forEach(function(g) {
          g.count = 9999;
        });
      }

      body = JSON.stringify(j);
      console.log('[BQWZ] get_user_info 已修改');
    }
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 2. /api/weapon/get_weapons — 篡改武器属性
// ================================================================
else if (/\/api\/weapon\/get_weapons/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data && j.data.weapons) {
      j.data.weapons.forEach(function(w) {
        w.attack = 99999999;           // 攻击力
        w.life = 99999999;             // 生命值
        w.quality = 10;                // 品质拉满
        w.score = 99999999;            // 评分
        w.forge_accuracy = 100;        // 锻造精准
        w.gem = 99;                    // 宝石槽
        w.rank_id = 99;               // 排名
        w.fight_num = 99999;           // 战斗次数
        // 额外属性
        w.extra_attr = w.extra_attr || {};
        w.combat_attr = w.combat_attr || {};
        w.damage_attr = w.damage_attr || {};
      });
      j.data.sum = j.data.weapons.length;
      body = JSON.stringify(j);
      console.log('[BQWZ] get_weapons 已修改');
    }
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 3. /api/weapon/get_weapon_props_info — 篡改武器道具
// ================================================================
else if (/\/api\/weapon\/get_weapon_props_info/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.sum = 99999;
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 4. /api/activity/get_egg_info — 扭蛋次数拉满
// ================================================================
else if (/\/api\/activity\/get_egg_info/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.sum = 99999;    // 总扭蛋次数
      j.data.use_num = 0;    // 已用次数清零
    }
    body = JSON.stringify(j);
    console.log('[BQWZ] get_egg_info 已修改');
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 5. /api/shop/get_total_recharge_info — 伪造充值记录
// ================================================================
else if (/\/api\/shop\/get_total_recharge_info/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.sum_num = 999999;  // 总充值金额（分）
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 6. /api/order/create — 订单创建，保持原价（不改价防报错）
// ================================================================
else if (/\/api\/order\/create/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    // 如果服务端返回计费点错误，伪造成功
    if (j.code !== 0) {
      j.code = 0;
      j.msg = 'OK';
      j.data = j.data || {};
      j.data.order_id = 'hack_' + Date.now();
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 7. /api/order/verify — 订单验证，强制返回成功
// ================================================================
else if (/\/api\/order\/verify/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    // 强制返回验证成功
    j.code = 0;
    j.msg = 'OK';
    body = JSON.stringify(j);
    console.log('[BQWZ] order/verify 强制成功');
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 8. /api/order/hang_list — 挂起订单列表，清空防重复弹窗
// ================================================================
else if (/\/api\/order\/hang_list/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      j.data.list = [];  // 清空挂起订单
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 9. /api/mail/load — 注入奖励邮件
// ================================================================
else if (/\/api\/mail\/load$/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    if (j.code === 0 && j.data) {
      // 保持原有邮件不变
    }
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 10. /api/minigame/integral/get_state — 任务状态全部已完成
// ================================================================
else if (/\/api\/minigame\/integral\/get_state/i.test(url) && isResp) {
  let body = $response.body;
  try {
    let j = JSON.parse(body);
    // 不动任务状态，避免触发异常
    body = JSON.stringify(j);
  } catch (e) {}
  $done({ body: body });
}

// ================================================================
// 11. CDN pay.config — 保持原价（之前改价导致 19013 错误）
// ================================================================
else if (/\/prodConfig\/pay\.config/i.test(url) && isResp) {
  // 不再修改价格，服务端会校验
  $done({});
}

// ================================================================
// 默认放行
// ================================================================
else {
  $done({});
}
