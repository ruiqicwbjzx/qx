/*
 * 易知课堂 - 解锁付费视频
 * QuantumultX 重写脚本
 * 
 * [rewrite_local]
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/user/getCurriculumStatusV2 url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/getNoLessonDetail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/getCurriculumGroupList url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 * ^https://curriculum-api\.yizhiknow\.com/curriculum/newDetailX url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/yizhi_unlock.js
 *
 * [mitm]
 * hostname = curriculum-api.yizhiknow.com
 */

const url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);

    // 1. 付费状态接口 → 强制返回已购买
    if (url.includes('getCurriculumStatusV2')) {
        if (obj.data) {
            obj.data.is_pay = 1;
            obj.data.status = 1;
            obj.data.is_buy = 1;
            obj.data.order_status = 1;
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
    }

    // 2. 课程详情接口 → 标记为已购 + 解锁所有课时
    if (url.includes('getNoLessonDetail') || url.includes('newDetailX')) {
        if (obj.data) {
            obj.data.is_pay = 1;
            obj.data.is_buy = 1;
            obj.data.pay_status = 1;
            obj.data.available_buy = 1;
            // 如果有试看时长限制，设为极大值
            if (obj.data.audition_duration !== undefined) {
                obj.data.audition_duration = 999999;
            }
            if (obj.data.free_duration !== undefined) {
                obj.data.free_duration = 999999;
            }
        }
    }

    // 3. 课时列表接口 → 解锁全部课时
    if (url.includes('getCurriculumGroupList') || url.includes('getCurriculumGroupLessones')) {
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
    }

    body = JSON.stringify(obj);
} catch (e) {
    console.log('[易知解锁] 解析失败: ' + e.message);
}

$done({ body });
