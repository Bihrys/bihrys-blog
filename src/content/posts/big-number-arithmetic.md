---
title: 高精度计算：加减乘除（C++）
published: 2026-11-06
description: '用 C++ 讲清高精度计算：大数的读入与存储、位数确认、进位与借位、错位处理，以及高精度加法、减法、乘法、除法的完整思路和代码，配 SVG 动画与逐步演算表。'
image: ''
tags: [Programming, C++, 算法, 高精度]
category: '算法'
draft: false
lang: 'zh_CN'
---

`int` 最大约 $2.1\times10^9$，`long long` 最大约 $9.2\times10^{18}$。题目一旦给出几百位、几千位的整数（比如求 $100!$、斐波那契第 5000 项），内置类型就装不下了。这时的做法是：把数字当成字符串读进来，一位一位拆开放进数组，再按小学竖式的方法自己实现加减乘除。这种技术叫高精度计算（big integer）。

本文先讲三件准备工作：数据怎么存和读、结果最多有几位、进位借位怎么处理。然后依次实现加法、减法、乘法、除法，每种运算都配有循环播放的 SVG 动画、逐步演算表、完整函数和复杂度分析。

# 准备工作

## 数据的存储和接收

### 为什么用字符串读入

几百位的数字无法用任何整数类型读入，只能先当字符串读：

```cpp
string s;
cin >> s;   // 例如 s = "12345678901234567890123"
```

字符串里每个字符是 `'0'` 到 `'9'`，用 `s[i] - '0'` 就能得到对应的数字。

### 为什么倒着存

竖式计算从个位开始，进位也是从低位往高位走。所以让数组下标 0 存个位，下标 1 存十位，以此类推（小端存储）。这样进位时只需要在数组末尾追加，不用移动整个数组。

例如 $12345$ 存成：

| 下标 | 0 | 1 | 2 | 3 | 4 |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 数位 | 5 | 4 | 3 | 2 | 1 |
| 含义 | 个位 | 十位 | 百位 | 千位 | 万位 |

读入时从字符串末尾往前取：

```cpp title="bigint-1.cpp"
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

using Big = vector<int>;   // 下标 0 是个位

// 字符串转高精度数
Big fromString(const string& s) {
    Big a;
    for (int i = (int)s.size() - 1; i >= 0; i--) {
        a.push_back(s[i] - '0');
    }
    return a;
}

// 去掉高位多余的 0，但至少保留一位
void trim(Big& a) {
    while (a.size() > 1 && a.back() == 0) a.pop_back();
}

// 高精度数转字符串（从最高位开始输出）
string toString(const Big& a) {
    string s;
    for (int i = (int)a.size() - 1; i >= 0; i--) {
        s += char('0' + a[i]);
    }
    return s;
}
```

### 直接循环加数组输入

有些题目（或老式写法）不用 `string` 和 `vector`，直接用字符数组读入，再循环拆到整型数组里：

```cpp
char s[1005];
int a[1005] = {0};
cin >> s;
int len = strlen(s);            // 需要 <cstring>
for (int i = 0; i < len; i++) {
    a[len - 1 - i] = s[i] - '0';   // 第 i 个字符放到倒数第 i 位
}
```

关键是下标换算：字符串里第 0 个字符是最高位，它应该放到数组的 `a[len-1]`，所以是 `a[len - 1 - i]`。如果题目给的是用空格隔开的单个数字，可以直接 `for (...) cin >> a[i];` 再整体反转一次。

用 `vector` 的好处是长度自动管理，结果变长时直接 `push_back`，不用担心数组开小。本文后面都用 `vector<int>`。

> 想让程序更快的话，每个元素不必只存一位，可以存 4 位或 9 位（比如压成 $10^4$ 进制）。入门阶段先用一位一格，逻辑最清楚。

## 高精度位数确认

写代码前先弄清楚结果最多有几位，这决定了数组开多大、循环跑多少次。设两个数的位数分别是 $la$ 和 $lb$：

| 运算 | 结果最多位数 | 原因 |
| :-- | :-- | :-- |
| 加法 $a+b$ | $\max(la, lb)+1$ | 最高位可能再进一位，如 $999+1=1000$ |
| 减法 $a-b$（$a\ge b$） | $\le la$ | 结果不会比被减数大，但前面可能有一串 0 |
| 乘法 $a\times b$ | $la+lb$ | $10^{la-1}\times10^{lb-1}$ 到 $<10^{la}\times10^{lb}$ |
| 除法 $a\div b$ | $\le la$ | 商不会比被除数大 |

这里有两个容易漏掉的点：

1. 位数是预估的上界，实际结果可能更短。比如 $1000-999=1$，数组里算出来是 `1,0,0,0`，高位的 0 要用 `trim` 去掉，否则输出会变成 `0001`。
2. 数字 0 本身是一位 `0`，不是空数组，所以 `trim` 要保证至少留一位。

## 进位错位处理

### 进位和借位

竖式里「满 10 进 1」「不够减向高位借 1」在代码里是这样的：

- 进位：`t = 当前位的和 + carry`，当前位存 `t % 10`，新的进位是 `t / 10`。
- 借位：`t = 当前位的差 - borrow`，若 `t < 0` 就 `t += 10` 并让 `borrow = 1`，否则 `borrow = 0`。

