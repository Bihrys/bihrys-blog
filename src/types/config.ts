export type AppItem = {
	name: string;
	url: string;
	image: string; // public/ 路径或完整 URL
	description?: string;
	external?: boolean; // 外链则新标签打开
};
import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;
	description?: string;
	keywords?: string[];

	lang: string;

	themeColor: {
		hue: number;
		fixed: boolean;
		forceDarkMode?: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	background: {
		enable: boolean;
		src: string;
		srcLandscape?: string;
		srcPortrait?: string;
		randomSrc?: string;
		position?: "top" | "center" | "bottom";
		size?: "cover" | "contain" | "auto";
		repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
		attachment?: "fixed" | "scroll" | "local";
		opacity?: number;
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];

	// Optional URL for the Apps page redirect target
	appRedirectUrl?: string;

	// 应用卡片数据（用于 /apps 页面）
	apps?: AppItem[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,

	Friends = 3,
	Apps = 4,
	Donate = 5,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarGroup = {
	name: string;
	children: (NavBarLink | LinkPreset)[];
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset | NavBarGroup)[];
};
