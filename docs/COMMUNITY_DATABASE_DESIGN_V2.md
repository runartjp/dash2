# コミュニティ機能 データベース設計書 v2

## 🎯 修正後の要件

### 基本方針
- ✅ **会員専用コミュニティ** - 公開範囲は全て会員全体
- ✅ **フォロー/フォロワー機能なし** - シンプルな構成
- ✅ **プロフィール公開/非公開**
  - 非公開の場合：閲覧可能、コメント不可
- ✅ **グループ機能**
  - コミュニティ別にグループ作成
  - グループ内での投稿・ディスカッション
  - グループの公開/非公開設定
  - 非公開グループ：閲覧可能、コメント不可（メンバー以外）

---

## 📊 新規コレクション

### 1. 🗨️ community_posts（投稿・タイムライン）

**用途**: タイムラインへの投稿、グループ内投稿

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 投稿ID |
| user | Many-to-One (Users) | ✅ | 投稿者 |
| group | Many-to-One | ❌ | 所属グループ（nullの場合は全体タイムライン） |
| content | Text | ✅ | 投稿内容 |
| post_type | Dropdown | ✅ | 投稿タイプ |
| mentioned_users | JSON | ❌ | メンションされたユーザーID配列 |
| hashtags | JSON | ❌ | ハッシュタグ配列 |
| like_count | Integer | ❌ | いいね数（自動集計） |
| comment_count | Integer | ❌ | コメント数（自動集計） |
| is_pinned | Boolean | ❌ | ピン留めフラグ（グループ管理者） |
| is_edited | Boolean | ❌ | 編集済みフラグ |
| edited_at | Timestamp | ❌ | 最終編集日時 |
| status | Dropdown | ✅ | published / draft / archived |
| date_created | Timestamp | ✅ | 投稿日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**post_type（投稿タイプ）の選択肢**:
- `text` - テキスト投稿
- `question` - 質問
- `discussion` - ディスカッション
- `announcement` - お知らせ（管理者のみ）
- `poll` - アンケート（将来実装）

**リレーション**:
- directus_users (Many-to-One) - 投稿者
- community_groups (Many-to-One) - 所属グループ
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
| related_group | Many-to-One | ❌ | 関連グループ |
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
- `group_invite` - グループ招待
- `group_join` - グループ参加承認
- `system` - システム通知

**リレーション**:
- directus_users (Many-to-One) - 通知先・通知元
- community_posts (Many-to-One) - 関連投稿
- community_comments (Many-to-One) - 関連コメント
- community_groups (Many-to-One) - 関連グループ

---

### 5. 👥 community_groups（グループ）

**用途**: コミュニティ内のグループ管理

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | グループID |
| name | String | ✅ | グループ名 |
| slug | String | ✅ | URLスラッグ |
| description | Text | ❌ | グループ説明 |
| cover_image | File | ❌ | カバー画像 |
| icon | String | ❌ | アイコン |
| color | String | ❌ | テーマカラー |
| category | Many-to-One | ❌ | カテゴリ（categories） |
| creator | Many-to-One (Users) | ✅ | 作成者 |
| is_private | Boolean | ❌ | 非公開フラグ |
| allow_member_posts | Boolean | ❌ | メンバーの投稿許可 |
| require_approval | Boolean | ❌ | 参加承認制 |
| member_count | Integer | ❌ | メンバー数（自動集計） |
| post_count | Integer | ❌ | 投稿数（自動集計） |
| status | Dropdown | ✅ | active / archived |
| date_created | Timestamp | ✅ | 作成日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**is_private の仕様**:
- `false`（公開）: 全員が閲覧・コメント可能
- `true`（非公開）: メンバー以外は閲覧のみ、コメント不可

**リレーション**:
- directus_users (Many-to-One) - 作成者
- categories (Many-to-One) - カテゴリ
- community_group_members (One-to-Many) - メンバー一覧
- community_posts (One-to-Many) - グループ内投稿

---

### 6. 👤 community_group_members（グループメンバー）

**用途**: グループメンバーの管理

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | メンバーID |
| group | Many-to-One | ✅ | グループ |
| user | Many-to-One (Users) | ✅ | ユーザー |
| role | Dropdown | ✅ | 役割 |
| status | Dropdown | ✅ | ステータス |
| joined_at | Timestamp | ✅ | 参加日時 |
| invited_by | Many-to-One (Users) | ❌ | 招待者 |
| date_created | Timestamp | ✅ | 作成日時 |

**role（役割）の選択肢**:
- `admin` - 管理者（グループ設定変更、メンバー管理、投稿削除可能）
- `moderator` - モデレーター（投稿削除、ピン留め可能）
- `member` - 一般メンバー

**status（ステータス）の選択肢**:
- `active` - アクティブ
- `pending` - 参加申請中（承認制の場合）
- `banned` - 追放済み

**ユニーク制約**: (group, user) - 同じユーザーが同じグループに重複参加不可

**リレーション**:
- community_groups (Many-to-One) - グループ
- directus_users (Many-to-One) - ユーザー、招待者

---

