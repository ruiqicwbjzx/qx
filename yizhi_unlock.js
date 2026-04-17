/*
 * 易知课堂 - 解锁付费视频 v4 (script-response-body)
 * 
 * 已确认: getLessonResourceV2 服务端校验付费 → code:5209002 "课表未解锁"
 * 策略: 改写响应为已购 + 伪造视频资源响应绕过服务端校验
 */

const NAME = '易知解锁';
const url = $request.url;
let body = $response.body;

function notify(subtitle, message) {
    if (typeof $notification !== 'undefined') {
        $notification.post(NAME, subtitle, String(message).substring(0, 250));
    }
}

function apiName(u) {
    let m = u.match(/\/curriculum\/([^?]+)/);
    return m ? m[1] : u.substring(0, 80);
}

if (!body || body === 'undefined' || body === 'null') {
    notify('⚠️ ' + apiName(url), '响应体为空');
    $done({ body: body || '' });
} else {

try {
    let obj = JSON.parse(body);
    let matched = '';

    // 1. 付费状态 → 已购买
    if (url.includes('getCurriculumStatusV2')) {
        matched = 'Status';
        obj.code = 200;
        obj.msg = "成功！";
        obj.data = obj.data || {};
        obj.data.is_pay = 1;
        obj.data.status = 1;
        obj.data.is_buy = 1;
        obj.data.order_status = 1;
        obj.data.pay_status = 1;
        notify('付费状态', '✅ 已改为已购买');
    }

    // 2. 课程详情 → 已购 + 免试看限制
    if (url.includes('getNoLessonDetail') || url.includes('newDetailX')) {
        matched = 'Detail';
        if (obj.data) {
            obj.data.is_pay = 1;
            obj.data.is_buy = 1;
            obj.data.pay_status = 1;
            obj.data.available_buy = 1;
            obj.data.audition_duration = 999999;
            obj.data.free_duration = 999999;
            notify('课程详情', '✅ ' + (obj.data.title || '已解锁'));
        }
    }

    // 3. 课时列表 → 全部解锁
    if (url.includes('getCurriculumGroupList') || url.includes('getCurriculumGroupLessones')) {
        matched = 'Lessons';
        const unlockLessons = (lessons) => {
            if (!Array.isArray(lessons)) return;
            lessons.forEach(l => {
                l.unlock = 1;
                l.is_free = 1;
                if (l.lesson) unlockLessons(l.lesson);
            });
        };
        if (obj.data) {
            if (obj.data.lesson_list) unlockLessons(obj.data.lesson_list);
            if (obj.data.group_list) {
                obj.data.group_list.forEach(g => {
                    if (g.lesson_list) unlockLessons(g.lesson_list);
                });
            }
            if (Array.isArray(obj.data)) unlockLessons(obj.data);
        }
        notify('课时列表', '✅ 已解锁');
    }

    // 4. 视频资源 → 核心拦截
    if (url.includes('getLessonResourceV2')) {
        matched = 'Video';
        if (obj.code === 200 && obj.data) {
            // 服务端正常返回了视频
            let vurl = obj.data.media_url || obj.data.mp4_url || obj.data.m3u8_url || '';
            notify('🎬 视频URL', vurl || JSON.stringify(obj.data).substring(0, 200));
        } else {
            // 服务端拒绝(5209002)，通知详情
            notify('❌ 服务端拒绝', 'code=' + obj.code + ' ' + (obj.msg || ''));

            // 尝试从请求体获取lesson_id，记录供分析
            try {
                let reqBody = $request.body;
                if (reqBody) {
                    let req = JSON.parse(reqBody);
                    notify('📋 请求参数', 'cid=' + (req.curriculum_id || '?') + ' lid=' + (req.lesson_id || '?'));
                }
            } catch(e2) {}
        }
    }

    // 5. 通用：拦截所有curriculum-api响应，捕获视频URL
    if (!matched && url.includes('curriculum-api')) {
        let s = JSON.stringify(obj);
        // 搜索是否有视频URL泄露
        let m3u8 = s.match(/https?:[^"]*\.m3u8[^"]*/);
        let mp4 = s.match(/https?:[^"]*\.mp4[^"]*/);
        if (m3u8 || mp4) {
            notify('🔍 发现视频URL', (m3u8 && m3u8[0] || '') + ' | ' + (mp4 && mp4[0] || ''));
        }
    }

    if (matched) {
        body = JSON.stringify(obj);
    }
} catch (e) {
    notify('⚠️ ' + apiName(url), e.message + ' | ' + String(body).substring(0, 80));
}

$done({ body });
}
