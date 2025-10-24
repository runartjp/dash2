#!/usr/bin/env node

/**
 * コミュニティ機能 - リレーション自動設定スクリプト
 * コミュニティコレクション間のリレーションを作成します
 */

const axios = require('axios');

// Directus API設定
const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

let authToken = null;

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
    console.log('✅ ログイン成功！\n');
  } catch (error) {
    console.error('❌ ログインエラー:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * リレーションを作成
 */
async function createRelation(relationData) {
  try {
    const response = await api.post('/relations', relationData);
    console.log(`  ✅ ${relationData.collection}.${relationData.field} → ${relationData.related_collection || relationData.meta.one_collection}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠️  既に存在: ${relationData.collection}.${relationData.field}`);
    } else {
      console.error(`  ❌ エラー (${relationData.collection}.${relationData.field}):`, error.response?.data || error.message);
    }
  }
}

/**
 * ==============================================
 * リレーション作成
 * ==============================================
 */
async function createAllRelations() {
  console.log('📊 コミュニティ機能のリレーションを作成中...\n');

  // ==============================================
  // 1. community_posts のリレーション
  // ==============================================
  console.log('📝 1. community_posts のリレーション');

  // user (投稿者)
  await createRelation({
    collection: 'community_posts',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_posts',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: 'posts',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // group (所属グループ)
  await createRelation({
    collection: 'community_posts',
    field: 'group',
    related_collection: 'community_groups',
    meta: {
      many_collection: 'community_posts',
      many_field: 'group',
      one_collection: 'community_groups',
      one_field: 'posts',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // ==============================================
  // 2. community_comments のリレーション
  // ==============================================
  console.log('\n💬 2. community_comments のリレーション');

  // post (対象投稿)
  await createRelation({
    collection: 'community_comments',
    field: 'post',
    related_collection: 'community_posts',
    meta: {
      many_collection: 'community_comments',
      many_field: 'post',
      one_collection: 'community_posts',
      one_field: 'comments',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // user (コメント投稿者)
  await createRelation({
    collection: 'community_comments',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_comments',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: 'comments',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // parent_comment (親コメント - セルフリレーション)
  await createRelation({
    collection: 'community_comments',
    field: 'parent_comment',
    related_collection: 'community_comments',
    meta: {
      many_collection: 'community_comments',
      many_field: 'parent_comment',
      one_collection: 'community_comments',
      one_field: 'replies',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // ==============================================
  // 3. community_likes のリレーション
  // ==============================================
  console.log('\n❤️  3. community_likes のリレーション');

  // user (いいねした人)
  await createRelation({
    collection: 'community_likes',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_likes',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: 'likes',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // post (いいねした投稿)
  await createRelation({
    collection: 'community_likes',
    field: 'post',
    related_collection: 'community_posts',
    meta: {
      many_collection: 'community_likes',
      many_field: 'post',
      one_collection: 'community_posts',
      one_field: 'likes',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // comment (いいねしたコメント)
  await createRelation({
    collection: 'community_likes',
    field: 'comment',
    related_collection: 'community_comments',
    meta: {
      many_collection: 'community_likes',
      many_field: 'comment',
      one_collection: 'community_comments',
      one_field: 'likes',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // ==============================================
  // 4. community_notifications のリレーション
  // ==============================================
  console.log('\n🔔 4. community_notifications のリレーション');

  // recipient (通知先ユーザー)
  await createRelation({
    collection: 'community_notifications',
    field: 'recipient',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_notifications',
      many_field: 'recipient',
      one_collection: 'directus_users',
      one_field: 'notifications_received',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // sender (通知元ユーザー)
  await createRelation({
    collection: 'community_notifications',
    field: 'sender',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_notifications',
      many_field: 'sender',
      one_collection: 'directus_users',
      one_field: 'notifications_sent',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // related_post (関連投稿)
  await createRelation({
    collection: 'community_notifications',
    field: 'related_post',
    related_collection: 'community_posts',
    meta: {
      many_collection: 'community_notifications',
      many_field: 'related_post',
      one_collection: 'community_posts',
      one_field: 'notifications',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // related_comment (関連コメント)
  await createRelation({
    collection: 'community_notifications',
    field: 'related_comment',
    related_collection: 'community_comments',
    meta: {
      many_collection: 'community_notifications',
      many_field: 'related_comment',
      one_collection: 'community_comments',
      one_field: 'notifications',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // related_group (関連グループ)
  await createRelation({
    collection: 'community_notifications',
    field: 'related_group',
    related_collection: 'community_groups',
    meta: {
      many_collection: 'community_notifications',
      many_field: 'related_group',
      one_collection: 'community_groups',
      one_field: 'notifications',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // ==============================================
  // 5. community_groups のリレーション
  // ==============================================
  console.log('\n👥 5. community_groups のリレーション');

  // creator (グループ作成者)
  await createRelation({
    collection: 'community_groups',
    field: 'creator',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_groups',
      many_field: 'creator',
      one_collection: 'directus_users',
      one_field: 'created_groups',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // category (カテゴリ)
  await createRelation({
    collection: 'community_groups',
    field: 'category',
    related_collection: 'categories',
    meta: {
      many_collection: 'community_groups',
      many_field: 'category',
      one_collection: 'categories',
      one_field: 'groups',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // cover_image (カバー画像) - File relation
  await createRelation({
    collection: 'community_groups',
    field: 'cover_image',
    related_collection: 'directus_files',
    meta: {
      many_collection: 'community_groups',
      many_field: 'cover_image',
      one_collection: 'directus_files',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // ==============================================
  // 6. community_group_members のリレーション
  // ==============================================
  console.log('\n👤 6. community_group_members のリレーション');

  // group (グループ)
  await createRelation({
    collection: 'community_group_members',
    field: 'group',
    related_collection: 'community_groups',
    meta: {
      many_collection: 'community_group_members',
      many_field: 'group',
      one_collection: 'community_groups',
      one_field: 'members',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // user (ユーザー)
  await createRelation({
    collection: 'community_group_members',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_group_members',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: 'group_memberships',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // invited_by (招待者)
  await createRelation({
    collection: 'community_group_members',
    field: 'invited_by',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'community_group_members',
      many_field: 'invited_by',
      one_collection: 'directus_users',
      one_field: 'group_invitations',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // ==============================================
  // 7. user_profiles のリレーション
  // ==============================================
  console.log('\n⚙️  7. user_profiles のリレーション');

  // user (ユーザー - ユニーク)
  await createRelation({
    collection: 'user_profiles',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'user_profiles',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: 'profile',
      one_deselect_action: 'nullify',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });

  // avatar (プロフィール画像) - File relation
  await createRelation({
    collection: 'user_profiles',
    field: 'avatar',
    related_collection: 'directus_files',
    meta: {
      many_collection: 'user_profiles',
      many_field: 'avatar',
      one_collection: 'directus_files',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // cover_image (カバー画像) - File relation
  await createRelation({
    collection: 'user_profiles',
    field: 'cover_image',
    related_collection: 'directus_files',
    meta: {
      many_collection: 'user_profiles',
      many_field: 'cover_image',
      one_collection: 'directus_files',
      sort_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  });

  // ==============================================
  // 8. user_privacy_settings のリレーション
  // ==============================================
  console.log('\n🔒 8. user_privacy_settings のリレーション');

  // user (ユーザー - ユニーク)
  await createRelation({
    collection: 'user_privacy_settings',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'user_privacy_settings',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: 'privacy_settings',
      one_deselect_action: 'nullify',
      sort_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  });
}

/**
 * ==============================================
 * メイン処理
 * ==============================================
 */
async function main() {
  console.log('========================================');
  console.log('  コミュニティ機能 - リレーション設定  ');
  console.log('========================================\n');

  await login();

  try {
    await createAllRelations();

    console.log('\n========================================');
    console.log('✅ 全リレーションの設定が完了しました！');
    console.log('========================================\n');
    console.log('📊 設定されたリレーション数: 23');
    console.log('');
    console.log('📝 次のステップ:');
    console.log('  1. Directus管理画面でリレーション確認: http://localhost:8056/admin');
    console.log('  2. サンプルデータ投入（必要に応じて）');
    console.log('');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
main();
