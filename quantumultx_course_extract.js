/*
Quantumult X

[rewrite_local]
^https:\/\/goodminiapp\.wendao101\.com\/course_detail\/detail url script-response-body https://raw.githubusercontent.com/ruiqicwbjzx/qx/main/quantumultx_course_extract.js

[mitm]
hostname = goodminiapp.wendao101.com
*/

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function dedupeByUrl(list) {
  const map = new Map();
  for (const item of list) {
    if (!item || !item.courseDirectoryUrl) continue;
    if (!map.has(item.courseDirectoryUrl)) {
      map.set(item.courseDirectoryUrl, item);
    }
  }
  return Array.from(map.values());
}

const body = safeParse($response.body);

if (!body || !body.data) {
  $done({});
} else {
  const data = body.data;
  const sourceList =
    Array.isArray(data.courseDirectoryNotInChapterList) && data.courseDirectoryNotInChapterList.length
      ? data.courseDirectoryNotInChapterList
      : Array.isArray(data.trySeeDirList)
        ? data.trySeeDirList
        : [];

  const extracted = dedupeByUrl(
    sourceList.map((item) => ({
      directoryName: item.directoryName || "",
      courseDirectoryUrl: item.courseDirectoryUrl || ""
    }))
  );

  const lines = extracted.map((item, index) => `${index + 1}. ${item.directoryName}\n${item.courseDirectoryUrl}`);
  const title = data.title || "课程目录";
  const subtitle = `${title} | 共 ${extracted.length} 条`;
  const message = lines.length ? lines.join("\n\n") : "未提取到课程链接";

  console.log(message);
  $notify("Quantumult X", subtitle, message);
  $done({});
}
