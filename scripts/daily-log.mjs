/**
 * 每天记录站点状态到 docs/site-uptime.md
 * 由 GitHub Actions 每天自动运行（同时产生一次提交，保持贡献图活跃）
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LOG_PATH = join(ROOT, "docs", "site-uptime.md");
const DATA_PATH = join(ROOT, "src", "data", "github-contributions.json");
const SITE = "https://bihrys.com/";

async function checkSite() {
	const start = Date.now();
	try {
		const res = await fetch(SITE, {
			redirect: "follow",
			headers: { "User-Agent": "Bihrys-Blog-DailyChecker/1.0" },
			signal: AbortSignal.timeout(20000),
		});
		const ttfb = ((Date.now() - start) / 1000).toFixed(2);
		return {
			status: res.status,
			ttfb,
			cache: res.headers.get("cf-cache-status") || "-",
			node: (res.headers.get("cf-ray") || "-").split("-")[1] || "-",
		};
	} catch (error) {
		return { status: 0, ttfb: "-", cache: "-", node: "-", error: String(error?.message || error) };
	}
}

function readContributions() {
	try {
		const data = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
		return {
			total: data.total ?? "-",
			activeDays: (data.days || []).filter((d) => d.count > 0).length,
		};
	} catch {
		return { total: "-", activeDays: "-" };
	}
}

const site = await checkSite();
const contributions = readContributions();

const now = new Date(Date.now() + 8 * 3600 * 1000); // 北京时间
const date = now.toISOString().slice(0, 10);
const time = now.toISOString().slice(11, 16);

mkdirSync(dirname(LOG_PATH), { recursive: true });
if (!existsSync(LOG_PATH)) {
	writeFileSync(
		LOG_PATH,
		"# 站点每日状态\n\n由 GitHub Actions 每天自动记录（时间为北京时间）。\n\n" +
			"| 日期 | 时间 | 状态码 | 首字节(s) | CF 缓存 | CF 节点 | 贡献总数 | 有贡献天数 |\n" +
			"|:---|:---|:---:|:---:|:---|:---|:---:|:---:|\n",
		"utf-8",
	);
}

const row = `| ${date} | ${time} | ${site.status} | ${site.ttfb} | ${site.cache} | ${site.node} | ${contributions.total} | ${contributions.activeDays} |\n`;
appendFileSync(LOG_PATH, row, "utf-8");

console.log(`已记录：${row.trim()}`);
