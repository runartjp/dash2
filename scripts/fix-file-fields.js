/**
 * ファイルフィールドの修正スクリプト
 * エラーの原因となっている alias 型のファイルフィールドを削除
 */

const axios = require('axios');

// Directus接続設定
const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

let authToken = null;

// Directus APIクライアント
const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 認証トークン取得
async function authenticate() {
  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log('✅ 認証成功');
    return true;
  } catch (error) {
    console.error('❌ 認証失敗:', error.response?.data || error.message);
    return false;
  }
}

// フィールド削除
async function deleteField(collection, field) {
  try {
    await api.delete(`/fields/${collection}/${field}`);
    console.log(`  ✅ フィールド削除成功: ${collection}.${field}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`  ⚠️  フィールドが存在しません: ${collection}.${field}`);
      return true;
    }
    console.error(`  ❌ フィールド削除失敗: ${collection}.${field}`, error.response?.data || error.message);
    return false;
  }
}

// 待機関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// メイン実行
async function main() {
  console.log('🔧 問題のあるファイルフィールドを修正します...\n');

  // 認証
  const authenticated = await authenticate();
  if (!authenticated) {
    console.error('❌ 認証に失敗しました。終了します。');
    process.exit(1);
  }

  console.log('\n🗑️  alias型のファイルフィールドを削除します...\n');

  // 削除するフィールド一覧
  const fieldsToDelete = [
    { collection: 'patients_records', field: 'attachments' },
    { collection: 'products_internal', field: 'images' },
    { collection: 'products_competitor', field: 'images' },
    { collection: 'products_reviews', field: 'images' },
  ];

  for (const { collection, field } of fieldsToDelete) {
    console.log(`📦 ${collection}.${field}`);
    await deleteField(collection, field);
    await sleep(500);
  }

  console.log('\n✅ 修正完了！');
  console.log('\n次のステップ:');
  console.log('1. Directus管理画面でコレクションが正常に表示されるか確認');
  console.log('2. 必要に応じて、ファイルフィールドをリレーションとして再設定\n');
}

// 実行
main().catch(error => {
  console.error('\n❌ エラーが発生しました:', error);
  process.exit(1);
});
