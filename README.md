# 图片与视频下载 Chrome 扩展

## 简介
这是一个 Chrome 扩展程序，用于检索当前页面上的图片和视频，并提供下载功能。用户可以通过扩展的弹出窗口查看图片和视频链接，还能将所有图片或视频下载为压缩包。

## 功能特性
- **图片检索**：自动识别当前页面上的所有图片。
- **视频检索**：自动识别当前页面上的所有视频。
- **批量下载**：支持将所有图片或视频下载为压缩包。
- **选项卡切换**：通过选项卡方便地切换图片和视频的展示。

## 安装步骤
1. 确保你已经安装了 Chrome 浏览器。
2. 克隆或下载本项目到本地，例如保存到 `c:\workspace\chrome_extension\image_download` 目录。
3. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions` 并回车，进入扩展程序管理页面。
4. 开启页面右上角的“开发者模式”开关。
5. 点击“加载已解压的扩展程序”按钮，在弹出的文件选择框中选择项目所在的目录，然后点击“选择文件夹”。

## 使用方法
1. 安装完成后，在 Chrome 浏览器的扩展栏中会出现扩展图标。
2. 点击扩展图标，打开弹出窗口。
3. 弹出窗口中有两个选项卡：“图片”和“视频”。
    - **图片选项卡**：显示当前页面上的所有图片，你可以点击“下载所有图片为压缩包”按钮将图片下载。
    - **视频选项卡**：显示当前页面上的所有视频链接，你可以点击“下载所有视频为压缩包”按钮将视频下载。

## 调试方法
### 调试 `popup.js`
1. 点击扩展图标打开弹出窗口，在弹出窗口的空白处右键单击，选择“检查”（或使用快捷键 `Ctrl + Shift + I` 或 `Cmd + Opt + I`）打开开发者工具。
2. 在开发者工具中切换到“Sources”（源）面板，找到 `popup.js` 文件并点击打开。
3. 在代码中设置断点，再次触发相关功能（如点击下载按钮、切换选项卡等），程序会在断点处暂停执行，你可以查看变量的值、调用栈等信息。

### 调试 `content.js`
1. 在要测试的网页上打开开发者工具（同样可以通过右键选择“检查”或使用快捷键）。
2. 在“Sources”面板中找到 `content.js` 文件。
3. 设置断点，然后刷新网页，触发相应的消息传递（如切换到视频选项卡触发 `retrieveVideoLinks` 消息），程序会在断点处暂停。

### 日志输出
在代码中使用 `console.log()`、`console.error()` 等方法输出调试信息，这些信息会在开发者工具的“Console”（控制台）面板中显示。

## 注意事项
- 下载所有视频为压缩包的功能可能涉及跨域请求和文件处理等复杂问题，需要进一步完善。
- 请确保你的 Chrome 浏览器版本支持扩展开发相关的功能。

## 贡献
如果你发现了问题或有改进建议，欢迎提交 issue 或 pull request。