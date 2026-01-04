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
		setTimeout(() => toast.remove(), 300);
	}, 2000);
}

// 切换背景展示模式
function toggleBackground() {
	isBackgroundHidden = !isBackgroundHidden;
	const mainContent = document.getElementById("main-content-wrapper");
	const navbar = document.getElementById("navbar-wrapper");
	const toc = document.getElementById("toc-wrapper");

	if (isBackgroundHidden) {
		if (mainContent) mainContent.style.display = "none";
		if (navbar) navbar.style.display = "none";
		if (toc) toc.style.display = "none";
		document.body.style.overflow = "hidden";
		showExitHint();
	} else {
		if (mainContent) mainContent.style.display = "";
		if (navbar) navbar.style.display = "";
		if (toc) toc.style.display = "";
		document.body.style.overflow = "";
		hideExitHint();
	}
}

function showExitHint() {
	const existingHint = document.getElementById("bg-exit-hint");
	if (existingHint) return;

	const hint = document.createElement("div");
	hint.id = "bg-exit-hint";
	hint.className = "bg-exit-hint";
	hint.innerHTML = `
            <div class="hint-content">
                <div class="hint-icon">👆</div>
                <div class="hint-text">点击按钮或按 ESC 键退出</div>
            </div>
        `;
	document.body.appendChild(hint);
	setTimeout(() => hint.classList.add("fade-out"), 3000);
}

function hideExitHint() {
	const hint = document.getElementById("bg-exit-hint");
	if (hint) hint.remove();
}

// 滚动到评论区
function scrollToComments() {
	const giscus = document.querySelector(".giscus");
	if (giscus) {
		giscus.scrollIntoView({ behavior: "smooth" });
	}
}

// 返回顶部
function backToTop() {
	window.scroll({ top: 0, behavior: "smooth" });
}

// 应用保存的排序状态
function applySavedSort() {
	const currentPath = window.location.pathname;
	const isCurrentHomePage =
		currentPath === "/" || /^\/(\d+|page\/\d+)\/?$/.test(currentPath);
	const isCurrentHotPage = /^\/hot(\/\d+)?\/?$/.test(currentPath);

	if (isCurrentHomePage || isCurrentHotPage) {
		isHomePage = true;
		isHotPage = isCurrentHotPage;
		isPostPage = false;

		if (isCurrentHotPage) {
			// /hot/ 页面默认选中 views
			currentSortIndex = sortModes.findIndex((m) => m.key === "views");
			localStorage.setItem("post-sort-mode", "views");
		} else {
			const savedSort = localStorage.getItem(
				"post-sort-mode",
			) as SortMode | null;
			if (savedSort === "views") {
				// 从 /hot/ 回到首页，重置为 published
				currentSortIndex = 0;
				localStorage.setItem("post-sort-mode", "published");
			} else if (savedSort && savedSort !== "published") {
				const savedIndex = sortModes.findIndex((m) => m.key === savedSort);
