/**
 * Directus サンプルデータ投入スクリプト
 * 治療・医療系プラットフォーム用のテストデータを作成
 */

const axios = require('axios');

// Directus接続設定
const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

let authToken = null;
let adminUserId = null;

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

    // Directus 11の認証レスポンス構造に対応
    if (response.data.data) {
      authToken = response.data.data.access_token;
      adminUserId = response.data.data.user?.id;
    } else {
      authToken = response.data.access_token;
      adminUserId = response.data.user?.id;
    }

    if (!authToken) {
      throw new Error('認証トークンが取得できませんでした');
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log('✅ 認証成功');

    // ユーザーIDが取得できなかった場合は /users/me から取得
    if (!adminUserId) {
      console.log('⚠️  ユーザーIDを /users/me から取得します...');
      const userResponse = await api.get('/users/me');
      adminUserId = userResponse.data.data.id;
    }

    console.log(`👤 管理者ユーザーID: ${adminUserId}`);
    return true;
  } catch (error) {
    console.error('❌ 認証失敗:', error.response?.data || error.message);
    return false;
  }
}

// アイテム作成
async function createItem(collection, data) {
  try {
    const response = await api.post(`/items/${collection}`, data);
    console.log(`  ✅ 作成成功: ${collection} - ${data.name || data.title || data.question || data.display_name || response.data.data.id}`);
    return response.data.data;
  } catch (error) {
    console.error(`  ❌ 作成失敗: ${collection}`, error.response?.data || error.message);
    return null;
  }
}

// 待機関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// サンプルデータ定義
// =============================================================================

