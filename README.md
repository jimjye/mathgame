# mathgame

班級工具總專案，用來集中管理數學課堂相關的小工具、遊戲與資料工作流程。

## 專案狀態

- 目前階段：已建立兩個工具，幾A幾B已接上 Firebase/Firestore
- 工具清單：座標獵人、幾A幾B
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
- [幾A幾B](tools/bulls-and-cows/index.html)：四位數字邏輯推理遊戲，支援玩家代碼與成績記錄。

根目錄的 `index.html` 是遊戲清單，方便之後部署到 GitHub Pages。

## Firebase

- Firebase project：`jimjyestudy`
- Web App：`mathgame`
- Firestore collection：`bullsAndCowsScores`
- Auth：匿名登入
- Rules：`firestore.rules`

本機 Firebase Web config 放在 `tools/bulls-and-cows/firebase-config.js`，此檔案不提交到 Git。
