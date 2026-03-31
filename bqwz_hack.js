/**
 * 兵器王者 (wxcfb0cdea6a581432) — Quantumult X 资源修改脚本
 * 
 * 功能：
 *   1. 拦截游戏 CDN 资源加载，注入 Storage Hook（资源/等级拉满）
 *   2. 拦截 DataNexus 数据上报，篡改购买金额为 0
 *   3. 广告回调强制返回已完成
 *   4. 排行榜分数拉满
 *
 * Quantumult X 配置（添加到对应段落）：
 *
 * [rewrite_local]
 * ^https://cdn-build-adventure\.lanfeitech\.com/.+\.js$ url script-response-body https://raw.githubusercontent.com/yourname/scripts/main/bqwz_hack.js
 * ^https://api\.datanexus\.qq\.com/data-nexus-cgi/miniprogram url script-request-body https://raw.githubusercontent.com/yourname/scripts/main/bqwz_hack.js
 * ^https://servicewechat\.com/wxcfb0cdea6a581432/.+/game\.js$ url script-response-body https://raw.githubusercontent.com/yourname/scripts/main/bqwz_hack.js
 * ^https://servicewechat\.com/wxcfb0cdea6a581432/.+/weapp-adapter\.js$ url script-response-body https://raw.githubusercontent.com/yourname/scripts/main/bqwz_hack.js
 * ^https://servicewechat\.com/wxcfb0cdea6a581432/.+/dn-sdk-minigame/dn-sdk\.js$ url script-response-body https://raw.githubusercontent.com/yourname/scripts/main/bqwz_hack.js
 *
 * [mitm]
 * hostname = cdn-build-adventure.lanfeitech.com, api.datanexus.qq.com, servicewechat.com
 *
 */

const url = $request.url;
const MAX_INT = 99999999;
const MAX_LEVEL = 999;

