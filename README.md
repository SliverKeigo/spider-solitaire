# 蜘蛛纸牌游戏 (Spider Solitaire)

一个使用 React、TypeScript 和 Tauri 开发的经典蜘蛛纸牌游戏。游戏具有现代化的界面设计、流畅的拖放体验和完整的游戏逻辑，适合在桌面环境运行。

## 特性

- 完整实现经典蜘蛛纸牌玩法
- 使用 Tauri 框架构建轻量级桌面应用
- 支持拖放操作移动卡牌
- 自动检测完成的序列（从 K 到 A）
- 支持撤销操作，包括撤销已完成的序列
- 响应式设计，适应不同窗口尺寸
- 优化的卡牌堆叠效果，使游戏界面更清晰
- 使用 SVG 图像实现高质量卡牌外观

## 技术栈

- Tauri (Rust + Web 技术)
- React 18
- TypeScript
- Vite

## 游戏规则

### 目标

将所有卡牌按照从 K 到 A 的顺序排列成完整序列。当一个完整序列形成时，这些卡牌会自动移动到完成区。

### 基本规则

- 游戏使用两副扑克牌（不含大小王），共 104 张牌
- 初始时，每列发放 4-6 张牌，最上面的牌正面朝上
- 玩家可以移动正面朝上的卡牌，将其放置在比它大 1 点的任意一张牌上
- 玩家可以一次移动一连串按顺序排列的卡牌
- 当抽牌堆中还有牌时，玩家可以点击"发牌"按钮，给每列再发一张牌
- 当从 K 到 A 的完整序列形成时，这些卡牌会被自动移除
- 当所有 8 个完整序列都被移除时，游戏胜利

## 安装与运行

### 前提条件

- Node.js 16.0 或更高版本
- Rust 编译器 (用于 Tauri)
- 相关平台的开发依赖 (详见 [Tauri 文档](https://tauri.app/start/))

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/spider-solitaire-tauri.git
cd spider-solitaire-tauri
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run tauri dev
```

4. 构建生产版本

```bash
npm run tauri build
```

## 卡牌资源

游戏使用 SVG 格式的卡牌图像，文件命名格式如下：

- `Suit=Hearts, Number=1.svg` - 红心 A
- `Suit=Spades, Number=13.svg` - 黑桃 K
- `Suit=Other, Number=Back Blue.svg` - 蓝色牌背

所有卡牌图像都存储在 `/src/assets` 目录中。

## 自定义

### 修改卡牌样式

你可以替换 `/src/assets` 目录中的 SVG 文件来自定义卡牌外观，只需保持相同的命名格式。

### 调整难度

默认情况下，游戏不要求完成的序列是同一花色。如果你想增加游戏难度，可以修改 `gameEngine.ts` 中的 `checkForCompletedSequences` 函数，添加花色检查。

## 操作指南

- **移动卡牌**: 点击或拖拽卡牌将其移动到其他位置
- **发牌**: 点击"发牌"按钮从抽牌堆发牌到每一列
- **撤销**: 点击"撤销"按钮撤销上一步操作
- **新游戏**: 点击"新游戏"按钮开始新的游戏
- **重新开始**: 点击"重新开始"按钮重置当前游戏

## 性能优化

- 使用了 Vite 构建工具，提供快速的开发和构建体验
- 实现了高效的卡牌渲染和拖放逻辑
- Tauri 框架提供了比 Electron 更小的二进制文件和更低的资源占用
- 卡牌图像使用 SVG 格式，保证在任何分辨率下都清晰显示

## 跨平台支持

Tauri 应用可以构建为以下平台的可执行文件：

- Windows (7 及以上)
- macOS (10.13 及以上)
- Linux (通过 AppImage, Debian 包或 RPM)

## 开发笔记

### React 和 Tauri 的集成

本项目使用 React 构建前端界面，并通过 Tauri 封装为原生应用。Tauri 提供了与操作系统交互的能力，同时保持应用体积小巧。

## 许可证

本项目使用 MIT 许可证。详情请查看 [LICENSE](LICENSE) 文件。

## 致谢

- [Tauri](https://tauri.app/)
- [React](https://reactjs.org/)

---

希望你喜欢这个蜘蛛纸牌游戏！欢迎贡献代码或提出改进建议。
