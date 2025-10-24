# dash2 治療・医療系プラットフォーム データベース設計書

## 🎯 プラットフォーム概要

### 3つのサイト構成
1. **公開サイト（パブリック）** - 一般向け情報発信
2. **会員サイト（治療家・セラピスト向け）** - 学習・コミュニティ
3. **患者サイト（患者向け）** - カルテ管理

### 商品管理
- 自社商品の管理
- 競合商品の分析・比較

---

## 📊 全体構造図

```
公開サイト
├── public_articles (ブログ記事)
└── public_faq (FAQ)

会員サイト（治療家向け）
├── members_therapists (治療家プロフィール)
├── members_courses (コース)
└── members_enrollments (受講状況)

患者サイト
└── patients_records (カルテ)

商品管理
├── products_internal (自社商品)
├── products_competitor (競合商品)
└── products_reviews (レビュー)

共通
└── categories (カテゴリ)
```

---

## 📋 コレクション詳細定義

### 1. 🏷️ categories（カテゴリ）

**用途**: 記事、FAQ、商品、コースなどの分類管理

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | カテゴリID |
| name | String (100) | ✅ | カテゴリ名（例: インソール療法、栄養学） |
| slug | String (100) | ✅ | URLスラッグ（auto: name） |
| type | Dropdown | ✅ | カテゴリ種別 |
| description | Text | ❌ | カテゴリ説明 |
| parent_category | Many-to-One (self) | ❌ | 親カテゴリ（階層構造用） |
| icon | Select Icon | ❌ | アイコン |
| color | Color | ❌ | テーマカラー |
| sort_order | Integer | ❌ | 表示順（デフォルト: 0） |
| status | Dropdown | ✅ | published / draft |

**type（カテゴリ種別）の選択肢**:
- `article` - 記事用
- `faq` - FAQ用
- `product` - 商品用
- `course` - コース用

**リレーション**:
- public_articles (One-to-Many)
- public_faq (One-to-Many)
- products_internal (One-to-Many)
- products_competitor (One-to-Many)
- members_courses (One-to-Many)

---

### 2. 📝 public_articles（公開ブログ記事）

**用途**: 一般向けブログ・お知らせ記事

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 記事ID |
| title | String (200) | ✅ | 記事タイトル |
| slug | String (200) | ✅ | URLスラッグ（auto: title） |
| excerpt | Text (500) | ❌ | 抜粋・要約 |
| body | WYSIWYG | ✅ | 本文（リッチテキスト） |
| featured_image | File (Image) | ❌ | アイキャッチ画像 |
| category | Many-to-One | ❌ | カテゴリ（categories） |
| author | Many-to-One | ✅ | 著者（directus_users） |
| tags | Tags (JSON) | ❌ | タグ（複数指定可能） |
| views | Integer | ❌ | 閲覧数（デフォルト: 0） |
| featured | Boolean | ❌ | 注目記事フラグ |
| status | Dropdown | ✅ | published / draft / scheduled |
| published_at | Timestamp | ❌ | 公開日時 |
| meta_title | String (60) | ❌ | SEOタイトル |
| meta_description | Text (160) | ❌ | SEO説明 |

**status の選択肢**:
- `published` - 公開済み
- `draft` - 下書き
- `scheduled` - 予約投稿

---

### 3. ❓ public_faq（公開FAQ）

**用途**: よくある質問と回答

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | FAQ ID |
| question | String (300) | ✅ | 質問 |
| answer | WYSIWYG | ✅ | 回答（リッチテキスト） |
| category | Many-to-One | ❌ | カテゴリ（categories） |
| sort_order | Integer | ❌ | 表示順（デフォルト: 0） |
| helpful_count | Integer | ❌ | 役立ったカウント（デフォルト: 0） |
| views | Integer | ❌ | 閲覧数（デフォルト: 0） |
| status | Dropdown | ✅ | published / draft |

**例**:
- 質問: 「初めての方でも受講できますか？」
- 回答: 「はい、初心者向けのコースもご用意しております...」

---

### 4. 👨‍⚕️ members_therapists（治療家プロフィール）

**用途**: 治療家・セラピストの詳細情報

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 治療家ID |
| user | Many-to-One | ✅ | ユーザーアカウント（directus_users） |
| display_name | String (100) | ✅ | 表示名 |
| specialty | Dropdown | ✅ | 専門分野 |
| bio | Text | ❌ | 自己紹介・経歴 |
| profile_image | File (Image) | ❌ | プロフィール画像 |
| certifications | JSON | ❌ | 保有資格（配列） |
| clinic_name | String (200) | ❌ | 所属クリニック名 |
| clinic_address | JSON | ❌ | クリニック住所 |
| website | String (200) | ❌ | ウェブサイトURL |
| social_links | JSON | ❌ | SNSリンク（Twitter, Facebook等） |
| years_experience | Integer | ❌ | 実務経験年数 |
| rating_average | Decimal (3,2) | ❌ | 平均評価（1.00-5.00） |
| total_students | Integer | ❌ | 指導した生徒数 |
| status | Dropdown | ✅ | active / pending / suspended |
| verified | Boolean | ❌ | 認証済みフラグ |

