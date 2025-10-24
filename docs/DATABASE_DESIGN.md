# dash2 データベース設計書

## 概要
Directusを使用した包括的なデータベース設計。EC、コンテンツ管理、会員管理、E-Learningの機能を統合。

---

## コレクション一覧

### 1. 👤 Users（ユーザー・会員管理）
**説明**: システムユーザーと会員情報（Directus組み込みコレクション）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | ユーザーID（自動生成） |
| email | String | メールアドレス（ユニーク） |
| password | Hash | パスワード（ハッシュ化） |
| first_name | String | 名 |
| last_name | String | 姓 |
| avatar | File | プロフィール画像 |
| role | Many-to-One | ロール（Admin, Member, Guest等） |
| status | String | ステータス（active, suspended, invited） |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- Orders (One-to-Many) - ユーザーの注文一覧
- Reviews (One-to-Many) - ユーザーのレビュー一覧
- Course_Progress (Many-to-Many) - コース進捗

---

### 2. 🏷️ Categories（カテゴリ）
**説明**: 商品やコンテンツの分類カテゴリ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | カテゴリID（自動生成） |
| name | String | カテゴリ名（例: 電子機器、衣類） |
| slug | String | URLスラッグ（例: electronics） |
| description | Text | カテゴリ説明 |
| icon | String | アイコン名 |
| color | String | カラーコード |
| parent_category | Many-to-One | 親カテゴリ（階層構造用） |
| sort_order | Integer | 表示順 |
| status | String | 公開ステータス（published, draft） |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- Products (One-to-Many) - このカテゴリの商品一覧
- Content (One-to-Many) - このカテゴリのコンテンツ一覧
- Parent/Child Categories (Self-Referencing) - 階層構造

---

### 3. 🛍️ Products（商品）
**説明**: EC商品カタログ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | 商品ID（自動生成） |
| name | String | 商品名 |
| slug | String | URLスラッグ |
| description | Text | 商品説明 |
| short_description | String | 短い説明（一覧用） |
| price | Decimal | 価格 |
| sale_price | Decimal | セール価格（オプション） |
| sku | String | 商品コード（ユニーク） |
| stock | Integer | 在庫数 |
| images | Many-to-Many (Files) | 商品画像（複数） |
| category | Many-to-One | カテゴリ |
| featured | Boolean | おすすめ商品フラグ |
| status | String | 公開ステータス（published, draft, archived） |
| meta_title | String | SEOタイトル |
| meta_description | Text | SEO説明 |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- Category (Many-to-One) - 所属カテゴリ
- Reviews (One-to-Many) - 商品レビュー一覧
- Order_Items (One-to-Many) - 注文明細

---

### 4. 📝 Content（コンテンツ・記事）
**説明**: ブログ記事、ニュース、お知らせ

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | コンテンツID（自動生成） |
| title | String | タイトル |
| slug | String | URLスラッグ |
| excerpt | Text | 抜粋・要約 |
| body | WYSIWYG | 本文（リッチテキスト） |
| featured_image | File | アイキャッチ画像 |
| category | Many-to-One | カテゴリ |
| author | Many-to-One (Users) | 著者 |
| tags | JSON | タグ（複数） |
| views | Integer | 閲覧数 |
| featured | Boolean | 注目記事フラグ |
| status | String | 公開ステータス（published, draft, scheduled） |
| published_at | Timestamp | 公開日時 |
| meta_title | String | SEOタイトル |
| meta_description | Text | SEO説明 |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- Category (Many-to-One) - 所属カテゴリ
- Author (Many-to-One to Users) - 著者情報

---

### 5. 🎓 Courses（コース）
**説明**: E-Learning学習コース

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | コースID（自動生成） |
| title | String | コースタイトル |
| slug | String | URLスラッグ |
| description | Text | コース説明 |
| thumbnail | File | サムネイル画像 |
| instructor | Many-to-One (Users) | 講師 |
| level | String | レベル（beginner, intermediate, advanced） |
| duration | Integer | 推定所要時間（分） |
| price | Decimal | 価格（0=無料） |
| featured | Boolean | おすすめコースフラグ |
| status | String | 公開ステータス（published, draft） |
| enrollment_count | Integer | 受講者数 |
| rating_average | Decimal | 平均評価 |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- Lessons (One-to-Many) - レッスン一覧
- Instructor (Many-to-One to Users) - 講師情報
- Enrollments (Many-to-Many with Users) - 受講者一覧

