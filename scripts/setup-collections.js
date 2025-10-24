/**
 * Directus コレクション自動作成スクリプト
 * 治療・医療系プラットフォーム用の全コレクションを作成
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

// コレクション作成
async function createCollection(collectionData) {
  try {
    const response = await api.post('/collections', collectionData);
    console.log(`✅ コレクション作成成功: ${collectionData.collection}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      console.log(`⚠️  コレクションは既に存在します: ${collectionData.collection}`);
      return null;
    }
    console.error(`❌ コレクション作成失敗: ${collectionData.collection}`, error.response?.data || error.message);
    throw error;
  }
}

// フィールド作成
async function createField(collection, fieldData) {
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
    // フィールド作成失敗は致命的ではないので続行
    return null;
  }
}

// 待機関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// コレクション定義
// =============================================================================

const collections = [
  // 1. categories（カテゴリ）
  {
    collection: 'categories',
    meta: {
      icon: 'folder',
      note: 'カテゴリ分類管理',
      display_template: '{{name}}',
    },
    schema: {
      name: 'categories',
    },
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, max_length: 100 } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, width: 'half', options: { slug: true } }, schema: { is_nullable: false, is_unique: true, max_length: 100 } },
      { field: 'type', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '記事用', value: 'article' },
        { text: 'FAQ用', value: 'faq' },
        { text: '商品用', value: 'product' },
        { text: 'コース用', value: 'course' },
      ] } }, schema: { is_nullable: false, default_value: 'article' } },
      { field: 'description', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'icon', type: 'string', meta: { interface: 'select-icon', width: 'half' }, schema: { max_length: 50 } },
      { field: 'color', type: 'string', meta: { interface: 'select-color', width: 'half' }, schema: { max_length: 10 } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 0 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '公開', value: 'published' },
        { text: '下書き', value: 'draft' },
      ] } }, schema: { is_nullable: false, default_value: 'published' } },
    ],
  },

  // 2. public_articles（公開記事）
  {
    collection: 'public_articles',
    meta: {
      icon: 'article',
      note: '公開ブログ記事',
      display_template: '{{title}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, max_length: 200 } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, width: 'half', options: { slug: true } }, schema: { is_nullable: false, is_unique: true, max_length: 200 } },
      { field: 'excerpt', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'body', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'featured_image', type: 'uuid', meta: { interface: 'file-image', width: 'half', special: ['file'] }, schema: {} },
      { field: 'tags', type: 'json', meta: { interface: 'tags', width: 'full' }, schema: {} },
      { field: 'views', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'featured', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '公開', value: 'published' },
        { text: '下書き', value: 'draft' },
        { text: '予約投稿', value: 'scheduled' },
      ] } }, schema: { is_nullable: false, default_value: 'draft' } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' }, schema: {} },
      { field: 'meta_title', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 60 } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
    ],
  },

  // 3. public_faq（FAQ）
  {
    collection: 'public_faq',
    meta: {
      icon: 'help',
      note: 'よくある質問',
      display_template: '{{question}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'question', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, max_length: 300 } },
      { field: 'answer', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'sort_order', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: { default_value: 0 } },
      { field: 'helpful_count', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'views', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '公開', value: 'published' },
        { text: '下書き', value: 'draft' },
      ] } }, schema: { is_nullable: false, default_value: 'published' } },
    ],
  },

  // 4. members_therapists（治療家プロフィール）
  {
    collection: 'members_therapists',
    meta: {
      icon: 'medical_services',
      note: '治療家・セラピスト情報',
      display_template: '{{display_name}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'display_name', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, max_length: 100 } },
      { field: 'specialty', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '整形外科', value: 'orthopedics' },
        { text: 'スポーツ医学', value: 'sports_medicine' },
        { text: 'リハビリテーション', value: 'rehabilitation' },
        { text: '鍼灸', value: 'acupuncture' },
        { text: 'カイロプラクティック', value: 'chiropractic' },
        { text: 'その他', value: 'other' },
      ] } }, schema: { is_nullable: false } },
      { field: 'bio', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'profile_image', type: 'uuid', meta: { interface: 'file-image', width: 'half', special: ['file'] }, schema: {} },
      { field: 'certifications', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'clinic_name', type: 'string', meta: { interface: 'input', width: 'full' }, schema: { max_length: 200 } },
      { field: 'clinic_address', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: {} },
      { field: 'website', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 200 } },
      { field: 'social_links', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: {} },
      { field: 'years_experience', type: 'integer', meta: { interface: 'input', width: 'half' }, schema: {} },
      { field: 'rating_average', type: 'decimal', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { numeric_precision: 3, numeric_scale: 2, default_value: 0 } },
      { field: 'total_students', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: 'アクティブ', value: 'active' },
        { text: '保留中', value: 'pending' },
        { text: '停止中', value: 'suspended' },
      ] } }, schema: { is_nullable: false, default_value: 'pending' } },
      { field: 'verified', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
    ],
  },

  // 5. members_courses（コース）
  {
    collection: 'members_courses',
    meta: {
      icon: 'school',
      note: '学習コース',
      display_template: '{{title}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'title', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, max_length: 200 } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, width: 'half', options: { slug: true } }, schema: { is_nullable: false, is_unique: true, max_length: 200 } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'thumbnail', type: 'uuid', meta: { interface: 'file-image', width: 'half', special: ['file'] }, schema: {} },
      { field: 'level', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '初級', value: 'beginner' },
        { text: '中級', value: 'intermediate' },
        { text: '上級', value: 'advanced' },
        { text: '全レベル', value: 'all' },
      ] } }, schema: { is_nullable: false, default_value: 'beginner' } },
      { field: 'duration', type: 'integer', meta: { interface: 'input', width: 'half', note: '推定所要時間（分）' }, schema: {} },
      { field: 'lesson_count', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'price', type: 'decimal', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, numeric_precision: 10, numeric_scale: 2, default_value: 0 } },
      { field: 'discount_price', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 10, numeric_scale: 2 } },
      { field: 'syllabus', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: {} },
      { field: 'requirements', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'learning_objectives', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'featured', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'enrollment_count', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'rating_average', type: 'decimal', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { numeric_precision: 3, numeric_scale: 2, default_value: 0 } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '公開', value: 'published' },
        { text: '下書き', value: 'draft' },
      ] } }, schema: { is_nullable: false, default_value: 'draft' } },
    ],
  },

  // 6. members_enrollments（受講状況）
  {
    collection: 'members_enrollments',
    meta: {
      icon: 'assignment',
      note: 'コース受講状況',
      display_template: '{{user.first_name}} - {{course.title}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'enrolled_at', type: 'timestamp', meta: { interface: 'datetime', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'completed_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' }, schema: {} },
      { field: 'progress', type: 'integer', meta: { interface: 'slider', width: 'half', options: { minValue: 0, maxValue: 100, step: 1 } }, schema: { default_value: 0 } },
      { field: 'last_accessed_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' }, schema: {} },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '受講中', value: 'in_progress' },
        { text: '完了', value: 'completed' },
        { text: '中断中', value: 'paused' },
        { text: 'キャンセル', value: 'cancelled' },
      ] } }, schema: { is_nullable: false, default_value: 'in_progress' } },
      { field: 'certificate_issued', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'notes', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
    ],
  },

  // 7. patients_records（カルテ）
  {
    collection: 'patients_records',
    meta: {
      icon: 'folder_shared',
      note: '患者カルテ（機密情報）',
      display_template: '{{patient_user.first_name}} - {{visit_date}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'visit_date', type: 'date', meta: { interface: 'datetime', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'visit_number', type: 'integer', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false } },
      { field: 'chief_complaint', type: 'text', meta: { interface: 'textarea', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'symptoms', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'diagnosis', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'treatment', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'prescription', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: {} },
      { field: 'progress_notes', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'next_visit_date', type: 'date', meta: { interface: 'datetime', width: 'half' }, schema: {} },
      { field: 'attachments', type: 'alias', meta: { interface: 'files', special: ['files'], width: 'full' }, schema: {} },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: 'アクティブ', value: 'active' },
        { text: '完了', value: 'completed' },
        { text: 'アーカイブ', value: 'archived' },
      ] } }, schema: { is_nullable: false, default_value: 'active' } },
      { field: 'is_confidential', type: 'boolean', meta: { interface: 'boolean', required: true, width: 'half' }, schema: { is_nullable: false, default_value: true } },
    ],
  },

  // 8. products_internal（自社商品）
  {
    collection: 'products_internal',
    meta: {
      icon: 'inventory',
      note: '自社商品',
      display_template: '{{name}}',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, max_length: 200 } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true, width: 'half', options: { slug: true } }, schema: { is_nullable: false, is_unique: true, max_length: 200 } },
      { field: 'sku', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, is_unique: true, max_length: 50 } },
      { field: 'short_description', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'features', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'specifications', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: {} },
      { field: 'images', type: 'alias', meta: { interface: 'files', special: ['files'], width: 'full' }, schema: {} },
      { field: 'price', type: 'decimal', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, numeric_precision: 10, numeric_scale: 2 } },
      { field: 'sale_price', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 10, numeric_scale: 2 } },
      { field: 'cost', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 10, numeric_scale: 2 } },
      { field: 'stock', type: 'integer', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, default_value: 0 } },
      { field: 'stock_status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '在庫あり', value: 'in_stock' },
        { text: '在庫少', value: 'low_stock' },
        { text: '在庫切れ', value: 'out_of_stock' },
        { text: '予約受付中', value: 'pre_order' },
      ] } }, schema: { is_nullable: false, default_value: 'in_stock' } },
      { field: 'manufacturer', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 100 } },
      { field: 'supplier', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 100 } },
      { field: 'featured', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '公開', value: 'published' },
        { text: '下書き', value: 'draft' },
        { text: '販売終了', value: 'discontinued' },
      ] } }, schema: { is_nullable: false, default_value: 'draft' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 60 } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
    ],
  },

  // 9. products_competitor（競合商品）
  {
    collection: 'products_competitor',
    meta: {
      icon: 'search',
      note: '競合商品分析',
      display_template: '{{name}} ({{manufacturer}})',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'full' }, schema: { is_nullable: false, max_length: 200 } },
      { field: 'manufacturer', type: 'string', meta: { interface: 'input', required: true, width: 'half' }, schema: { is_nullable: false, max_length: 100 } },
      { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' }, schema: {} },
      { field: 'images', type: 'alias', meta: { interface: 'files', special: ['files'], width: 'full' }, schema: {} },
      { field: 'price', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 10, numeric_scale: 2 } },
      { field: 'features', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'strengths', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'weaknesses', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'specifications', type: 'json', meta: { interface: 'input-code', width: 'full', options: { language: 'json' } }, schema: {} },
      { field: 'target_market', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'market_share', type: 'decimal', meta: { interface: 'input', width: 'half' }, schema: { numeric_precision: 5, numeric_scale: 2 } },
      { field: 'website_url', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 200 } },
      { field: 'purchase_url', type: 'string', meta: { interface: 'input', width: 'half' }, schema: { max_length: 200 } },
      { field: 'notes', type: 'text', meta: { interface: 'textarea', width: 'full' }, schema: {} },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: 'アクティブ', value: 'active' },
        { text: '販売終了', value: 'discontinued' },
        { text: '監視中', value: 'monitoring' },
      ] } }, schema: { is_nullable: false, default_value: 'active' } },
    ],
  },

  // 10. products_reviews（商品レビュー）
  {
    collection: 'products_reviews',
    meta: {
      icon: 'star',
      note: '商品レビュー',
      display_template: '{{user.first_name}} - {{rating}}⭐',
    },
    schema: {},
    fields: [
      { field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } },
      { field: 'rating', type: 'integer', meta: { interface: 'slider', required: true, width: 'half', options: { minValue: 1, maxValue: 5, step: 1 } }, schema: { is_nullable: false } },
      { field: 'title', type: 'string', meta: { interface: 'input', width: 'full' }, schema: { max_length: 100 } },
      { field: 'comment', type: 'text', meta: { interface: 'textarea', required: true, width: 'full' }, schema: { is_nullable: false } },
      { field: 'pros', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'cons', type: 'json', meta: { interface: 'list', width: 'full' }, schema: {} },
      { field: 'verified_purchase', type: 'boolean', meta: { interface: 'boolean', width: 'half' }, schema: { default_value: false } },
      { field: 'helpful_count', type: 'integer', meta: { interface: 'input', readonly: true, width: 'half' }, schema: { default_value: 0 } },
      { field: 'images', type: 'alias', meta: { interface: 'files', special: ['files'], width: 'full' }, schema: {} },
      { field: 'status', type: 'string', meta: { interface: 'select-dropdown', required: true, width: 'half', options: { choices: [
        { text: '公開', value: 'published' },
        { text: '承認待ち', value: 'pending' },
        { text: '却下', value: 'rejected' },
      ] } }, schema: { is_nullable: false, default_value: 'pending' } },
    ],
  },
];

// =============================================================================
// メイン実行
// =============================================================================

async function main() {
  console.log('🚀 Directus コレクション自動作成を開始します...\n');

  // 認証
  const authenticated = await authenticate();
  if (!authenticated) {
    console.error('❌ 認証に失敗しました。終了します。');
    process.exit(1);
  }

  console.log('\n📦 コレクションとフィールドを作成します...\n');

  for (const collectionDef of collections) {
    console.log(`\n📁 コレクション: ${collectionDef.collection}`);

    // コレクション作成
    await createCollection({
      collection: collectionDef.collection,
      meta: collectionDef.meta,
      schema: collectionDef.schema,
    });

    // 少し待機
    await sleep(500);

    // フィールド作成
    for (const field of collectionDef.fields) {
      await createField(collectionDef.collection, field);
      await sleep(200);
    }

    // Directus自動管理フィールドを追加
    if (!collectionDef.fields.find(f => f.field === 'date_created')) {
      await createField(collectionDef.collection, {
        field: 'date_created',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          special: ['date-created'],
        },
        schema: {},
      });
    }

    if (!collectionDef.fields.find(f => f.field === 'date_updated')) {
      await createField(collectionDef.collection, {
        field: 'date_updated',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
          special: ['date-updated'],
        },
        schema: {},
      });
    }
  }

  console.log('\n\n✅ 全コレクションの作成が完了しました！');
  console.log('\n次のステップ:');
  console.log('1. Directus管理画面 (http://localhost:8056/admin) で作成されたコレクションを確認');
  console.log('2. リレーション（関連付け）を設定');
  console.log('3. サンプルデータを投入\n');
}

// 実行
main().catch(error => {
  console.error('\n❌ エラーが発生しました:', error);
  process.exit(1);
});
