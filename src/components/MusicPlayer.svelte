<script lang="ts">
import { onMount } from "svelte";

let audio: HTMLAudioElement;
let isPlaying = false;
let currentTime = 0;
let duration = 0;
let isLoaded = false;
let isInitialized = false; // 是否已初始化音频
let isLoading = false; // 是否正在加载
let checkboxElement: HTMLInputElement;
let isMobile = false; // 是否移动端视口
let pendingPlayRequest = false; // 移动端首点加载后自动播放
let showLoadingToast = false; // 控制加载提示显示
let showLoadedToast = false; // 控制加载完成提示显示
let loadStartTime = 0; // 记录加载开始时间

// 音频文件配置 - 支持多格式回退
const audioSources = ["/music/background.flac", "/music/background.mp3"];

let currentSourceIndex = 0;

function updateIsMobile() {
	if (typeof window !== "undefined") {
		isMobile = window.matchMedia("(max-width: 768px)").matches;
	}
}

onMount(() => {
	updateIsMobile();
	if (typeof window !== "undefined") {
		window.addEventListener("resize", updateIsMobile);
	}

	audio = new Audio();
	// 懒加载：不立即加载音频文件

	audio.addEventListener("loadedmetadata", () => {
		duration = audio.duration;
		isLoaded = true;
		isLoading = false;

		// 确保至少显示1秒加载提示，然后显示完成提示
		const minLoadTime = Math.max(1000 - (Date.now() - loadStartTime), 100);
		setTimeout(() => {
			showLoadingToast = false;
			// 显示加载完成提示
			showLoadedToast = true;
			// 1秒后隐藏完成提示
			setTimeout(() => {
				showLoadedToast = false;
			}, 1000);

			// 移动端：用户首点后自动播放
			if (pendingPlayRequest && isMobile) {
				pendingPlayRequest = false;
				isPlaying = true;
				if (checkboxElement) {
					checkboxElement.checked = true;
				}
				audio.play().catch((error) => {
					console.error("Failed to auto-play audio:", error);
					if (checkboxElement) {
						checkboxElement.checked = false;
					}
					isPlaying = false;
				});
			}
		}, minLoadTime);
	});

	audio.addEventListener("timeupdate", () => {
		currentTime = audio.currentTime;
	});

	audio.addEventListener("ended", () => {
		isPlaying = false;
		if (checkboxElement) {
			checkboxElement.checked = false;
		}
	});

	audio.addEventListener("error", handleAudioError);

	return () => {
		if (audio) {
			audio.pause();
			audio.src = "";
		}
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", updateIsMobile);
		}
	};
});

function loadAudioSource() {
	if (currentSourceIndex < audioSources.length) {
		isLoading = true;
		showLoadingToast = true; // 显示加载提示
		loadStartTime = Date.now(); // 记录开始时间
		audio.src = audioSources[currentSourceIndex];
		audio.load();
		isInitialized = true;
	}
}

function handleAudioError() {
	console.warn(
		`Failed to load audio source: ${audioSources[currentSourceIndex]}`,
	);
	currentSourceIndex++;
	if (currentSourceIndex < audioSources.length) {
		loadAudioSource();
	} else {
		console.error("All audio sources failed to load");
		isLoading = false;
		showLoadingToast = false;
		showLoadedToast = false;
		pendingPlayRequest = false;
		// 所有音频源都加载失败时重置checkbox
		if (checkboxElement) {
			checkboxElement.checked = false;
		}
	}
}

function handleCheckboxChange(event: Event) {
	const target = event.target as HTMLInputElement;

	// 如果音频尚未初始化，先初始化
	if (!isInitialized) {
		loadAudioSource();

		// 如果正在加载，移动端记下自动播放意图，桌面端阻止状态变化
		if (isLoading) {
			pendingPlayRequest = isMobile;
			if (!isMobile) {
				target.checked = false;
			}
			return;
		}
	}

	if (!isLoaded) {
		// 如果音频未加载完成，阻止checkbox状态改变
		target.checked = false;
		return;
	}

	// 如果显示加载完成提示，立即隐藏
	if (showLoadedToast) {
		showLoadedToast = false;
	}

	isPlaying = target.checked;

	if (isPlaying) {
		audio.play().catch((error) => {
			console.error("Failed to play audio:", error);
			// 播放失败时重置checkbox
			if (checkboxElement) {
				checkboxElement.checked = false;
			}
			isPlaying = false;
		});
	} else {
		audio.pause();
	}
}
</script>

<div class="container">
  <label>
    <input 
      class="play-btn" 
      type="checkbox"
      aria-label="播放/暂停背景音乐"
      bind:this={checkboxElement}
      on:change={handleCheckboxChange}
      disabled={isLoading}
    >
    <div class="play-icon"></div>
    <div class="pause-icon"></div>
  </label>
</div>

<!-- 优雅的音乐加载提示 -->
{#if showLoadingToast}
  <div class="music-loading-notification loading">
    <div class="loading-content">
      <div class="music-icon loading-icon">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      <div class="loading-wave">
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
        <div class="wave-bar"></div>
      </div>
      <div class="loading-text">
        <span class="main-text loading-main-text">🎵 音乐准备中</span>
        <span class="sub-text">正在加载音频文件...</span>
      </div>
    </div>
    <div class="loading-progress"></div>
  </div>
{/if}

<!-- 音乐加载完成提示 -->
{#if showLoadedToast}
  <div class="music-loading-notification loaded">
    <div class="loading-content">
      <div class="music-icon success-icon">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <div class="success-animation">
        <div class="ripple-1"></div>
        <div class="ripple-2"></div>
        <div class="ripple-3"></div>
      </div>
      <div class="loading-text">
        <span class="main-text success-main-text">✨ 音乐已就绪</span>
        <span class="sub-text">点击播放按钮开始播放</span>
      </div>
    </div>
    <div class="success-glow"></div>
  </div>
{/if}

<style>
  .container {
    width: 40px;
    height: 40px;
    position: relative;
    border-radius: 50%;
    margin-right: 12px;
  }

  .play-btn {
    position: absolute;
    appearance: none;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(var(--primary), var(--primary));
    cursor: pointer;
    outline: none;
  }

  .play-btn::before {
    content: "";
    position: absolute;
    width: 93%;
    height: 93%;
    background-color: var(--card-bg);
    border-radius: 50%;
    left: 50%;
