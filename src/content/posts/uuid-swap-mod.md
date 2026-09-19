---
title: UUID Swap —— 拯救存档丢失的 Minecraft 服务端模组
published: 2026-09-20
description: '玩家存档丢了？UUID 变了？这个模组可以把存档数据完整迁移给任意 UUID，Fabric / Forge 双平台支持。'
image: ''
tags: [Minecraft, Mod, 开服]
category: 'Projects'
draft: false
lang: 'zh_CN'
---

开服的人大概都遇到过这种绝望的提问：

> 「腐竹，我存档没了！背包全空了，家也回不去了！」

存档丢失的原因千奇百怪：离线服玩家改了名字 UUID 跟着变、从离线模式迁移到正版验证、换了个账号、`playerdata` 文件损坏只能从备份恢复但 UUID 对不上……数据明明还在硬盘上，玩家却只能对着一个「全新的自己」发呆。

为了解决这个痛点，我写了 **UUID Swap** 这个模组：按 UUID 完整替换玩家存档数据，把一个人的背包、经验、位置、成就、统计原封不动地「搬」给另一个人。

仓库地址：[Bihrys/UUID](https://github.com/Bihrys/UUID)

## 它能做什么

- **完整的玩家数据替换**，复制以下存档文件：
  - `playerdata/<uuid>.dat`（背包、经验、生命、位置、维度、末影箱等）
  - `stats/<uuid>.json`（统计数据）
  - `advancements/<uuid>.json`（成就进度）
- **宠物自动转移**：开启 `transferPetsAutomatically` 后，世界里已驯服的猫狗也会跟着换主人
- **可视化操作**：`/uuidswap` 打开分页箱子 GUI，玩家头颅、名称、UUID、在线状态一目了然，点一下就完成替换，不用手敲一长串 UUID
- **在线也能换**：源玩家在线时，模组会先把他踢出去、等存档落盘，再在下一个 tick 执行替换，重连后就是「新」数据了
- **替换前自动备份**：默认开启，备份在 `<world>/uuid_backups/` 下，随时能反悔

## 支持的版本

| Minecraft 版本 | 加载器 | Java 要求 |
| --- | --- | --- |
| 1.21.11 | Fabric | 21+ |
| 26.1 / 26.1.1 / 26.1.2 / 26.2 | Fabric | 25+ |
| 1.20.1 | Forge（47.4.23） | 17+ |

注意：每个 jar 只适配特定的 Minecraft 版本，不能跨版本使用。

## 下载与安装

仓库目前没有正式发布版，GitHub Actions 会在每次推送后自动构建全部版本，并刷新一个名为 **`automated-build`** 的滚动预发布，去仓库的 [Releases](https://github.com/Bihrys/UUID/releases) 页面下载对应版本的 jar，丢进服务器的 `mods` 文件夹即可（Fabric Loader 需要 0.19.3 或更新版本）。

## 使用方法

首次启动会生成 `config/uuid-config.json`：

```json
{
  "playerSwapPermissionLevel": 4,
  "petOwnerSwapPermissionLevel": 4,
  "backupBeforeOverwrite": true,
  "transferPetsAutomatically": true,
  "enablePetOwnerSwap": true
}
```

常用命令：

```
/uuidswap                              # 打开 GUI，用所选玩家的数据替换自己
/uuidswap list                         # 列出已知玩家、UUID 和在线状态
/uuidswap <targetUuid>                 # 用目标 UUID 的数据替换自己
/uuidswap apply <sourceUuid> <targetUuid>   # 管理员/控制台：把 target 的数据给 source
```

另外还有个小功能：手持红石粉、潜行右键一只已驯服的动物，可以在 GUI 里给它换主人。

典型的「救存档」流程：

1. 玩家新 UUID 进服一次，生成一份空存档后退出
2. 控制台执行 `/uuidswap apply <旧UUID> <新UUID>`（在 GUI 里点也行）
3. 玩家重连，背包、家、成就全部回来

## ⚠️ 重要提醒

存档替换是**破坏性操作**，用之前请务必：

- 保持 `backupBeforeOverwrite=true`（默认就是开的，别手贱关掉）
- 先在世界副本上测试一遍再上生产服
- 权限等级默认是最高的 4 级（仅服主/完整 OP），除非你完全明白风险，否则不要下放给普通管理员

## 最后

这个模组采用 **保留所有权利（All Rights Reserved）** 许可证，可以从仓库获取构建使用，但请不要未经授权二次分发代码。

如果用上了觉得好用，欢迎来 [GitHub 仓库](https://github.com/Bihrys/UUID) 点个 Star、提 Issue。愿天下没有丢失的存档！