### 7. ⚙️ user_profiles（ユーザープロフィール拡張）

**用途**: ユーザーのプロフィール情報

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | プロフィールID |
| user | Many-to-One (Users) | ✅ | ユーザー（ユニーク） |
| display_name | String | ✅ | 表示名 |
| bio | Text | ❌ | 自己紹介 |
| avatar | File | ❌ | プロフィール画像 |
| cover_image | File | ❌ | カバー画像 |
| website | String | ❌ | ウェブサイトURL |
| location | String | ❌ | 所在地 |
| specialties | JSON | ❌ | 専門分野（配列） |
| interests | JSON | ❌ | 興味・関心（配列） |
| social_links | JSON | ❌ | SNSリンク |
| post_count | Integer | ❌ | 投稿数（自動集計） |
| comment_count | Integer | ❌ | コメント数（自動集計） |
| verified | Boolean | ❌ | 認証バッジ |
| is_profile_public | Boolean | ✅ | プロフィール公開フラグ |
| date_created | Timestamp | ✅ | 作成日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**is_profile_public の仕様**:
- `true`（公開）: プロフィール閲覧可能、投稿・コメント可能
- `false`（非公開）: プロフィール閲覧可能、投稿・コメント不可

**リレーション**:
- directus_users (Many-to-One) - ユーザー

---

### 8. 🔒 user_privacy_settings（プライバシー設定）

**用途**: ユーザー情報の公開/非公開設定

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Integer (Auto) | ✅ | 設定ID |
| user | Many-to-One (Users) | ✅ | ユーザー（ユニーク） |
| email_visible | Boolean | ❌ | メールアドレス公開 |
| location_visible | Boolean | ❌ | 所在地公開 |
| show_online_status | Boolean | ❌ | オンライン状態表示 |
| allow_messages | Boolean | ❌ | メッセージ受信許可 |
| allow_mentions | Boolean | ❌ | メンション許可 |
| allow_group_invites | Boolean | ❌ | グループ招待許可 |
| notification_email | Boolean | ❌ | メール通知 |
| notification_push | Boolean | ❌ | プッシュ通知 |
| date_created | Timestamp | ✅ | 作成日時 |
| date_updated | Timestamp | ✅ | 更新日時 |

**デフォルト設定**:
- email_visible: `false`
- location_visible: `true`
- show_online_status: `true`
- allow_messages: `true`
- allow_mentions: `true`
- allow_group_invites: `true`
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
Users (1) ──→ (Many) community_groups (creator)
Users (Many) ←→ (Many) community_groups (via community_group_members)

community_groups (1) ──→ (Many) community_posts
community_groups (1) ──→ (Many) community_group_members

community_posts (1) ──→ (Many) community_comments
community_posts (1) ──→ (Many) community_likes

community_comments (1) ──→ (Many) community_comments (parent)
community_comments (1) ──→ (Many) community_likes
```

---

## 📋 機能実装例

### 1. グループ作成

```javascript
// グループ作成
POST /items/community_groups
{
  "name": "インソール療法研究会",
  "slug": "insole-therapy-research",
  "description": "インソール療法に関する情報交換、症例共有を行うグループです。",
  "category": 1,
  "creator": "user-id",
  "is_private": false,
  "allow_member_posts": true,
  "require_approval": false,
  "status": "active"
}

// 作成者を自動的にadminとしてメンバー追加
POST /items/community_group_members
{
  "group": 1,
  "user": "user-id",
  "role": "admin",
  "status": "active",
  "joined_at": "2025-10-23T12:00:00Z"
}
```

### 2. グループへの参加

```javascript
// 公開グループに参加（即時参加）
POST /items/community_group_members
{
  "group": 1,
  "user": "user2-id",
  "role": "member",
  "status": "active",
  "joined_at": "2025-10-23T12:00:00Z"
}

// 承認制グループに参加申請
POST /items/community_group_members
{
  "group": 2,
  "user": "user2-id",
  "role": "member",
  "status": "pending",
  "joined_at": "2025-10-23T12:00:00Z"
}

// 管理者が承認
PATCH /items/community_group_members/{member-id}
{
  "status": "active"
}
```

### 3. グループ内投稿

```javascript
// グループ内に投稿
POST /items/community_posts
{
  "user": "user-id",
  "group": 1,
  "content": "新しい症例を共有します。50代女性、扁平足...",
  "post_type": "discussion",
  "hashtags": ["症例共有", "扁平足"],
  "status": "published"
}

// 全体タイムラインに投稿（groupをnullに）
POST /items/community_posts
{
  "user": "user-id",
  "group": null,
  "content": "今日の勉強会に参加しました！",
  "post_type": "text",
  "status": "published"
}
```

### 4. コメント投稿（権限チェック）

```javascript
// コメント前に権限チェック
GET /items/user_profiles?filter[user][_eq]=user-id&fields=is_profile_public

// is_profile_public が true の場合のみコメント可能
if (is_profile_public === true) {
  POST /items/community_comments
  {
    "post": 1,
    "user": "user-id",
    "content": "参考になりました！",
    "status": "published"
  }
}

