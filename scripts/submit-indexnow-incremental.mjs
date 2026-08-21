import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const SUBMITTED_URLS_FILE = join(process.cwd(), '.indexnow-submitted.json');

function getIndexNowConfig() {
  const key = process.env.INDEXNOW_KEY;
  const host = process.env.INDEXNOW_HOST;
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || (host && key ? `https://${host}/${key}.txt` : undefined);

  if (!key || !host) {
    console.error('❌ 缺少 IndexNow 配置，请设置环境变量 INDEXNOW_KEY 与 INDEXNOW_HOST');
    process.exit(1);
  }

  return { key, host, keyLocation };
}

// 读取已提交的URL记录
function getSubmittedUrls() {
  if (!existsSync(SUBMITTED_URLS_FILE)) {
    return {
      urls: [],
      lastSubmitted: null,
      totalSubmissions: 0
    };
  }

  try {
    const data = readFileSync(SUBMITTED_URLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('⚠️ 无法读取已提交URL记录，将重新开始:', error.message);
    return {
      urls: [],
      lastSubmitted: null,
      totalSubmissions: 0
    };
  }
}

// 保存已提交的URL记录
function saveSubmittedUrls(submittedData) {
  try {
    writeFileSync(SUBMITTED_URLS_FILE, JSON.stringify(submittedData, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ 保存已提交URL记录失败:', error.message);
  }
}

// 增量提交到IndexNow
async function submitIncrementalIndexNow() {
  try {
    // 读取构建后的 sitemap
    const sitemapPath = join(process.cwd(), 'dist', 'sitemap-0.xml');

    if (!existsSync(sitemapPath)) {
      console.error('❌ 未找到 sitemap 文件，请先运行 pnpm build');
      process.exit(1);
    }

    const sitemapContent = readFileSync(sitemapPath, 'utf-8');

    // 从 sitemap 中提取 URL
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
    const currentUrls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];

    if (currentUrls.length === 0) {
      console.error('❌ 未找到要提交的 URL');
      process.exit(1);
    }

    console.log(`📋 当前网站共有 ${currentUrls.length} 个页面`);

    // 获取已提交的URL记录
    const submittedData = getSubmittedUrls();
    const submittedUrls = new Set(submittedData.urls || []);

    // 找出新增的URL
    const newUrls = currentUrls.filter(url => !submittedUrls.has(url));

    if (newUrls.length === 0) {
      console.log('✅ 没有新增URL需要提交到 IndexNow');
      console.log(`📊 统计信息:`);
      console.log(`   - 总页面数: ${currentUrls.length}`);
      console.log(`   - 已提交数: ${submittedUrls.size}`);
      console.log(`   - 上次提交: ${submittedData.lastSubmitted || '从未提交'}`);