// ================================================================
// 策略 A: 拦截 game.js — 注入完整 Hook 到游戏主入口
// ================================================================
if (/servicewechat\.com\/wxcfb0cdea6a581432\/.+\/game\.js/i.test(url) ||
    /cdn-build-adventure\.lanfeitech\.com\/.+\.js/i.test(url)) {

  let body = $response.body;
  if (!body) { $done({}); }

  const hookPayload = `;(function(){
  'use strict';
  if(window.__BQWZ_HOOKED__) return;
  window.__BQWZ_HOOKED__ = true;

  var MAX_R = ${MAX_INT};
  var MAX_L = ${MAX_LEVEL};

  /* ---- 资源 key 匹配规则 ---- */
  var RES_RE = /coin|gold|gem|diamond|money|cash|ore|mineral|stone|iron|wood|crystal|energy|stamina|power|hp|mp|exp|score|point|star|heart|life|soul|material|resource|token|ticket|weapon|armor|sword|blade|shield|attack|defend|damage|strength|speed|amount|count|num|quantity|balance/i;
  var LV_RE  = /level|lv|rank|grade|tier|stage|floor/i;
  var UNLOCK_RE = /unlock|unlocked|owned|acquired|enabled|active|available/i;
  var RES_FIELDS = ['coin','coins','gold','golds','gem','gems','diamond','diamonds','money','cash','ore','ores','mineral','minerals','stone','stones','iron','irons','wood','woods','crystal','crystals','energy','stamina','power','hp','mp','exp','experience','score','point','points','star','stars','heart','hearts','life','lives','soul','souls','material','materials','resource','resources','token','tokens','ticket','tickets','attack','atk','defend','def','defense','damage','dmg','strength','str','speed','spd','critical','crit','amount','count','num','quantity','balance'];
  var LV_FIELDS = ['level','lv','rank','grade','tier','stage','floor'];
  var UL_FIELDS = ['unlock','unlocked','owned','acquired','enabled','active','available'];

  function deepMod(o, d) {
    if(!o || typeof o !== 'object' || (d||0) > 10) return false;
    var hit = false;
    for(var k in o) {
      if(!o.hasOwnProperty(k)) continue;
      var lk = k.toLowerCase();
      if(typeof o[k] === 'number') {
        if(RES_FIELDS.some(function(f){ return lk.indexOf(f) !== -1; })) { o[k] = MAX_R; hit = true; }
        else if(LV_FIELDS.some(function(f){ return lk.indexOf(f) !== -1; })) { o[k] = MAX_L; hit = true; }
      } else if(typeof o[k] === 'boolean') {
        if(UL_FIELDS.some(function(f){ return lk.indexOf(f) !== -1; })) { o[k] = true; hit = true; }
      } else if(typeof o[k] === 'object' && o[k] !== null) {
        if(deepMod(o[k], (d||0)+1)) hit = true;
      }
    }
    return hit;
  }

  /* ---- 等待 WXWASMSDK 加载后 Hook ---- */
  function hookSDK() {
    if(!window.WXWASMSDK) { setTimeout(hookSDK, 300); return; }
    var S = window.WXWASMSDK;

    /* GetIntSync */
    var _gi = S.WXStorageGetIntSync;
    S.WXStorageGetIntSync = function(k, d) {
      var v = _gi.call(S, k, d);
      if(RES_RE.test(k)) return LV_RE.test(k) ? MAX_L : MAX_R;
      return v;
    };

    /* SetIntSync */
    var _si = S.WXStorageSetIntSync;
    S.WXStorageSetIntSync = function(k, v) {
      if(RES_RE.test(k)) v = LV_RE.test(k) ? MAX_L : MAX_R;
      return _si.call(S, k, v);
    };

    /* GetFloatSync */
    var _gf = S.WXStorageGetFloatSync;
    S.WXStorageGetFloatSync = function(k, d) {
      var v = _gf.call(S, k, d);
      if(RES_RE.test(k)) return MAX_R;
      return v;
    };

    /* SetFloatSync */
    var _sf = S.WXStorageSetFloatSync;
    S.WXStorageSetFloatSync = function(k, v) {
      if(RES_RE.test(k)) v = MAX_R;
      return _sf.call(S, k, v);
    };

    /* GetStringSync — JSON 深度修改 */
    var _gs = S.WXStorageGetStringSync;
    S.WXStorageGetStringSync = function(k, d) {
      var v = _gs.call(S, k, d);
      if(v && typeof v === 'string') {
        try { var o = JSON.parse(v); if(deepMod(o)) v = JSON.stringify(o); } catch(e){}
      }
      return v;
    };

    /* SetStringSync — JSON 深度修改 */
    var _ss = S.WXStorageSetStringSync;
    S.WXStorageSetStringSync = function(k, v) {
      if(v && typeof v === 'string') {
        try { var o = JSON.parse(v); deepMod(o); v = JSON.stringify(o); } catch(e){}
      }
      return _ss.call(S, k, v);
    };

    console.log('[BQWZ] WASM Storage Hook OK');
  }

  /* ---- Hook 广告: 跳过激励视频，直接拿奖励 ---- */
  function hookAd() {
    if(!wx || !wx.createRewardedVideoAd) { setTimeout(hookAd, 500); return; }
    var _cra = wx.createRewardedVideoAd;
    wx.createRewardedVideoAd = function(opts) {
      var ad = _cra.call(wx, opts);
      var _show = ad.show.bind(ad);
      var _cbs = [];
      var _onClose = ad.onClose.bind(ad);

      ad.onClose = function(cb) {
        _cbs.push(cb);
        return _onClose(function(res) { res.isEnded = true; cb(res); });
      };

      ad.show = function() {
        setTimeout(function() {
          _cbs.forEach(function(cb) { try{ cb({isEnded:true}); }catch(e){} });
        }, 200);
        return Promise.resolve();
      };

      return ad;
    };
    console.log('[BQWZ] Ad Hook OK');
  }

  /* ---- Hook 排行榜分数 ---- */
  if(typeof wx !== 'undefined' && wx.setUserCloudStorage) {
    var _sucs = wx.setUserCloudStorage;
    wx.setUserCloudStorage = function(opts) {
      if(opts && opts.KVDataList) {
        opts.KVDataList.forEach(function(item) {
          if(item.value) {
            try {
              var d = JSON.parse(item.value);
              if(d.wxgame && d.wxgame.score !== undefined) {
                d.wxgame.score = MAX_R;
                if(d.scoreStr !== undefined) d.scoreStr = String(MAX_R);
                item.value = JSON.stringify(d);
              }
            } catch(e){}
          }
        });
      }
      return _sucs.call(wx, opts);
    };
    console.log('[BQWZ] Rank Hook OK');
  }

  /* ---- Hook 购买上报: 金额归零 ---- */
  if(typeof GameGlobal !== 'undefined' && typeof GameGlobal.purchase === 'function') {
    var _pur = GameGlobal.purchase;
    GameGlobal.purchase = function(e) { e.price = 0; return _pur(e); };
    console.log('[BQWZ] Purchase Hook OK');
  }

  /* ---- 全量修改已有 Storage ---- */
  function maxAllStorage() {
    try {
      var info = wx.getStorageInfoSync();
      var _getS = wx.getStorageSync.bind(wx);
      var _setS = wx.setStorageSync.bind(wx);
      info.keys.forEach(function(k) {
        var v = _getS(k);
        if(typeof v === 'number' && RES_RE.test(k)) {
          _setS(k, LV_RE.test(k) ? MAX_L : MAX_R);
        } else if(typeof v === 'string') {
          try { var o = JSON.parse(v); if(deepMod(o)) _setS(k, JSON.stringify(o)); } catch(e){}
        }
      });
      console.log('[BQWZ] maxAllStorage OK, keys:', info.keys.length);
    } catch(e) { console.log('[BQWZ] maxAllStorage err:', e); }
  }

  hookSDK();
  hookAd();
  setTimeout(maxAllStorage, 3000);

  console.log('[BQWZ] All hooks injected!');
})();`;

  // 注入到 JS 文件头部
  body = hookPayload + '\n' + body;
  $done({ body: body });

}

