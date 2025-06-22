# できたよカレンダー

小学生の子どもの予定・宿題などを家族で共有・可視化し、
子どもが「できた」ことを実感・記録できるようにするアプリです。

---

## 🎯 主な機能（MVP）

- 親が日付ごとに子どものタスクを登録
- 子どもが今日のタスクを一覧で確認・「できたよ」チェック
- 日付ごとの達成状況をカレンダー形式で表示（GitHub風草予定）
- 家族間でデータ共有（複数端末対応）

---

## 🧑‍💻 技術スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | Next.js (App Router) |
| スタイリング | Tailwind CSS + DaisyUI |
| 認証 | Firebase Authentication（匿名ログイン・メールログイン） |
| データベース | Firebase Firestore |
| ホスティング | Vercel or Firebase Hosting（予定） |

---

## 🚀 ローカル開発手順

### 1. このリポジトリをクローン

```bash
git clone https://github.com/your-username/dekita-calendar.git
cd dekita-calendar
```

### 2. 必要なパッケージをインストール
```bash
npm install
```

### 3. 環境変数ファイルを作成
プロジェクト直下に .env.local を作成し、以下を記入：
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. 開発サーバーを起動
プロジェクト直下に .env.local を作成し、以下を記入：
```bash
npm run dev
```
→ http://localhost:3000 にアクセス