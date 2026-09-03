# Fuwari Project Context for AI Agents

> **File Purpose**: This document consolidates project context for AI agents (Claude, Gemini, etc.) to quickly understand the Fuwari project structure, technology stack, and workflows.

## Project Overview

**Fuwari** is a static blog template built on **Astro**, using **Svelte** and **Tailwind CSS** to achieve high customization, high performance, and beautiful visual effects.

## Core Architecture

### Technology Stack
| Category | Technology |
| :--- | :--- |
| **Framework** | Astro 5.x |
| **Styling** | Tailwind CSS 3.x + Stylus |
| **Interactivity** | Svelte 5.x + Astro |
| **Content** | Astro Content Collections (Markdown) |
| **Package Manager** | pnpm 9.x |
| **Linting/Formatting** | Biome |
| **Type Checking** | TypeScript (Strict Mode) |

### Key Features
- **UI/UX**: Dark/Light theme toggle, Page transition animations (Swup), TOC, Sticky posts, **Post sorting** (by published/updated/views with cross-page navigation; labels: 文章创作时间/文章更新时间/浏览量排序), **Flat navbar links** (all links visible on `lg+`, no dropdown groups), **Reading progress indicator**, **Hot posts page** (`/hot/`) with build-time pageviews sorting.
- **Privacy/Consent**: Cookie consent popup (bottom-right, animated scale-in/out) with bilingual (zh+en) text, dynamic GA/AdSense loading only after consent, Umami always-on (cookie-free), "always remember" checkbox, reset control on privacy page (`/about-privacy/`).
- **Content**: Markdown support with math formulae (KaTeX), syntax highlighting (Expressive Code), Mermaid diagrams.
- **Performance/Safety**: Image fallback (Dual CDN), Anti-leech protection, **Real-time CDN Detection** (Cloudflare/EdgeOne/Vercel).
- **SEO/Analytics**: IndexNow integration, Sitemap, RSS, Umami (pageviews via `/stats` endpoint, always-on, cookie-free) & Google Analytics + AdSense (consent-gated, dynamically injected after user accepts), Canonical URLs, Open Graph & Twitter Card meta tags, JSON-LD structured data.
- **Cookie Consent** (`src/layouts/Layout.astro`): Bottom-right animated popup (scale-in on load, keyframe shrink-out on dismiss). `localStorage` key `cookie-consent` stores `accepted`/`rejected`/`always-accepted`/`always-rejected`. GA (`G-68S9RLWRP0`) and AdSense (`ca-pub-2234222684256085`) scripts are dynamically injected only when accepted. Umami is unconditional. Reset UI available at `/about-privacy/`.

---

## Directory Structure & Configuration

### Key Directories
| Directory | Description |
| :--- | :--- |
| `src/config.ts` | **Main Configuration** (Site, Nav, Profile, Feature toggles) |
| `src/content/posts/` | Blog Posts (Markdown) |
| `src/content/spec/` | Special Pages (e.g., About) |
| `src/content/friends/` | Friend Links (JSON + `_order.json` for sorting) |
| `src/content/config.ts` | Content Collections Schema |
| `src/components/` | UI Components (Astro + Svelte) |
| `src/layouts/` | Page Layouts |
| `src/pages/` | Routing Pages & API Endpoints |
| `src/plugins/` | Custom Remark/Rehype Plugins |
| `src/styles/` | Global Styles |
| `src/utils/` | Utility Functions |
| `public/` | Static Assets |
| `scripts/` | Tool scripts (Migration, IndexNow submission) |

### Key Configuration Files
| File | Description |
| :--- | :--- |
| `astro.config.mjs` | Astro Project Config |
| `src/config.ts` | User Configuration Entry Point |
| `src/content/config.ts` | Content Collections Schema |
| `tailwind.config.cjs` | Tailwind CSS Config |

### Content Collections Schema
| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| `posts` | Blog Posts | `title`, `published`, `updated`, `draft`, `description`, `image`, `tags`, `lang`, `pinned` |
| `spec` | Special Pages | `title`, `published`, `updated`, `draft` |
| `assets` | Asset Data | `title`, `description` |
| `friends` | Friend Links | `name`, `url`, `avatar`, `introduction`, `friendsPage` |

---

## Development Workflow

