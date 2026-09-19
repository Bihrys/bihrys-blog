# 友链

欢迎互换友链！本站友链已接入 **GitHub 自动审核**，申请通过后机器人会**自动合并并上线**，无需等待人工处理。

**👉 [点这里申请友链](https://github.com/Bihrys/bihrys-blog/new/main/src/content/friends?filename=your-site.json)**（在 GitHub 上提交一个 JSON 文件即可，会自动创建一个 PR）

<details>
<summary>点击查看申请方式与格式示例</summary>

## 申请方式

1. 点击上方链接，打开 GitHub 的「新建文件」页面（目录已定位到 `src/content/friends`）
2. 文件名改成 `<你的站点英文名>.json`（只能用字母、数字、下划线 `_`、短横线 `-`）
3. 按下面的格式填写内容，提交后会自动创建一个 PR
4. 机器人会自动检查：**文件路径** → **JSON 格式** → **互链**（你的友链页必须有本站链接）→ **能否正常构建**
5. 全部通过后自动 squash 合并，本站会自动更新你的友链卡片

**本站信息（申请时请参考）：**

```json
{
  "name": "Bihrys's Blog",
  "avatar": "https://bihrys.com/images/avatar.jpeg",
  "introduction": "心臓は点滅するかしら……",
  "url": "https://bihrys.com",
  "friendsPage": "https://bihrys.com/friends"
}
```

**内容格式示例：**

```json
{
  "name": "您的网站名称",
  "avatar": "https://example.com/avatar.png",
  "introduction": "一句话简介",
  "url": "https://example.com",
  "friendsPage": "https://example.com/friends"
}
```

> **注意事项**
> - 五个字段都不能为空，且 `url`、`avatar`、`friendsPage` 必须以 `http://` 或 `https://` 开头；除这五个字段外不能有其他字段
> - **请不要修改 `_order.json`**（友链排序由机器人自动维护）
> - **请先在你的友链页面加上本站链接**（`https://bihrys.com`），机器人会访问你的友链页检测互链，没有互链会审核失败
> - 头像链接需允许跨域引用（防盗链会导致图片无法显示）
> - 单个 JSON 文件不超过 2KB

</details>

---
