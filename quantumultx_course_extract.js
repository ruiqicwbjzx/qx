/*
Quantumult X

[rewrite_local]
^https:\/\/goodminiapp\.wendao101\.com\/course_detail\/detail url script-response-body https://your-local-path/quantumultx_course_extract.js

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
  $done({ body: $response.body });
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

  const result = {
    code: body.code,
    msg: body.msg,
    courseId: data.id || data.courseId || null,
    title: data.title || "",
    total: extracted.length,
    list: extracted
  };

  $done({ body: JSON.stringify(result) });
}
