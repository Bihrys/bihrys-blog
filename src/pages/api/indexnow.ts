import fs from "fs";
import path from "path";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

// 已提交URL记录文件路径
const SUBMITTED_URLS_FILE = path.join(
	process.cwd(),
	".indexnow-submitted.json",
);

// 读取已提交的URL记录
function getSubmittedUrls() {
	if (!fs.existsSync(SUBMITTED_URLS_FILE)) {
		return {
			urls: [],
			lastSubmitted: null,
			totalSubmissions: 0,
		};
	}

	try {
		const data = fs.readFileSync(SUBMITTED_URLS_FILE, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		console.warn("Warning: Cannot read submitted URLs record:", error);
		return {
			urls: [],
			lastSubmitted: null,
			totalSubmissions: 0,
		};
	}
}

// 保存已提交的URL记录
function saveSubmittedUrls(submittedData: any) {
	try {
		fs.writeFileSync(
			SUBMITTED_URLS_FILE,
			JSON.stringify(submittedData, null, 2),
			"utf-8",
		);
	} catch (error) {
		console.error("Failed to save submitted URLs record:", error);
	}
}

export const POST: APIRoute = async ({ request }) => {
	try {
		console.log("IndexNow API called");

		// 检查是否请求强制提交
		const body = await request.text();
		const requestData = body ? JSON.parse(body) : {};
		const forceSubmit = requestData.force === true;

		// 获取所有博客文章
		const posts = await getCollection("posts");

		// 构建要提交的 URL 列表
		const baseUrl = "https://bihrys.com";
		const currentUrls = [
			baseUrl, // 首页
			`${baseUrl}/archive`, // 归档页
			`${baseUrl}/about`, // 关于页
			...posts.map((post) => `${baseUrl}/posts/${post.slug}`), // 所有文章页面
		];

		console.log(`Current site has ${currentUrls.length} URLs`);

		let urlsToSubmit = currentUrls;
		let isIncremental = false;

		if (!forceSubmit) {
			// 增量提交模式
			const submittedData = getSubmittedUrls();
			const submittedUrls = new Set(submittedData.urls || []);

			// 找出新增的URL
			const newUrls = currentUrls.filter((url) => !submittedUrls.has(url));

			if (newUrls.length === 0) {
				return new Response(
					JSON.stringify({
						success: true,
						message: "No new URLs to submit",
						totalUrls: currentUrls.length,
