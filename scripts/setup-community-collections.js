#!/usr/bin/env node

/**
 * コミュニティ機能 - コレクション自動作成スクリプト
 * 8つのコミュニティ関連コレクションを作成します
 */

const axios = require('axios');

// Directus API設定
const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

let authToken = null;
let adminUserId = null;

// APIクライアント
const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークン追加）
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

/**
 * Directusにログイン
 */
async function login() {
  try {
    console.log('🔐 Directusにログイン中...');
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    authToken = response.data.data.access_token;
    console.log('✅ ログイン成功！');

    // ユーザーIDを取得
    const userResponse = await api.get('/users/me');
    adminUserId = userResponse.data.data.id;
    console.log(`👤 ユーザーID: ${adminUserId}\n`);
  } catch (error) {
    console.error('❌ ログインエラー:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * コレクションを作成
 */
async function createCollection(collectionData) {
  try {
    const response = await api.post('/collections', collectionData);
    console.log(`  ✅ コレクション作成: ${collectionData.collection}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠️  既に存在: ${collectionData.collection}`);
    } else {
      console.error(`  ❌ エラー (${collectionData.collection}):`, error.response?.data || error.message);
      throw error;
    }
  }
}

/**
 * フィールドを作成
 */
async function createField(collection, fieldData) {
  try {
    const response = await api.post(`/fields/${collection}`, fieldData);
    console.log(`    ✅ ${fieldData.field}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
      console.log(`    ⚠️  既に存在: ${fieldData.field}`);
    } else {
      console.error(`    ❌ エラー (${fieldData.field}):`, error.response?.data || error.message);
    }
  }
}

/**
 * ==============================================
 * 1. community_posts（投稿・タイムライン）
 * ==============================================
 */
async function createCommunityPosts() {
  console.log('\n📝 1. community_posts を作成中...');

  await createCollection({
    collection: 'community_posts',
    meta: {
      icon: 'forum',
      display_template: '{{user}} - {{content}}',
      note: 'タイムライン投稿、グループ内投稿',
    },
    schema: {
      name: 'community_posts',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: '投稿者' } },
    { field: 'group', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '所属グループ（nullの場合は全体タイムライン）' } },
    { field: 'content', type: 'text', meta: { interface: 'input-rich-text-md', required: true, note: '投稿内容' } },
    { field: 'post_type', type: 'string', meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: 'テキスト投稿', value: 'text' },
      { text: '質問', value: 'question' },
      { text: 'ディスカッション', value: 'discussion' },
      { text: 'お知らせ', value: 'announcement' },
      { text: 'アンケート', value: 'poll' }
    ] }, note: '投稿タイプ' } },
    { field: 'mentioned_users', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'メンションされたユーザーID配列' } },
    { field: 'hashtags', type: 'json', meta: { interface: 'tags', note: 'ハッシュタグ配列' } },
    { field: 'like_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: 'いいね数（自動集計）' } },
    { field: 'comment_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: 'コメント数（自動集計）' } },
    { field: 'is_pinned', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: 'ピン留めフラグ' } },
    { field: 'is_edited', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: '編集済みフラグ' } },
    { field: 'edited_at', type: 'timestamp', meta: { interface: 'datetime', note: '最終編集日時' } },
    { field: 'status', type: 'string', schema: { default_value: 'published' }, meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: '公開', value: 'published' },
      { text: '下書き', value: 'draft' },
      { text: 'アーカイブ', value: 'archived' }
    ] }, note: 'ステータス' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
    { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-updated'] } },
  ];

  for (const field of fields) {
    await createField('community_posts', field);
  }
}

/**
 * ==============================================
 * 2. community_comments（コメント・返信）
 * ==============================================
 */
async function createCommunityComments() {
  console.log('\n💬 2. community_comments を作成中...');

  await createCollection({
    collection: 'community_comments',
    meta: {
      icon: 'comment',
      display_template: '{{user}} - {{content}}',
      note: '投稿への返信・コメント',
    },
    schema: {
      name: 'community_comments',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'post', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: '対象投稿' } },
    { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: 'コメント投稿者' } },
    { field: 'parent_comment', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '親コメント（スレッド用）' } },
    { field: 'content', type: 'text', meta: { interface: 'input-rich-text-md', required: true, note: 'コメント内容' } },
    { field: 'mentioned_users', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'メンションされたユーザーID配列' } },
    { field: 'like_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: 'いいね数（自動集計）' } },
    { field: 'is_edited', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: '編集済みフラグ' } },
    { field: 'edited_at', type: 'timestamp', meta: { interface: 'datetime', note: '最終編集日時' } },
    { field: 'status', type: 'string', schema: { default_value: 'published' }, meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: '公開', value: 'published' },
      { text: '非表示', value: 'hidden' },
      { text: '削除済み', value: 'deleted' }
    ] }, note: 'ステータス' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
    { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-updated'] } },
  ];

  for (const field of fields) {
    await createField('community_comments', field);
  }
}

/**
 * ==============================================
 * 3. community_likes（いいね）
 * ==============================================
 */
async function createCommunityLikes() {
  console.log('\n❤️  3. community_likes を作成中...');

  await createCollection({
    collection: 'community_likes',
    meta: {
      icon: 'favorite',
      display_template: '{{user}}',
      note: '投稿・コメントへのいいね',
    },
    schema: {
      name: 'community_likes',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: 'いいねした人' } },
    { field: 'post', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: 'いいねした投稿' } },
    { field: 'comment', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: 'いいねしたコメント' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
  ];

  for (const field of fields) {
    await createField('community_likes', field);
  }
}

/**
 * ==============================================
 * 4. community_notifications（通知）
 * ==============================================
 */
async function createCommunityNotifications() {
  console.log('\n🔔 4. community_notifications を作成中...');

  await createCollection({
    collection: 'community_notifications',
    meta: {
      icon: 'notifications',
      display_template: '{{message}}',
      note: 'メンション、いいね、コメントなどの通知',
    },
    schema: {
      name: 'community_notifications',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'recipient', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: '通知先ユーザー' } },
    { field: 'sender', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '通知元ユーザー' } },
    { field: 'related_post', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '関連投稿' } },
    { field: 'related_comment', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '関連コメント' } },
    { field: 'related_group', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '関連グループ' } },
    { field: 'type', type: 'string', meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: 'メンション', value: 'mention' },
      { text: '投稿へのいいね', value: 'like_post' },
      { text: 'コメントへのいいね', value: 'like_comment' },
      { text: 'コメント', value: 'comment' },
      { text: '返信', value: 'reply' },
      { text: 'グループ招待', value: 'group_invite' },
      { text: 'グループ参加承認', value: 'group_join' },
      { text: 'システム通知', value: 'system' }
    ] }, note: '通知タイプ' } },
    { field: 'message', type: 'string', meta: { interface: 'input', required: true, note: '通知メッセージ' } },
    { field: 'is_read', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: '既読フラグ' } },
    { field: 'read_at', type: 'timestamp', meta: { interface: 'datetime', note: '既読日時' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
  ];

  for (const field of fields) {
    await createField('community_notifications', field);
  }
}

/**
 * ==============================================
 * 5. community_groups（グループ）
 * ==============================================
 */
async function createCommunityGroups() {
  console.log('\n👥 5. community_groups を作成中...');

  await createCollection({
    collection: 'community_groups',
    meta: {
      icon: 'groups',
      display_template: '{{name}}',
      note: 'コミュニティ内のグループ管理',
    },
    schema: {
      name: 'community_groups',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'name', type: 'string', meta: { interface: 'input', required: true, note: 'グループ名' } },
    { field: 'slug', type: 'string', schema: { is_unique: true }, meta: { interface: 'input', required: true, note: 'URLスラッグ' } },
    { field: 'description', type: 'text', meta: { interface: 'input-rich-text-md', note: 'グループ説明' } },
    { field: 'cover_image', type: 'uuid', meta: { interface: 'file-image', note: 'カバー画像' } },
    { field: 'creator', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: '作成者' } },
    { field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: 'カテゴリ' } },
    { field: 'icon', type: 'string', meta: { interface: 'select-icon', note: 'アイコン' } },
    { field: 'color', type: 'string', meta: { interface: 'select-color', note: 'テーマカラー' } },
    { field: 'is_private', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: '非公開フラグ（メンバー以外は閲覧のみ）' } },
    { field: 'allow_member_posts', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'メンバーの投稿許可' } },
    { field: 'require_approval', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: '参加承認制' } },
    { field: 'member_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: 'メンバー数（自動集計）' } },
    { field: 'post_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: '投稿数（自動集計）' } },
    { field: 'status', type: 'string', schema: { default_value: 'active' }, meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: 'アクティブ', value: 'active' },
      { text: 'アーカイブ', value: 'archived' }
    ] }, note: 'ステータス' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
    { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-updated'] } },
  ];

  for (const field of fields) {
    await createField('community_groups', field);
  }
}

/**
 * ==============================================
 * 6. community_group_members（グループメンバー）
 * ==============================================
 */
async function createCommunityGroupMembers() {
  console.log('\n👤 6. community_group_members を作成中...');

  await createCollection({
    collection: 'community_group_members',
    meta: {
      icon: 'person_add',
      display_template: '{{user}} in {{group}}',
      note: 'グループメンバーの管理',
    },
    schema: {
      name: 'community_group_members',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'group', type: 'integer', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: 'グループ' } },
    { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: 'ユーザー' } },
    { field: 'invited_by', type: 'uuid', meta: { interface: 'select-dropdown-m2o', display: 'related-values', note: '招待者' } },
    { field: 'role', type: 'string', schema: { default_value: 'member' }, meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: '管理者', value: 'admin' },
      { text: 'モデレーター', value: 'moderator' },
      { text: 'メンバー', value: 'member' }
    ] }, note: '役割' } },
    { field: 'status', type: 'string', schema: { default_value: 'active' }, meta: { interface: 'select-dropdown', required: true, options: { choices: [
      { text: 'アクティブ', value: 'active' },
      { text: '参加申請中', value: 'pending' },
      { text: '追放済み', value: 'banned' }
    ] }, note: 'ステータス' } },
    { field: 'joined_at', type: 'timestamp', meta: { interface: 'datetime', required: true, note: '参加日時' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
  ];

  for (const field of fields) {
    await createField('community_group_members', field);
  }
}

/**
 * ==============================================
 * 7. user_profiles（ユーザープロフィール拡張）
 * ==============================================
 */
async function createUserProfiles() {
  console.log('\n⚙️  7. user_profiles を作成中...');

  await createCollection({
    collection: 'user_profiles',
    meta: {
      icon: 'account_circle',
      display_template: '{{display_name}}',
      note: 'ユーザーのプロフィール情報',
    },
    schema: {
      name: 'user_profiles',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'user', type: 'uuid', schema: { is_unique: true }, meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: 'ユーザー（ユニーク）' } },
    { field: 'display_name', type: 'string', meta: { interface: 'input', required: true, note: '表示名' } },
    { field: 'bio', type: 'text', meta: { interface: 'input-multiline', note: '自己紹介' } },
    { field: 'avatar', type: 'uuid', meta: { interface: 'file-image', note: 'プロフィール画像' } },
    { field: 'cover_image', type: 'uuid', meta: { interface: 'file-image', note: 'カバー画像' } },
    { field: 'website', type: 'string', meta: { interface: 'input', note: 'ウェブサイトURL' } },
    { field: 'location', type: 'string', meta: { interface: 'input', note: '所在地' } },
    { field: 'specialties', type: 'json', meta: { interface: 'tags', note: '専門分野（配列）' } },
    { field: 'interests', type: 'json', meta: { interface: 'tags', note: '興味・関心（配列）' } },
    { field: 'social_links', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, note: 'SNSリンク（JSON）' } },
    { field: 'post_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: '投稿数（自動集計）' } },
    { field: 'comment_count', type: 'integer', schema: { default_value: 0 }, meta: { interface: 'input', readonly: true, note: 'コメント数（自動集計）' } },
    { field: 'verified', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: '認証バッジ' } },
    { field: 'is_profile_public', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', required: true, note: 'プロフィール公開フラグ（false=閲覧のみ、投稿・コメント不可）' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
    { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-updated'] } },
  ];

  for (const field of fields) {
    await createField('user_profiles', field);
  }
}

/**
 * ==============================================
 * 8. user_privacy_settings（プライバシー設定）
 * ==============================================
 */
async function createUserPrivacySettings() {
  console.log('\n🔒 8. user_privacy_settings を作成中...');

  await createCollection({
    collection: 'user_privacy_settings',
    meta: {
      icon: 'security',
      display_template: 'Privacy Settings for {{user}}',
      note: 'ユーザー情報の公開/非公開設定',
    },
    schema: {
      name: 'user_privacy_settings',
    },
  });

  const fields = [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } },
    { field: 'user', type: 'uuid', schema: { is_unique: true }, meta: { interface: 'select-dropdown-m2o', display: 'related-values', required: true, note: 'ユーザー（ユニーク）' } },
    { field: 'email_visible', type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', note: 'メールアドレス公開' } },
    { field: 'location_visible', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: '所在地公開' } },
    { field: 'show_online_status', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'オンライン状態表示' } },
    { field: 'allow_messages', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'メッセージ受信許可' } },
    { field: 'allow_mentions', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'メンション許可' } },
    { field: 'allow_group_invites', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'グループ招待許可' } },
    { field: 'notification_email', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'メール通知' } },
    { field: 'notification_push', type: 'boolean', schema: { default_value: true }, meta: { interface: 'boolean', note: 'プッシュ通知' } },
    { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] } },
    { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-updated'] } },
  ];

  for (const field of fields) {
    await createField('user_privacy_settings', field);
  }
}

/**
 * ==============================================
 * メイン処理
 * ==============================================
 */
async function main() {
  console.log('========================================');
  console.log('  コミュニティ機能 - コレクション作成  ');
  console.log('========================================\n');

  await login();

  try {
    await createCommunityPosts();
    await createCommunityComments();
    await createCommunityLikes();
    await createCommunityNotifications();
    await createCommunityGroups();
    await createCommunityGroupMembers();
    await createUserProfiles();
    await createUserPrivacySettings();

    console.log('\n========================================');
    console.log('✅ 全8コレクションの作成が完了しました！');
    console.log('========================================\n');
    console.log('📊 次のステップ:');
    console.log('  1. npm run community:relations - リレーション設定');
    console.log('  2. Directus管理画面で確認: http://localhost:8056/admin');
    console.log('');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
main();
