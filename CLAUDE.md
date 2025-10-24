# dash2 - Directus バックエンド検証プロジェクト

## 概要
dashプロジェクトをベースに、DirectusヘッドレスCMSとPostgreSQLを使用したバックエンド構築の検証プロジェクト。

## 技術スタック

### バックエンド
- **Directus 11** - ヘッドレスCMS
- **PostgreSQL 15** - データベース
- **Docker & Docker Compose** - コンテナ管理

### 今後追加予定
- Next.js 14 (フロントエンド - Phase 2以降)
- TypeScript
- Tailwind CSS

## プロジェクト方針

### Phase 1: バックエンド構築（現在のフェーズ）
1. ✅ Docker環境セットアップ
2. ⏳ データベース設計
3. ⏳ Directusコレクション作成
4. ⏳ リレーション設計
5. ⏳ API動作確認

### Phase 2: フロントエンド構築（後日）
1. Next.jsプロジェクト作成
2. Directus SDK統合
3. 基本的なCRUD画面実装

## プロジェクト構成

```
/home/user/projects/active/dash2/
├── CLAUDE.md                  # このファイル
├── HISTORY.md                 # 作業履歴
├── docker-compose.yml         # Docker構成（Directus + PostgreSQL）
├── .env                       # 環境変数
├── .gitignore                 # Git除外設定
├── directus/                  # Directus設定
│   ├── Dockerfile             # Directusコンテナ定義
│   ├── extensions/            # カスタム拡張機能
│   └── uploads/               # アップロードファイル
├── database/                  # データベース関連
│   ├── schema/                # スキーマ設計ドキュメント
│   └── migrations/            # マイグレーションファイル
├── docs/                      # ドキュメント
│   ├── API.md                 # API仕様書
│   ├── DATABASE_DESIGN.md     # DB設計書
│   └── COLLECTIONS.md         # コレクション定義
└── scripts/                   # ユーティリティスクリプト
    ├── setup-collections.js   # コレクション自動作成
    └── seed-data.js           # サンプルデータ投入
```

## 開発環境

### アクセス情報
- **Directus管理画面**: http://localhost:8056/admin
- **Directus API**: http://localhost:8056
- **PostgreSQL**: localhost:5433

### 認証情報
- **管理者メール**: admin@example.com
- **管理者パスワード**: dash2admin
- **データベース**: dash2_db
- **DBユーザー**: dash2_user

## Docker コマンド

```bash
# コンテナ起動
docker-compose up -d

# コンテナ停止
docker-compose down

# ログ確認
docker-compose logs -f

# データベースも含めて完全削除
docker-compose down -v

# コンテナ再ビルド
docker-compose up -d --build
```

## 開発の進め方

### バックエンドファースト方針
このプロジェクトでは、**バックエンド（データベース設計 + API）を完全に固めてから、フロントエンドに着手する**方針を採用しています。

**理由**:
- 過去のプロジェクトで、フロントエンドと同時進行してうまくいかなかった経験から
- データ構造が確定していない状態でUIを作ると、後で大幅な修正が必要になる
- APIが安定してからフロントエンド開発を始める方が、効率的で確実

## 管理するデータ（予定）

以下のコレクションを作成予定：

### コア機能
1. **Users** - ユーザー・会員管理
   - 基本情報（名前、メール、プロフィール）
   - ロール・権限管理
   - 認証情報

2. **Products** - 商品・製品情報
   - 商品名、説明、価格
   - カテゴリ、メーカー
   - 画像、在庫情報

3. **Content** - コンテンツ管理
   - ブログ記事
   - ニュース・お知らせ
   - カテゴリ、タグ

### 拡張機能（検討中）
4. **Courses** - 学習コース
5. **Lessons** - レッスン・教材
6. **Progress** - 進捗管理

## 次回作業内容

### 優先度：高
- [ ] Directusコンテナ初回起動
- [ ] データベース接続確認
- [ ] 基本コレクション作成（Users, Products, Content）
- [ ] リレーション設定

### 優先度：中
- [ ] APIドキュメント作成
- [ ] サンプルデータ投入
- [ ] REST API動作確認

### 優先度：低
- [ ] GraphQL動作確認
- [ ] カスタムエンドポイント検討

## 関連プロジェクト
- **dash**: `/home/user/projects/active/dash`
  - 本番稼働中のフルスタックシステム
  - VPS: https://dash.hanageruge.com
  - 参考にする技術スタック・設計

## 注意事項
- ポート番号は既存のdashプロジェクトと競合しないように設定
  - Directus: 8056（dashは8055）
  - PostgreSQL: 5433（dashは5432）
- 開発用の認証情報は本番では使用しない
- `.env`ファイルはGit管理しない

---

**作成日**: 2025-10-23
**最終更新**: 2025-10-23
**ステータス**: 🚀 Phase 1: バックエンド構築中
**バージョン**: 0.1.0
