/*
 * 易知课堂 - 解锁付费视频 v2
 * QuantumultX 重写脚本
 * 
 * [rewrite_local]
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/user/getCurriculumStatusV2 url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/getNoLessonDetail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/newDetailX url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/getCurriculumGroupList url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/getCurriculumGroupLessones url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/getLessonResourceV2 url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 *
 * [mitm]
 * hostname = curriculum-api.yizhiknow.com
 */

const NAME = '易知解锁';
const url = $request.url;
let body = $response.body;

function notify(subtitle, message) {
    if (typeof $notification !== 'undefined') {
        $notification.post(NAME, subtitle, message);
    }
}

try {
    let obj = JSON.parse(body);
    let matched = '';

    // 1. 付费状态接口 → 强制返回已购买
    if (url.includes('getCurriculumStatusV2')) {
        matched = 'Status';
        if (obj.data) {
            obj.data.is_pay = 1;
            obj.data.status = 1;
            obj.data.is_buy = 1;
            obj.data.order_status = 1;
            obj.data.pay_status = 1;
        } else {
            obj.code = 200;
            obj.msg = "成功！";
            obj.data = {
                is_pay: 1,
                status: 1,
                is_buy: 1,
                order_status: 1,
                pay_status: 1
            };
        }
        notify('付费状态', '✅ 已改为已购买');
    }

    // 2. 课程详情接口 → 标记为已购 + 解锁
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

    // 3. 课时列表接口 → 解锁全部课时
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
        let count = obj.data?.lesson_list?.length || obj.data?.group_list?.length || (Array.isArray(obj.data) ? obj.data.length : 0);
        notify('课时列表', '✅ 已解锁 ' + count + ' 项');
    }

    // 4. 视频资源接口 → 记录URL + 通知
    if (url.includes('getLessonResourceV2')) {
        matched = 'Video';
        if (obj.code === 200 && obj.data) {
            let vurl = obj.data.media_url || obj.data.mp4_url || obj.data.m3u8_url || '';
            if (vurl) {
                notify('🎬 视频URL', vurl.substring(0, 200));
            } else {
                notify('⚠️ 视频响应', '服务端返回数据但无URL: ' + JSON.stringify(obj.data).substring(0, 200));
            }
        } else {
            // 服务端拒绝 → 通知错误信息
            notify('❌ 视频被拒', 'code=' + obj.code + ' msg=' + (obj.msg || '').substring(0, 150));
            
            // 如果服务端返回未付费错误，记录完整响应供分析
            notify('📋 完整响应', JSON.stringify(obj).substring(0, 200));
        }
    }

    if (matched) {
        body = JSON.stringify(obj);
    }
} catch (e) {
    notify('⚠️ 脚本异常', e.message);
}

$done({ body });
