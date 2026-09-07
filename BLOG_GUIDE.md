# 📝 博客编写和更新完整指南

## 🚀 快速开始

### 创建新文章
```bash
pnpm run new-post -- "文章标题"
```

### 本地预览
```bash
pnpm run dev
```
访问: http://localhost:4321

### 构建博客
```bash
pnpm run build
```

## 📄 文章结构

### Front Matter (文章头部信息)
```yaml
---
title: 文章标题                    # 必填
published: 2025-09-02T20:10:14    # 发布时间
description: '文章描述'            # SEO描述
image: 'https://example.com/img.jpg'  # 封面图片
tags: [标签1, 标签2, 标签3]       # 标签
category: 分类名称                # 分类
draft: false                      # 是否为草稿
lang: ''                         # 语言(默认继承配置)
pinned: true                     # 置顶文章（显示在列表最前面）
prerenderAll: true               # 预渲染所有内容（适用于长文章，确保滚动流畅）
---
```

> **置顶文章**：添加 `pinned: true` 即可将文章置顶显示  
> **长文章优化**：添加 `prerenderAll: true` 可预渲染折叠区内容，确保滚动流畅

### Markdown 内容格式

#### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

#### 图片
```markdown
# 使用您的双CDN图床
![图片描述](https://image.ai0728.com.cn/your-image.jpg)

# 本地图片（放在 public/images/ 目录下）
![本地图片](/images/example.png)

# 相对路径本地图片
![本地图片](./images/local-image.jpg)
```

#### 代码块
````markdown
```javascript
function hello() {
    console.log("Hello World!");
}
```
````

#### 链接
```markdown
[链接文字](https://example.com)
```

#### 列表
```markdown
1. 有序列表
2. 项目二

- 无序列表
- 项目二
```

#### 引用
```markdown
> 这是一个引用块
```

#### 表格
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
```

#### 文本样式
```markdown
# 基本样式
**加粗文本**
*斜体文本*
***加粗斜体***
~~删除线~~

# 下划线（使用HTML标签）
<ins>带下划线的文本</ins>

# 红色加粗警告文本（推荐方式）
<span style="color: red; font-weight: bold;">重要警告信息</span>

# 其他颜色文本
<span style="color: blue;">蓝色文本</span>
<span style="color: green;">绿色文本</span>
<span style="color: orange;">橙色文本</span>

# 组合样式
<span style="color: red; font-weight: bold; text-decoration: underline;">红色加粗下划线</span>
```

## 🖼️ 图片管理

### 双CDN图床配置
已配置的图床系统：
- 主图床: `image.ai0728.com.cn`
- 备用图床: `image.cloudrunmax.top`

### 图片使用方式

1. **直接使用图床链接**
```markdown
![图片](https://image.ai0728.com.cn/your-image.jpg)
```

2. **本地图片**
将图片放在 `src/content/posts/` 相对路径下：
```markdown
![本地图片](./images/example.jpg)
```

3. **封面图片**
在 Front Matter 中设置：
```yaml
image: 'https://image.ai0728.com.cn/cover.jpg'
```

## 📂 文件组织

### 目录结构
```
src/content/posts/
├── 我的第一篇博客.md
├── Vercel部署指南.md
├── images/                 # 图片目录
│   ├── post1/
│   └── post2/
└── assets/                 # 其他资源
```

### 分类建议
- **技术教程**: 详细的技术指南
- **项目分享**: 个人项目介绍
- **学习笔记**: 学习心得和总结
- **博客日志**: 个人动态和想法
- **工具推荐**: 实用工具介绍

## 🧩 作品集页面编写方法

作品集内容位于 `src/content/works/`，每个作品对应一个 Markdown 文件。文件名会成为访问路径，例如：

```plaintext
src/content/works/unity-skills.md
```

