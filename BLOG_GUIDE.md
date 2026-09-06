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
