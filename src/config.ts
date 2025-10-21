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
