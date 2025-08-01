# ドキュメント構成

このディレクトリには、デキタカレンダーアプリケーションの技術ドキュメントが格納されています。

## 📋 ドキュメント一覧

### 🔧 技術仕様

- **[API仕様書](api-reference.md)** - API層の詳細な仕様とサンプルコード
- **[アーキテクチャ設計](architecture.md)** - システム全体の設計思想と構成
- **[データベース設計](database-schema.md)** - Firestoreのコレクション構造とデータモデル

### 🚀 セットアップ・運用

- **[開発環境構築](development-setup.md)** - 開発環境のセットアップ手順
- **[Firebase設定](firebase-setup.md)** - Firebase プロジェクトの設定方法
- **[デプロイメント](deployment.md)** - 本番環境へのデプロイ手順

### 🎯 機能仕様

- **[ユーザー管理](user-management.md)** - 親・子ユーザーの管理仕様
- **[タスク管理](task-management.md)** - タスクとテンプレートの機能仕様
- **[カレンダー機能](calendar-features.md)** - カレンダー表示と操作の仕様

### 🔒 セキュリティ・品質

- **[セキュリティ指針](security-guidelines.md)** - セキュリティ要件と実装指針
- **[テスト戦略](testing-strategy.md)** - テストの方針と実装方法
- **[パフォーマンス最適化](performance-optimization.md)** - パフォーマンス改善の指針

## 📖 ドキュメント利用ガイド

### 🔰 初めて開発に参加する方

1. [開発環境構築](development-setup.md)
2. [アーキテクチャ設計](architecture.md)
3. [API仕様書](api-reference.md)

### 🛠️ 機能追加・修正を行う方

1. [API仕様書](api-reference.md)
2. 対象機能の仕様書（ユーザー管理、タスク管理など）
3. [テスト戦略](testing-strategy.md)

### 🚀 運用・デプロイを行う方

1. [Firebase設定](firebase-setup.md)
2. [デプロイメント](deployment.md)
3. [セキュリティ指針](security-guidelines.md)

## 💡 ドキュメント更新について

- 新機能追加時は対応する仕様書を更新してください
- API変更時は必ず [API仕様書](api-reference.md) を更新してください
- 設定変更時は該当するセットアップドキュメントを更新してください

## 🔄 ドキュメント管理ルール

1. **即座更新**: コード変更と同時にドキュメントも更新
2. **レビュー必須**: ドキュメント変更もコードレビューの対象
3. **バージョン管理**: 重要な変更は変更履歴を記載
4. **具体的記述**: 抽象的な説明ではなく具体的なサンプルコードを含める
