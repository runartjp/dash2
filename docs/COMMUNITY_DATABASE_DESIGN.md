# コミュニティ機能 データベース設計書

## 🎯 要件

治療家・医療従事者向けのコミュニティ機能を実装。以下の機能を提供：

1. ✅ 会員情報の変更
2. ✅ タイムラインへの書き込み
3. ✅ いいね機能
4. ✅ 返信（コメント）機能
5. ✅ メンション通知
6. ✅ プロフィール画像登録
7. ✅ ユーザー情報の公開/非公開設定

---

## 📊 新規コレクション

### 1. 🗨️ community_posts（投稿・タイムライン）

**用途**: タイムラインへの投稿、つぶやき、質問など

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 投稿ID |
| user | Many-to-One (Users) | ✅ | 投稿者 |
| content | Text | ✅ | 投稿内容 |
| images | Files (Many-to-Many) | ❌ | 投稿画像（最大4枚） |
| post_type | Dropdown | ✅ | 投稿タイプ |
| visibility | Dropdown | ✅ | 公開範囲 |
| mentioned_users | JSON | ❌ | メンションされたユーザーID配列 |
| hashtags | JSON | ❌ | ハッシュタグ配列 |
| like_count | Integer | ❌ | いいね数（自動集計） |
| comment_count | Integer | ❌ | コメント数（自動集計） |
| is_pinned | Boolean | ❌ | ピン留めフラグ |
| is_edited | Boolean | ❌ | 編集済みフラグ |
| edited_at | Timestamp | ❌ | 最終編集日時 |
| status | Dropdown | ✅ | published / draft / archived |
| date_created | Timestamp | ✅ | 投稿日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**post_type（投稿タイプ）の選択肢**:
- `text` - テキスト投稿
- `question` - 質問
- `discussion` - ディスカッション
- `announcement` - お知らせ
- `share` - シェア

**visibility（公開範囲）の選択肢**:
- `public` - 全体公開
- `members_only` - 会員のみ
- `followers_only` - フォロワーのみ
- `private` - 自分のみ

**リレーション**:
- directus_users (Many-to-One) - 投稿者
- community_comments (One-to-Many) - コメント一覧
- community_likes (One-to-Many) - いいね一覧

---

### 2. 💬 community_comments（コメント・返信）

**用途**: 投稿への返信・コメント

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | コメントID |
| post | Many-to-One | ✅ | 対象投稿 |
| user | Many-to-One (Users) | ✅ | コメント投稿者 |
| parent_comment | Many-to-One (self) | ❌ | 親コメント（スレッド用） |
| content | Text | ✅ | コメント内容 |
| mentioned_users | JSON | ❌ | メンションされたユーザーID配列 |
| like_count | Integer | ❌ | いいね数（自動集計） |
| is_edited | Boolean | ❌ | 編集済みフラグ |
| edited_at | Timestamp | ❌ | 最終編集日時 |
| status | Dropdown | ✅ | published / hidden / deleted |
| date_created | Timestamp | ✅ | コメント日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**status の選択肢**:
- `published` - 公開
- `hidden` - 非表示（モデレーション）
- `deleted` - 削除済み（ソフトデリート）

**リレーション**:
- community_posts (Many-to-One) - 投稿
- directus_users (Many-to-One) - コメント投稿者
- parent_comment (Many-to-One, self) - 親コメント（ネスト構造）
- community_likes (One-to-Many) - いいね一覧

---

### 3. ❤️ community_likes（いいね）

**用途**: 投稿・コメントへのいいね

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | いいねID |
| user | Many-to-One (Users) | ✅ | いいねした人 |
| post | Many-to-One | ❌ | いいねした投稿 |
| comment | Many-to-One | ❌ | いいねしたコメント |
| date_created | Timestamp | ✅ | いいね日時 |

**注意**: `post` と `comment` は、どちらか一方が必須（XOR）

**ユニーク制約**: (user, post) または (user, comment) - 同じユーザーが2回いいねできない

**リレーション**:
- directus_users (Many-to-One) - いいねした人
- community_posts (Many-to-One) - 投稿
- community_comments (Many-to-One) - コメント

---

### 4. 🔔 community_notifications（通知）

**用途**: メンション、いいね、コメントなどの通知

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 通知ID |
| recipient | Many-to-One (Users) | ✅ | 通知先ユーザー |
| sender | Many-to-One (Users) | ❌ | 通知元ユーザー |
| type | Dropdown | ✅ | 通知タイプ |
| related_post | Many-to-One | ❌ | 関連投稿 |
| related_comment | Many-to-One | ❌ | 関連コメント |
| message | String | ✅ | 通知メッセージ |
| is_read | Boolean | ❌ | 既読フラグ |
| read_at | Timestamp | ❌ | 既読日時 |
| date_created | Timestamp | ✅ | 通知日時 |

