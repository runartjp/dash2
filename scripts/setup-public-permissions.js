#!/usr/bin/env node

/**
 * Directus Public権限設定スクリプト
 * フロントエンドからの読み取りアクセスを許可します
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
 * Public roleを取得または作成
 */
async function getOrCreatePublicRole() {
  try {
    // 既存のPublicロールを検索
    const response = await api.get('/roles', {
      params: {
        filter: { name: { _eq: 'Public' } }
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ 既存のPublicロールを使用');
      return response.data.data[0].id;
    }

    // Publicロールを作成
    console.log('📝 Publicロールを作成中...');
    const createResponse = await api.post('/roles', {
      name: 'Public',
      icon: 'public',
      description: 'Public access role for unauthenticated users',
      admin_access: false,
      app_access: false
    });

    console.log('✅ Publicロール作成完了');
    return createResponse.data.data.id;
  } catch (error) {
    console.error('❌ Publicロール取得/作成エラー:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * 権限を設定
 */
async function setPermission(roleId, collection, action = 'read') {
  try {
    // 既存の権限を確認
    const existing = await api.get('/permissions', {
      params: {
        filter: {
          role: { _eq: roleId },
          collection: { _eq: collection },
          action: { _eq: action }
        }
      }
    });

    if (existing.data.data && existing.data.data.length > 0) {
      console.log(`  ⚠️  既に存在: ${collection} (${action})`);
      return;
    }

    // 権限を作成
    await api.post('/permissions', {
      role: roleId,
      collection: collection,
      action: action,
      permissions: {},
      fields: ['*']
    });

    console.log(`  ✅ 権限設定: ${collection} (${action})`);
  } catch (error) {
    console.error(`  ❌ エラー (${collection}):`, error.response?.data || error.message);
  }
}

/**
 * ==============================================
 * メイン処理
 * ==============================================
 */
async function main() {
  console.log('========================================');
  console.log('  Directus Public権限設定  ');
  console.log('========================================\n');

  await login();

  console.log('📋 Publicロールを取得/作成中...');
  const publicRoleId = await getOrCreatePublicRole();
  console.log(`✅ Public Role ID: ${publicRoleId}\n`);

  console.log('🔓 権限を設定中...\n');

  // 公開コンテンツ
  console.log('📰 公開コンテンツ');
  await setPermission(publicRoleId, 'categories', 'read');
  await setPermission(publicRoleId, 'public_articles', 'read');
  await setPermission(publicRoleId, 'public_faq', 'read');

  // 会員機能
  console.log('\n👨‍⚕️ 会員機能');
  await setPermission(publicRoleId, 'members_therapists', 'read');
  await setPermission(publicRoleId, 'members_courses', 'read');
  await setPermission(publicRoleId, 'members_enrollments', 'read');

  // 商品管理
  console.log('\n🛒 商品管理');
  await setPermission(publicRoleId, 'products_internal', 'read');
  await setPermission(publicRoleId, 'products_competitor', 'read');
  await setPermission(publicRoleId, 'products_reviews', 'read');

  // コミュニティ機能
  console.log('\n👥 コミュニティ機能');
  await setPermission(publicRoleId, 'community_posts', 'read');
  await setPermission(publicRoleId, 'community_comments', 'read');
  await setPermission(publicRoleId, 'community_likes', 'read');
  await setPermission(publicRoleId, 'community_notifications', 'read');
  await setPermission(publicRoleId, 'community_groups', 'read');
  await setPermission(publicRoleId, 'community_group_members', 'read');
  await setPermission(publicRoleId, 'user_profiles', 'read');
  await setPermission(publicRoleId, 'user_privacy_settings', 'read');

  console.log('\n========================================');
  console.log('✅ 権限設定が完了しました！');
  console.log('========================================\n');
  console.log('📝 設定内容:');
  console.log('  - Public ロールに read 権限を付与');
  console.log('  - 全18コレクションにアクセス可能');
  console.log('');
  console.log('🌐 フロントエンドをリロードしてください');
  console.log('  http://localhost:3002');
  console.log('');
}

// スクリプト実行
main();
