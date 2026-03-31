/**
 * 兵器王者 (wxcfb0cdea6a581432) — Quantumult X 脚本
 * 
 * 功能:
 *   1. 拦截 pay.config 响应 → 所有商品价格改为 1 分
 *   2. 拦截 game.js 响应 → 注入 Storage/广告/排行榜 Hook
 *   3. 拦截 DataNexus 上报 → 屏蔽
 */

const url = $request.url;
const MAX = 99999999;

// ================================================================
// 1. 拦截 pay.config — 所有商品价格改为 1 分
// ================================================================
if (/cdn-build-adventure\.lanfeitech\.com\/prodConfig\/pay\.config/i.test(url)) {

  let body = $response.body;
  try {
    let items = JSON.parse(body);
    items.forEach(function(item) {
      item.product_price = 1;
    });
    body = JSON.stringify(items);
    console.log('[BQWZ] pay.config: 全部商品价格已改为 1 分');
  } catch (e) {
    console.log('[BQWZ] pay.config 解析失败:', e);
  }
  $done({ body: body });

}

// ================================================================
// 2. 拦截 game.js / weapp-adapter.js / dn-sdk.js — 注入 Hook
// ================================================================
else if (/servicewechat\.com\/wxcfb0cdea6a581432\/.+\/(game|weapp-adapter|dn-sdk)\.js/i.test(url) ||
         /cdn-build-adventure\.lanfeitech\.com\/.+\.js$/i.test(url)) {

  let body = $response.body;
  if (!body) { $done({}); }

  const hook = `;(function(){
if(window.__BQWZ__) return;
window.__BQWZ__ = true;

var M = ${MAX}, L = 999;
var RK = /coin|gold|gem|diamond|money|cash|ore|mineral|stone|iron|wood|crystal|energy|stamina|power|hp|mp|exp|score|point|star|heart|life|soul|material|resource|token|ticket|weapon|armor|sword|blade|shield|attack|defend|damage|strength|speed|amount|count|num|quantity|balance/i;
var LK = /level|lv|rank|grade|tier|stage|floor/i;

function dm(o,d){
  if(!o||typeof o!=='object'||(d||0)>10) return false;
  var h=false;
  for(var k in o){
    if(!o.hasOwnProperty(k)) continue;
    var l=k.toLowerCase();
    if(typeof o[k]==='number'){
      if(['coin','coins','gold','gem','gems','diamond','diamonds','money','ore','energy','exp','score','point','star','heart','soul','material','resource','token','attack','atk','defend','def','damage','strength','speed','amount','count','balance','hp','mp','stamina','power'].some(function(f){return l.indexOf(f)!==-1})){o[k]=M;h=true;}
      else if(['level','lv','rank','grade','tier','stage'].some(function(f){return l.indexOf(f)!==-1})){o[k]=L;h=true;}
    }else if(typeof o[k]==='boolean'){
      if(['unlock','unlocked','owned','acquired','enabled','active','available'].some(function(f){return l.indexOf(f)!==-1})){o[k]=true;h=true;}
    }else if(typeof o[k]==='object'&&o[k]!==null){
      if(dm(o[k],(d||0)+1)) h=true;
    }
  }
  return h;
}

/* Hook WXWASMSDK Storage */
function hS(){
  if(!window.WXWASMSDK){setTimeout(hS,300);return;}
  var S=window.WXWASMSDK;
  var _gi=S.WXStorageGetIntSync,_si=S.WXStorageSetIntSync;
  var _gf=S.WXStorageGetFloatSync,_sf=S.WXStorageSetFloatSync;
  var _gs=S.WXStorageGetStringSync,_ss=S.WXStorageSetStringSync;

  S.WXStorageGetIntSync=function(k,d){var v=_gi.call(S,k,d);if(RK.test(k))return LK.test(k)?L:M;return v;};
  S.WXStorageSetIntSync=function(k,v){if(RK.test(k))v=LK.test(k)?L:M;return _si.call(S,k,v);};
  S.WXStorageGetFloatSync=function(k,d){var v=_gf.call(S,k,d);if(RK.test(k))return M;return v;};
  S.WXStorageSetFloatSync=function(k,v){if(RK.test(k))v=M;return _sf.call(S,k,v);};
  S.WXStorageGetStringSync=function(k,d){var v=_gs.call(S,k,d);if(v&&typeof v==='string'){try{var o=JSON.parse(v);if(dm(o))v=JSON.stringify(o);}catch(e){}}return v;};
  S.WXStorageSetStringSync=function(k,v){if(v&&typeof v==='string'){try{var o=JSON.parse(v);dm(o);v=JSON.stringify(o);}catch(e){}}return _ss.call(S,k,v);};
  console.log('[BQWZ] Storage Hook OK');
}

/* Hook 广告 */
function hA(){
  if(!wx||!wx.createRewardedVideoAd){setTimeout(hA,500);return;}
  var _c=wx.createRewardedVideoAd;
  wx.createRewardedVideoAd=function(o){
    var ad=_c.call(wx,o),_s=ad.show.bind(ad),cbs=[];
    var _oc=ad.onClose.bind(ad);
    ad.onClose=function(cb){cbs.push(cb);return _oc(function(r){r.isEnded=true;cb(r);});};
    ad.show=function(){setTimeout(function(){cbs.forEach(function(c){try{c({isEnded:true});}catch(e){}});},200);return Promise.resolve();};
    return ad;
  };
  console.log('[BQWZ] Ad Hook OK');
}

/* Hook 排行榜 */
if(typeof wx!=='undefined'&&wx.setUserCloudStorage){
  var _su=wx.setUserCloudStorage;
  wx.setUserCloudStorage=function(o){
    if(o&&o.KVDataList){o.KVDataList.forEach(function(i){if(i.value){try{var d=JSON.parse(i.value);if(d.wxgame&&d.wxgame.score!==undefined){d.wxgame.score=M;if(d.scoreStr)d.scoreStr=String(M);i.value=JSON.stringify(d);}}catch(e){}}});}
    return _su.call(wx,o);
  };
}

/* Hook 购买上报 */
var _pt=setInterval(function(){
  if(typeof GameGlobal!=='undefined'&&typeof GameGlobal.purchase==='function'){
    clearInterval(_pt);
    var _p=GameGlobal.purchase;
    GameGlobal.purchase=function(e){e.price=0;return _p(e);};
  }
},500);

/* 全量修改已有 Storage */
setTimeout(function(){
  try{
    var info=wx.getStorageInfoSync();
    info.keys.forEach(function(k){
      var v=wx.getStorageSync(k);
      if(typeof v==='number'&&RK.test(k)){wx.setStorageSync(k,LK.test(k)?L:M);}
      else if(typeof v==='string'){try{var o=JSON.parse(v);if(dm(o))wx.setStorageSync(k,JSON.stringify(o));}catch(e){}}
    });
  }catch(e){}
},3000);

hS();hA();
console.log('[BQWZ] All hooks loaded!');
})();`;

  body = hook + '\\n' + body;
  $done({ body: body });
}

// ================================================================
// 3. 拦截 DataNexus 上报 — 篡改购买金额
// ================================================================
else if (/api\.datanexus\.qq\.com\/data-nexus-cgi/i.test(url)) {
  let body = $request.body;
  if (body) {
    try {
      let data = JSON.parse(body);
      if (data.actions) {
        data.actions.forEach(function(a) {
          if (a.action_param && a.action_param.value) a.action_param.value = 0;
        });
      }
      body = JSON.stringify(data);
    } catch (e) {}
  }
  $done({ body: body });
}

// ================================================================
// 默认放行
// ================================================================
else {
  $done({});
}
