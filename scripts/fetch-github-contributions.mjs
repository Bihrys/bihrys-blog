/**
 * 抓取 GitHub 用户近一年的贡献热力图数据，写入 src/data/github-contributions.json。
 *
 * 数据源优先级：
 *   A. GitHub GraphQL API（仅当存在 GITHUB_TOKEN 环境变量时使用）
 *   B. jogruber 第三方接口（无 token 或数据源 A 失败时的回退）
 *
 * 容错策略：两个数据源都不可用时，若本地已存在旧数据文件则保留旧文件并以
 * 退出码 0 结束，避免外部 API 抖动导致构建失败；若连旧文件都没有，才以
 * 非零退出码结束。
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = "Bihrys";
const TIMEOUT_MS = 15000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(
	__dirname,
	"..",
	"src",
	"data",
	"github-contributions.json",
);

// GraphQL 的贡献等级枚举 -> 归一化数字（0-4）
const GRAPHQL_LEVEL_MAP = {
	NONE: 0,
	FIRST_QUARTILE: 1,
	SECOND_QUARTILE: 2,
	THIRD_QUARTILE: 3,
	FOURTH_QUARTILE: 4,
};

/**
 * 数据源 A：GitHub GraphQL API（需要 token）
 */
async function fetchFromGraphQL(token) {
	const query = `
		query($login: String!) {
			user(login: $login) {
				name
				avatarUrl
				contributionsCollection {
					contributionCalendar {
						totalContributions
						weeks {
							contributionDays {
								date
								contributionCount
								contributionLevel
							}
						}
					}
				}
			}
		}
	`;

	const res = await fetch("https://api.github.com/graphql", {
		method: "POST",
		headers: {
			Authorization: `bearer ${token}`,
			"Content-Type": "application/json",
			"User-Agent": "fuwari-contributions-fetcher",
		},
		body: JSON.stringify({ query, variables: { login: USERNAME } }),
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});

	if (!res.ok) {
		throw new Error(`GraphQL HTTP ${res.status} ${res.statusText}`);
	}

	const json = await res.json();

	// GraphQL 即使 HTTP 200 也可能携带 errors 字段，必须显式检查
	if (json.errors) {
		throw new Error(`GraphQL 返回错误: ${JSON.stringify(json.errors)}`);
	}

	const user = json.data?.user;
	const calendar = user?.contributionsCollection?.contributionCalendar;
	if (!calendar) {
