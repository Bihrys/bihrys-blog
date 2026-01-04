<script lang="ts">
import { onMount } from "svelte";

// 排序模式
type SortMode = "published" | "updated" | "views";
const sortModes: { key: SortMode; label: string; icon: string }[] = [
	{ key: "published", label: "文章创作时间", icon: "calendar" },
	{ key: "updated", label: "文章更新时间", icon: "edit" },
	{ key: "views", label: "浏览量排序", icon: "fire" },
];

let currentSortIndex = 0;
let isBackgroundHidden = false;
let showBackToTop = false;
let isHomePage = false;
let isHotPage = false;
let isPostPage = false;

// 切换排序
function cycleSortMode() {
	currentSortIndex = (currentSortIndex + 1) % sortModes.length;
	const mode = sortModes[currentSortIndex];
	localStorage.setItem("post-sort-mode", mode.key);

	if (mode.key === "views") {
		sessionStorage.setItem("sort-toast", `已按${mode.label}排序`);
		window.location.href = "/hot/";
		return;
	}
	if (mode.key === "published" && isHotPage) {
		sessionStorage.setItem("sort-toast", `已按${mode.label}排序`);
		window.location.href = "/";
		return;
	}

	sortPosts(mode.key);
	showToast(`已按${mode.label}排序（当前页）`);
}

// 排序文章
function sortPosts(mode: SortMode) {
	const container = document.querySelector(
		".post-list-container",
	) as HTMLElement;
	if (!container) return;

	const cards = [
		...container.querySelectorAll('[id^="post-card-"]'),
	] as HTMLElement[];
	if (cards.length === 0) return;

	// 分离置顶和非置顶文章
	const pinnedCards = cards.filter((c) => c.dataset.pinned === "true");
	const normalCards = cards.filter((c) => c.dataset.pinned !== "true");

	// 只对非置顶文章排序
	normalCards.sort((a, b) => {
		if (mode === "views") {
			const slugA = a.dataset.slug || "";
			const slugB = b.dataset.slug || "";
			const viewsA = (window as any).umamiCache?.[slugA]?.pageViews || 0;
			const viewsB = (window as any).umamiCache?.[slugB]?.pageViews || 0;
			return viewsB - viewsA;
		}
		return Number(b.dataset[mode] || 0) - Number(a.dataset[mode] || 0);
	});

	// 重新排列 DOM：置顶在前，排序后的普通文章在后
	[...pinnedCards, ...normalCards].forEach((card) =>
		container.appendChild(card),
	);
}

// Toast 提示
function showToast(message: string) {
	const existing = document.getElementById("sort-toast");
	if (existing) existing.remove();

	const toast = document.createElement("div");
	toast.id = "sort-toast";
	toast.className = "sort-toast";
	toast.textContent = message;
	document.body.appendChild(toast);

	setTimeout(() => toast.classList.add("show"), 10);
	setTimeout(() => {
		toast.classList.remove("show");
