# mathgame

班級工具總專案，用來集中管理數學課堂相關的小工具、遊戲與資料工作流程。

## 專案狀態

- 目前階段：已建立第一個工具
- 工具清單：座標獵人
- 工作筆記：`D:\Obsidian\mathgame\工作筆記.md`

## 建議結構

```text
tools/
  <tool-name>/
    README.md
    src/
```

新增工具時，請放在 `tools/` 底下，並在 `CLAUDE.md` 與 Obsidian 工作筆記同步更新狀態。

## 工具

- [座標獵人](tools/coordinate-hunter/index.html)：60 秒直角座標練習遊戲。

根目錄的 `index.html` 會直接導向座標獵人，方便之後部署到 GitHub Pages。
