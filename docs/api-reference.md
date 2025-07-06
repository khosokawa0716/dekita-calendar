# API仕様書

このドキュメントでは、デキタカレンダーアプリケーションのAPI層の仕様について説明します。

## 概要

本アプリケーションでは、Firebaseとの直接的なやり取りを避け、API層を通してデータ操作を行います。これにより、コードの保守性、テスタビリティ、型安全性が向上しています。

## API層の構成

```typescript
src/lib/api/
├── index.ts          // 統合エクスポート
├── tasks.ts          // タスク関連操作
├── taskTemplates.ts  // タスクテンプレート関連操作
├── users.ts          // ユーザー関連操作
└── achievements.ts   // 達成記録関連操作
```

## 使用方法

```typescript
import { taskAPI, userAPI } from '@/lib/api'

// タスクを作成
const taskId = await taskAPI.create(taskData)

// ユーザー情報を取得
const user = await userAPI.getById(userId)
```

---

## 📋 Task API

タスク関連の操作を提供します。

### `taskAPI.create(taskData)`

新しいタスクを作成します。

**パラメータ:**
```typescript
interface CreateTaskInput {
  title: string
  date: string
  createdBy: string
  familyId: string
  childrenStatus: { [childId: string]: ChildStatus }
  userId?: string // 下位互換性のため
}
```

**戻り値:** `Promise<string>` - 作成されたタスクのID

**例:**
```typescript
const taskData = {
  title: "宿題をする",
  date: "2025-01-06",
  createdBy: "parent_user_id",
  familyId: "family_123",
  childrenStatus: {
    "child_1": { isCompleted: false, comment: "", completedAt: null }
  }
}

const taskId = await taskAPI.create(taskData)
```

### `taskAPI.getByFamilyIdAndDate(familyId, date)`

指定した家族IDと日付のタスクを取得します。

**パラメータ:**
- `familyId: string` - 家族ID
- `date: string` - 日付 (YYYY-MM-DD形式)

**戻り値:** `Promise<Task[]>`

**例:**
```typescript
const tasks = await taskAPI.getByFamilyIdAndDate("family_123", "2025-01-06")
```

### `taskAPI.getByFamilyIdAndDateRange(familyId, startDate, endDate)`

指定した家族IDと日付範囲のタスクを取得します（カレンダー用）。

**パラメータ:**
- `familyId: string` - 家族ID
- `startDate: string` - 開始日 (YYYY-MM-DD形式)
- `endDate: string` - 終了日 (YYYY-MM-DD形式)

**戻り値:** `Promise<Task[]>`

**例:**
```typescript
const tasks = await taskAPI.getByFamilyIdAndDateRange(
  "family_123", 
  "2025-01-01", 
  "2025-01-31"
)
```

### `taskAPI.getById(id)`

IDでタスクを取得します。

**パラメータ:**
- `id: string` - タスクID

**戻り値:** `Promise<Task | null>`

### `taskAPI.update(id, updates)`

タスクを更新します。

**パラメータ:**
- `id: string` - タスクID
- `updates: UpdateTaskInput` - 更新データ

**例:**
```typescript
await taskAPI.update("task_123", {
  title: "新しいタイトル",
  isCompleted: true
})
```

### `taskAPI.delete(id)`

タスクを削除します。

**パラメータ:**
- `id: string` - タスクID

### `taskAPI.toggleCompleted(id, isCompleted)`

タスクの完了状態を切り替えます。

**パラメータ:**
- `id: string` - タスクID
- `isCompleted: boolean` - 完了状態

---

## 📋 TaskTemplate API

タスクテンプレート関連の操作を提供します。

### `taskTemplateAPI.create(templateData)`

新しいタスクテンプレートを作成します。

**パラメータ:**
```typescript
interface CreateTaskTemplateInput {
  title: string
  createdBy: string
  familyId: string
  repeatType: 'none' | 'everyday' | 'weekday' | 'custom'
  repeatDays?: number[]
}
```

**戻り値:** `Promise<string>` - 作成されたテンプレートのID

**例:**
```typescript
const templateData = {
  title: "朝の準備",
  createdBy: "parent_user_id",
  familyId: "family_123",
  repeatType: "weekday"
}

const templateId = await taskTemplateAPI.create(templateData)
```

### `taskTemplateAPI.getByFamilyId(familyId)`

家族IDでタスクテンプレートを取得します。

### `taskTemplateAPI.getByCreatedBy(createdBy, familyId)`

作成者IDでタスクテンプレートを取得します。

### `taskTemplateAPI.getById(id)`

IDでタスクテンプレートを取得します。

### `taskTemplateAPI.update(id, updates)`

タスクテンプレートを更新します。

### `taskTemplateAPI.delete(id)`

タスクテンプレートを削除します。

---

## 👤 User API

ユーザー関連の操作を提供します。

### `userAPI.create(uid, userData)`

新しいユーザーを作成します。

**パラメータ:**
- `uid: string` - Firebase AuthのUID
- `userData: Omit<User, 'id'>` - ユーザーデータ

**例:**
```typescript
await userAPI.create("firebase_uid", {
  email: "user@example.com",
  displayName: "太郎",
  role: "child",
  familyId: "family_123"
})
```

### `userAPI.getById(id)`

IDでユーザーを取得します。

### `userAPI.getChildrenByFamilyId(familyId)`

家族IDで子どもユーザーを取得します。

### `userAPI.update(id, updates)`

ユーザー情報を更新します。

### `userAPI.delete(id)`

ユーザーを削除します。

---

## 🏆 Achievement API

達成記録関連の操作を提供します。

### `achievementAPI.getById(userId, date)`

達成記録を取得します。

### `achievementAPI.createOrUpdate(userId, date, completedCount)`

達成記録を作成または更新します。

### `achievementAPI.incrementCount(userId, date)`

達成カウントを増加します。

### `achievementAPI.decrementCount(userId, date)`

達成カウントを減少します。

---

## 🔧 型定義

### Task型
```typescript
interface Task {
  id: string
  title: string
  date: string
  createdBy: string
  familyId: string
  childrenStatus: { [childId: string]: ChildStatus }
  
  // 下位互換性フィールド
  isCompleted?: boolean
  userId?: string
  childComment?: string
}
```

### ChildStatus型
```typescript
interface ChildStatus {
  isCompleted: boolean
  comment: string
  completedAt?: Date
}
```

### TaskTemplate型
```typescript
interface TaskTemplate {
  id: string
  title: string
  createdBy: string
  familyId: string
  createdAt: any
  repeatType: 'none' | 'everyday' | 'weekday' | 'custom'
  repeatDays?: number[]
}
```

### User型
```typescript
interface User {
  id: string
  email: string
  displayName: string
  role: 'parent' | 'child'
  familyId: string
}
```

---

## ⚠️ エラーハンドリング

すべてのAPI関数は、エラーが発生した場合に適切なエラーメッセージと共に`Error`をthrowします。

```typescript
try {
  const task = await taskAPI.getById("invalid_id")
} catch (error) {
  console.error(error.message) // "タスクの取得に失敗しました"
}
```

---

## 🚀 ベストプラクティス

1. **型安全性**: TypeScriptの型定義を活用してください
2. **エラーハンドリング**: 必ずtry-catch文を使用してください
3. **パフォーマンス**: 必要なデータのみを取得するよう適切なAPIを選択してください
4. **再利用性**: 共通の操作はAPI層を通して行ってください

---

## 📚 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [Firebase設定](firebase-setup.md) - Firebase設定手順
- [デプロイメント](deployment.md) - デプロイメント手順
