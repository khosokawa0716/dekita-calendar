# 開発環境構築

## 🔧 必要な環境

- **Node.js**: 18.x 以上
- **npm**: 9.x 以上
- **Git**: 最新版
- **エディタ**: VS Code（推奨）

## 📦 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone [repository-url]
cd dekita-calendar
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Firebase プロジェクトの設定

#### 3.1 Firebase コンソールでプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `dekita-calendar-dev`）
4. Google Analytics は任意で設定

#### 3.2 Web アプリの追加

1. プロジェクト設定 → 「アプリを追加」→ Web を選択
2. アプリ名を入力（例: `dekita-calendar-web`）
3. Firebase SDK 設定をコピー

#### 3.3 Firestore Database の設定

1. 「Firestore Database」→ 「データベースの作成」
2. **テストモード** で開始（後でセキュリティルールを設定）
3. ロケーションを選択（推奨: `asia-northeast1`）

#### 3.4 Authentication の設定

1. 「Authentication」→ 「始める」
2. 「Sign-in method」タブ
3. 「メール/パスワード」を有効化

### 4. 環境変数の設定

```bash
# .env.example をコピー
cp .env.example .env.local
```

`.env.local` を編集して Firebase 設定を記入：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## 🛠️ 開発ツール設定

### VS Code 拡張機能（推奨）

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "firebase.firebase-vscode"
  ]
}
```

### VS Code 設定

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 📋 開発用スクリプト

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番モード起動
npm start

# リンター実行
npm run lint

# リンター自動修正
npm run lint:fix

# 型チェック
npm run type-check
```

## 🗄️ 初期データ設定

### データ構造の理解

開発を始める前に、[データベース設計書](database-schema.md) でFirestoreのコレクション構造を確認してください。

### テストユーザーの作成

1. アプリにアクセスして「ユーザー登録」
2. 親ユーザーを作成:
   ```
   メール: parent@example.com
   パスワード: password123
   ロール: parent（親）
   ```
3. 子ユーザーを作成:
   ```
   メール: child@example.com
   パスワード: password123
   ロール: child（子）
   ```

### ファミリーIDの設定

1. 親ユーザーでログイン
2. 設定画面で任意のファミリーID（例: `family001`）を設定
3. 子ユーザーでログイン
4. 同じファミリーIDを設定

### サンプルデータの作成

1. 親ユーザーでタスクテンプレートを作成
2. 本日のタスクを生成
3. 子ユーザーでカレンダー画面を確認

## 🔧 トラブルシューティング

### よくある問題

#### Firebase 接続エラー

```
Firebase: Error (auth/invalid-api-key)
```

**解決方法**: `.env.local` の Firebase 設定を確認

#### 権限エラー

```
FirebaseError: Missing or insufficient permissions
```

**解決方法**: Firestore のセキュリティルールを確認

#### ビルドエラー

```
Module not found: Can't resolve '@/lib/api'
```

**解決方法**: TypeScript の paths 設定を確認

### デバッグ方法

#### 1. ブラウザ開発者ツール

- Console タブでエラーログを確認
- Network タブで API 通信を確認

#### 2. Firebase デバッグ

```javascript
// Firebase の詳細ログを有効化
firebase.firestore.setLogLevel('debug')
```

#### 3. Next.js デバッグ

```bash
# 詳細ログでサーバー起動
DEBUG=* npm run dev
```

## 🚀 本番環境への準備

### Firestore セキュリティルールの設定

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // ファミリーデータは同じ家族のみアクセス可能
    match /tasks/{taskId} {
      allow read, write: if request.auth != null
        && resource.data.familyId == getUserFamilyId(request.auth.uid);
    }

    // ヘルパー関数
    function getUserFamilyId(uid) {
      return get(/databases/$(database)/documents/users/$(uid)).data.familyId;
    }
  }
}
```

### 環境変数の本番設定

本番環境では以下の環境変数を設定：

- Firebase の本番プロジェクト設定
- セキュリティ強化された設定値

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. [データベース設計書](database-schema.md) - コレクション構造
2. [API仕様書](api-reference.md) - API使用方法
3. [アーキテクチャ設計](architecture.md) - システム全体像
4. [よくある質問](./faq.md)
5. [Issue トラッカー](../issues)
6. [開発チームへの連絡](mailto:dev@example.com)
