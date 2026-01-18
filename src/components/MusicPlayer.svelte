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
