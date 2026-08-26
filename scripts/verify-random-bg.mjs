#!/usr/bin/env node
// 独立验证脚本：探测 img.micostar.cc/random 按 UA 重定向的行为和 CORS 头。
// 不修改 src/，仅读取线上 API 响应。

import https from "node:https";

const API_URL = "https://img.micostar.cc/random";
// 该 API 启用了 DDoS 防盗链，缺失 Referer 会 403。
// 浏览器实际访问时自然携带页面 Referer，脚本用主站地址模拟。
const DEFAULT_REFERER = "https://www.micostar.cc/";

const USER_AGENTS = {
  desktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
};

function classifyOrientation(redirectUrl) {
  if (redirectUrl.includes("/horizontal/")) return "landscape";
  if (redirectUrl.includes("/vertical/")) return "portrait";
  return "unknown";
}

function request(url, headers = {}, method = "GET", redirect = "manual") {
  return new Promise((resolve, reject) => {
    const reqUrl = new URL(url);
    const req = https.request(
      {
        hostname: reqUrl.hostname,
        path: reqUrl.pathname + reqUrl.search,
        method,
        headers: {
          Accept: "image/webp,image/apng,image/*,*/*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          ...headers,
        },
      },
      (res) => {
        let finalUrl = url;
        if (res.headers.location) {
          finalUrl = new URL(res.headers.location, url).href;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          finalUrl,
          orientation: classifyOrientation(finalUrl),
        });
        res.resume();
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function runProbe(label, ua, options = {}) {
  const headers = { "User-Agent": ua };
  if (options.xhr) {
    headers["X-Requested-With"] = "XMLHttpRequest";
  }
  headers.Referer = options.referer ?? DEFAULT_REFERER;
  try {
    const res = await request(API_URL, headers);
    return {
      label,
      statusCode: res.statusCode,
      finalUrl: res.finalUrl,
      orientation: res.orientation,
      corsOrigin: res.headers["access-control-allow-origin"] || null,
      ok: res.statusCode >= 200 && res.statusCode < 400,
    };
  } catch (err) {
    return { label, ok: false, error: err.message };
  }
}

function printTable(rows) {
  console.log("| 场景 | 状态 | 重定向方向 | 最终 URL 样例 | CORS Origin | 结果 |");
  console.log("|---|---|---|---|---|---|");
  for (const r of rows) {
    const status = r.error ? `ERROR ${r.error}` : r.statusCode;
    const direction = r.orientation || "-";
    const sample = r.finalUrl ? r.finalUrl.replace(/\?_t=\d+/, "?_t=...") : "-";
    const cors = r.corsOrigin || "-";
