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

function markTrySee(list) {
  if (!Array.isArray(list)) return;
  for (const item of list) {
    if (item && Object.prototype.hasOwnProperty.call(item, "isTrySee")) {
      item.isTrySee = 1;
    }
  }
}

function collectDirectories(data) {
  const collected = [];

  if (Array.isArray(data.trySeeDirList)) {
    collected.push(...data.trySeeDirList);
  }

  if (Array.isArray(data.courseDirectoryNotInChapterList)) {
    collected.push(...data.courseDirectoryNotInChapterList);
  }

  if (Array.isArray(data.chapterList)) {
    for (const chapter of data.chapterList) {
      if (chapter && Array.isArray(chapter.courseDirectoryList)) {
        collected.push(...chapter.courseDirectoryList);
      }
    }
  }

  return collected;
}

const body = safeParse($response.body);

if (!body || !body.data) {
  $done({ body: $response.body });
} else {
  const data = body.data;

  markTrySee(data.trySeeDirList);
  markTrySee(data.courseDirectoryNotInChapterList);
  if (Array.isArray(data.chapterList)) {
    for (const chapter of data.chapterList) {
      if (chapter) {
        markTrySee(chapter.courseDirectoryList);
      }
    }
  }

  const sourceList = collectDirectories(data);

  const extracted = dedupeByUrl(
    sourceList.map((item) => ({
      directoryName: item.directoryName || "",
      courseDirectoryUrl: item.courseDirectoryUrl || ""
    }))
  );

  const lines = extracted.map((item, index) => `${index + 1}. ${item.directoryName}\n${item.courseDirectoryUrl}`);
  const title = data.title || "课程目录";
  const subtitle = `${title} | 共 ${extracted.length} 条`;
  const preview = lines.length ? lines.slice(0, 5).join("\n\n") : "未提取到课程链接";
  const message = lines.length > 5 ? `${preview}\n\n其余 ${lines.length - 5} 条请看日志` : preview;

  console.log(lines.length ? lines.join("\n\n") : "未提取到课程链接");
  $notify("Quantumult X", subtitle, message);
  $done({ body: JSON.stringify(body) });
}
