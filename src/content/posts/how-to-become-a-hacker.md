---
title: 如何成为黑客
published: 2025-09-10
description: 'How To Become A Hacker, Eric Steven Raymond, Thyrsus Enterprises, < esr@thyrsus.com >'
image: ''
tags: [Manual, 转载]
category: 'Articles'
draft: false
lang: ''
---

**How To Become A Hacker**

Eric Steven Raymond, [Thyrsus Enterprises](http://catb.org/~esr/), < <esr@thyrsus.com> >

Copyright © 2001 Eric S. Raymond

翻译：柯非, < <zer4tul@gmail.com> >

这篇译文基于2020.01.03更新的[原文][hacker-howto]修订版1.52。

如果对译文有任何意见或者建议，__请[发Issue](https://github.com/zer4tul/hacker-howto/issues/new)，或直接[发Pull Request](https://github.com/zer4tul/hacker-howto/compare/)给原仓库维护者。__

原仓库：
:::github{repo="zer4tul/hacker-howto"}
:::

<p style="text-align:center;"> <img  src="/images/glider.png"> </p>

# 为何会有这篇文档

身为[新黑客词典（The Jargon File）][Jargon File]和许多其他广为人知的同类文章的作者，我常收到热心的网络新人的电子邮件，问及（大意上是）“如何成为一名魔法师似的黑客？”。1996年的时候我注意到这个重要的问题并没有相关的FAQ或文档页面，所以我写了一份。许多黑客认为这篇文章是权威的，我觉得它应该是吧。此外，我不会寻求在这个话题上的独立著作权，如果你不喜欢在这里读到的内容，自己写一篇吧。

如果你是在离线阅读本文，可以在[http://catb.org/~esr/faqs/hacker-howto.html][hacker-howto]找到本文的最新版本。（译注：本文的最新中文版可以在[这里][Chinese_Latest]找到）

注意：本文的末尾有一系列[常见问题](#常见问题)。请在向我发邮件询问关于本文的任何问题前 **再三阅读**。

目前本文有许多语言的翻译版：[阿拉伯语][Arabic]，[白俄罗斯语][Belorussian], [中文][Chinese]，[捷克语][Czech]，[丹麦语][Danish]，[荷兰语][Dutch]，[爱沙尼亚语][Estonian]，[德语][German]，[希腊语][Greek]，[意大利语][Italian]，[希伯来语][Hebrew]，[挪威语][Norwegian], [波斯语][Persian]，[巴西葡萄牙语][Brazilian-Portuguese]，[罗马尼亚语][Romanian]，[西班牙语][Spanish]，[土耳其语][Turkish]，[瑞典语][Swedish]。请注意，由于本文不定期更新，这些翻译版可能存在不同程度的过时。

本文里九宫格中的5个黑点的装饰图被称作glider。这是一个使很多黑客多年痴迷的被称作[康威生命游戏（LIFE）][life]中，具有令人惊奇特性的简单图案。我认为它是很好的黑客精神徽章 —— 抽象，初见的时候感觉有点神秘，通过它复杂的逻辑可以通向整个世界。如果你想了解更多关于glider的信息，请看[这里][glider]。

如果你觉得这篇文章有价值，请在[Patreon][Patreon]或者[SubscribeStar][SubscribeStar]上给我一点赞助。也请考虑通过[Loadsharers][Loadsharers]赞助其他为你提供了有价值代码的黑客。小额的赞助也能够聚小流成江海，使为你提供帮助的人从繁重的劳动中解放出来，创造更多的价值。

<p style="text-align:center;"> <img  src="/images/glider.png"> </p>

# 什么是黑客

[新黑客词典（Jargon File）][Jargon File]中有数个“黑客”的定义，主要形容"技术专才"或"有志解决问题及超越极限之人"。要成为黑客，有两个要点。

这可以追溯到几十年前第一台分时小型电脑诞生, ARPAnet 实验也刚展开的年代，那时有一个由程序设计专家和网络名人所组成的, 具有分享特点的文化社群。 这种文化的成员创造了 “hacker” 这个词。他们建立了互联网，他们发明了现在使用的Unix操作系统。他们管理Usenet讨论组。他们令WWW运作。因此，若你有上述的特性及参与同类的社区，亦有对以上种种作出贡献，同时社区的人知你是谁又称你为“hacker”，你便是黑客。

然而，黑客的理念并非只局限于软件社区。有很多人将黑客的态度应用于其他事物，如电子或音乐上——实际上，黑客的理念存在于任何科学及文学。由于了解黑客的理念及精神，软件社区的黑客亦会称后者为黑客。有些人亦认为黑客的理念是独立于黑客所从事的媒体。然而，我们将在这篇文章专注讨论软件黑客的技巧，态度及传统。

另外，有一群人亦称自已为“黑客”，他们（多数是年青人）用电脑侵入其他电脑的系统作出破坏。黑客们称这群人为“Cracker（破坏者）”，亦不认同他们为黑客。多数黑客会认为Cracker是懒惰, 不负责任，不杰出的人。有能力侵入安全系统并不能使你成为黑客，正如可以用铁丝来偷车并不能使你成为汽车工程师一样。不幸的是很多作家及报道均称这群人为“黑客”。这一直使黑客们非常恼火。

黑客与Cracker的主要区别在于，前者搞建设，后者搞破坏。

如果你想成为一个黑客，请继续读下去。如果你只想做一个Cracker，请到[alt.2600][alt.2600]讨论组，并做好当你发现自己不如想象中聪颖的时候进5到10次监狱的准备。关于Cracker我就说这么多。

<p style="text-align:center;"> <img  src="/images/glider.png"> </p>

# 黑客的精神

1. [世上仍有大量迷人的事情等待解决](#世上仍有大量迷人的事情等待解决)
2. [同样的问题不应被重复处理两次](#同样的问题不应被重复处理两次)
3. [拒绝重复和沉闷的事情](#拒绝重复和沉闷的事情)
4. [自由万岁](#自由万岁)
5. [精神不能代替能力](#精神不能代替能力)

黑客们解决问题，建设事物，他们崇尚自由和无私的双向帮助。要被他人承认是一名黑客，你必须表现得你具备了这样的态度。而要表现得你具备了这种态度，你必须彻彻底底的坚持它。

如果你认为培养黑客的态度只是一条在这个文化圈中得到认同的路子，那就错了。成为具备这种素质的人对 **你** ¸非常重要 —— 使你保持学习和成为黑客的自发性。正如所有创造性艺术一样，成为大师的最有效途径就是效仿大师的精神——不仅从理念上，还要从态度上效仿。

或许下面的这首现代禅诗很好的阐述了这个意思：

:::tip
To follow the path:  
沿着这样一条道路：

look to the master,  
关注大师，

follow the master,  
跟随大师，

walk with the master,  
与大师同行，