---

### 6. 📚 Lessons（レッスン）
**説明**: コース内のレッスン・教材

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | レッスンID（自動生成） |
| title | String | レッスンタイトル |
| slug | String | URLスラッグ |
| course | Many-to-One | 所属コース |
| content | WYSIWYG | レッスン内容 |
| video_url | String | 動画URL（YouTube等） |
| duration | Integer | 動画時間（分） |
| order | Integer | 表示順 |
| is_preview | Boolean | プレビュー可能フラグ |
| status | String | 公開ステータス（published, draft） |
| created_at | Timestamp | 作成日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- Course (Many-to-One) - 所属コース

---

### 7. 🛒 Orders（注文）
**説明**: EC注文管理

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | 注文ID（自動生成） |
| order_number | String | 注文番号（ユニーク） |
| user | Many-to-One (Users) | 注文者 |
| status | String | ステータス（pending, processing, shipped, completed, cancelled） |
| total_amount | Decimal | 合計金額 |
| shipping_address | JSON | 配送先住所 |
| billing_address | JSON | 請求先住所 |
| payment_method | String | 支払方法 |
| payment_status | String | 支払ステータス（pending, paid, failed） |
| notes | Text | 備考 |
| created_at | Timestamp | 注文日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- User (Many-to-One to Users) - 注文者情報
- Order_Items (One-to-Many) - 注文明細

---

### 8. 📦 Order_Items（注文明細）
**説明**: 注文内の商品明細

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | 明細ID（自動生成） |
| order | Many-to-One | 所属注文 |
| product | Many-to-One | 商品 |
| quantity | Integer | 数量 |
| unit_price | Decimal | 単価 |
| total_price | Decimal | 小計 |
| created_at | Timestamp | 作成日時 |

**リレーション**:
- Order (Many-to-One) - 所属注文
- Product (Many-to-One) - 商品情報

---

### 9. ⭐ Reviews（レビュー・評価）
**説明**: 商品・コースのレビュー

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | Integer | レビューID（自動生成） |
| user | Many-to-One (Users) | レビュー投稿者 |
| product | Many-to-One | 商品（オプション） |
| course | Many-to-One | コース（オプション） |
| rating | Integer | 評価（1-5） |
| title | String | レビュータイトル |
| comment | Text | コメント |
| helpful_count | Integer | 役立ったカウント |
| status | String | 公開ステータス（published, pending, rejected） |
| created_at | Timestamp | 投稿日時 |
| updated_at | Timestamp | 更新日時 |

**リレーション**:
- User (Many-to-One to Users) - 投稿者情報
- Product (Many-to-One) - 商品情報
- Course (Many-to-One) - コース情報

---

## リレーション図（主要な関連）

```
Users (1) ──→ (Many) Orders
Users (1) ──→ (Many) Reviews
Users (1) ──→ (Many) Content (as Author)
Users (Many) ←→ (Many) Courses (Enrollments)

Categories (1) ──→ (Many) Products
Categories (1) ──→ (Many) Content

Products (1) ──→ (Many) Reviews
Products (1) ──→ (Many) Order_Items

Orders (1) ──→ (Many) Order_Items
Order_Items (Many) ──→ (1) Products

Courses (1) ──→ (Many) Lessons
Courses (1) ──→ (Many) Reviews
```

---

## ステータス値の標準化

### 共通ステータス
- `published` - 公開済み
- `draft` - 下書き
- `archived` - アーカイブ

### 注文ステータス
- `pending` - 保留中
- `processing` - 処理中
- `shipped` - 発送済み
- `completed` - 完了
- `cancelled` - キャンセル

### 支払いステータス
- `pending` - 支払待ち
- `paid` - 支払済み
- `failed` - 失敗

---

## インデックス推奨

パフォーマンス向上のため、以下のフィールドにインデックスを作成：

- `products.slug`
- `products.sku`
- `content.slug`
- `courses.slug`
- `orders.order_number`
- `users.email`

---

**作成日**: 2025-10-23
**最終更新**: 2025-10-23
