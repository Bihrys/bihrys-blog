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
      console.log(`   - 提交次数: ${submittedData.totalSubmissions || 0}`);
      return;
    }

    console.log(`🚀 发现 ${newUrls.length} 个新增URL需要提交:`);
    newUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    // IndexNow 官方配置（通过环境变量提供）
    const { key, host, keyLocation } = getIndexNowConfig();

    const payload = {
      host,
      key,
      keyLocation,
      urlList: newUrls
    };

    // 提交到 IndexNow 官方 API
    console.log('🔄 正在提交新增URL到 api.indexnow.org...');

    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Micostar-Blog-IndexNow/1.0'
      },
      body: JSON.stringify(payload)
    });

    // IndexNow API 通常返回空响应体
    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch (e) {
      // 正常情况，IndexNow通常返回空响应
    }

    const isSuccess = response.status === 200 || response.status === 202;

    if (isSuccess) {
      console.log(`✅ IndexNow 提交成功! (HTTP ${response.status})`);

      // 更新已提交URL记录
      const updatedSubmittedData = {
        urls: [...submittedUrls, ...newUrls],
        lastSubmitted: new Date().toISOString(),
        totalSubmissions: (submittedData.totalSubmissions || 0) + 1,
        lastSubmissionDetails: {
          newUrlsCount: newUrls.length,
          totalUrlsCount: currentUrls.length,
          timestamp: new Date().toISOString(),
          status: response.status,
          newUrls: newUrls
        }
      };

      saveSubmittedUrls(updatedSubmittedData);

      console.log(`📊 提交统计:`);
      console.log(`   - 本次新增: ${newUrls.length} 个URL`);
      console.log(`   - 累计提交: ${updatedSubmittedData.urls.length} 个URL`);
      console.log(`   - 提交次数: ${updatedSubmittedData.totalSubmissions}`);
      console.log(`   - 节省额度: ${currentUrls.length - newUrls.length} 个URL (${Math.round((1 - newUrls.length / currentUrls.length) * 100)}%)`);

    } else {
      console.error(`❌ IndexNow 提交失败: HTTP ${response.status} ${response.statusText}`);
      if (responseBody) {
        console.error('响应内容:', responseBody);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ 提交过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 强制重新提交所有URL的选项
async function forceSubmitAll() {
  try {
    console.log('🔄 强制提交模式：将提交所有URL...');

    // 读取构建后的 sitemap
    const sitemapPath = join(process.cwd(), 'dist', 'sitemap-0.xml');
