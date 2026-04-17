/*
 * 易知课堂 - 请求体改写 (script-request-body)
 * 拦截 getLessonResourceV2 请求，注入解锁参数
 */
const NAME = '易知解锁';
const url = $request.url;
let body = $request.body;

function notify(subtitle, message) {
    if (typeof $notification !== 'undefined') {
        $notification.post(NAME, subtitle, String(message).substring(0, 250));
    }
}

try {
    if (url.includes('getLessonResourceV2') && body) {
        let obj = JSON.parse(body);
        // 注入解锁参数，尝试绕过服务端校验
        obj.unlock = 1;
        obj.is_pay = 1;
        obj.is_free = 1;
        obj.pay_status = 1;
        notify('📤 请求改写', 'lesson_id=' + (obj.lesson_id || '?') + ' 已注入unlock=1');
        body = JSON.stringify(obj);
    }
} catch (e) {
    notify('⚠️ 请求改写失败', e.message);
}

$done({ body });
