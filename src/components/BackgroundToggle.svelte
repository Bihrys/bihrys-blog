<script lang="ts">
import { onMount } from "svelte";

let isHidden = false;
let button: HTMLButtonElement;

function toggleBackground() {
	isHidden = !isHidden;
	const mainContent = document.getElementById("main-content-wrapper");
	const navbar = document.getElementById("navbar-wrapper");
	const backToTop = document.getElementById("back-to-top-btn");
	const toc = document.getElementById("toc-wrapper");

	if (isHidden) {
		// 隐藏所有内容，只展示背景
		if (mainContent) mainContent.style.display = "none";
		if (navbar) navbar.style.display = "none";
		if (backToTop) backToTop.style.display = "none";
		if (toc) toc.style.display = "none";
		document.body.style.overflow = "hidden";
		// 添加一个提示显示如何退出
		showExitHint();
	} else {
		// 显示所有内容
		if (mainContent) mainContent.style.display = "";
		if (navbar) navbar.style.display = "";
		if (backToTop) backToTop.style.display = "";
		if (toc) toc.style.display = "";
		document.body.style.overflow = "";
		// 移除提示
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

	// 3秒后自动淡出提示
	setTimeout(() => {
		hint.classList.add("fade-out");
	}, 3000);
}

function hideExitHint() {
	const hint = document.getElementById("bg-exit-hint");
	if (hint) {
		hint.remove();
	}
}

onMount(() => {
	// 按 ESC 键也可以退出背景展示模式
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape" && isHidden) {
			toggleBackground();
		}
	};

	window.addEventListener("keydown", handleKeyDown);

	return () => {
		window.removeEventListener("keydown", handleKeyDown);
		hideExitHint();
	};
});
</script>

<button
    bind:this={button}
    on:click={toggleBackground}
    class="bg-toggle-btn"
    class:hidden={isHidden}
    aria-label={isHidden ? "显示内容" : "仅展示背景"}
    title={isHidden ? "显示内容" : "仅展示背景 (按ESC退出)"}
>