**type（通知タイプ）の選択肢**:
- `mention` - メンション
- `like_post` - 投稿へのいいね
- `like_comment` - コメントへのいいね
- `comment` - コメント
- `reply` - 返信
- `follow` - フォロー
- `system` - システム通知

**リレーション**:
- directus_users (Many-to-One) - 通知先・通知元
- community_posts (Many-to-One) - 関連投稿
- community_comments (Many-to-One) - 関連コメント

---

### 5. 👥 community_follows（フォロー関係）

**用途**: ユーザー同士のフォロー/フォロワー関係

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | フォローID |
| follower | Many-to-One (Users) | ✅ | フォローする人 |
| following | Many-to-One (Users) | ✅ | フォローされる人 |
| date_created | Timestamp | ✅ | フォロー開始日時 |

**ユニーク制約**: (follower, following) - 同じ組み合わせは1つのみ

**リレーション**:
- directus_users (Many-to-One) - フォロワー、フォロイング

---

### 6. ⚙️ user_profiles（ユーザープロフィール拡張）

**用途**: ユーザーのプロフィール情報と公開設定

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | プロフィールID |
| user | Many-to-One (Users) | ✅ | ユーザー |
| display_name | String | ✅ | 表示名 |
| bio | Text | ❌ | 自己紹介 |
| avatar | File | ❌ | プロフィール画像 |
| cover_image | File | ❌ | カバー画像 |
| website | String | ❌ | ウェブサイトURL |
| location | String | ❌ | 所在地 |
| birth_date | Date | ❌ | 生年月日 |
| gender | Dropdown | ❌ | 性別 |
| specialties | JSON | ❌ | 専門分野（配列） |
| interests | JSON | ❌ | 興味・関心（配列） |
| social_links | JSON | ❌ | SNSリンク |
| post_count | Integer | ❌ | 投稿数（自動集計） |
| follower_count | Integer | ❌ | フォロワー数（自動集計） |
| following_count | Integer | ❌ | フォロー数（自動集計） |
| verified | Boolean | ❌ | 認証バッジ |
| date_created | Timestamp | ✅ | 作成日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**gender の選択肢**:
- `male` - 男性
- `female` - 女性
- `other` - その他
- `prefer_not_to_say` - 回答しない

**リレーション**:
- directus_users (Many-to-One) - ユーザー

---

### 7. 🔒 user_privacy_settings（プライバシー設定）

**用途**: ユーザー情報の公開/非公開設定

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 設定ID |
| user | Many-to-One (Users) | ✅ | ユーザー |
| profile_visibility | Dropdown | ✅ | プロフィール公開範囲 |
| email_visible | Boolean | ❌ | メールアドレス公開 |
| birth_date_visible | Boolean | ❌ | 生年月日公開 |
| location_visible | Boolean | ❌ | 所在地公開 |
| show_online_status | Boolean | ❌ | オンライン状態表示 |
| allow_messages | Boolean | ❌ | メッセージ受信許可 |
| allow_mentions | Boolean | ❌ | メンション許可 |
| allow_follows | Boolean | ❌ | フォロー許可 |
| notification_email | Boolean | ❌ | メール通知 |
| notification_push | Boolean | ❌ | プッシュ通知 |
| date_created | Timestamp | ✅ | 作成日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**profile_visibility（プロフィール公開範囲）の選択肢**:
- `public` - 全体公開
- `members_only` - 会員のみ
- `followers_only` - フォロワーのみ
- `private` - 非公開

**デフォルト設定**:
- profile_visibility: `members_only`
- email_visible: `false`
- show_online_status: `true`
- allow_messages: `true`
- allow_mentions: `true`
- allow_follows: `true`
- notification_email: `true`
- notification_push: `true`

**リレーション**:
- directus_users (Many-to-One) - ユーザー

---

## 🔗 リレーション図

```
Users (1) ──→ (1) user_profiles
Users (1) ──→ (1) user_privacy_settings
Users (1) ──→ (Many) community_posts
Users (1) ──→ (Many) community_comments
Users (1) ──→ (Many) community_likes
Users (1) ──→ (Many) community_notifications (recipient)
Users (1) ──→ (Many) community_notifications (sender)
Users (Many) ←→ (Many) Users (via community_follows)

community_posts (1) ──→ (Many) community_comments
community_posts (1) ──→ (Many) community_likes

community_comments (1) ──→ (Many) community_comments (parent)
community_comments (1) ──→ (Many) community_likes
```

---

## 📋 機能実装例

### 1. タイムライン投稿

```javascript
// 新規投稿
POST /items/community_posts
{
  "user": "user-id",
  "content": "今日はインソール療法の講習会に参加しました！@user2 さんもいらっしゃってました。 #インソール #勉強会",
  "post_type": "text",
  "visibility": "members_only",
  "mentioned_users": ["user2-id"],
  "hashtags": ["インソール", "勉強会"],
  "status": "published"
}
```

### 2. いいね機能

```javascript
// いいねする
POST /items/community_likes
{
  "user": "user-id",
  "post": 1
}

// いいね取り消し
DELETE /items/community_likes/{like-id}

// いいね一覧取得
GET /items/community_likes?filter[post][_eq]=1
```

