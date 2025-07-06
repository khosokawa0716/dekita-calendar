# できたよカレンダー

小学生の子どもの予定・宿題などを家族で共有・可視化し、子どもが「できた」ことを実感・記録できる家族向けタスク管理アプリです。

## ✨ 主な機能

- **👨‍👩‍👧‍👦 複数子ども対応**: 1つのタスクを複数の子どもに同時割り当て
- **📅 カレンダー表示**: 月ごとのタスク達成度を視覚化
- **🔄 テンプレート機能**: 繰り返しタスクの効率的な管理
- **🎯 個別進捗管理**: 子どもごとの独立した完了状況・コメント記録
- **🔐 ロールベース制御**: 親・子の権限に応じた機能制限

## 🚀 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth)
- **Architecture**: API層による抽象化、型安全な設計

## 📚 ドキュメント

詳細な技術仕様やセットアップ手順は、[`docs/`](./docs/) ディレクトリをご参照ください：

- **[API仕様書](./docs/api-reference.md)** - API層の詳細仕様
- **[アーキテクチャ設計](./docs/architecture.md)** - システム設計思想
- **[開発環境構築](./docs/development-setup.md)** - セットアップ手順
- **[ドキュメント一覧](./docs/README.md)** - 全ドキュメントの目次

## 🔧 クイックスタート

```bash
# 1. リポジトリのクローン
git clone [repository-url]
cd dekita-calendar

# 2. 依存関係のインストール
npm install

# 3. 環境変数の設定
cp .env.example .env.local
# .env.localにFirebase設定を記入

# 4. 開発サーバーの起動
npm run dev
```

詳細なセットアップ手順は [開発環境構築](./docs/development-setup.md) をご覧ください。

## 📋 画面一覧とアクセス権限（2025年7月6日時点）

| No  | 画面名                                 | 概要                                                       | 親（`role: 'parent'`） | 子（`role: 'child'`）    | 実装状況    |
| --- | -------------------------------------- | ---------------------------------------------------------- | ---------------------- | ------------------------ | ----------- |
| 1   | トップページ /                         | アプリのホーム画面・各機能へのナビゲーション               | ✅ 利用可              | ❌ 不可※自動リダイレクト | ✅ 完了     |
| 2   | ログイン画面 /login                    | Firebase Authenticationでログイン                          | ✅ 利用可              | ✅ 利用可                | ✅ 完了     |
| 3   | ユーザー登録画面 /signup               | Firebase Authenticationでユーザー登録                      | ✅ 利用可              | ✅ 利用可                | ✅ 完了     |
| 4   | タスクテンプレート作成 /task-templates | 繰り返し設定付きテンプレートの登録・複数子ども割り当て     | ✅ 利用可              | ❌ 不可                  | ✅ 完了     |
| 5   | タスク一覧画面 /tasks                  | 今日のタスク一覧表示・子どもごとの完了状況確認             | ✅ 利用可              | ❌ 不可                  | ✅ 完了     |
| 6   | タスク作成画面 /tasks/add              | タスクの作成・複数子どもへの同時割り当て                   | ✅ 利用可              | ❌ 不可                  | ✅ 完了     |
| 7   | カレンダー画面 /tasks/calendar         | 月ごとのタスク達成度表示・今日のタスク管理                 | ✅ 利用可              | ✅ 利用可                | ✅ 完了     |
| 8   | カレンダー内タスク管理                 | 自分に割り当てられたタスクの完了チェック・コメント記録     | ✅ 表示＋監視可        | ✅ 編集可                | ✅ 完了     |
| 9   | タスク詳細編集画面 /tasks/edit         | タスクのタイトル・繰り返しなどを編集（一覧から遷移）       | ✅ 利用可              | ❌ 不可                  | ⏸ 今後検討 |
| 10  | 親子設定・アカウント管理 /setting      | ユーザーが親か子か、ファミリーIDの設定など、アカウント削除 | ✅ 利用可              | ✅ 利用可                | ✅ 完了     |
| 11  | エラーページ/認証保護                  | 未ログイン時のリダイレクトなど                             | ✅ 対応中              | ✅ 対応中                | ✅ 完了     |

