# アーキテクチャ設計

## 🏗️ システム概要

できたよカレンダーは、家族向けタスク管理アプリケーションです。親が子どもにタスクを割り当て、子どもがタスクを完了していく仕組みを提供しています。

## 📋 技術スタック

### フロントエンド

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)

### バックエンド・インフラ

- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Vercel (推奨)

### 開発ツール

- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git

## 🎯 設計思想

### 1. API層による抽象化

Firebase操作を直接行わず、API層を経由することで以下を実現：

- **保守性**: データアクセスロジックの集約
- **テスタビリティ**: API層のモック化が容易
- **型安全性**: TypeScript型定義の活用
- **エラーハンドリング**: 統一されたエラー処理

```typescript
// ❌ 直接Firebase操作（従来）
const q = query(collection(db, 'tasks'), where('familyId', '==', familyId))
const snapshot = await getDocs(q)

// ✅ API層経由（現在）
const tasks = await taskAPI.getByFamilyId(familyId)
```

### 2. コンポーネント分離

- **Page Components**: ページ単位のコンポーネント
- **Shared Components**: 再利用可能なUIコンポーネント
- **Custom Hooks**: ビジネスロジックの抽象化

### 3. 型安全性の重視

- 全てのデータ構造をTypeScriptで定義
- API層での型チェック
- コンパイル時エラーの最大化

## 📂 ディレクトリ構成

```
src/
├── app/                     # Next.js App Router
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx           # トップページ
│   ├── login/             # ログインページ
│   ├── signup/            # サインアップページ
│   ├── setting/           # 設定ページ
│   ├── tasks/             # タスク関連ページ
│   │   ├── page.tsx       # タスク一覧
│   │   ├── add/           # タスク追加
│   │   ├── edit/[id]/     # タスク編集
│   │   └── calendar/      # カレンダー表示
│   └── task-templates/    # テンプレート関連ページ
│       ├── page.tsx       # テンプレート一覧
│       ├── create/        # テンプレート作成
│       └── edit/[id]/     # テンプレート編集
├── components/            # 共有コンポーネント
│   ├── AuthGuard.tsx     # 認証ガード
│   ├── RoleGuard.tsx     # ロールベースアクセス制御
│   ├── Calendar.tsx      # カレンダーコンポーネント
│   ├── Navigation.tsx    # ナビゲーション
│   └── Toast.tsx         # 通知コンポーネント
├── hooks/                # カスタムフック
│   ├── useAuthRedirect.ts
│   ├── useUserInfo.ts
│   └── useFamilyChildren.ts
├── lib/                  # ユーティリティ・設定
│   ├── api/             # API層
│   │   ├── index.ts     # 統合エクスポート
│   │   ├── tasks.ts     # タスクAPI
│   │   ├── taskTemplates.ts # テンプレートAPI
│   │   ├── users.ts     # ユーザーAPI
│   │   └── achievements.ts # 達成記録API
│   ├── firebase.ts      # Firebase設定
│   └── dateUtils.ts     # 日付ユーティリティ
└── types/               # TypeScript型定義
    └── task.ts          # タスク関連の型
```

## 🔄 データフロー

### 1. 認証フロー

```
User Login → Firebase Auth → useUserInfo Hook → User State
```

### 2. データ取得フロー

```
Component → API Layer → Firebase Firestore → Data Transform → Component State
```

### 3. データ更新フロー

```
User Action → API Layer → Firebase Firestore → Local State Update → UI Re-render
```

## 🛡️ セキュリティ設計

### 1. 認証・認可

- **Firebase Auth**: メール・パスワード認証
- **Role-based Access Control**: 親・子の権限管理
- **Route Protection**: 認証が必要なページの保護

### 2. データアクセス制御

- **Family-based Isolation**: 家族単位でのデータ分離
- **Role-based Operations**: 操作権限の制限
- **Input Validation**: API層でのデータ検証

### 3. Firestore Security Rules

```javascript
// 家族データの分離
allow read, write: if request.auth != null
  && resource.data.familyId == getUserFamilyId(request.auth.uid);
```

## 📊 データモデル設計

### コレクション構成

```
firestore/
├── users/           # ユーザー情報
├── tasks/           # タスクデータ
├── taskTemplates/   # タスクテンプレート
└── achievements/    # 達成記録
```

### リレーション設計

- **Users ← FamilyId → Tasks**: 家族によるデータ分離
- **Users ← CreatedBy → TaskTemplates**: 作成者による管理
- **Tasks → ChildrenStatus**: 複数子どもの状態管理

📋 **詳細なコレクション構造については [データベース設計書](database-schema.md) を参照してください。**

## 🚀 パフォーマンス考慮事項

### 1. クエリ最適化

- **インデックス**: 複合クエリに対するインデックス設定
- **Pagination**: 大量データの分割取得
- **Caching**: 適切なデータキャッシュ

### 2. リアルタイム更新

- **Firestore Realtime Listeners**: 必要最小限の使用
- **Local State Management**: クライアント側キャッシュ

### 3. バンドルサイズ最適化

- **Tree Shaking**: 未使用コードの除去
- **Dynamic Imports**: 必要時のみコンポーネント読み込み

## 🔧 開発・運用考慮事項

### 1. 環境分離

```
Development → Firebase Project (dev)
Production  → Firebase Project (prod)
```

### 2. ログ・監視

- **Console Logging**: 開発時のデバッグ情報
- **Error Tracking**: 本番環境でのエラー監視
- **Performance Monitoring**: パフォーマンス計測

### 3. CI/CD

```
Git Push → GitHub Actions → Build & Test → Deploy to Vercel
```

## 🔄 今後の拡張性

### 1. 機能拡張

- **通知機能**: プッシュ通知・メール通知
- **レポート機能**: 達成率レポート
- **ゲーミフィケーション**: ポイント・バッジシステム

### 2. 技術的拡張

- **PWA化**: オフライン対応
- **マルチテナント**: 組織単位の管理
- **API外部公開**: REST API/GraphQL

### 3. 運用面拡張

- **多言語対応**: i18n導入
- **アクセシビリティ**: WCAG準拠
- **モバイルアプリ**: React Native展開
