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
				if (savedIndex !== -1) {
					currentSortIndex = savedIndex;
					waitAndSort(savedSort);
				}
			} else {
				currentSortIndex = 0;
			}
		}
	} else {
		isHomePage = false;
		isHotPage = false;
		isPostPage = /^\/posts\//.test(currentPath);
	}
}

// 等待条件满足后执行排序
function waitAndSort(mode: SortMode, retries = 0) {
	const maxRetries = 20; // 最多等待约4秒
	const container = document.querySelector(".post-list-container");

	if (!container || container.children.length === 0) {
		// DOM 未就绪，继续等待
		if (retries < maxRetries) {
			setTimeout(() => waitAndSort(mode, retries + 1), 200);
		}
		return;
	}

	// 对于浏览量排序，需要等待 umamiCache 加载
	if (mode === "views") {
		const cards = container.querySelectorAll('[id^="post-card-"]');
		const hasAnyViewData = Array.from(cards).some((card) => {
			const slug = (card as HTMLElement).dataset.slug;
			return (
				slug && (window as any).umamiCache?.[slug]?.pageViews !== undefined
			);
		});

		if (!hasAnyViewData && retries < maxRetries) {
			// 浏览量数据未加载，继续等待
			setTimeout(() => waitAndSort(mode, retries + 1), 200);
			return;
		}
	}

	// 条件满足，执行排序
	sortPosts(mode);
}

onMount(() => {
	// 显示跨页 toast
	const pendingToast = sessionStorage.getItem("sort-toast");
	if (pendingToast) {
		sessionStorage.removeItem("sort-toast");
		showToast(pendingToast);
	}

	// 初始判断并应用排序
	applySavedSort();

	// 监听 Swup 页面切换事件 - 使用多种事件确保触发
	const handleSwupContentReplace = () => {
		// 使用较长延迟确保 DOM 完全加载
		setTimeout(() => {
			applySavedSort();
		}, 300);
	};

	// 尝试注册 Swup 钩子
	const registerSwupHooks = () => {
		if ((window as any).swup?.hooks) {
			(window as any).swup.hooks.on(
				"content:replace",
				handleSwupContentReplace,
			);
			(window as any).swup.hooks.on("page:view", handleSwupContentReplace);
		}
	};

	// 立即尝试注册
	registerSwupHooks();

	// 也监听 Swup 启用事件（以防 Swup 尚未初始化）
	document.addEventListener("swup:enable", registerSwupHooks);
	document.addEventListener("swup:contentReplaced", handleSwupContentReplace);

	// 监听滚动显示返回顶部按钮
	const handleScroll = () => {
		showBackToTop = window.scrollY > 300;
	};
	window.addEventListener("scroll", handleScroll, { passive: true });

	// ESC 退出背景模式
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape" && isBackgroundHidden) {
			toggleBackground();
		}
	};
	window.addEventListener("keydown", handleKeyDown);

	return () => {
		window.removeEventListener("scroll", handleScroll);
		window.removeEventListener("keydown", handleKeyDown);
		document.removeEventListener("swup:enable", registerSwupHooks);
		document.removeEventListener(
			"swup:contentReplaced",
			handleSwupContentReplace,
		);
		if ((window as any).swup?.hooks) {
			(window as any).swup.hooks.off(
				"content:replace",
				handleSwupContentReplace,
			);
			(window as any).swup.hooks.off("page:view", handleSwupContentReplace);
		}
		hideExitHint();
	};
});
</script>

<div class="floating-controls" class:bg-mode={isBackgroundHidden}>
  <!-- 排序按钮（仅首页） -->
  {#if isHomePage && !isBackgroundHidden}
    <button
      class="control-btn"
      on:click={cycleSortMode}
      aria-label="切换排序方式"
      title={`当前：${sortModes[currentSortIndex].label}（点击切换）`}
    >
      {#if sortModes[currentSortIndex].icon === "calendar"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      {:else if sortModes[currentSortIndex].icon === "edit"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <path d="M15 14l-3.5 3.5L10 16l3.5-3.5L15 14z"></path>
          <line x1="12" y1="11" x2="12" y2="11.01"></line>
        </svg>
      {:else}
        <!-- 火焰图标表示热门/浏览次数 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