**specialty（専門分野）の選択肢**:
- `orthopedics` - 整形外科
- `sports_medicine` - スポーツ医学
- `rehabilitation` - リハビリテーション
- `acupuncture` - 鍼灸
- `chiropractic` - カイロプラクティック
- `other` - その他

**certifications の例**:
```json
[
  "理学療法士",
  "認定インソール療法士",
  "スポーツトレーナー"
]
```

**clinic_address の例**:
```json
{
  "postal_code": "100-0001",
  "prefecture": "東京都",
  "city": "千代田区",
  "address": "千代田1-1-1",
  "building": "メディカルビル3F"
}
```

**リレーション**:
- directus_users (Many-to-One) - ユーザーアカウント
- members_courses (One-to-Many) - 講師として担当するコース

---

### 5. 🎓 members_courses（コース情報）

**用途**: 治療家向け学習コース

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | コースID |
| title | String (200) | ✅ | コースタイトル |
| slug | String (200) | ✅ | URLスラッグ（auto: title） |
| description | WYSIWYG | ✅ | コース説明 |
| thumbnail | File (Image) | ❌ | サムネイル画像 |
| instructor | Many-to-One | ✅ | 講師（members_therapists） |
| category | Many-to-One | ❌ | カテゴリ（categories） |
| level | Dropdown | ✅ | レベル |
| duration | Integer | ❌ | 推定所要時間（分） |
| lesson_count | Integer | ❌ | レッスン数 |
| price | Decimal (10,2) | ✅ | 価格（円、0=無料） |
| discount_price | Decimal (10,2) | ❌ | 割引価格 |
| syllabus | JSON | ❌ | シラバス（学習内容） |
| requirements | Text | ❌ | 受講条件 |
| learning_objectives | JSON | ❌ | 学習目標（配列） |
| featured | Boolean | ❌ | おすすめコース |
| enrollment_count | Integer | ❌ | 受講者数（デフォルト: 0） |
| rating_average | Decimal (3,2) | ❌ | 平均評価 |
| status | Dropdown | ✅ | published / draft |

**level（レベル）の選択肢**:
- `beginner` - 初級
- `intermediate` - 中級
- `advanced` - 上級
- `all` - 全レベル

**learning_objectives の例**:
```json
[
  "インソール療法の基礎を理解する",
  "足型測定の正確な方法を習得する",
  "患者への適切な処方ができる"
]
```

**リレーション**:
- members_therapists (Many-to-One) - 講師
- members_enrollments (One-to-Many) - 受講状況

---

### 6. 📚 members_enrollments（受講状況）

**用途**: 治療家のコース受講進捗管理

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 受講ID |
| user | Many-to-One | ✅ | 受講者（directus_users） |
| course | Many-to-One | ✅ | コース（members_courses） |
| enrolled_at | Timestamp | ✅ | 受講開始日時 |
| completed_at | Timestamp | ❌ | 完了日時 |
| progress | Integer | ❌ | 進捗率（0-100%） |
| last_accessed_at | Timestamp | ❌ | 最終アクセス日時 |
| status | Dropdown | ✅ | ステータス |
| certificate_issued | Boolean | ❌ | 修了証発行済みフラグ |
| notes | Text | ❌ | メモ・備考 |

**status の選択肢**:
- `in_progress` - 受講中
- `completed` - 完了
- `paused` - 中断中
- `cancelled` - キャンセル

**リレーション**:
- directus_users (Many-to-One) - 受講者
- members_courses (Many-to-One) - コース

---

### 7. 📋 patients_records（患者カルテ）

**用途**: 患者の診療記録・カルテ情報

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | カルテID |
| patient_user | Many-to-One | ✅ | 患者アカウント（directus_users） |
| therapist | Many-to-One | ✅ | 担当治療家（members_therapists） |
| visit_date | Date | ✅ | 来院日 |
| visit_number | Integer | ✅ | 来院回数 |
| chief_complaint | Text | ✅ | 主訴（患者の訴え） |
| symptoms | JSON | ❌ | 症状リスト |
| diagnosis | Text | ❌ | 診断 |
| treatment | WYSIWYG | ✅ | 実施した治療内容 |
| prescription | JSON | ❌ | 処方（インソール、運動療法等） |
| progress_notes | Text | ❌ | 経過記録 |
| next_visit_date | Date | ❌ | 次回来院予定日 |
| attachments | Files | ❌ | 添付ファイル（画像、資料等） |
| status | Dropdown | ✅ | active / completed / archived |
| is_confidential | Boolean | ✅ | 機密情報フラグ |