// グループ投稿へのコメント（非公開グループの場合）
GET /items/community_group_members?filter[group][_eq]=1&filter[user][_eq]=user-id

// メンバーの場合のみコメント可能
if (member exists && status === 'active') {
  POST /items/community_comments
  {
    "post": 2,
    "user": "user-id",
    "content": "症例ありがとうございます！",
    "status": "published"
  }
}
```

### 5. タイムライン取得

```javascript
// 全体タイムライン（グループなし投稿）
GET /items/community_posts?filter[group][_null]=true&sort=-date_created&limit=20

// 特定グループのタイムライン
GET /items/community_posts?filter[group][_eq]=1&sort=-date_created&limit=20

// 自分が参加しているグループの投稿一覧
// 1. 参加グループID取得
GET /items/community_group_members?filter[user][_eq]=user-id&filter[status][_eq]=active&fields=group

// 2. グループ投稿取得
GET /items/community_posts?filter[group][_in]=group-ids&sort=-date_created
```

### 6. グループ一覧取得

```javascript
// 公開グループ一覧
GET /items/community_groups?filter[status][_eq]=active&sort=-member_count

// 自分が参加しているグループ
GET /items/community_group_members?filter[user][_eq]=user-id&filter[status][_eq]=active&fields=group.*

// グループ詳細（メンバー込み）
GET /items/community_groups/1?fields=*,creator.*,members.user.*
```

### 7. プロフィール公開/非公開設定

```javascript
// プロフィール非公開にする
PATCH /items/user_profiles/{profile-id}
{
  "is_profile_public": false
}

// 非公開状態の確認
GET /items/user_profiles?filter[user][_eq]=user-id&fields=is_profile_public

// 公開状態のユーザーのみ取得（コメント可能ユーザー）
GET /items/user_profiles?filter[is_profile_public][_eq]=true
```

---

## 🔐 セキュリティ・権限

### アクセス制御ルール

#### community_posts
- **作成**: ログイン済み + プロフィール公開ユーザー
- **読取**: 全会員
- **更新**: 投稿者本人のみ
- **削除**: 投稿者本人 + グループ管理者/モデレーター + システム管理者

#### community_comments
- **作成**: ログイン済み + プロフィール公開ユーザー + （非公開グループの場合はメンバー）
- **読取**: 全会員
- **更新**: コメント投稿者本人のみ
- **削除**: コメント投稿者本人 + グループ管理者/モデレーター + システム管理者

#### community_groups
- **作成**: ログイン済みユーザー
- **読取**: 全会員
- **更新**: グループ管理者のみ
- **削除**: グループ作成者 + システム管理者

#### community_group_members
- **作成**: グループへの参加申請（本人）、招待（管理者）
- **読取**: 全会員（メンバー一覧表示のため）
- **更新**: グループ管理者（承認、役割変更、追放）
- **削除**: 本人（退会）、グループ管理者

#### user_profiles
- **作成**: ユーザー登録時に自動作成
- **読取**: 全会員
- **更新**: ユーザー本人のみ
- **削除**: 不可（ユーザー削除時に連動削除）

---

## 📊 インデックス推奨

- `community_posts.user`
- `community_posts.group`
- `community_posts.date_created`
- `community_posts.hashtags`
- `community_comments.post`
- `community_comments.user`
- `community_likes.user`
- `community_likes.post`
- `community_likes.comment`
- `community_notifications.recipient`
- `community_notifications.is_read`
- `community_groups.slug`
- `community_groups.status`
- `community_group_members.group`
- `community_group_members.user`
- `community_group_members.status`
- `user_profiles.user`
- `user_profiles.is_profile_public`

---

## 🚀 実装順序

### Phase 1: プロフィール・基本投稿
1. **user_profiles** - プロフィール管理
2. **user_privacy_settings** - プライバシー設定
3. **community_posts** - 投稿機能（全体タイムライン）

### Phase 2: インタラクション
4. **community_comments** - コメント機能
5. **community_likes** - いいね機能

### Phase 3: グループ機能
6. **community_groups** - グループ作成
7. **community_group_members** - メンバー管理

### Phase 4: 通知
8. **community_notifications** - 通知システム

---

## 📝 主要な変更点（v1からv2）

### 削除された機能
- ❌ フォロー/フォロワー機能（`community_follows`）
- ❌ 公開範囲設定（`visibility` フィールド）

### 追加された機能
- ✅ グループ機能（`community_groups`, `community_group_members`）
- ✅ グループ内投稿
- ✅ グループ権限管理（管理者、モデレーター、メンバー）

### 変更された仕様
- ✅ プロフィール公開/非公開の簡略化
  - 非公開: 閲覧可能、投稿・コメント不可
- ✅ 会員専用コミュニティ（公開範囲は全て会員全体）
- ✅ グループの非公開設定
  - 非公開グループ: メンバー以外は閲覧のみ、コメント不可

---

**作成日**: 2025-10-23
**バージョン**: 2.0.0
**前バージョンからの変更**: フォロー機能削除、グループ機能追加、プライバシー設定簡略化