// メイン実行
async function main() {
  console.log('🌱 サンプルデータ投入を開始します...\n');

  // 認証
  const authenticated = await authenticate();
  if (!authenticated) {
    console.error('❌ 認証に失敗しました。終了します。');
    process.exit(1);
  }

  // ==========================================================================
  // 1. Categories（カテゴリ）
  // ==========================================================================
  console.log('\n📁 カテゴリを作成します...\n');

  const categories = [];

  const categoryData = [
    { name: 'インソール療法', slug: 'insole-therapy', type: 'article', icon: 'straighten', color: '#6644FF', sort_order: 1, status: 'published' },
    { name: '足部医学', slug: 'foot-medicine', type: 'article', icon: 'healing', color: '#4CAF50', sort_order: 2, status: 'published' },
    { name: 'スポーツ医学', slug: 'sports-medicine', type: 'article', icon: 'sports', color: '#FF9800', sort_order: 3, status: 'published' },
    { name: '製品情報', slug: 'products', type: 'product', icon: 'inventory', color: '#2196F3', sort_order: 4, status: 'published' },
    { name: 'コース - 初級', slug: 'course-beginner', type: 'course', icon: 'school', color: '#9C27B0', sort_order: 5, status: 'published' },
    { name: 'コース - 中級', slug: 'course-intermediate', type: 'course', icon: 'school', color: '#673AB7', sort_order: 6, status: 'published' },
    { name: 'よくある質問', slug: 'faq-general', type: 'faq', icon: 'help', color: '#00BCD4', sort_order: 7, status: 'published' },
  ];

  for (const cat of categoryData) {
    const created = await createItem('categories', cat);
    if (created) categories.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 2. Members_Therapists（治療家プロフィール）
  // ==========================================================================
  console.log('\n👨‍⚕️ 治療家プロフィールを作成します...\n');

  const therapists = [];

  const therapistData = [
    {
      user: adminUserId,
      display_name: '田中 健一',
      specialty: 'orthopedics',
      bio: '整形外科専門医として20年以上の経験を持つ。足部疾患の治療とインソール療法のエキスパート。',
      certifications: ['整形外科専門医', '認定インソール療法士', 'スポーツドクター'],
      clinic_name: '田中整形外科クリニック',
      clinic_address: {
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        building: 'メディカルビル3F'
      },
      website: 'https://example.com/tanaka-clinic',
      years_experience: 20,
      rating_average: 4.8,
      total_students: 150,
      status: 'active',
      verified: true,
    },
  ];

  for (const therapist of therapistData) {
    const created = await createItem('members_therapists', therapist);
    if (created) therapists.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 3. Members_Courses（コース）
  // ==========================================================================
  console.log('\n🎓 コースを作成します...\n');

  const courses = [];

  const courseData = [
    {
      title: 'インソール療法入門 - 基礎から学ぶ足部機能',
      slug: 'insole-therapy-basics',
      description: '<p>足部の解剖学から始め、インソール療法の基礎理論を学びます。初心者の方でも安心して受講できる内容です。</p><ul><li>足部の解剖学と機能</li><li>インソールの種類と特徴</li><li>基本的な処方方法</li></ul>',
      instructor: therapists[0]?.id,
      category: categories.find(c => c.slug === 'course-beginner')?.id,
      level: 'beginner',
      duration: 480,
      lesson_count: 8,
      price: 29800,
      discount_price: 24800,
      requirements: '医療従事者または関連分野の学生',
      learning_objectives: [
        '足部の基本的な解剖学と機能を理解する',
        'インソールの種類と特徴を説明できる',
        '基本的なインソール処方ができる'
      ],
      featured: true,
      enrollment_count: 45,
      rating_average: 4.7,
      status: 'published',
    },
    {
      title: 'スポーツ選手のためのインソール療法',
      slug: 'sports-insole-therapy',
      description: '<p>スポーツ選手特有の足部問題とインソールによる解決方法を学びます。</p><p>様々なスポーツに対応した実践的な内容です。</p>',
      instructor: therapists[0]?.id,
      category: categories.find(c => c.slug === 'course-intermediate')?.id,
      level: 'intermediate',
      duration: 600,
      lesson_count: 10,
      price: 39800,
      requirements: 'インソール療法の基礎知識',
      learning_objectives: [
        'スポーツ選手の足部特性を理解する',
        '競技別のインソール処方ができる',
        'パフォーマンス向上のための調整方法を習得する'
      ],
      featured: true,
      enrollment_count: 28,
      rating_average: 4.9,
      status: 'published',
    },
  ];

  for (const course of courseData) {
    const created = await createItem('members_courses', course);
    if (created) courses.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 4. Public_Articles（公開記事）
  // ==========================================================================
  console.log('\n📝 ブログ記事を作成します...\n');

  const articles = [];

  const articleData = [
    {
      title: 'インソール療法とは？足のトラブルを解決する最新治療',
      slug: 'what-is-insole-therapy',
      excerpt: 'インソール療法は、足部の問題を解決する効果的な治療法です。この記事では、インソールの基本から最新の治療法まで詳しく解説します。',
      body: '<h2>インソール療法の基礎</h2><p>インソール療法は、足部の機能を改善し、痛みや不快感を軽減する治療法です。</p><h3>主な適応症</h3><ul><li>扁平足</li><li>外反母趾</li><li>足底筋膜炎</li><li>膝痛・腰痛</li></ul><h3>インソールの効果</h3><p>適切なインソールは、足部のアーチをサポートし、体重分散を最適化することで、様々な症状を改善します。</p>',
      category: categories.find(c => c.slug === 'insole-therapy')?.id,
      author: adminUserId,
      tags: ['インソール', '治療法', '足の健康'],
      views: 245,
      featured: true,
      status: 'published',
      published_at: new Date().toISOString(),
      meta_title: 'インソール療法とは？効果と治療法を解説',
      meta_description: 'インソール療法の基礎知識、効果、適応症について専門医が詳しく解説します。',
    },
    {
      title: 'スポーツ選手に多い足のトラブルと予防法',
      slug: 'sports-foot-problems',
      excerpt: 'スポーツ選手特有の足部トラブルとその予防・治療方法について、スポーツ医学の観点から解説します。',
      body: '<h2>スポーツと足部障害</h2><p>激しいトレーニングや競技により、スポーツ選手の足には大きな負担がかかります。</p><h3>よくある足部トラブル</h3><ul><li>疲労骨折</li><li>アキレス腱炎</li><li>足底筋膜炎</li><li>足関節捻挫</li></ul><h3>予防のポイント</h3><p>適切なシューズ選び、インソールの使用、ストレッチングが重要です。</p>',
      category: categories.find(c => c.slug === 'sports-medicine')?.id,
      author: adminUserId,
      tags: ['スポーツ医学', '予防', 'アスリート'],
      views: 189,
      featured: false,
      status: 'published',
      published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      title: '扁平足の治療と日常生活での注意点',
      slug: 'flat-feet-treatment',
      excerpt: '扁平足（へんぺいそく）の症状、原因、治療法について詳しく解説。日常生活での注意点も紹介します。',
      body: '<h2>扁平足とは</h2><p>扁平足は、足のアーチが低下または消失した状態です。</p><h3>症状</h3><ul><li>足の疲れやすさ</li><li>足裏の痛み</li><li>膝や腰への影響</li></ul><h3>治療法</h3><p>インソール療法、運動療法、必要に応じて手術療法を行います。</p>',
      category: categories.find(c => c.slug === 'foot-medicine')?.id,
      author: adminUserId,
      tags: ['扁平足', '足の病気', '治療'],
      views: 312,
      featured: false,
      status: 'published',
      published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];

  for (const article of articleData) {
    const created = await createItem('public_articles', article);
    if (created) articles.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 5. Public_FAQ（FAQ）
  // ==========================================================================
  console.log('\n❓ FAQを作成します...\n');

  const faqs = [];

  const faqData = [
    {
      question: 'インソールはどのくらいの期間使えますか？',
      answer: '<p>一般的なインソールの寿命は、使用頻度にもよりますが<strong>6ヶ月〜1年程度</strong>です。</p><p>以下のような場合は交換をお勧めします：</p><ul><li>素材が劣化してきた</li><li>形状が変形した</li><li>効果が感じられなくなった</li></ul>',
      category: categories.find(c => c.slug === 'faq-general')?.id,
      sort_order: 1,
      helpful_count: 45,
      views: 234,
      status: 'published',
    },
    {
      question: '初めての受講でも大丈夫ですか？',
      answer: '<p>はい、<strong>初心者の方でも安心</strong>して受講いただけます。</p><p>初級コースでは基礎から丁寧に解説していますので、医療従事者であれば予備知識がなくても問題ありません。</p><p>不安な点があれば、事前に講師へご相談いただくことも可能です。</p>',
      category: categories.find(c => c.slug === 'faq-general')?.id,
      sort_order: 2,
      helpful_count: 67,
      views: 189,
      status: 'published',
    },
    {
      question: 'コース修了後に資格は取得できますか？',
      answer: '<p>コースを修了すると、<strong>修了証明書</strong>を発行いたします。</p><p>ただし、これは公的資格ではなく、当プラットフォームが発行する修了証となります。</p><p>将来的には、認定資格制度の導入も検討しております。</p>',
      category: categories.find(c => c.slug === 'faq-general')?.id,
      sort_order: 3,
      helpful_count: 52,
      views: 156,
      status: 'published',
    },
    {
      question: '返金保証はありますか？',
      answer: '<p>コース開始後<strong>7日以内</strong>であれば、全額返金に応じます。</p><p>ただし、以下の条件があります：</p><ul><li>コース進行率が10%以下であること</li><li>明確な理由があること</li></ul><p>返金をご希望の場合は、お問い合わせフォームよりご連絡ください。</p>',
      category: categories.find(c => c.slug === 'faq-general')?.id,
      sort_order: 4,
      helpful_count: 38,
      views: 201,
      status: 'published',
    },
  ];

  for (const faq of faqData) {
    const created = await createItem('public_faq', faq);
    if (created) faqs.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 6. Products_Internal（自社商品）
  // ==========================================================================
  console.log('\n🏢 自社商品を作成します...\n');

  const productsInternal = [];

  const productInternalData = [
    {
      name: 'メディカルインソール プロ - スタンダード',
      slug: 'medical-insole-pro-standard',
      sku: 'MIP-STD-001',
      category: categories.find(c => c.slug === 'products')?.id,
      short_description: '医療用素材を使用した高品質インソール。日常使いに最適なスタンダードモデル。',
      description: '<h2>製品特徴</h2><p>医療現場で培った技術を活かし、快適性と機能性を両立しました。</p><h3>主な特徴</h3><ul><li>医療用EVA素材使用</li><li>3層構造のアーチサポート</li><li>抗菌・防臭加工</li><li>日本製</li></ul><h3>推奨用途</h3><p>日常生活、立ち仕事、ウォーキングなど</p>',
      features: ['医療用素材', '抗菌防臭', '日本製', '3層構造'],
      specifications: {
        'サイズ': 'S(22-24cm) / M(24-26cm) / L(26-28cm)',
        '素材': 'EVA樹脂、ポリエステル',
        '重量': '約45g（片足・Mサイズ）',
        '厚さ': '約3mm',
        '耐久性': '約6ヶ月〜1年',
        '対応シューズ': 'スニーカー、ビジネスシューズ、ウォーキングシューズ'
      },
      price: 5980,
      sale_price: 4980,
      cost: 2000,
      stock: 150,
      stock_status: 'in_stock',
      manufacturer: '自社製造',
      supplier: '国内工場',
      featured: true,
      status: 'published',
      meta_title: 'メディカルインソール プロ - 医療用高品質インソール',
      meta_description: '医療現場で培った技術を活かした高品質インソール。日常使いに最適。',
    },
    {
      name: 'メディカルインソール プロ - スポーツ',
      slug: 'medical-insole-pro-sports',
      sku: 'MIP-SPT-001',
      category: categories.find(c => c.slug === 'products')?.id,
      short_description: 'アスリート向け高機能インソール。衝撃吸収とパフォーマンス向上を実現。',
      description: '<h2>スポーツ専用設計</h2><p>激しい運動にも対応する高機能モデル。</p><h3>主な特徴</h3><ul><li>高反発クッション材</li><li>強化アーチサポート</li><li>通気性メッシュ素材</li><li>軽量設計</li></ul><h3>対応スポーツ</h3><p>ランニング、テニス、バスケットボール、サッカーなど</p>',
      features: ['高反発素材', '強化サポート', '軽量', '通気性'],
      specifications: {
        'サイズ': 'S(22-24cm) / M(24-26cm) / L(26-28cm)',
        '素材': 'ポリウレタン、メッシュファブリック',
        '重量': '約35g（片足・Mサイズ）',
        '厚さ': '約4mm',
        '耐久性': '約4ヶ月〜8ヶ月',
        '対応シューズ': 'スポーツシューズ全般'
      },
      price: 7980,
      cost: 3000,
      stock: 80,
      stock_status: 'in_stock',
      manufacturer: '自社製造',
      supplier: '国内工場',
      featured: true,
      status: 'published',
      meta_title: 'メディカルインソール プロ スポーツ - アスリート向け',
      meta_description: 'アスリート向け高機能インソール。衝撃吸収とパフォーマンス向上を実現。',
    },
  ];

  for (const product of productInternalData) {
    const created = await createItem('products_internal', product);
    if (created) productsInternal.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 7. Products_Competitor（競合商品）
  // ==========================================================================
  console.log('\n🔍 競合商品を作成します...\n');

  const productsCompetitor = [];

  const productCompetitorData = [
    {
      name: 'スーパーフットインソール - ベーシック',
      manufacturer: 'A社',
      category: categories.find(c => c.slug === 'products')?.id,
      description: '<p>市場シェアNo.1のインソールブランド。廉価版モデル。</p>',
      price: 2980,
      features: ['低価格', '豊富なサイズ展開', '全国店舗で購入可能'],
      strengths: ['価格が安い', '入手しやすい', '知名度が高い'],
      weaknesses: ['耐久性が低い', '機能性は限定的', 'カスタマイズ不可'],
      specifications: {
        'サイズ': 'XS〜XL（5サイズ展開）',
        '素材': 'PVC、スポンジ',
        '重量': '約60g',
        '価格帯': '2,000〜3,000円'
      },
      target_market: '一般消費者向け、初心者層',
      market_share: 28.5,
      website_url: 'https://example.com/competitor-a',
      purchase_url: 'https://example.com/buy-competitor-a',
      notes: '最大の競合。価格競争力が強い。品質面で差別化が必要。',
      status: 'active',
    },
    {
      name: 'プロアスリート インソールX',
      manufacturer: 'B社',
      category: categories.find(c => c.slug === 'products')?.id,
      description: '<p>プロアスリート向けハイエンドモデル。高価格帯。</p>',
      price: 12800,
      features: ['カーボンファイバー使用', 'カスタムフィッティング', 'プロ仕様'],
      strengths: ['高機能', 'ブランド力', 'プロ使用実績'],
      weaknesses: ['価格が高い', '一般向けではない', '専門店でしか買えない'],
      specifications: {
        'サイズ': 'カスタムフィッティング',
        '素材': 'カーボンファイバー、高反発ウレタン',
        '重量': '約30g',
        '価格帯': '10,000〜15,000円'
      },
      target_market: 'プロアスリート、シリアスランナー',
      market_share: 8.3,
      website_url: 'https://example.com/competitor-b',
      purchase_url: 'https://example.com/buy-competitor-b',
      notes: 'ハイエンド市場の競合。品質は高いが価格も高い。中価格帯で勝負。',
      status: 'active',
    },
  ];

  for (const product of productCompetitorData) {
    const created = await createItem('products_competitor', product);
    if (created) productsCompetitor.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 8. Products_Reviews（レビュー）
  // ==========================================================================
  console.log('\n⭐ 商品レビューを作成します...\n');

  const reviews = [];

  const reviewData = [
    {
      user: adminUserId,
      product_internal: productsInternal[0]?.id,
      rating: 5,
      title: '期待以上の効果！',
      comment: '長時間の立ち仕事で足が疲れやすかったのですが、このインソールを使い始めてから劇的に改善しました。特にアーチサポートがしっかりしていて、足裏全体で体重を支えている感じがします。',
      pros: ['快適な装着感', '疲れにくい', '品質が良い'],
      cons: ['少し価格が高め'],
      verified_purchase: true,
      helpful_count: 12,
      status: 'published',
    },
    {
      user: adminUserId,
      product_internal: productsInternal[1]?.id,
      rating: 4,
      title: 'ランニングに最適',
      comment: 'マラソン練習用に購入。クッション性が良く、長距離走でも足が痛くなりにくくなりました。もう少し耐久性があれば満点です。',
      pros: ['軽量', 'クッション性抜群', 'フィット感が良い'],
      cons: ['耐久性がやや心配'],
      verified_purchase: true,
      helpful_count: 8,
      status: 'published',
    },
  ];

  for (const review of reviewData) {
    const created = await createItem('products_reviews', review);
    if (created) reviews.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 9. Members_Enrollments（受講状況）
  // ==========================================================================
  console.log('\n📚 受講状況を作成します...\n');

  const enrollments = [];

  const enrollmentData = [
    {
      user: adminUserId,
      course: courses[0]?.id,
      enrolled_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      progress: 65,
      last_accessed_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'in_progress',
      certificate_issued: false,
      notes: '順調に進んでいます',
    },
  ];

  for (const enrollment of enrollmentData) {
    const created = await createItem('members_enrollments', enrollment);
    if (created) enrollments.push(created);
    await sleep(300);
  }

  // ==========================================================================
  // 完了
  // ==========================================================================
  console.log('\n\n✅ サンプルデータの投入が完了しました！\n');
  console.log('📊 作成されたデータ:');
  console.log(`  - カテゴリ: ${categories.length}件`);
  console.log(`  - 治療家プロフィール: ${therapists.length}件`);
  console.log(`  - コース: ${courses.length}件`);
  console.log(`  - ブログ記事: ${articles.length}件`);
  console.log(`  - FAQ: ${faqs.length}件`);
  console.log(`  - 自社商品: ${productsInternal.length}件`);
  console.log(`  - 競合商品: ${productsCompetitor.length}件`);
  console.log(`  - レビュー: ${reviews.length}件`);
  console.log(`  - 受講状況: ${enrollments.length}件`);
  console.log('\n次のステップ:');
  console.log('1. Directus管理画面でデータを確認');
  console.log('2. 各コレクションでデータの表示・編集を試す');
  console.log('3. リレーションが正しく動作しているか確認\n');
}

// 実行
main().catch(error => {
  console.error('\n❌ エラーが発生しました:', error);
  process.exit(1);
});
