/**
 * Directus リレーション自動設定スクリプト
 * 治療・医療系プラットフォーム用のリレーション（関連付け）を作成
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

// リレーション作成
async function createRelation(relationData) {
  try {
    const response = await api.post('/relations', relationData);
    console.log(`  ✅ リレーション作成成功: ${relationData.collection}.${relationData.field} → ${relationData.related_collection}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠️  リレーションは既に存在します: ${relationData.collection}.${relationData.field}`);
      return null;
    }
    console.error(`  ❌ リレーション作成失敗: ${relationData.collection}.${relationData.field}`, error.response?.data || error.message);
    return null;
  }
}

// フィールド更新（リレーション用）
async function updateField(collection, field, fieldData) {
  try {
    const response = await api.patch(`/fields/${collection}/${field}`, fieldData);
    console.log(`  ✅ フィールド更新: ${collection}.${field}`);
    return response.data.data;
  } catch (error) {
    console.error(`  ❌ フィールド更新失敗: ${collection}.${field}`, error.response?.data || error.message);
    return null;
  }
}

// フィールド作成（存在しない場合のみ）
async function createFieldIfNotExists(collection, fieldData) {
  try {
    const response = await api.post(`/fields/${collection}`, fieldData);
    console.log(`  ✅ フィールド作成: ${collection}.${fieldData.field}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`  ⚠️  フィールドは既に存在します: ${collection}.${fieldData.field}`);
      return null;
    }
    console.error(`  ❌ フィールド作成失敗: ${collection}.${fieldData.field}`, error.response?.data || error.message);
    return null;
  }
}

// 待機関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// リレーション定義
// =============================================================================

const relations = [
  // 1. public_articles → categories
  {
    collection: 'public_articles',
    field: 'category',
    related_collection: 'categories',
    meta: {
      many_collection: 'public_articles',
      many_field: 'category',
      one_collection: 'categories',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 2. public_articles → directus_users (author)
  {
    collection: 'public_articles',
    field: 'author',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'public_articles',
      many_field: 'author',
      one_collection: 'directus_users',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 3. public_faq → categories
  {
    collection: 'public_faq',
    field: 'category',
    related_collection: 'categories',
    meta: {
      many_collection: 'public_faq',
      many_field: 'category',
      one_collection: 'categories',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 4. members_therapists → directus_users
  {
    collection: 'members_therapists',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'members_therapists',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },

  // 5. members_courses → members_therapists (instructor)
  {
    collection: 'members_courses',
    field: 'instructor',
    related_collection: 'members_therapists',
    meta: {
      many_collection: 'members_courses',
      many_field: 'instructor',
      one_collection: 'members_therapists',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 6. members_courses → categories
  {
    collection: 'members_courses',
    field: 'category',
    related_collection: 'categories',
    meta: {
      many_collection: 'members_courses',
      many_field: 'category',
      one_collection: 'categories',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 7. members_enrollments → directus_users
  {
    collection: 'members_enrollments',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'members_enrollments',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },

  // 8. members_enrollments → members_courses
  {
    collection: 'members_enrollments',
    field: 'course',
    related_collection: 'members_courses',
    meta: {
      many_collection: 'members_enrollments',
      many_field: 'course',
      one_collection: 'members_courses',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },

  // 9. patients_records → directus_users (patient_user)
  {
    collection: 'patients_records',
    field: 'patient_user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'patients_records',
      many_field: 'patient_user',
      one_collection: 'directus_users',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },

  // 10. patients_records → members_therapists (therapist)
  {
    collection: 'patients_records',
    field: 'therapist',
    related_collection: 'members_therapists',
    meta: {
      many_collection: 'patients_records',
      many_field: 'therapist',
      one_collection: 'members_therapists',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 11. products_internal → categories
  {
    collection: 'products_internal',
    field: 'category',
    related_collection: 'categories',
    meta: {
      many_collection: 'products_internal',
      many_field: 'category',
      one_collection: 'categories',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 12. products_competitor → categories
  {
    collection: 'products_competitor',
    field: 'category',
    related_collection: 'categories',
    meta: {
      many_collection: 'products_competitor',
      many_field: 'category',
      one_collection: 'categories',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'SET NULL',
    },
  },

  // 13. products_reviews → directus_users
  {
    collection: 'products_reviews',
    field: 'user',
    related_collection: 'directus_users',
    meta: {
      many_collection: 'products_reviews',
      many_field: 'user',
      one_collection: 'directus_users',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },

  // 14. products_reviews → products_internal
  {
    collection: 'products_reviews',
    field: 'product_internal',
    related_collection: 'products_internal',
    meta: {
      many_collection: 'products_reviews',
      many_field: 'product_internal',
      one_collection: 'products_internal',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },

  // 15. products_reviews → products_competitor
  {
    collection: 'products_reviews',
    field: 'product_competitor',
    related_collection: 'products_competitor',
    meta: {
      many_collection: 'products_reviews',
      many_field: 'product_competitor',
      one_collection: 'products_competitor',
      one_field: null,
      junction_field: null,
    },
    schema: {
      on_delete: 'CASCADE',
    },
  },
];

// リレーションフィールドの定義（まだ作成していない場合）
const relationFields = [
  // public_articles
  { collection: 'public_articles', field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },
  { collection: 'public_articles', field: 'author', type: 'uuid', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{first_name}} {{last_name}}' } }, schema: {} },

  // public_faq
  { collection: 'public_faq', field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },

  // members_therapists
  { collection: 'members_therapists', field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{first_name}} {{last_name}}' } }, schema: { is_nullable: false } },

  // members_courses
  { collection: 'members_courses', field: 'instructor', type: 'integer', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{display_name}}' } }, schema: { is_nullable: false } },
  { collection: 'members_courses', field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },

  // members_enrollments
  { collection: 'members_enrollments', field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{first_name}} {{last_name}}' } }, schema: { is_nullable: false } },
  { collection: 'members_enrollments', field: 'course', type: 'integer', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{title}}' } }, schema: { is_nullable: false } },

  // patients_records
  { collection: 'patients_records', field: 'patient_user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{first_name}} {{last_name}}' } }, schema: { is_nullable: false } },
  { collection: 'patients_records', field: 'therapist', type: 'integer', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{display_name}}' } }, schema: { is_nullable: false } },

  // products_internal
  { collection: 'products_internal', field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },

  // products_competitor
  { collection: 'products_competitor', field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },

  // products_reviews
  { collection: 'products_reviews', field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', required: true, width: 'half', display: 'related-values', display_options: { template: '{{first_name}} {{last_name}}' } }, schema: { is_nullable: false } },
  { collection: 'products_reviews', field: 'product_internal', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },
  { collection: 'products_reviews', field: 'product_competitor', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half', display: 'related-values', display_options: { template: '{{name}}' } }, schema: {} },
];

// =============================================================================
// メイン実行
// =============================================================================

async function main() {
  console.log('🔗 Directus リレーション自動設定を開始します...\n');

  // 認証
  const authenticated = await authenticate();
  if (!authenticated) {
    console.error('❌ 認証に失敗しました。終了します。');
    process.exit(1);
  }

  console.log('\n📦 リレーションフィールドを作成します...\n');

  // リレーションフィールドを先に作成
  for (const fieldDef of relationFields) {
    console.log(`📝 ${fieldDef.collection}.${fieldDef.field}`);
    await createFieldIfNotExists(fieldDef.collection, fieldDef);
    await sleep(300);
  }

  console.log('\n🔗 リレーションを作成します...\n');

  // リレーション作成
  for (const relation of relations) {
    console.log(`🔗 ${relation.collection}.${relation.field} → ${relation.related_collection}`);
    await createRelation(relation);
    await sleep(500);
  }

  console.log('\n\n✅ 全リレーションの設定が完了しました！');
  console.log('\n作成されたリレーション:');
  console.log('1. public_articles → categories, directus_users');
  console.log('2. public_faq → categories');
  console.log('3. members_therapists → directus_users');
  console.log('4. members_courses → members_therapists, categories');
  console.log('5. members_enrollments → directus_users, members_courses');
  console.log('6. patients_records → directus_users, members_therapists');
  console.log('7. products_internal → categories');
  console.log('8. products_competitor → categories');
  console.log('9. products_reviews → directus_users, products_internal, products_competitor');
  console.log('\n次のステップ:');
  console.log('1. Directus管理画面でリレーションを確認');
  console.log('2. サンプルデータを投入してテスト\n');
}

// 実行
main().catch(error => {
  console.error('\n❌ エラーが発生しました:', error);
  process.exit(1);
});
