# dash2 コレクション定義書

Directusで作成する全コレクションの詳細定義。実際にDirectus管理画面で設定する際の手順書として使用。

---

## 📋 目次
1. [Categories（カテゴリ）](#1-categories)
2. [Products（商品）](#2-products)
3. [Content（コンテンツ）](#3-content)
4. [Courses（コース）](#4-courses)
5. [Lessons（レッスン）](#5-lessons)
6. [Orders（注文）](#6-orders)
7. [Order_Items（注文明細）](#7-order_items)
8. [Reviews（レビュー）](#8-reviews)

---

## 1. Categories（カテゴリ）

### 基本情報
- **コレクション名**: `categories`
- **表示名**: Categories
- **アイコン**: `folder`
- **説明**: 商品・コンテンツの分類カテゴリ

### フィールド定義

#### 1.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)
- **必須**: Yes
- **ユニーク**: Yes
- **説明**: 自動生成されるカテゴリID

#### 1.2 name（カテゴリ名）
- **フィールド名**: `name`
- **型**: String
- **Interface**: Input
- **必須**: Yes
- **最大文字数**: 100
- **説明**: カテゴリの表示名（例: 電子機器、衣類、食品）

#### 1.3 slug（URLスラッグ）
- **フィールド名**: `slug`
- **型**: String
- **Interface**: Input (slug template)
- **必須**: Yes
- **ユニーク**: Yes
- **Template**: `{{name}}`（nameから自動生成）
- **説明**: URL用のスラッグ（例: electronics, clothing）

#### 1.4 description（説明）
- **フィールド名**: `description`
- **型**: Text
- **Interface**: Textarea
- **必須**: No
- **説明**: カテゴリの詳細説明

#### 1.5 icon（アイコン）
- **フィールド名**: `icon`
- **型**: String
- **Interface**: Select Icon
- **必須**: No
- **デフォルト**: `category`
- **説明**: Material Iconsからアイコンを選択

#### 1.6 color（カラー）
- **フィールド名**: `color`
- **型**: String
- **Interface**: Color Picker
- **必須**: No
- **デフォルト**: `#6644FF`
- **説明**: カテゴリのテーマカラー

#### 1.7 parent_category（親カテゴリ）
- **フィールド名**: `parent_category`
- **型**: Many-to-One Relationship
- **Related Collection**: `categories`
- **必須**: No
- **説明**: 階層構造を作るための親カテゴリ参照

#### 1.8 sort_order（表示順）
- **フィールド名**: `sort_order`
- **型**: Integer
- **Interface**: Input
- **必須**: No
- **デフォルト**: 0
- **説明**: 表示順序（小さい値が先頭）

#### 1.9 status（ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `published`
- **選択肢**:
  - `published` - 公開
  - `draft` - 下書き
  - `archived` - アーカイブ

#### 1.10 created_at（作成日時）
- **フィールド名**: `date_created`
- **型**: Timestamp
- **Interface**: Datetime
- **必須**: No
- **特殊**: Directus自動管理フィールド

#### 1.11 updated_at（更新日時）
- **フィールド名**: `date_updated`
- **型**: Timestamp
- **Interface**: Datetime
- **必須**: No
- **特殊**: Directus自動管理フィールド

---

## 2. Products（商品）

### 基本情報
- **コレクション名**: `products`
- **表示名**: Products
- **アイコン**: `shopping_cart`
- **説明**: EC商品カタログ

### フィールド定義

#### 2.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)
- **必須**: Yes
- **ユニーク**: Yes

#### 2.2 name（商品名）
- **フィールド名**: `name`
- **型**: String
- **Interface**: Input
- **必須**: Yes
- **最大文字数**: 200
- **説明**: 商品の正式名称

#### 2.3 slug（URLスラッグ）
- **フィールド名**: `slug`
- **型**: String
- **Interface**: Input (slug template)
- **必須**: Yes
- **ユニーク**: Yes
- **Template**: `{{name}}`

#### 2.4 short_description（短い説明）
- **フィールド名**: `short_description`
- **型**: Text
- **Interface**: Textarea
- **必須**: No
- **最大文字数**: 300
- **説明**: 一覧ページ用の短い説明文

#### 2.5 description（詳細説明）
- **フィールド名**: `description`
- **型**: Text
- **Interface**: WYSIWYG Editor
- **必須**: No
- **説明**: 商品の詳細説明（HTMLリッチテキスト）

#### 2.6 price（価格）
- **フィールド名**: `price`
- **型**: Decimal
- **Interface**: Input (number)
- **必須**: Yes
- **デフォルト**: 0
- **精度**: 10,2（小数点2桁）
- **説明**: 通常価格（円）

#### 2.7 sale_price（セール価格）
- **フィールド名**: `sale_price`
- **型**: Decimal
- **Interface**: Input (number)
- **必須**: No
- **精度**: 10,2
- **説明**: セール価格（設定時はこちらを表示）

#### 2.8 sku（商品コード）
- **フィールド名**: `sku`
- **型**: String
- **Interface**: Input
- **必須**: Yes
- **ユニーク**: Yes
- **最大文字数**: 50
- **説明**: 在庫管理用の商品コード（例: PROD-001）

#### 2.9 stock（在庫数）
- **フィールド名**: `stock`
- **型**: Integer
- **Interface**: Input (number)
- **必須**: Yes
- **デフォルト**: 0
- **説明**: 現在の在庫数

#### 2.10 images（商品画像）
- **フィールド名**: `images`
- **型**: Many-to-Many Relationship (Files)
- **Interface**: Files
- **Junction Collection**: `products_files`（自動作成）
- **必須**: No
- **説明**: 商品画像（複数アップロード可能）

#### 2.11 category（カテゴリ）
- **フィールド名**: `category`
- **型**: Many-to-One Relationship
- **Related Collection**: `categories`
- **Interface**: Dropdown
- **必須**: No
- **説明**: 所属カテゴリ

#### 2.12 featured（おすすめ）
- **フィールド名**: `featured`
- **型**: Boolean
- **Interface**: Toggle
- **必須**: No
- **デフォルト**: false
- **説明**: トップページのおすすめ商品に表示

#### 2.13 status（ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `draft`
- **選択肢**:
  - `published` - 公開
  - `draft` - 下書き
  - `archived` - アーカイブ

#### 2.14 meta_title（SEOタイトル）
- **フィールド名**: `meta_title`
- **型**: String
- **Interface**: Input
- **必須**: No
- **最大文字数**: 60
- **説明**: 検索エンジン用のタイトル

#### 2.15 meta_description（SEO説明）
- **フィールド名**: `meta_description`
- **型**: Text
- **Interface**: Textarea
- **必須**: No
- **最大文字数**: 160
- **説明**: 検索エンジン用の説明文

#### 2.16 date_created / date_updated
- Directus自動管理フィールド

---

## 3. Content（コンテンツ・記事）

### 基本情報
- **コレクション名**: `content`
- **表示名**: Content
- **アイコン**: `article`
- **説明**: ブログ記事、ニュース、お知らせ

### フィールド定義

#### 3.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)
- **必須**: Yes

#### 3.2 title（タイトル）
- **フィールド名**: `title`
- **型**: String
- **Interface**: Input
- **必須**: Yes
- **最大文字数**: 200

#### 3.3 slug（URLスラッグ）
- **フィールド名**: `slug`
- **型**: String
- **Interface**: Input (slug template)
- **必須**: Yes
- **ユニーク**: Yes
- **Template**: `{{title}}`

#### 3.4 excerpt（抜粋）
- **フィールド名**: `excerpt`
- **型**: Text
- **Interface**: Textarea
- **必須**: No
- **最大文字数**: 500
- **説明**: 記事の要約（一覧ページ用）

#### 3.5 body（本文）
- **フィールド名**: `body`
- **型**: Text
- **Interface**: WYSIWYG Editor
- **必須**: Yes
- **説明**: 記事の本文（HTMLリッチテキスト）

#### 3.6 featured_image（アイキャッチ画像）
- **フィールド名**: `featured_image`
- **型**: Many-to-One Relationship (Files)
- **Interface**: Image
- **必須**: No
- **説明**: 記事のアイキャッチ画像

#### 3.7 category（カテゴリ）
- **フィールド名**: `category`
- **型**: Many-to-One Relationship
- **Related Collection**: `categories`
- **Interface**: Dropdown
- **必須**: No

#### 3.8 author（著者）
- **フィールド名**: `author`
- **型**: Many-to-One Relationship
- **Related Collection**: `directus_users`
- **Interface**: User Dropdown
- **必須**: Yes
- **説明**: 記事の著者（ユーザー）

#### 3.9 tags（タグ）
- **フィールド名**: `tags`
- **型**: JSON
- **Interface**: Tags
- **必須**: No
- **説明**: 記事のタグ（複数指定可能）

#### 3.10 views（閲覧数）
- **フィールド名**: `views`
- **型**: Integer
- **Interface**: Input (number, readonly)
- **必須**: No
- **デフォルト**: 0
- **説明**: 記事の閲覧回数（自動カウント）

#### 3.11 featured（注目記事）
- **フィールド名**: `featured`
- **型**: Boolean
- **Interface**: Toggle
- **必須**: No
- **デフォルト**: false

#### 3.12 status（ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `draft`
- **選択肢**:
  - `published` - 公開
  - `draft` - 下書き
  - `scheduled` - 予約投稿

#### 3.13 published_at（公開日時）
- **フィールド名**: `published_at`
- **型**: Timestamp
- **Interface**: Datetime
- **必須**: No
- **説明**: 記事の公開日時

#### 3.14 meta_title / meta_description
- SEO用フィールド（Productsと同様）

---

## 4. Courses（コース）

### 基本情報
- **コレクション名**: `courses`
- **表示名**: Courses
- **アイコン**: `school`
- **説明**: E-Learning学習コース

### フィールド定義

#### 4.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)

#### 4.2 title（コースタイトル）
- **フィールド名**: `title`
- **型**: String
- **Interface**: Input
- **必須**: Yes
- **最大文字数**: 200

#### 4.3 slug（URLスラッグ）
- **フィールド名**: `slug`
- **型**: String
- **Interface**: Input (slug template)
- **必須**: Yes
- **ユニーク**: Yes
- **Template**: `{{title}}`

#### 4.4 description（説明）
- **フィールド名**: `description`
- **型**: Text
- **Interface**: WYSIWYG Editor
- **必須**: Yes
- **説明**: コースの詳細説明

#### 4.5 thumbnail（サムネイル）
- **フィールド名**: `thumbnail`
- **型**: Many-to-One Relationship (Files)
- **Interface**: Image
- **必須**: No
- **説明**: コースのサムネイル画像

#### 4.6 instructor（講師）
- **フィールド名**: `instructor`
- **型**: Many-to-One Relationship
- **Related Collection**: `directus_users`
- **Interface**: User Dropdown
- **必須**: Yes
- **説明**: コースの講師

#### 4.7 level（レベル）
- **フィールド名**: `level`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `beginner`
- **選択肢**:
  - `beginner` - 初級
  - `intermediate` - 中級
  - `advanced` - 上級

#### 4.8 duration（所要時間）
- **フィールド名**: `duration`
- **型**: Integer
- **Interface**: Input (number)
- **必須**: No
- **説明**: 推定所要時間（分）

#### 4.9 price（価格）
- **フィールド名**: `price`
- **型**: Decimal
- **Interface**: Input (number)
- **必須**: Yes
- **デフォルト**: 0
- **精度**: 10,2
- **説明**: コース価格（0=無料）

#### 4.10 featured（おすすめ）
- **フィールド名**: `featured`
- **型**: Boolean
- **Interface**: Toggle
- **必須**: No
- **デフォルト**: false

#### 4.11 status（ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `draft`
- **選択肢**:
  - `published` - 公開
  - `draft` - 下書き

#### 4.12 enrollment_count（受講者数）
- **フィールド名**: `enrollment_count`
- **型**: Integer
- **Interface**: Input (number, readonly)
- **必須**: No
- **デフォルト**: 0

#### 4.13 rating_average（平均評価）
- **フィールド名**: `rating_average`
- **型**: Decimal
- **Interface**: Input (number, readonly)
- **必須**: No
- **デフォルト**: 0
- **精度**: 3,2（1.00 - 5.00）

---

## 5. Lessons（レッスン）

### 基本情報
- **コレクション名**: `lessons`
- **表示名**: Lessons
- **アイコン**: `video_library`
- **説明**: コース内のレッスン・教材

### フィールド定義

#### 5.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)

#### 5.2 title（レッスンタイトル）
- **フィールド名**: `title`
- **型**: String
- **Interface**: Input
- **必須**: Yes
- **最大文字数**: 200

#### 5.3 slug（URLスラッグ）
- **フィールド名**: `slug`
- **型**: String
- **Interface**: Input (slug template)
- **必須**: Yes
- **Template**: `{{title}}`

#### 5.4 course（所属コース）
- **フィールド名**: `course`
- **型**: Many-to-One Relationship
- **Related Collection**: `courses`
- **Interface**: Dropdown
- **必須**: Yes
- **説明**: このレッスンが属するコース

#### 5.5 content（レッスン内容）
- **フィールド名**: `content`
- **型**: Text
- **Interface**: WYSIWYG Editor
- **必須**: Yes
- **説明**: レッスンの説明・テキスト内容

#### 5.6 video_url（動画URL）
- **フィールド名**: `video_url`
- **型**: String
- **Interface**: Input
- **必須**: No
- **説明**: YouTube、Vimeo等の動画URL

#### 5.7 duration（動画時間）
- **フィールド名**: `duration`
- **型**: Integer
- **Interface**: Input (number)
- **必須**: No
- **説明**: 動画の長さ（分）

#### 5.8 order（表示順）
- **フィールド名**: `order`
- **型**: Integer
- **Interface**: Input (number)
- **必須**: Yes
- **デフォルト**: 1
- **説明**: コース内での表示順序

#### 5.9 is_preview（プレビュー可能）
- **フィールド名**: `is_preview`
- **型**: Boolean
- **Interface**: Toggle
- **必須**: No
- **デフォルト**: false
- **説明**: 未購入者でもプレビュー可能

#### 5.10 status（ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `draft`
- **選択肢**:
  - `published` - 公開
  - `draft` - 下書き

---

## 6. Orders（注文）

### 基本情報
- **コレクション名**: `orders`
- **表示名**: Orders
- **アイコン**: `receipt`
- **説明**: EC注文管理

### フィールド定義

#### 6.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)

#### 6.2 order_number（注文番号）
- **フィールド名**: `order_number`
- **型**: String
- **Interface**: Input (readonly)
- **必須**: Yes
- **ユニーク**: Yes
- **説明**: 自動生成される注文番号（例: ORD-20251023-001）

#### 6.3 user（注文者）
- **フィールド名**: `user`
- **型**: Many-to-One Relationship
- **Related Collection**: `directus_users`
- **Interface**: User Dropdown
- **必須**: Yes
- **説明**: 注文したユーザー

#### 6.4 status（注文ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `pending`
- **選択肢**:
  - `pending` - 保留中
  - `processing` - 処理中
  - `shipped` - 発送済み
  - `completed` - 完了
  - `cancelled` - キャンセル

#### 6.5 total_amount（合計金額）
- **フィールド名**: `total_amount`
- **型**: Decimal
- **Interface**: Input (number, readonly)
- **必須**: Yes
- **精度**: 10,2
- **説明**: 注文合計金額（自動計算）

#### 6.6 shipping_address（配送先住所）
- **フィールド名**: `shipping_address`
- **型**: JSON
- **Interface**: Code (JSON)
- **必須**: Yes
- **説明**: 配送先住所（JSON形式）
- **例**:
```json
{
  "name": "山田太郎",
  "postal_code": "100-0001",
  "address1": "東京都千代田区千代田1-1",
  "address2": "マンション101号室",
  "phone": "03-1234-5678"
}
```

#### 6.7 billing_address（請求先住所）
- **フィールド名**: `billing_address`
- **型**: JSON
- **Interface**: Code (JSON)
- **必須**: No
- **説明**: 請求先住所（配送先と同じ場合は空）

#### 6.8 payment_method（支払方法）
- **フィールド名**: `payment_method`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **選択肢**:
  - `credit_card` - クレジットカード
  - `bank_transfer` - 銀行振込
  - `cash_on_delivery` - 代金引換

#### 6.9 payment_status（支払ステータス）
- **フィールド名**: `payment_status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `pending`
- **選択肢**:
  - `pending` - 支払待ち
  - `paid` - 支払済み
  - `failed` - 失敗

#### 6.10 notes（備考）
- **フィールド名**: `notes`
- **型**: Text
- **Interface**: Textarea
- **必須**: No
- **説明**: 注文に関する備考・特記事項

---

## 7. Order_Items（注文明細）

### 基本情報
- **コレクション名**: `order_items`
- **表示名**: Order Items
- **アイコン**: `list`
- **説明**: 注文内の商品明細

### フィールド定義

#### 7.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)

#### 7.2 order（所属注文）
- **フィールド名**: `order`
- **型**: Many-to-One Relationship
- **Related Collection**: `orders`
- **Interface**: Dropdown
- **必須**: Yes
- **説明**: この明細が属する注文

#### 7.3 product（商品）
- **フィールド名**: `product`
- **型**: Many-to-One Relationship
- **Related Collection**: `products`
- **Interface**: Dropdown
- **必須**: Yes
- **説明**: 注文された商品

#### 7.4 quantity（数量）
- **フィールド名**: `quantity`
- **型**: Integer
- **Interface**: Input (number)
- **必須**: Yes
- **デフォルト**: 1
- **最小値**: 1
- **説明**: 注文数量

#### 7.5 unit_price（単価）
- **フィールド名**: `unit_price`
- **型**: Decimal
- **Interface**: Input (number)
- **必須**: Yes
- **精度**: 10,2
- **説明**: 購入時の単価（価格変動に対応）

#### 7.6 total_price（小計）
- **フィールド名**: `total_price`
- **型**: Decimal
- **Interface**: Input (number, readonly)
- **必須**: Yes
- **精度**: 10,2
- **説明**: 小計（unit_price × quantity）

---

## 8. Reviews（レビュー・評価）

### 基本情報
- **コレクション名**: `reviews`
- **表示名**: Reviews
- **アイコン**: `star`
- **説明**: 商品・コースのレビュー

### フィールド定義

#### 8.1 id（主キー）
- **フィールド名**: `id`
- **型**: Integer (Auto Increment)

#### 8.2 user（投稿者）
- **フィールド名**: `user`
- **型**: Many-to-One Relationship
- **Related Collection**: `directus_users`
- **Interface**: User Dropdown
- **必須**: Yes
- **説明**: レビューを投稿したユーザー

#### 8.3 product（商品）
- **フィールド名**: `product`
- **型**: Many-to-One Relationship
- **Related Collection**: `products`
- **Interface**: Dropdown
- **必須**: No
- **説明**: レビュー対象の商品（商品レビューの場合）

#### 8.4 course（コース）
- **フィールド名**: `course`
- **型**: Many-to-One Relationship
- **Related Collection**: `courses`
- **Interface**: Dropdown
- **必須**: No
- **説明**: レビュー対象のコース（コースレビューの場合）

**注**: product と course は、どちらか一方が必須

#### 8.5 rating（評価）
- **フィールド名**: `rating`
- **型**: Integer
- **Interface**: Slider
- **必須**: Yes
- **最小値**: 1
- **最大値**: 5
- **説明**: 星評価（1-5）

#### 8.6 title（レビュータイトル）
- **フィールド名**: `title`
- **型**: String
- **Interface**: Input
- **必須**: No
- **最大文字数**: 100
- **説明**: レビューのタイトル

#### 8.7 comment（コメント）
- **フィールド名**: `comment`
- **型**: Text
- **Interface**: Textarea
- **必須**: Yes
- **説明**: レビューの本文

#### 8.8 helpful_count（役立ったカウント）
- **フィールド名**: `helpful_count`
- **型**: Integer
- **Interface**: Input (number, readonly)
- **必須**: No
- **デフォルト**: 0
- **説明**: 「役に立った」ボタンのカウント

#### 8.9 status（ステータス）
- **フィールド名**: `status`
- **型**: String
- **Interface**: Dropdown
- **必須**: Yes
- **デフォルト**: `pending`
- **選択肢**:
  - `published` - 公開
  - `pending` - 承認待ち
  - `rejected` - 却下

---

## 📝 作成順序の推奨

コレクションの依存関係を考慮した作成順序：

1. **Categories** - 他のコレクションから参照される基本データ
2. **Products** - Categories を参照
3. **Content** - Categories を参照
4. **Courses** - 独立したコレクション
5. **Lessons** - Courses を参照
6. **Orders** - Users を参照
7. **Order_Items** - Orders と Products を参照
8. **Reviews** - Users、Products、Courses を参照

---

## 🔧 設定のヒント

### Directus管理画面での作成手順
1. Settings → Data Model → Create Collection
2. コレクション名と設定を入力
3. フィールドを順番に追加
4. リレーションフィールドは関連コレクション作成後に設定

### インターフェースの選択
- 短いテキスト: Input
- 長いテキスト: Textarea
- リッチテキスト: WYSIWYG Editor
- 数値: Input (number)
- 日時: Datetime
- 画像: Image / Files
- 選択肢: Dropdown
- ON/OFF: Toggle
- 関連データ: Many-to-One / Many-to-Many

---

**作成日**: 2025-10-23
**最終更新**: 2025-10-23