// ================================================================
// 策略 B: 拦截 DataNexus 数据上报 — 篡改购买事件
// ================================================================
else if (/api\.datanexus\.qq\.com\/data-nexus-cgi\/miniprogram/i.test(url)) {

  let body = $request.body;
  if (body) {
    try {
      let data = JSON.parse(body);

      // 篡改所有 purchase/付费事件的金额
      if (data.actions) {
        data.actions.forEach(function(action) {
          if (action.action_type === 'PURCHASE' || action.action_type === 'COMPLETE_ORDER') {
            if (action.action_param && action.action_param.value) {
              action.action_param.value = 0;
            }
          }
        });
      }
      
      // 伪造新用户注册事件（可选：刷注册量）
      // data.actions.push({ action_type: 'REGISTER', action_time: Math.floor(Date.now()/1000) });

      body = JSON.stringify(data);
    } catch (e) {}
  }
  $done({ body: body });

}

// ================================================================
// 策略 C: 拦截 weapp-adapter.js — 注入 wx.request 拦截器
// ================================================================
else if (/servicewechat\.com\/wxcfb0cdea6a581432\/.+\/weapp-adapter\.js/i.test(url)) {

  let body = $response.body;
  if (!body) { $done({}); }

  const requestHook = `;(function(){
  if(window.__BQWZ_REQ_HOOKED__) return;
  window.__BQWZ_REQ_HOOKED__ = true;

  var _wxReq = wx.request;
  wx.request = function(opts) {
    /* 拦截所有请求，记录日志 */
    console.log('[BQWZ-REQ]', opts.method || 'GET', opts.url);

    /* 包装 success 回调，修改服务端返回的游戏数据 */
    var _origSuccess = opts.success;
    if(_origSuccess) {
      opts.success = function(res) {
        if(res && res.data && typeof res.data === 'object') {
          try {
            var RES_FIELDS = ['coin','gold','gem','diamond','money','ore','energy','exp','score','point','star','material','resource','token','attack','defense','hp','mp','level'];
            (function mod(o, d) {
              if(!o || typeof o !== 'object' || d > 8) return;
              for(var k in o) {
                if(!o.hasOwnProperty(k)) continue;
                var lk = k.toLowerCase();
                if(typeof o[k] === 'number' && RES_FIELDS.some(function(f){ return lk.indexOf(f) !== -1; })) {
                  o[k] = 99999999;
                } else if(typeof o[k] === 'object') {
                  mod(o[k], d+1);
                }
              }
            })(res.data, 0);
          } catch(e){}
        }
        return _origSuccess(res);
      };
    }
    return _wxReq.call(wx, opts);
  };
  console.log('[BQWZ] wx.request Hook OK');
})();`;

  body = requestHook + '\n' + body;
  $done({ body: body });

}

// ================================================================
// 策略 D: 拦截 dn-sdk.js — 禁用数据上报 + Hook purchase
// ================================================================
else if (/servicewechat\.com\/wxcfb0cdea6a581432\/.+\/dn-sdk-minigame\/dn-sdk\.js/i.test(url)) {

  let body = $response.body;
  if (!body) { $done({}); }

  const sdkHook = `;(function(){
  if(window.__BQWZ_SDK_HOOKED__) return;
  window.__BQWZ_SDK_HOOKED__ = true;

  /* 等 GameGlobal.purchase 注册后 Hook */
  var _t = setInterval(function(){
    if(typeof GameGlobal !== 'undefined' && typeof GameGlobal.purchase === 'function') {
      clearInterval(_t);
      var _p = GameGlobal.purchase;
      GameGlobal.purchase = function(e) { e.price = 0; return _p(e); };
      console.log('[BQWZ] purchase Hook OK (sdk)');
    }
  }, 500);
})();`;

  body = sdkHook + '\n' + body;
  $done({ body: body });

}

// ================================================================
// 默认放行
// ================================================================
else {
  $done({});
}