**symptoms の例**:
```json
[
  "腰痛",
  "左膝の痛み",
  "歩行時の違和感"
]
```

**prescription の例**:
```json
{
  "insole": {
    "type": "カスタムインソール",
    "model": "スポーツタイプA",
    "notes": "アーチサポート強化"
  },
  "exercise": [
    "ストレッチ 1日3回",
    "筋力トレーニング 週3回"
  ],
  "follow_up": "2週間後に再診"
}
```

**セキュリティ重要事項**:
- このコレクションは**最高レベルのアクセス制限**が必要
- 患者本人と担当治療家のみ閲覧可能
- 管理者権限でも慎重な取り扱いが必要
- `is_confidential` フラグで機密度を管理

**リレーション**:
- directus_users (Many-to-One) - 患者
- members_therapists (Many-to-One) - 担当治療家

---

### 8. 🏢 products_internal（自社商品）

**用途**: 自社が販売する商品の管理

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 商品ID |
| name | String (200) | ✅ | 商品名 |
| slug | String (200) | ✅ | URLスラッグ（auto: name） |
| sku | String (50) | ✅ | 商品コード（ユニーク） |
| category | Many-to-One | ❌ | カテゴリ（categories） |
| short_description | Text (300) | ❌ | 短い説明 |
| description | WYSIWYG | ✅ | 詳細説明 |
| features | JSON | ❌ | 特徴リスト |
| specifications | JSON | ❌ | 仕様・スペック |
| images | Files | ❌ | 商品画像（複数） |
| price | Decimal (10,2) | ✅ | 価格（円） |
| sale_price | Decimal (10,2) | ❌ | セール価格 |
| cost | Decimal (10,2) | ❌ | 仕入れ原価 |
| stock | Integer | ✅ | 在庫数 |
| stock_status | Dropdown | ✅ | 在庫ステータス |
| manufacturer | String (100) | ❌ | 製造元 |
| supplier | String (100) | ❌ | 仕入先 |
| featured | Boolean | ❌ | おすすめ商品 |
| status | Dropdown | ✅ | published / draft / discontinued |
| meta_title | String (60) | ❌ | SEOタイトル |
| meta_description | Text (160) | ❌ | SEO説明 |

**stock_status（在庫ステータス）の選択肢**:
- `in_stock` - 在庫あり
- `low_stock` - 在庫少（再発注推奨）
- `out_of_stock` - 在庫切れ
- `pre_order` - 予約受付中

**features の例**:
```json
[
  "医療用素材使用",
  "抗菌・防臭加工",
  "日本製",
  "カスタマイズ可能"
]
```

**specifications の例**:
```json
{
  "サイズ": "S / M / L",
  "素材": "EVA樹脂、ポリエステル",
  "重量": "約50g（片足）",
  "耐久性": "約1年",
  "対応シューズ": "スニーカー、ビジネスシューズ"
}
```

**リレーション**:
- products_reviews (One-to-Many) - レビュー

---

### 9. 🔍 products_competitor（競合商品）

**用途**: 競合他社商品の分析・比較

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 商品ID |
| name | String (200) | ✅ | 商品名 |
| manufacturer | String (100) | ✅ | 製造元・ブランド |
| category | Many-to-One | ❌ | カテゴリ（categories） |
| description | WYSIWYG | ❌ | 商品説明 |
| images | Files | ❌ | 商品画像 |
| price | Decimal (10,2) | ❌ | 市場価格（円） |
| features | JSON | ❌ | 特徴リスト |
| strengths | JSON | ❌ | 強み |
| weaknesses | JSON | ❌ | 弱み |
| specifications | JSON | ❌ | 仕様・スペック |
| target_market | Text | ❌ | ターゲット市場 |
| market_share | Decimal (5,2) | ❌ | 市場シェア（%） |
| website_url | String (200) | ❌ | 公式サイトURL |
| purchase_url | String (200) | ❌ | 購入先URL |
| notes | Text | ❌ | 分析メモ |
| status | Dropdown | ✅ | active / discontinued / monitoring |

**strengths の例**:
```json
[
  "価格が安い",
  "軽量設計",
  "有名ブランド"
]
```

**weaknesses の例**:
```json
[
  "耐久性が低い",
  "サイズ展開が少ない",
  "カスタマイズ不可"
]
```

**用途**:
- 市場調査・競合分析
- 自社商品との比較資料作成
- マーケティング戦略立案

**リレーション**:
- products_reviews (One-to-Many) - レビュー

---

### 10. ⭐ products_reviews（商品レビュー）

