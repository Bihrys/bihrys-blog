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
    {#if isHidden}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    {/if}
</button>

<style>
    .bg-toggle-btn {
        position: fixed;
        bottom: 5.25rem;
        right: 1.5rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .bg-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(1.1);
        color: rgba(255, 255, 255, 1);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        border-color: rgba(255, 255, 255, 0.4);
    }

    .bg-toggle-btn:active {
        transform: scale(0.95);
    }

    .bg-toggle-btn.hidden {
        opacity: 0.8;
        position: fixed;
        bottom: auto;
        right: auto;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 4.5rem;
        height: 4.5rem;
        background: rgba(255, 255, 255, 0.2);
        animation: pulse 2s ease-in-out infinite;
    }

    .bg-toggle-btn.hidden:hover {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.15);
        animation: none;
    }

    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
        }
        50% {
            box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
        }
    }

    /* 暗色模式样式 */
    :global(.dark) .bg-toggle-btn {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.8);
    }

    :global(.dark) .bg-toggle-btn:hover {
        background: rgba(0, 0, 0, 0.6);
        border-color: rgba(255, 255, 255, 0.3);
    }