### 3. コメント投稿

```javascript
// コメント
POST /items/community_comments
{
  "post": 1,
  "user": "user-id",
  "content": "参考になりました！",
  "status": "published"
}

// 返信（ネスト）
POST /items/community_comments
{
  "post": 1,
  "user": "user-id",
  "parent_comment": 2,
  "content": "@user3 ありがとうございます！",
  "mentioned_users": ["user3-id"],
  "status": "published"
}
```

### 4. メンション通知

```javascript
// 通知作成（バックエンドで自動）
POST /items/community_notifications
{
  "recipient": "user2-id",
  "sender": "user-id",
  "type": "mention",
  "related_post": 1,
  "message": "田中健一さんがあなたをメンションしました",
  "is_read": false
}

// 通知取得
GET /items/community_notifications?filter[recipient][_eq]=user-id&filter[is_read][_eq]=false

// 既読にする
PATCH /items/community_notifications/{notification-id}
{
  "is_read": true,
  "read_at": "2025-10-23T12:00:00Z"
}
```

### 5. フォロー機能

```javascript
// フォローする
POST /items/community_follows
{
  "follower": "user-id",
  "following": "user2-id"
}

// フォロー解除
DELETE /items/community_follows/{follow-id}

// フォロワー一覧
GET /items/community_follows?filter[following][_eq]=user-id&fields=follower.*

// フォロー中一覧
GET /items/community_follows?filter[follower][_eq]=user-id&fields=following.*
```

### 6. プロフィール更新

```javascript
// プロフィール情報更新
PATCH /items/user_profiles/{profile-id}
{
  "display_name": "田中健一",
  "bio": "整形外科医。インソール療法の専門家です。",
  "location": "東京都",
  "specialties": ["整形外科", "インソール療法", "スポーツ医学"]
}

// プライバシー設定更新
PATCH /items/user_privacy_settings/{settings-id}
{
  "profile_visibility": "members_only",
  "email_visible": false,
  "allow_mentions": true
}
```

### 7. タイムライン取得（フィードアルゴリズム）

```javascript
// 全体タイムライン
GET /items/community_posts?filter[visibility][_eq]=public&sort=-date_created&limit=20

// フォロー中のユーザーの投稿
GET /items/community_posts?filter[user][_in]=following-user-ids&sort=-date_created

// 自分の投稿
GET /items/community_posts?filter[user][_eq]=user-id&sort=-date_created

// メンションされた投稿
GET /items/community_posts?filter[mentioned_users][_contains]=user-id

// ハッシュタグ検索
GET /items/community_posts?filter[hashtags][_contains]=インソール
```

---

## 🔐 セキュリティ・権限

### アクセス制御

#### community_posts
- **作成**: ログイン済みユーザー
- **読取**: 公開範囲に応じて制御
- **更新**: 投稿者本人のみ
- **削除**: 投稿者本人 + 管理者

#### community_comments
- **作成**: ログイン済みユーザー
- **読取**: 投稿が見える人
- **更新**: コメント投稿者本人のみ
- **削除**: コメント投稿者本人 + 管理者

#### community_likes
- **作成**: ログイン済みユーザー
- **読取**: 全員（いいね数表示のため）
- **削除**: いいねした本人のみ

#### community_notifications
- **作成**: システムのみ
- **読取**: 通知先ユーザー本人のみ
- **更新**: 通知先ユーザー本人のみ（既読フラグ）
- **削除**: 通知先ユーザー本人のみ

#### user_profiles
- **作成**: ユーザー登録時に自動作成
- **読取**: プライバシー設定に応じて制御
- **更新**: ユーザー本人のみ
- **削除**: 不可（ユーザー削除時に連動削除）

#### user_privacy_settings
- **作成**: ユーザー登録時に自動作成
- **読取**: ユーザー本人のみ
- **更新**: ユーザー本人のみ
- **削除**: 不可（ユーザー削除時に連動削除）

---

## 📊 インデックス推奨

パフォーマンス向上のため、以下のフィールドにインデックスを作成：

- `community_posts.user`
- `community_posts.date_created`
- `community_posts.hashtags`
- `community_comments.post`
- `community_comments.user`
- `community_likes.user`
- `community_likes.post`
- `community_likes.comment`
- `community_notifications.recipient`
- `community_notifications.is_read`
- `community_follows.follower`
- `community_follows.following`

---

## 🚀 実装順序

### Phase 1: 基本機能
1. **user_profiles** - プロフィール管理
2. **user_privacy_settings** - プライバシー設定
3. **community_posts** - 投稿機能

### Phase 2: インタラクション
4. **community_comments** - コメント機能
5. **community_likes** - いいね機能
6. **community_follows** - フォロー機能

### Phase 3: 通知
7. **community_notifications** - 通知システム

---

**作成日**: 2025-10-23
**バージョン**: 1.0.0
