# Google 登入與同行進度設定

已接駁 Firebase 專案 `bible-buddy-hk`，Google 登入已啟用。Firestore Standard 位於香港 asia-east2，採用本專案的私人進度與公開摘要存取規則。以下保留管理與驗證步驟。

1. 在 https://console.firebase.google.com/ 使用網站擁有人帳戶建立 Bible Buddy 專案。選擇無須綁定付款帳戶的設定；不用啟用 Analytics。帳戶登入、條款及任何付款要求由擁有人親自處理。
2. 新增 Web App，取得 firebaseConfig，將公開設定放進 `dist/firebase-config.mjs`，取代 null。不要提供服務帳戶私鑰。
3. Authentication → Sign-in method 啟用 Google，設定專案支援電郵。
4. Authentication → Settings → Authorized domains 加入 `lkw-gif.github.io`、`bible-buddy-hk.lui-david-1529.chatgpt.site` 及本機測試的 `localhost`、`127.0.0.1`。
5. 建立 Cloud Firestore Standard 資料庫；選定地區後使用正式模式，部署本專案 `firestore.rules`。登入與公開資料規則均須部署，不能使用全庫公開寫入規則。
6. 可在控制台貼上規則，或在已登入 Firebase CLI 的環境執行 `firebase deploy --only firestore:rules --project <projectId>`。
7. 檢查 Google OAuth 同意畫面及應用程式發布狀態，確保一般教會用家可登入。
8. 設定好後運行 `npm run check`，用兩個不同 Google 帳戶驗證隔離、改名、離線重試、跨裝置同步及公開同行進度，再發布兩個網址。

私人資料：`users/{uid}/state/progress` 只容許該帳戶讀寫。內含題目答案、課程、歷史、XP 及公開名稱；沒有保存 Google 密碼。

公開摘要：`members/{uid}` 只包含 displayName、xp、updatedAt。Level 和稱號由 XP 計算；訪客可讀取名稱與 XP，只有本人能更新。電郵及逐題紀錄不公開。名稱最多24個 Unicode 字元；用家在操練紀錄頁修改。

每個帳戶有獨立瀏覽器快取，遊客資料不會自動加入新登入者。用家確認後才能匯入遊客資料。同步使用交易，首次答啱 XP 去重、重做獎勵按日合併；書卷題目結果按逐題時間合併。離線先保留本機，回復連線後重試。

清除本機遊客紀錄不會刪除雲端帳戶資料。目前沒有提供刪除帳戶或公開摘要的網站操作。

官方說明：
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/firestore/security/rules-conditions
