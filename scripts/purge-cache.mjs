/**
 * 部署后清理 Cloudflare 缓存
 * 用法：CF_API_TOKEN=xxx node scripts/purge-cache.mjs
 * 未提供 token 时静默跳过（不影响部署）
 */
const TOKEN = process.env.CF_API_TOKEN;
const ZONE_NAME = "bihrys.com";

if (!TOKEN) {
	console.log("未配置 CF_API_TOKEN，跳过缓存清理");
	process.exit(0);
}

const API = "https://api.cloudflare.com/client/v4";
const headers = {
	Authorization: `Bearer ${TOKEN}`,
	"Content-Type": "application/json",
};

try {
	const zoneRes = await fetch(`${API}/zones?name=${ZONE_NAME}`, { headers });
	const zoneJson = await zoneRes.json();
	const zoneId = zoneJson?.result?.[0]?.id;
	if (!zoneId) {
		console.error("找不到域名，响应：", JSON.stringify(zoneJson.errors || zoneJson));
		process.exit(1);
	}
	console.log(`Cloudflare zone: ${zoneId}`);

	const purgeRes = await fetch(`${API}/zones/${zoneId}/purge_cache`, {
		method: "POST",
		headers,
		body: JSON.stringify({ purge_everything: true }),
	});
	const purgeJson = await purgeRes.json();
	if (purgeJson.success) {
		console.log("✅ 缓存已清空");
	} else {
		console.error("❌ 清理失败：", JSON.stringify(purgeJson.errors));
		process.exit(1);
	}
} catch (error) {
	console.error("清理缓存异常：", error?.message || error);
	process.exit(1);
}