整个过程是一个从低位到高位的循环，把「上一位留下来的东西」用一个变量带到下一位。

### 错位

乘法和除法里，数字不在同一个位置上对齐：

- 乘法中，$a$ 的第 $i$ 位乘以 $b$ 的第 $j$ 位，结果属于第 $i+j$ 位。例如十位（$i=1$）乘十位（$j=1$）得到百位（$i+j=2$）的贡献。
- 除法中，每次要把余数「左移一位」再接上被除数的下一位，相当于竖式里把下一位数字「落下来」。

这两处的下标写错，结果就整体错位，调试时最常见的症状是答案差了 10 倍或 100 倍。

# 高精度加法

## 思路

就是小学竖式加法：个位对个位，从低位到高位逐位相加，满 10 向前进 1。循环的结束条件有三个：$a$ 还有位、$b$ 还有位、还有进位没处理完，任意一个成立就继续。

## 逐步演算

下面的动画演示 $987+45$。每一步高亮一列，红色数字是进位；底部同步给出 `i`、`t`、`c[i]` 和 `carry` 的变化。其中 `c[i]` 表示本轮 `c.push_back(t % 10)` 新写入的元素，因此每一帧都能对应到后面的代码。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 240" width="340" height="240" style="max-width:100%;height:auto" role="img" aria-label="竖式加法 987 加 45 的逐位计算动画">
<style>.n{font-family:monospace;font-size:22px;fill:currentColor}.c{font-family:sans-serif;font-size:13px;fill:currentColor}.k{font-family:monospace;font-size:16px;fill:#e53e3e}</style>
<rect x="252" y="38" width="36" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.04;0.041;0.22;0.23;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="182" y="38" width="36" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.29;0.291;0.47;0.48;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="112" y="38" width="36" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.54;0.541;0.72;0.73;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="42" y="38" width="36" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.79;0.791;0.97;0.98;1" values="0;0;0.2;0.2;0;0"/></rect>
<text class="n" x="130" y="70" text-anchor="middle">9</text>
<text class="n" x="200" y="70" text-anchor="middle">8</text>
<text class="n" x="270" y="70" text-anchor="middle">7</text>
<text class="n" x="25" y="110" text-anchor="middle">+</text>
<text class="n" x="200" y="110" text-anchor="middle">4</text>
<text class="n" x="270" y="110" text-anchor="middle">5</text>
<line x1="40" y1="124" x2="300" y2="124" stroke="currentColor" stroke-width="2"/>
<text class="k" x="200" y="50" text-anchor="middle" opacity="0">1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.22;0.221;1" values="0;0;1;1"/></text>
<text class="k" x="130" y="50" text-anchor="middle" opacity="0">1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.47;0.471;1" values="0;0;1;1"/></text>
<text class="k" x="60" y="50" text-anchor="middle" opacity="0">1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.72;0.721;1" values="0;0;1;1"/></text>
<text class="n" x="270" y="165" text-anchor="middle" opacity="0">2<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.22;0.221;1" values="0;0;1;1"/></text>
<text class="n" x="200" y="165" text-anchor="middle" opacity="0">3<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.47;0.471;1" values="0;0;1;1"/></text>
<text class="n" x="130" y="165" text-anchor="middle" opacity="0">0<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.72;0.721;1" values="0;0;1;1"/></text>
<text class="n" x="60" y="165" text-anchor="middle" opacity="0">1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.97;0.971;1" values="0;0;1;1"/></text>
<text class="c" x="170" y="228" text-anchor="middle" opacity="0">i=0：t=0+7+5=12，c[0]=2，carry=1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.04;0.041;0.22;0.23;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="170" y="228" text-anchor="middle" opacity="0">i=1：t=1+8+4=13，c[1]=3，carry=1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.29;0.291;0.47;0.48;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="170" y="228" text-anchor="middle" opacity="0">i=2：t=1+9+0=10，c[2]=0，carry=1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.54;0.541;0.72;0.73;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="170" y="228" text-anchor="middle" opacity="0">i=3：t=1，c[3]=1，carry=0，循环结束<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.79;0.791;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
</svg>

计算 $987+45$。$a=[7,8,9]$，$b=[5,4]$（个位在前）：

| 步骤 | 位 | a 的这一位 | b 的这一位 | 上一位进位 | 合计 t | 写下 t%10 | 新进位 t/10 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | 个位 | 7 | 5 | 0 | 12 | 2 | 1 |
| 2 | 十位 | 8 | 4 | 1 | 13 | 3 | 1 |
| 3 | 百位 | 9 | 无（当 0） | 1 | 10 | 0 | 1 |
| 4 | 千位 | 无 | 无 | 1 | 1 | 1 | 0 |

从低位到高位写下 `2,3,0,1`，倒过来读就是 $1032$。第 4 步说明了为什么循环条件里要加「还有进位」。

## 代码

```cpp title="bigint-2.cpp"
// 高精度加法：a + b
Big add(const Big& a, const Big& b) {
    Big c;
    int carry = 0;
    for (size_t i = 0; i < a.size() || i < b.size() || carry; i++) {
        int t = carry;
        if (i < a.size()) t += a[i];
        if (i < b.size()) t += b[i];
        c.push_back(t % 10);
        carry = t / 10;
    }
    return c;
}
```

时间复杂度 $O(\max(la, lb))$。

# 高精度减法

## 思路

同样是竖式：从个位开始逐位相减，不够减就向高位借 1（当前位加 10，高位少 1）。

减法有一个前提：被减数不小于减数。所以要先比较大小。如果 $a<b$，就计算 $b-a$，最后在前面补一个负号。

比较两个高精度数：先比位数（位数多的更大，前提是没有多余的前导 0），位数相同再从最高位往低位逐位比。

## 逐步演算

下面的动画演示 $305-78$。蓝色是当前数位，红色「借 1」表示被低位借走 1；底部同步执行 `t=a[i]-borrow-b[i]` 和借位判断。注意十位要同时处理「被个位借走的 1」和「自己不够减时向百位借的 1」。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 250" width="420" height="250" style="max-width:100%;height:auto" role="img" aria-label="竖式减法 305 减 78 的连续借位动画">
<style>.n{font-family:monospace;font-size:22px;fill:currentColor}.c{font-family:sans-serif;font-size:13px;fill:currentColor}.k{font-family:sans-serif;font-size:13px;fill:#e53e3e}</style>
<rect x="250" y="38" width="60" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.04;0.041;0.22;0.23;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="170" y="38" width="60" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.29;0.291;0.47;0.48;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="90" y="38" width="60" height="150" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.54;0.541;0.72;0.73;1" values="0;0;0.2;0.2;0;0"/></rect>
<text class="n" x="120" y="80" text-anchor="middle">3</text><text class="n" x="200" y="80" text-anchor="middle">0</text><text class="n" x="280" y="80" text-anchor="middle">5</text>
<text class="n" x="45" y="120" text-anchor="middle">−</text><text class="n" x="200" y="120" text-anchor="middle">7</text><text class="n" x="280" y="120" text-anchor="middle">8</text>
<line x1="60" y1="134" x2="320" y2="134" stroke="currentColor" stroke-width="2"/>
<text class="k" x="200" y="54" text-anchor="middle" opacity="0">借 1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.22;0.221;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
<text class="k" x="120" y="54" text-anchor="middle" opacity="0">借 1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.47;0.471;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
<text class="n" x="280" y="175" text-anchor="middle" opacity="0">7<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.22;0.221;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
<text class="n" x="200" y="175" text-anchor="middle" opacity="0">2<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.47;0.471;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
<text class="n" x="120" y="175" text-anchor="middle" opacity="0">2<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.72;0.721;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="210" y="228" text-anchor="middle" opacity="0">i=0：t=5−0−8=−3；t+=10 得 7，borrow=1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.04;0.041;0.22;0.23;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="210" y="228" text-anchor="middle" opacity="0">i=1：t=0−1−7=−8；t+=10 得 2，borrow=1<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.29;0.291;0.47;0.48;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="210" y="228" text-anchor="middle" opacity="0">i=2：t=3−1−0=2；t≥0，borrow=0<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.54;0.541;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
</svg>

计算 $305-78$。$a=[5,0,3]$，$b=[8,7]$：

| 步骤 | 位 | a 的这一位 | 上一位借走 | b 的这一位 | 算式 | 是否不够减 | 写下 | 新借位 |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | 个位 | 5 | 0 | 8 | 5-0-8=-3 | 是，加 10 | 7 | 1 |
| 2 | 十位 | 0 | 1 | 7 | 0-1-7=-8 | 是，加 10 | 2 | 1 |
| 3 | 百位 | 3 | 1 | 无（当 0） | 3-1-0=2 | 否 | 2 | 0 |

写下 `7,2,2`，倒过来是 $227$。

再看一个会产生前导 0 的例子：$1000-999$，算完数组是 `1,0,0,0`，倒过来是 `0001`，必须 `trim` 才能得到 $1$。

## 代码

```cpp title="bigint-3.cpp"
// 比较大小：a >= b 返回 true（两个数都已去掉前导 0）
bool geq(const Big& a, const Big& b) {
    if (a.size() != b.size()) return a.size() > b.size();
    for (int i = (int)a.size() - 1; i >= 0; i--) {
        if (a[i] != b[i]) return a[i] > b[i];
    }
    return true;
}

// 高精度减法：a - b，要求 a >= b
Big sub(const Big& a, const Big& b) {
    Big c;
    int borrow = 0;
    for (size_t i = 0; i < a.size(); i++) {
        int t = a[i] - borrow;
        if (i < b.size()) t -= b[i];
        if (t < 0) {
            t += 10;
            borrow = 1;
        } else {
            borrow = 0;
        }
        c.push_back(t);
    }
    trim(c);
    return c;
}
```

时间复杂度 $O(la)$。如果题目要求处理负数结果，在 `main` 里先 `geq(a, b)` 判断，不成立就交换两数并输出 `-`（见文末完整程序）。

# 高精度乘法

## 思路

以图中的 $856\times25$ 为例。先按一基下标记数：$a_1=6,a_2=5,a_3=8$，$b_1=5,b_2=2$，也就是下标 1 永远表示个位。乘数的每一位都会产生一行部分积：$b_1$ 产生 $c'$，$b_2$ 产生 $c''$；把同一列的部分积相加，再处理进位，就得到最终的 $c$。

程序不必真的保存 $c'$、$c''$ 两个数组。等价的做法是：先枚举每一对 $a_i$ 和 $b_j$，把乘积累加到它所属的列；全部累加完后，再从低位到高位统一进位。这样就把「错位相乘」和「进位」拆成了两个独立阶段。

## 第一步：4280 怎样对应 c′，1712 为什么错一位

先看数值竖式和符号竖式的对应。动画左边计算 $856\times25$，右边标出每个位置对应的符号；$'$ 和 $''$ 分别读作「一撇」和「两撇」，用来区分两行部分积，不表示求导。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 330" width="680" height="330" style="max-width:100%;height:auto" role="img" aria-label="856 乘 25 的数值竖式与 c 一撇 c 两撇符号对应动画">
<style>.n{font-family:monospace;font-size:20px;fill:currentColor}.s{font-family:monospace;font-size:16px;fill:currentColor}.c{font-family:sans-serif;font-size:14px;fill:currentColor}.b{font-family:monospace;font-size:20px;fill:#3b82f6}</style>
<text class="c" x="180" y="24" text-anchor="middle">数值竖式</text><text class="c" x="500" y="24" text-anchor="middle">符号对应</text>
<rect x="275" y="32" width="70" height="82" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.03;0.031;0.18;0.19;1" values="0;0;0.2;0.2;0;0"/></rect><rect x="585" y="32" width="70" height="82" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.03;0.031;0.18;0.19;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="215" y="32" width="70" height="82" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.24;0.241;0.40;0.41;1" values="0;0;0.2;0.2;0;0"/></rect><rect x="525" y="32" width="70" height="82" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.24;0.241;0.40;0.41;1" values="0;0;0.2;0.2;0;0"/></rect>
<rect x="45" y="125" width="290" height="140" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.46;0.461;0.62;0.63;1" values="0;0;0.12;0.12;0;0"/></rect><rect x="355" y="125" width="300" height="140" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.46;0.461;0.62;0.63;1" values="0;0;0.12;0.12;0;0"/></rect>
<text class="n" x="190" y="65" text-anchor="middle">8</text><text class="n" x="250" y="65" text-anchor="middle">5</text><text class="n" x="310" y="65" text-anchor="middle">6</text><text class="n" x="45" y="100" text-anchor="middle">×</text><text class="n" x="250" y="100" text-anchor="middle">2</text><text class="n" x="310" y="100" text-anchor="middle">5</text>
<text class="s" x="500" y="65" text-anchor="middle">a₃</text><text class="s" x="560" y="65" text-anchor="middle">a₂</text><text class="s" x="620" y="65" text-anchor="middle">a₁</text><text class="s" x="360" y="100" text-anchor="middle">×</text><text class="s" x="560" y="100" text-anchor="middle">b₂</text><text class="s" x="620" y="100" text-anchor="middle">b₁</text>
<line x1="45" y1="115" x2="335" y2="115" stroke="currentColor" stroke-width="2"/><line x1="355" y1="115" x2="655" y2="115" stroke="currentColor" stroke-width="2"/>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.18;0.181;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="130" y="155" text-anchor="middle">4</text><text class="n" x="190" y="155" text-anchor="middle">2</text><text class="n" x="250" y="155" text-anchor="middle">8</text><text class="n" x="310" y="155" text-anchor="middle">0</text><text class="s" x="440" y="155" text-anchor="middle">c₄′</text><text class="s" x="500" y="155" text-anchor="middle">c₃′</text><text class="s" x="560" y="155" text-anchor="middle">c₂′</text><text class="s" x="620" y="155" text-anchor="middle">c₁′</text></g>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.40;0.401;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="70" y="195" text-anchor="middle">1</text><text class="n" x="130" y="195" text-anchor="middle">7</text><text class="n" x="190" y="195" text-anchor="middle">1</text><text class="n" x="250" y="195" text-anchor="middle">2</text><text class="b" x="310" y="195" text-anchor="middle">0</text><text class="s" x="380" y="195" text-anchor="middle">c₅″</text><text class="s" x="440" y="195" text-anchor="middle">c₄″</text><text class="s" x="500" y="195" text-anchor="middle">c₃″</text><text class="s" x="560" y="195" text-anchor="middle">c₂″</text><text class="s" x="620" y="195" text-anchor="middle">c₁″</text></g>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.46;0.461;0.97;0.98;1" values="0;0;1;1;0;0"/><line x1="45" y1="210" x2="335" y2="210" stroke="currentColor" stroke-width="2"/><line x1="355" y1="210" x2="655" y2="210" stroke="currentColor" stroke-width="2"/></g>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.62;0.621;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="70" y="250" text-anchor="middle">2</text><text class="n" x="130" y="250" text-anchor="middle">1</text><text class="n" x="190" y="250" text-anchor="middle">4</text><text class="n" x="250" y="250" text-anchor="middle">0</text><text class="n" x="310" y="250" text-anchor="middle">0</text><text class="s" x="380" y="250" text-anchor="middle">c₅</text><text class="s" x="440" y="250" text-anchor="middle">c₄</text><text class="s" x="500" y="250" text-anchor="middle">c₃</text><text class="s" x="560" y="250" text-anchor="middle">c₂</text><text class="s" x="620" y="250" text-anchor="middle">c₁</text></g>
<text class="c" x="340" y="300" text-anchor="middle" opacity="0">b₁=5：856×5=4280，所以 c₄′c₃′c₂′c₁′=4280<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.03;0.031;0.18;0.19;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="340" y="300" text-anchor="middle" opacity="0">b₂=2 在十位：856×20=17120，1712 要错一位，c₁″=0<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.24;0.241;0.40;0.41;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="340" y="300" text-anchor="middle" opacity="0">同列相加并进位：c₅c₄c₃c₂c₁=21400<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.46;0.461;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
</svg>

因此，图中的记号具体是：

$$
856\times5=4280\quad\Longrightarrow\quad c_4'=4,\ c_3'=2,\ c_2'=8,\ c_1'=0
$$

$$
856\times20=17120\quad\Longrightarrow\quad c_5''=1,\ c_4''=7,\ c_3''=1,\ c_2''=2,\ c_1''=0
$$

每一列先求 $c_k=c_k'+c_k''+\cdots$，再向高位进位。例如第 2 列有 $8+2=10$，所以最终的 $c_2=0$，向第 3 列进 1；第 3 列有 $2+1+1=4$，不再进位；第 4 列有 $4+7=11$，所以 $c_4=1$，向第 5 列进 1，最后得到 $21400$。

## 第二步：为什么代码的下标是 i+j

一位乘积 $a_i\times b_j$ 究竟落在哪一列，可以由位权直接推出来。一基下标中，$a_i$ 的位权是 $10^{i-1}$，$b_j$ 的位权是 $10^{j-1}$，所以：

$$
(a_i10^{i-1})(b_j10^{j-1})=a_ib_j10^{i+j-2}
$$

右边 $10$ 的指数是 $i+j-2$，对应一基数组的 $c_{i+j-1}$。例如 $a_3=8$ 表示 800，$b_2=2$ 表示 20，乘积 16000 应贡献到千位 $c_4$，恰好 $3+2-1=4$。

C++ 数组从 0 开始。如果保留图中一基的 $i,j$ 数值，就应该把 $a_i,b_j,c_{i+j-1}$ 分别写成 `a[i-1]`、`b[j-1]`、`c[i+j-2]`。本文则让循环变量本身从 0 开始，所以代码里的 `i` 相当于图中的 $i-1$，`j` 相当于图中的 $j-1$，目标下标恰好简化为 `i+j`。

| 含义 | 图中一基符号 | 本文 C++ 零基符号 |
| :-- | :-: | :-: |
| 被乘数的个位 6 | $a_1$ | `a[0]` |
| 被乘数的百位 8 | $a_3$ | `a[2]` |
| 乘数的十位 2 | $b_2$ | `b[1]` |
| 800×20 贡献到千位 | $c_4$ | `c[3]` |

这就是核心语句 `c[i + j] += a[i] * b[j]` 的由来：两个零下标相加，自动完成「一基公式减 2」的转换。下面的动画逐步执行 6 次数位乘法，并显示每次语句执行后数组的变化。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 235" width="650" height="235" style="max-width:100%;height:auto" role="img" aria-label="856 乘 25 的双层循环与 c 数组逐步变化动画">
<style>.h{font-family:sans-serif;font-size:16px;font-weight:bold;fill:currentColor}.n{font-family:monospace;font-size:18px;fill:currentColor}.c{font-family:monospace;font-size:16px;fill:currentColor}</style>
<text class="h" x="325" y="28" text-anchor="middle">双层循环怎样填满 c 数组</text><rect x="40" y="45" width="570" height="45" rx="6" fill="#3b82f6" opacity="0.09"/><text class="n" x="325" y="74" text-anchor="middle">c[i + j] += a[i] * b[j];</text>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.02;0.021;0.12;0.121;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">i=0，j=0：c[0] += 6×5 = 30</text><text class="n" x="325" y="180" text-anchor="middle">c = [30, 0, 0, 0, 0]</text></g>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.15;0.151;0.25;0.251;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">i=0，j=1：c[1] += 6×2 = 12</text><text class="n" x="325" y="180" text-anchor="middle">c = [30, 12, 0, 0, 0]</text></g>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.28;0.281;0.38;0.381;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">i=1，j=0：c[1] += 5×5 = 25</text><text class="n" x="325" y="180" text-anchor="middle">c = [30, 37, 0, 0, 0]</text></g>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.41;0.411;0.51;0.511;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">i=1，j=1：c[2] += 5×2 = 10</text><text class="n" x="325" y="180" text-anchor="middle">c = [30, 37, 10, 0, 0]</text></g>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.54;0.541;0.64;0.641;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">i=2，j=0：c[2] += 8×5 = 40</text><text class="n" x="325" y="180" text-anchor="middle">c = [30, 37, 50, 0, 0]</text></g>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.67;0.671;0.77;0.771;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">i=2，j=1：c[3] += 8×2 = 16</text><text class="n" x="325" y="180" text-anchor="middle">c = [30, 37, 50, 16, 0]</text></g>
<g opacity="0"><animate attributeName="opacity" dur="18s" repeatCount="indefinite" keyTimes="0;0.80;0.801;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="c" x="325" y="130" text-anchor="middle">统一进位：c[i]=t%10，carry=t/10</text><text class="n" x="325" y="180" text-anchor="middle">[30,37,50,16,0] → [0,0,4,1,2]</text><text class="h" x="325" y="215" text-anchor="middle">倒序输出：21400</text></g>
</svg>

本文代码使用零基数组：$a=[6,5,8]$，$b=[5,2]$，结果数组 $c$ 先开 $3+2=5$ 格并全部置 0。

**第一阶段：执行 `c[i+j] += a[i] * b[j]`**

| 步骤 | i | j | 乘积 | 累加到 | 此时 c（个位在前） |
| :-: | :-: | :-: | :-: | :-: | :-- |
| 1 | 0 | 0 | 6×5=30 | c[0] | 30,0,0,0,0 |
| 2 | 0 | 1 | 6×2=12 | c[1] | 30,12,0,0,0 |
| 3 | 1 | 0 | 5×5=25 | c[1] | 30,37,0,0,0 |
| 4 | 1 | 1 | 5×2=10 | c[2] | 30,37,10,0,0 |
| 5 | 2 | 0 | 8×5=40 | c[2] | 30,37,50,0,0 |
| 6 | 2 | 1 | 8×2=16 | c[3] | 30,37,50,16,0 |

注意这里的 `30,37,50,16,0` **不是** 前面的 $c'$、$c''$。$c'$ 和 $c''$ 是完整部分积 4280、17120 的十进制各位；代码的 $c$ 保存的是 6 个一位乘积按列相加后、尚未统一进位的原始列和。两种拆分方式不同，但最终结果相同。

**第二阶段：执行 `t=c[i]+carry`，再拆分当前位和新进位**

| 位 | t=c[i]+carry | c[i]=t%10 | carry=t/10 |
| :-: | :-: | :-: | :-: |
| c[0] | 30+0=30 | 0 | 3 |
| c[1] | 37+3=40 | 0 | 4 |
| c[2] | 50+4=54 | 4 | 5 |
| c[3] | 16+5=21 | 1 | 2 |
| c[4] | 0+2=2 | 2 | 0 |

最终数组是 `[0,0,4,1,2]`，倒序输出就是 $21400$。最高位 `c[4]` 也正是位数确认时预留的一格。

## 溢出提醒

第一阶段中 `c[k]` 可能累加很多个乘积，每个最大 $81$。若一位一格，最多累加 $\min(la, lb)$ 个，只要位数不超过约 $2.6\times10^7$ 就不会超过 `int` 范围，常规题目放心用。如果改成 $10^4$ 进制压位存储，单个乘积就接近 $10^8$，累加后要用 `long long`。

## 代码

```cpp title="bigint-4.cpp"
// 高精度乘法：a * b
Big mul(const Big& a, const Big& b) {
    Big c(a.size() + b.size(), 0);
    for (size_t i = 0; i < a.size(); i++) {
        for (size_t j = 0; j < b.size(); j++) {
            c[i + j] += a[i] * b[j];      // 错位累加到第 i+j 位
        }
    }
    int carry = 0;
    for (size_t i = 0; i < c.size(); i++) {
        int t = c[i] + carry;
        c[i] = t % 10;
        carry = t / 10;
    }
    trim(c);
    return c;
}
```

时间复杂度 $O(la\times lb)$。

> 特别地，高精度乘以一个小整数（比如求阶乘时每次乘一个 `int`）可以只用一层循环，复杂度 $O(la)$。把 `b[j]` 换成那个整数，`c[i]` 里存 `a[i] * x + carry` 即可，注意用 `long long`。

# 高精度除法

除法分两种情形：除数是普通整数（高精度除以低精度），和除数也是高精度数。两种情形都必须先检查除数不为 0；本文只讨论非负整数的除法，商向下取整，并同时求出余数。

## 高精度除以低精度

### 思路

这就是小学的长除法：从最高位开始，每次把「上一步的余数 × 10 + 当前位」作为被除数，除以 $b$，商就是这一位的商，余数留给下一位。

和前面三个运算不同，除法要从高位往低位处理。

### 逐步演算

动画中的每一行对应一次循环，底部依次执行代码中的 `r=r*10+a[i]`、`c[i]=r/b`、`r%=b`。可以清楚看到：上一步的新余数，会成为下一步 `r*10` 中的旧余数；由于数组倒序存储，处理顺序是 `i=3,2,1,0`。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 330" width="480" height="330" style="max-width:100%;height:auto" role="img" aria-label="7891 除以 23 的长除法逐位试商动画">
<style>.n{font-family:monospace;font-size:17px;fill:currentColor}.c{font-family:sans-serif;font-size:13px;fill:currentColor}.h{font-family:sans-serif;font-size:14px;font-weight:bold;fill:currentColor}</style>
<text class="h" x="240" y="24" text-anchor="middle">7891 ÷ 23</text>
<text class="h" x="60" y="58" text-anchor="middle">落下的位</text><text class="h" x="200" y="58" text-anchor="middle">当前被除数</text><text class="h" x="330" y="58" text-anchor="middle">商位</text><text class="h" x="410" y="58" text-anchor="middle">新余数</text>
<rect x="15" y="72" width="450" height="40" rx="5" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.03;0.031;0.18;0.19;1" values="0;0;0.18;0.18;0;0"/></rect>
<rect x="15" y="112" width="450" height="40" rx="5" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.23;0.231;0.38;0.39;1" values="0;0;0.18;0.18;0;0"/></rect>
<rect x="15" y="152" width="450" height="40" rx="5" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.43;0.431;0.58;0.59;1" values="0;0;0.18;0.18;0;0"/></rect>
<rect x="15" y="192" width="450" height="40" rx="5" fill="#3b82f6" opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.63;0.631;0.80;0.81;1" values="0;0;0.18;0.18;0;0"/></rect>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.03;0.031;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="60" y="100" text-anchor="middle">7</text><text class="n" x="200" y="100" text-anchor="middle">0×10+7=7</text><text class="n" x="330" y="100" text-anchor="middle">0</text><text class="n" x="410" y="100" text-anchor="middle">7</text></g>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.23;0.231;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="60" y="140" text-anchor="middle">8</text><text class="n" x="200" y="140" text-anchor="middle">7×10+8=78</text><text class="n" x="330" y="140" text-anchor="middle">3</text><text class="n" x="410" y="140" text-anchor="middle">9</text></g>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.43;0.431;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="60" y="180" text-anchor="middle">9</text><text class="n" x="200" y="180" text-anchor="middle">9×10+9=99</text><text class="n" x="330" y="180" text-anchor="middle">4</text><text class="n" x="410" y="180" text-anchor="middle">7</text></g>
<g opacity="0"><animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.63;0.631;0.97;0.98;1" values="0;0;1;1;0;0"/><text class="n" x="60" y="220" text-anchor="middle">1</text><text class="n" x="200" y="220" text-anchor="middle">7×10+1=71</text><text class="n" x="330" y="220" text-anchor="middle">3</text><text class="n" x="410" y="220" text-anchor="middle">2</text></g>
<text class="c" x="240" y="265" text-anchor="middle" opacity="0">i=3：r=0×10+a[3]=7；c[3]=7/23=0；r=7<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.03;0.031;0.18;0.19;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="240" y="265" text-anchor="middle" opacity="0">i=2：r=7×10+a[2]=78；c[2]=78/23=3；r=9<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.23;0.231;0.38;0.39;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="240" y="265" text-anchor="middle" opacity="0">i=1：r=9×10+a[1]=99；c[1]=99/23=4；r=7<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.43;0.431;0.58;0.59;1" values="0;0;1;1;0;0"/></text>
<text class="c" x="240" y="265" text-anchor="middle" opacity="0">i=0：r=7×10+a[0]=71；c[0]=71/23=3；r=2<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.63;0.631;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
<text class="h" x="240" y="310" text-anchor="middle" opacity="0">商 = 343，余数 = 2；验证：23×343+2=7891<animate attributeName="opacity" dur="12s" repeatCount="indefinite" keyTimes="0;0.80;0.801;0.97;0.98;1" values="0;0;1;1;0;0"/></text>
</svg>

计算 $7891\div23$。从高位到低位依次是 7、8、9、1：

| 步骤 | 取下一位 | 当前被除数 r×10+位 | 除以 23 | 这一位的商 | 新余数 |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | 7 | 0×10+7=7 | 7÷23 | 0 | 7 |
| 2 | 8 | 7×10+8=78 | 78÷23 | 3 | 78-69=9 |
| 3 | 9 | 9×10+9=99 | 99÷23 | 4 | 99-92=7 |
| 4 | 1 | 7×10+1=71 | 71÷23 | 3 | 71-69=2 |

商的各位依次是 `0,3,4,3`，去掉前导 0 得 $343$，余数 $2$。验证：$23\times343+2=7891$。

这里始终满足一个关键条件：开始处理下一位之前，$r$ 都是上一步的余数，所以 $0\le r<b$。落下数字 $d$ 后，当前被除数 $r\times10+d<10b$，因此商位一定在 0 到 9 之间；执行 `r %= b` 后，$r$ 又变成合法余数。这个不变式保证了逐位试商不会算漏，也解释了后面「高精度除以高精度」为什么最多只需减 9 次。

### 代码

```cpp title="bigint-5.cpp"
// 高精度除以低精度：a / b，商返回，余数通过 r 带出
Big divSmall(const Big& a, long long b, long long& r) {
    Big c(a.size(), 0);
    r = 0;
    for (int i = (int)a.size() - 1; i >= 0; i--) {   // 从最高位开始
        r = r * 10 + a[i];
        c[i] = (int)(r / b);
        r %= b;
    }
    trim(c);
    return c;
}
```

`r` 最大是 $b-1$，再乘 10 加一位，所以 `b` 要小到让 `r * 10` 不溢出 `long long`（`b` 不超过约 $9\times10^{17}$ 即可）。时间复杂度 $O(la)$。

## 高精度除以高精度

### 思路

除数也是大数时，没法用一条 `/` 算出这一位的商。这时回到竖式的本意：商的这一位是几，就是「当前余数里最多能减去几个 $b$」。因为每一位的商只在 0 到 9 之间，最多减 9 次。

步骤是：

1. 从最高位开始，把 $a$ 的下一位「落下来」接到余数 $r$ 的末尾（等价于 $r=r\times10+$ 这一位，在小端数组里就是在下标 0 处插入）。
2. 当 $r\ge b$ 时，反复执行 $r=r-b$，每减一次，这一位的商加 1。
3. 处理完所有位后，商和余数就都得到了。

这里用到了前面写好的 `geq` 和 `sub`，所以它依赖减法和比较。

### 逐步演算

仍用 $7891\div23$，这次把「减」的过程展开：

| 步骤 | 落下的位 | 余数变成 | 反复减 23 | 商的这一位 | 余下 |
| :-: | :-: | :-: | :-- | :-: | :-: |
| 1 | 7 | 7 | 7<23，不能减 | 0 | 7 |
| 2 | 8 | 78 | 78→55→32→9 | 3 | 9 |
| 3 | 9 | 99 | 99→76→53→30→7 | 4 | 7 |
| 4 | 1 | 71 | 71→48→25→2 | 3 | 2 |

和上一节结果一致：商 $343$，余数 $2$。

前面的除法动画仍然对应这里的外层循环，只是「落下一位、试商、取余」换成了高精度操作：

| 动画中的动作 | 除以低精度的代码 | 除以高精度的代码 |
| :-- | :-- | :-- |
| 落下 `a[i]`，让余数乘 10 再接上它 | `r = r * 10 + a[i]` | `r.insert(r.begin(), a[i])`，小端数组在头部插入正好等价 |
| 求当前商位 | `c[i] = r / b` | 每执行一次 `r=sub(r,b)`，就 `q[i]++` |
| 留下新余数 | `r %= b` | 减到 `r<b` 时，剩下的 `r` 就是余数 |

例如动画处理 78 时，高精度版本实际执行 `78→55→32→9`，同时 `q[i]` 从 0 增加到 3；最后 9 小于 23，`while` 退出。这就是代码用反复减法代替 `/` 和 `%` 的过程。

### 代码

```cpp title="bigint-6.cpp"
// 高精度除以高精度：a / b，商返回，余数通过 r 带出。要求 b != 0
Big divBig(const Big& a, const Big& b, Big& r) {
    Big q(a.size(), 0);
    r = Big{0};
    for (int i = (int)a.size() - 1; i >= 0; i--) {
        r.insert(r.begin(), a[i]);   // 余数 *10 再加上落下来的这一位
        trim(r);
        while (geq(r, b)) {          // 最多循环 9 次
            r = sub(r, b);
            q[i]++;
        }
    }
    trim(q);
    return q;
}
```

时间复杂度约 $O(la\times lb)$：外层 $la$ 次，每次最多 9 次减法，每次减法 $O(lb)$ 级。

# 完整程序

下面的 `main` 读入 `a op b`，`op` 是 `+`、`-`、`*`、`/` 之一，输出结果。它和前面各节的函数拼在同一个文件里使用：

```cpp title="bigint-7.cpp"
int main() {
    string sa, sb;
    char op;
    cin >> sa >> op >> sb;
    Big a = fromString(sa), b = fromString(sb);
    trim(a);
    trim(b);

    if (op == '+') {
        cout << toString(add(a, b)) << "\n";
    } else if (op == '-') {
        if (geq(a, b)) {
            cout << toString(sub(a, b)) << "\n";
        } else {
            cout << "-" << toString(sub(b, a)) << "\n";   // a<b，结果为负
        }
    } else if (op == '*') {
        cout << toString(mul(a, b)) << "\n";
    } else if (op == '/') {
        if (b.size() == 1 && b[0] == 0) {
            cout << "除数不能为 0\n";
            return 0;
        }
        Big r;
        Big q = divBig(a, b, r);
        cout << "商 " << toString(q) << "，余数 " << toString(r) << "\n";
    }
    return 0;
}
```

测试样例：

| 输入 | 输出 |
| :-- | :-- |
| `987 + 45` | `1032` |
| `305 - 78` | `227` |
| `78 - 305` | `-227` |
| `856 * 25` | `21400` |
| `123 * 45` | `5535` |
| `7891 / 23` | `商 343，余数 2` |

# 常见错误

1. 忘记 `trim`：输出出现 `0001` 这类前导 0；比较大小时位数判断也会出错。
2. 忘记输出时倒序：数组里是个位在前，输出要从 `size()-1` 到 0。
3. 加法漏掉最后的进位：循环条件里没写 `|| carry`，$999+1$ 会得到 $000$。
4. 减法不检查大小：$a<b$ 时直接减会算出错误结果，必须先 `geq`。
5. 乘法下标写错：应是 `c[i + j]`，写成 `c[i]` 或 `c[j]` 整个结果就错位。
6. 乘法数组开小：结果最多 $la+lb$ 位。
7. 除法方向反了：除法要从最高位往最低位处理，不能照搬加法的从低到高。
8. 结果是 0 时输出空串：`trim` 必须至少保留一位。

# 总结

| 运算 | 处理方向 | 关键变量 | 时间复杂度 |
| :-- | :-: | :-- | :-: |
| 加法 | 低位→高位 | 进位 carry | $O(\max(la,lb))$ |
| 减法 | 低位→高位 | 借位 borrow，先比大小 | $O(la)$ |
| 乘法 | 先错位累加，再低→高进位 | 下标 $i+j$ | $O(la\times lb)$ |
| 除以低精度 | 高位→低位 | 余数 r | $O(la)$ |
| 除以高精度 | 高位→低位 | 余数 r，反复减 | $O(la\times lb)$ |

练习：用本文的函数写阶乘 $100!$、斐波那契第 1000 项，再试试把存储改成每格 4 位（$10^4$ 进制），体会压位带来的速度提升。
