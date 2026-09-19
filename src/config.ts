import type {
	AntiLeechConfig,
	ExpressiveCodeConfig,
	ImageFallbackConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Bihrys's Blog",
	subtitle: "A personal blog site.",
	description:
		"Bihrys 的个人博客，记录技术折腾、Linux 使用与生活随笔。",
	keywords: ["Bihrys", "博客", "Linux", "技术"],
	lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
	themeColor: {
		hue: 220, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: true, // Hide the theme color picker for visitors
		forceDarkMode: true, // Force dark mode and hide theme switcher
	},
	banner: {
		enable: false,
		src: "/images/banner1.jpeg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'

		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed

			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	background: {
		enable: true, // Enable background image
		src: "/images/banner1.jpeg", // 默认固定背景（横屏）
		srcLandscape: "/images/banner1.jpeg", // 横屏固定背景
		srcPortrait: "/images/banner1.jpeg", // 竖屏固定背景
		randomSrc: "", // 随机图 API，留空表示不使用
		position: "center", // Background position: 'top', 'center', 'bottom'
		size: "cover", // Background size: 'cover', 'contain', 'auto'
		repeat: "no-repeat", // Background repeat: 'no-repeat', 'repeat', 'repeat-x', 'repeat-y'
		attachment: "fixed", // Background attachment: 'fixed', 'scroll', 'local'
		opacity: 0.5, // Background opacity (0-1)
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{
			src: "/favicon/favicon-dark-32.png",
			theme: "dark",
			sizes: "32x32",
		},
		{
			src: "/favicon/favicon-light-32.png",
			theme: "light",
			sizes: "32x32",
		},
	],
	apps: [
		{
			name: "AI Relay",
			url: "https://ai.bihrys.com",
			image: "/favicon/ai-relay.svg",
			description: "AI 中转服务",
			external: true,
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Friends,
		LinkPreset.Apps,
		LinkPreset.Donate,
		{
			name: "关于",
			url: "/about/",
		},
		{
			name: "AI Relay",
			url: "https://ai.bihrys.com",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/images/avatar.jpeg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Bihrys",
	bio: ["心臓は点滅するかしら……"],
	links: [
		{
			name: "Email",
			icon: "material-symbols:mail-rounded",
			url: "mailto:3200769991@qq.com",
		},
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/1124230309",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Bihrys",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

//图片回退（本地图片为主，关闭双图床容灾）
export const imageFallbackConfig: ImageFallbackConfig = {
	enable: false,
	originalDomain: "",
	fallbackDomain: "",
};

// 统计服务：自建 Umami（umami.bihrys.com）
export const umamiConfig: UmamiConfig = {
	enable: true,
	baseUrl: "https://umami.bihrys.com",
	shareId: "8gQID6k4hHuanwjO",
	timezone: "Asia/Shanghai",
};

// 防盗链/域名保护配置
export const antiLeechConfig: AntiLeechConfig = {
	enable: true,
	officialSites: [{ url: "https://bihrys.com", name: "主站" }],
	debug: false,
	warningTitle: "⚠️ 域名安全警告",
	warningMessage:
		"您可能正在访问非官方网站，存在安全风险！建议跳转到官方网站。",
};

export const googleAnalyticsConfig = {
	enable: false,
	measurementId: "",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
