---
title: Expressive Code Example
published: 2024-04-10
description: How code blocks look in Markdown using Expressive Code.
tags: [Markdown, Blogging, Demo]
category: Examples
draft: true
---

Here, we'll explore how code blocks look using [Expressive Code](https://expressive-code.com/). The provided examples are based on the official documentation, which you can refer to for further details.

## Expressive Code

### Syntax Highlighting

[Syntax Highlighting](https://expressive-code.com/key-features/syntax-highlighting/)

#### Regular syntax highlighting

```js
console.log('This code is syntax highlighted!')
```

#### Rendering ANSI escape sequences

```ansi
ANSI colors:
- Regular: [31mRed[0m [32mGreen[0m [33mYellow[0m [34mBlue[0m [35mMagenta[0m [36mCyan[0m
- Bold:    [1;31mRed[0m [1;32mGreen[0m [1;33mYellow[0m [1;34mBlue[0m [1;35mMagenta[0m [1;36mCyan[0m
- Dimmed:  [2;31mRed[0m [2;32mGreen[0m [2;33mYellow[0m [2;34mBlue[0m [2;35mMagenta[0m [2;36mCyan[0m

256 colors (showing colors 160-177):
[38;5;160m160 [38;5;161m161 [38;5;162m162 [38;5;163m163 [38;5;164m164 [38;5;165m165[0m
[38;5;166m166 [38;5;167m167 [38;5;168m168 [38;5;169m169 [38;5;170m170 [38;5;171m171[0m
[38;5;172m172 [38;5;173m173 [38;5;174m174 [38;5;175m175 [38;5;176m176 [38;5;177m177[0m

Full RGB colors:
[38;2;34;139;34mForestGreen - RGB(34, 139, 34)[0m

Text formatting: [1mBold[0m [2mDimmed[0m [3mItalic[0m [4mUnderline[0m
```

### Editor & Terminal Frames

[Editor & Terminal Frames](https://expressive-code.com/key-features/frames/)

#### Code editor frames

```js title="my-test-file.js"
console.log('Title attribute example')
```

---

```html
<!-- src/content/index.html -->
<div>File name comment example</div>
```

#### Terminal frames

```bash
echo "This terminal frame has no title"
```

---

```powershell title="PowerShell terminal example"
Write-Output "This one has a title!"
```

#### Overriding frame types

```sh frame="none"
echo "Look ma, no frame!"
```

---

```ps frame="code" title="PowerShell Profile.ps1"
# Without overriding, this would be a terminal frame
function Watch-Tail { Get-Content -Tail 20 -Wait $args }
New-Alias tail Watch-Tail
```

### Text & Line Markers

