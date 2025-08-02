# Firebase Firestore コレクション定義書

## 概要

本アプリケーションでは、Firebase Firestore を使用してデータを管理しています。
家族単位でデータを分離し、親・子の役割に基づいたアクセス制御を実装しています。

## 📊 コレクション構成

```
firestore/
├── users/           # ユーザー情報
├── tasks/           # タスクデータ
├── taskTemplates/   # タスクテンプレート
└── achievements/    # 達成記録
```

---

## 1. 👤 users コレクション

ユーザー（親・子）の基本情報を管理

### フィールド定義

| フィールド名 | 型        | 必須 | 説明                                 | 例                      |
| ------------ | --------- | ---- | ------------------------------------ | ----------------------- |
| id           | string    | ✅   | ドキュメントID（Firebase AuthのUID） | "firebase_auth_uid_123" |
| email        | string    | ✅   | メールアドレス                       | "parent@example.com"    |
| displayName  | string    | ✅   | 表示名                               | "太郎"                  |
| role         | string    | ✅   | ユーザーの役割                       | "parent" / "child"      |
| familyId     | string    | ✅   | 家族ID（データ分離用）               | "family_123"            |
| createdAt    | Timestamp | ✅   | 作成日時                             | serverTimestamp()       |

### インデックス

- `familyId + role` : 家族内の子どもユーザー取得用

### サンプルドキュメント