**用途**: 自社商品・競合商品のレビュー

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | レビューID |
| user | Many-to-One | ✅ | 投稿者（directus_users） |
| product_internal | Many-to-One | ❌ | 自社商品（products_internal） |
| product_competitor | Many-to-One | ❌ | 競合商品（products_competitor） |
| rating | Integer (1-5) | ✅ | 評価（1-5星） |
| title | String (100) | ❌ | レビュータイトル |
| comment | Text | ✅ | コメント |
| pros | JSON | ❌ | 良い点 |
| cons | JSON | ❌ | 悪い点 |
| verified_purchase | Boolean | ❌ | 購入確認済み |
| helpful_count | Integer | ❌ | 役立ったカウント |
| images | Files | ❌ | レビュー画像 |
| status | Dropdown | ✅ | published / pending / rejected |

**注意**: product_internal と product_competitor は、**どちらか一方が必須**

**pros（良い点）の例**:
```json
[
  "装着感が快適",
  "効果を実感できた",
  "コストパフォーマンスが良い"
]
```

**cons（悪い点）の例**:
```json
[
  "サイズ選びが難しい",
  "価格がやや高い"
]
```

**リレーション**:
- directus_users (Many-to-One) - 投稿者
- products_internal (Many-to-One) - 自社商品
- products_competitor (Many-to-One) - 競合商品

---

## 🔗 リレーション図

### 公開サイト
```
categories (1) ──→ (Many) public_articles
categories (1) ──→ (Many) public_faq

directus_users (1) ──→ (Many) public_articles (as author)
```

### 会員サイト
```
directus_users (1) ──→ (1) members_therapists
members_therapists (1) ──→ (Many) members_courses (as instructor)

categories (1) ──→ (Many) members_courses

directus_users (Many) ←→ (Many) members_courses
  ↳ 中間テーブル: members_enrollments
```

### 患者サイト
```
directus_users (1) ──→ (Many) patients_records (as patient)
members_therapists (1) ──→ (Many) patients_records (as therapist)
```

### 商品管理
```
categories (1) ──→ (Many) products_internal
categories (1) ──→ (Many) products_competitor

products_internal (1) ──→ (Many) products_reviews
products_competitor (1) ──→ (Many) products_reviews

directus_users (1) ──→ (Many) products_reviews (as reviewer)
```

---

## 🔐 アクセス権限設計

### ロール定義

| ロール | 説明 | アクセス範囲 |
|--------|------|-------------|
| **Administrator** | システム管理者 | 全コレクション フルアクセス |
| **Therapist** | 治療家会員 | 会員サイト、患者カルテ（担当分のみ） |
| **Patient** | 患者 | 自分のカルテのみ閲覧可能 |
| **Public** | 一般ユーザー | 公開サイトのみ閲覧 |

### コレクション別アクセス権限

| コレクション | Public | Patient | Therapist | Admin |
|-------------|--------|---------|-----------|-------|
| public_articles | 読取 | 読取 | 読取・作成 | フル |
| public_faq | 読取 | 読取 | 読取 | フル |
| members_therapists | 読取 | 読取 | 自分のみ編集 | フル |
| members_courses | 一部読取 | 一部読取 | 読取・作成 | フル |
| members_enrollments | ❌ | 自分のみ | 自分のみ | フル |
| patients_records | ❌ | 自分のみ | 担当分のみ | フル |
| products_internal | 読取 | 読取 | 読取 | フル |
| products_competitor | ❌ | ❌ | 読取 | フル |
| products_reviews | 読取 | 読取・作成 | 読取・作成 | フル |

**重要**: `patients_records`（カルテ）は最高レベルのセキュリティで保護

---

## 📝 作成順序

依存関係を考慮した推奨作成順序：

1. **categories** - 他のコレクションから参照される基本データ
2. **members_therapists** - ユーザーと紐づく治療家情報
3. **public_articles** - 公開記事
4. **public_faq** - 公開FAQ
5. **members_courses** - コース情報（therapistsを参照）
6. **members_enrollments** - 受講状況（courses、usersを参照）
7. **patients_records** - カルテ（therapistsを参照）
8. **products_internal** - 自社商品
9. **products_competitor** - 競合商品
10. **products_reviews** - レビュー（productsを参照）

---

## 🚀 次のステップ

1. **Directus管理画面でコレクション作成**
   - 上記の順序で1つずつ作成
   - フィールド定義に従って設定

2. **リレーション設定**
   - Many-to-One関係を設定
   - Junction Collection（中間テーブル）を作成

3. **権限設定**
   - ロールを定義
   - アクセス権限を設定

4. **サンプルデータ投入**
   - 動作確認用データを作成

---

**作成日**: 2025-10-23
**最終更新**: 2025-10-23
**ステータス**: 設計完了 - 実装準備完了