### 🔐 権限制御の概要

**子どもユーザー（`role: 'child'`）は：**

- ✅ 自分に割り当てられたタスクの完了状況を管理
- ✅ タスクごとに個別のコメントを記録
- ✅ カレンダーで家族全体のタスク達成状況を確認
- ✅ 設定で自分のアカウント情報を管理
- ✅ トップページにアクセスすると自動的にカレンダー画面にリダイレクト
- ❌ タスクの作成・編集・削除はできない（保護者のみ）
- ❌ トップページ（保護者向けナビゲーション）は利用不可

**保護者ユーザー（`role: 'parent'`）は：**

- ✅ 複数の子どもに同時にタスクを割り当て
- ✅ 子どもごとの完了状況をリアルタイム監視
- ✅ テンプレートから効率的なタスク生成
- ✅ トップページから各機能へ簡単にアクセス
- ✅ すべてのページにアクセス可能
- ✅ タスク管理とテンプレート管理が可能

---

## 🎯 主な機能（MVP）

### 🏠 複数子ども対応タスク管理

- **親**: 1つのタスクを複数の子どもに同時に割り当て
- **子**: 自分専用のタスク完了状態とコメントを管理
- **集計**: 「3人中2人完了」のような家族全体の進捗表示

### 📅 効率的なタスク作成

- **手動作成**: 子ども選択機能付きタスク個別作成
- **テンプレート**: 繰り返しタスクの一括生成機能
- **スケジューリング**: 毎日・平日・カスタム曜日指定

### 👨‍👩‍👧‍👦 家族間コラボレーション

- **リアルタイム共有**: 複数端末での同期対応
- **進捗可視化**: GitHub風カレンダー表示
- **コミュニケーション**: 子どもごとのコメント機能

### 🔒 安全な権限管理

- **役割ベース**: parent/child権限の明確な分離
- **データ分離**: 家族単位でのデータ管理
- **プライバシー**: 子どもは自分のタスクのみアクセス

---

## 🧑‍💻 技術スタック

| 項目           | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| フロントエンド | Next.js (App Router) + TypeScript                       |
| スタイリング   | Tailwind CSS + DaisyUI                                  |
| 認証           | Firebase Authentication（匿名ログイン・メールログイン） |
| 権限制御       | RoleGuardコンポーネントによるページレベルでの制御       |
| データベース   | Firebase Firestore（NoSQL）                             |
| 状態管理       | React Hooks + Custom Hooks                              |
| 型安全性       | TypeScript + 厳密な型定義                               |
| ホスティング   | Vercel or Firebase Hosting（予定）                      |

### 🏗️ アーキテクチャの特徴

- **複数子ども対応データ構造**: `childrenStatus`による個別状態管理
- **段階的移行設計**: 既存データとの下位互換性を保持
- **型安全な開発**: TypeScriptによる堅牢な型システム
- **再利用可能コンポーネント**: モジュラー設計による保守性向上

---

## 📊 データ構造

### タスクデータ（複数子ども対応）

```typescript
interface Task {
  id: string
  title: string
  date: string
  createdBy: string
  familyId: string

  // 新構造：複数子ども対応
  childrenStatus: {
    [childId: string]: {
      isCompleted: boolean
      comment: string
      completedAt?: Date
    }
  }
}
```

### 使用例

```javascript
// 例：「宿題をする」タスクを3人の子どもに割り当て
{
  title: "宿題をする",
  date: "2025-07-06",
  childrenStatus: {
    "child-1": { isCompleted: true, comment: "算数がんばった！" },
    "child-2": { isCompleted: false, comment: "" },
    "child-3": { isCompleted: true, comment: "漢字練習できた" }
  }
}
```

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