### Prerequisites
- Node.js 18+ (LTS)
- pnpm 9+

### Common Commands
| Command | Description |
| :--- | :--- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server (`localhost:4321`) |
| `pnpm build` | Build production version to `./dist/` |
| `pnpm preview` | Preview production build |
| `pnpm new-post <filename>` | Create new post from template |
| `pnpm lint` | Biome code check |
| `pnpm format` | Biome code format |
| `pnpm type-check` | TypeScript type check |

### Creating Content
Posts are located in `src/content/posts/`.
**Frontmatter Example:**
```yaml
---
title: "Post Title"           # Required
published: 2023-01-01         # Required (YYYY-MM-DD)
updated: 2023-01-02           # Optional
draft: false                  # Optional
description: "Summary"        # Optional
image: "./cover.jpg"          # Optional
tags: ["Tag1", "Tag2"]        # Optional
category: "Category"          # Optional
pinned: false                 # Optional: Pin to top
prerenderAll: false           # Optional: Pre-render content (for long posts)
lang: zh_CN                   # Optional
---
```

---

## Friend Links Automation

### Data Structure
Each friend link is a JSON file in `src/content/friends/`:
```json
{
  "name": "Site Name",
  "url": "https://example.com",
  "avatar": "https://example.com/avatar.png",
  "introduction": "Short description",
  "friendsPage": "https://example.com/friends/"
}
```

### Sorting
- `src/content/friends/_order.json`: Array of friend IDs controlling display order (earliest added first).
- `src/pages/friends.astro`: Reads `_order.json` for sorting; entries not in the array appear last.
- The `_` prefix ensures Astro ignores it as a collection entry.

### GitHub Actions Auto-Merge (`friends-auto-merge.yml`)
| Step | Description |
| :--- | :--- |
| **Verify Changed Files** | Whitelist check: only `src/content/friends/<name>.json` allowed; `_order.json` modification blocked. Outputs `status`/`detail` without exiting on failure. |
| **Validate JSON Content** | Schema validation (required fields, URL format, XSS check, no extra fields, 2KB size limit). Collects all errors before reporting. |
| **Check Backlink** | Fetches `friendsPage` URL, checks for `href` containing `www.micostar.cc`. Outputs per-entry results. |
| **Gate Check** | Aggregates results from above 3 steps. Only proceeds to Build/Merge if all pass. |
| **Build Check** | Runs `pnpm build` (skipped if Gate fails). Captures pass/fail status. |
| **Auto Merge** | Squash merge with welcome message (skipped if Gate or Build fails) |
| **Update Order** | Appends new friend ID to `_order.json` and pushes to main |
| **Comment on PR** | Posts structured table with per-step ✅/❌/⏭️ results and specific error details |
| **Label** | Adds `✅ 验证通过` or `❌ 验证未通过` label (auto-creates labels if missing) |

- **Feedback Format**: PR comment uses a Markdown table showing each check item's status and reason. Failed checks don't block subsequent checks from running (except Build which requires Gate pass).
- **Trigger**: `pull_request_target` with `types: [opened, synchronize]`.
- **Security**: Checkout base first for file verification, then PR head for content validation. `pnpm install --frozen-lockfile` prevents lockfile tampering.

---

## IndexNow Integration
Fuwari integrates IndexNow to automatically submit URLs to search engines (Bing, Yandex, etc.).

### Commands
- `pnpm submit-indexnow`: Submit all URLs (no build).
- `pnpm submit-indexnow-inc`: **Incremental submit** (new URLs only).
- `pnpm submit-indexnow-force`: Force submit all URLs.
- `pnpm indexnow-status`: Check submission status.

### Implementation
- **Scripts**: `scripts/submit-indexnow*.mjs`
- **API**: `src/pages/api/indexnow.ts`
- **State**: `.indexnow-submitted.json` (Do not commit)

---

## Integrations & Plugins

### Markdown & Content (Remark/Rehype)
- **Math**: `remark-math` + `rehype-katex`
- **Code**: Expressive Code (GitHub Dark theme) with custom plugins:
    - Collapsible sections
    - Line numbers
    - Custom copy button
- **Content**:
    - `remark-reading-time` (Reading time)
    - `rehype-slug` & `rehype-autolink-headings` (Anchors)
    - Custom components: GitHub Cards, Admonitions