```json
{
  "id": "firebase_auth_uid_123",
  "email": "parent@example.com",
  "displayName": "お母さん",
  "role": "parent",
  "familyId": "family_abc123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 2. 📝 tasks コレクション

日々のタスクデータを管理

### フィールド定義

| フィールド名   | 型        | 必須 | 説明                       | 例                      |
| -------------- | --------- | ---- | -------------------------- | ----------------------- |
| id             | string    | ✅   | ドキュメントID（自動生成） | "task_123abc"           |
| title          | string    | ✅   | タスクタイトル             | "歯磨き"                |
| date           | string    | ✅   | 実行日（YYYY-MM-DD形式）   | "2024-01-15"            |
| createdBy      | string    | ✅   | 作成者のユーザーID         | "firebase_auth_uid_123" |
| familyId       | string    | ✅   | 家族ID                     | "family_123"            |
| childrenStatus | Object    | ✅   | 子どもごとの完了状態       | 下記参照                |
| createdAt      | Timestamp | ✅   | 作成日時                   | serverTimestamp()       |

### childrenStatus オブジェクト構造

```typescript
{
  [childId: string]: {
    isCompleted: boolean,     // 完了状態
    comment: string,          // 子どものコメント
    completedAt?: Date        // 完了日時（オプション）
  }
}
```

### インデックス

- `familyId + date` : 家族の特定日タスク取得用
- `familyId + date (範囲)` : カレンダー表示用の日付範囲検索

### サンプルドキュメント

```json
{
  "id": "task_xyz789",
  "title": "朝の歯磨き",
  "date": "2024-01-15",
  "createdBy": "parent_uid_123",
  "familyId": "family_abc123",
  "childrenStatus": {
    "child1_uid": {
      "isCompleted": true,
      "comment": "きれいに磨けた！",
      "completedAt": "2024-01-15T07:30:00Z"
    },
    "child2_uid": {
      "isCompleted": false,
      "comment": ""
    }
  },
  "createdAt": "2024-01-15T06:00:00Z"
}
```

---

## 3. 📋 taskTemplates コレクション

再利用可能なタスクテンプレートを管理

### フィールド定義

| フィールド名 | 型        | 必須 | 説明                         | 例                                         |
| ------------ | --------- | ---- | ---------------------------- | ------------------------------------------ |
| id           | string    | ✅   | ドキュメントID（自動生成）   | "template_abc123"                          |
| title        | string    | ✅   | テンプレートタイトル         | "歯磨き"                                   |
| createdBy    | string    | ✅   | 作成者のユーザーID           | "parent_uid_123"                           |
| familyId     | string    | ✅   | 家族ID                       | "family_123"                               |
| repeatType   | string    | ✅   | 繰り返しタイプ               | "everyday" / "weekday" / "custom" / "none" |
| repeatDays   | number[]  | -    | 繰り返し曜日（customの場合） | [1, 2, 3, 4, 5]                            |
| createdAt    | Timestamp | ✅   | 作成日時                     | serverTimestamp()                          |

### repeatType の値

- `"none"` : 繰り返しなし
- `"everyday"` : 毎日
- `"weekday"` : 平日のみ（月〜金）
- `"custom"` : カスタム（repeatDaysで指定）

### インデックス

- `familyId` : 家族のテンプレート取得用
- `createdBy + familyId` : 作成者別テンプレート取得用

### サンプルドキュメント

```json
{
  "id": "template_morning_teeth",
  "title": "朝の歯磨き",
  "createdBy": "parent_uid_123",
  "familyId": "family_abc123",
  "repeatType": "everyday",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## 4. 🏆 achievements コレクション

子どもの日別達成記録を管理

### フィールド定義

| フィールド名   | 型        | 必須 | 説明                                   | 例                     |
| -------------- | --------- | ---- | -------------------------------------- | ---------------------- |
| id             | string    | ✅   | ドキュメントID（{userId}\_{date}形式） | "child_uid_2024-01-15" |
| userId         | string    | ✅   | 子どものユーザーID                     | "child_uid_123"        |
| date           | string    | ✅   | 達成日（YYYY-MM-DD形式）               | "2024-01-15"           |
| completedCount | number    | ✅   | 完了したタスク数                       | 5                      |
| createdAt      | Timestamp | -    | 初回作成日時                           | serverTimestamp()      |
| updatedAt      | Timestamp | ✅   | 最終更新日時                           | serverTimestamp()      |

### 特殊な仕様

- **複合キー**: ドキュメントIDは `{userId}_{date}` の形式
- **自動集計**: タスク完了時に自動的にカウントが増減
- **日別管理**: 1日1レコードで子どもの達成状況を記録

### インデックス

- 自然インデックス（ドキュメントIDによる検索）

### サンプルドキュメント

```json
{
  "id": "child_uid_123_2024-01-15",
  "userId": "child_uid_123",
  "date": "2024-01-15",
  "completedCount": 3,
  "createdAt": "2024-01-15T07:00:00Z",
  "updatedAt": "2024-01-15T19:30:00Z"
}
```

---

## 🔗 リレーション設計

### データ分離の仕組み

```
Family Level Isolation:
├── familyId をキーとした完全分離
├── 家族間でのデータアクセス不可
└── セキュリティルールで強制

User Relationships:
├── Parent (role: "parent")
│   ├── タスクテンプレート作成権限
│   ├── タスク作成権限
│   └── 全データ閲覧権限
└── Child (role: "child")
    ├── 自分のタスク完了権限
    ├── コメント追加権限
    └── 達成記録閲覧権限
```

### データフロー

```
1. タスクテンプレート作成（親）
   Parent → taskTemplates

2. タスク生成（親）
   taskTemplates → tasks（childrenStatus付き）

3. タスク完了（子）
   Child → tasks.childrenStatus[childId]
   └── 同時に → achievements（カウント増加）

4. 達成記録確認
   achievements → 日別・子別の完了数表示
```

---

## 🛡️ セキュリティルール設計

### 基本方針

1. **認証必須**: すべての操作で認証が必要
2. **家族分離**: 他の家族のデータにはアクセス不可
3. **役割制御**: 親・子の役割に応じた操作制限

### 主要ルール

```javascript
// ユーザーは自分のデータのみアクセス可能
match /users/{userId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}

// 家族データは同じfamilyIdのユーザーのみアクセス可能
match /tasks/{taskId} {
  allow read, write: if request.auth != null
    && resource.data.familyId == getUserFamilyId(request.auth.uid);
}

// 達成記録は本人のみアクセス可能
match /achievements/{achievementId} {
  allow read, write: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
```

---

## 📈 パフォーマンス考慮事項

### インデックス戦略

1. **複合インデックス**
   - `familyId + date` : 日別タスク検索
   - `familyId + role` : 家族内ユーザー検索

2. **単一フィールドインデックス**
   - `familyId` : 家族データ検索
   - `userId` : ユーザー関連データ検索

### クエリ最適化

- 日付範囲検索でのページネーション
- 必要最小限のフィールドのみ取得
- リアルタイムリスナーの適切な配置

---

## API使用例

### タスク作成

```typescript
await taskAPI.create({
  title: '朝の歯磨き',
  date: '2024-01-15',
  createdBy: 'parent_uid',
  familyId: 'family_123',
  childrenStatus: {
    child1_uid: {
      isCompleted: false,
      comment: '',
    },
    child2_uid: {
      isCompleted: false,
      comment: '',
    },
  },
})
```

### 達成記録の更新

```typescript
// タスク完了時に自動実行
await achievementAPI.incrementCount('child1_uid', '2024-01-15')
```

---

## 🔗 関連ドキュメント

- [API仕様書](api-reference.md) - 詳細なAPI仕様とサンプルコード
- [アーキテクチャ設計](architecture.md) - システム全体設計とデータフロー
- [開発環境構築](development-setup.md) - セットアップ手順と初期データ設定
- [README.md](README.md) - ドキュメント構成とナビゲーション

### 📋 実装時の参考

- **API実装**: `src/lib/api/` 内の各ファイル
- **型定義**: `src/types/task.ts`
- **コンポーネント**: `src/components/` 内の関連コンポーネント
