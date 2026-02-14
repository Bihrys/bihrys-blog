<script lang="ts">
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	urlPath?: string;
}

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let posts: any[] = [];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const highlightText = (text: string, keyword: string): string => {
	if (!keyword) return text;
	const regex = new RegExp(`(${keyword})`, "gi");
	return text.replace(regex, "<mark>$1</mark>");
};

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	isSearching = true;

	try {
		const searchResults = posts
			.filter((post) => {
				const keywordLower = keyword.toLowerCase();
				const searchText =
					`${post.title} ${post.description} ${post.content}`.toLowerCase();
				const urlPath = `/posts/${post.link}`;

				// 支持内容搜索和URL后缀搜索
				return (
					searchText.includes(keywordLower) ||
					urlPath.toLowerCase().includes(keywordLower) ||
					post.link.toLowerCase().includes(keywordLower)
				);
			})
			.map((post) => {
				const contentLower = post.content.toLowerCase();
				const keywordLower = keyword.toLowerCase();
				const contentIndex = contentLower.indexOf(keywordLower);

				let excerpt = "";
				if (contentIndex !== -1) {
					const start = Math.max(0, contentIndex - 50);
					const end = Math.min(post.content.length, contentIndex + 100);
					excerpt = post.content.substring(start, end);
					if (start > 0) excerpt = "..." + excerpt;
					if (end < post.content.length) excerpt = excerpt + "...";
				} else {
					excerpt = post.description || post.content.substring(0, 150) + "...";
				}

				return {
					url: url(`/posts/${post.link}/`),
					meta: {
						title: post.title,
					},
