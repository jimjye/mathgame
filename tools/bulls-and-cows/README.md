# 幾A幾B

四位數字邏輯遊戲。系統會產生不重複的四位數，玩家每次輸入猜測後會得到：

- `A`：數字正確且位置正確
- `B`：數字正確但位置不同

## 成績記錄

預設使用瀏覽器本機記錄。若要接 Firestore：

1. 建立 Firebase Web App。
2. 將 `firebase-config.example.js` 複製成 `firebase-config.js`。
3. 填入 Firebase config。
4. 在 Firestore 建立可寫入的 `bullsAndCowsScores` collection 規則。

`firebase-config.js` 已被 `.gitignore` 排除，不會提交到 repo。
