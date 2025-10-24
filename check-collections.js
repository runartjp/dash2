const { createDirectus, rest, readCollections, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function checkCollections() {
  try {
    console.log('\n📊 Directus コレクション確認\n');
    console.log(`接続先: ${DIRECTUS_URL}`);

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // ログイン
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('✅ ログイン成功\n');

    // 全コレクション取得
    const collections = await client.request(readCollections());

    // システムコレクションを除外
    const userCollections = collections.filter(c => !c.collection.startsWith('directus_'));

    console.log(`📁 ユーザーコレクション数: ${userCollections.length}\n`);

    if (userCollections.length === 0) {
      console.log('⚠️  ユーザーコレクションが存在しません。\n');
      return;
    }

    console.log('コレクション一覧:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const collection of userCollections) {
      console.log(`📦 ${collection.collection}`);
      if (collection.meta?.note) {
        console.log(`   説明: ${collection.meta.note}`);
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // プロジェクト/タスク関連のコレクションをチェック
    const projectRelated = ['projects', 'tasks', 'project_tasks', 'task_management'];
    const existingProjectCollections = userCollections.filter(c =>
      projectRelated.some(keyword => c.collection.toLowerCase().includes(keyword))
    );

    if (existingProjectCollections.length > 0) {
      console.log('⚠️  プロジェクト/タスク関連のコレクションが既に存在します:\n');
      existingProjectCollections.forEach(c => {
        console.log(`   - ${c.collection}`);
      });
      console.log('\n');
    } else {
      console.log('✅ プロジェクト/タスク関連のコレクションは存在しません。新規作成可能です。\n');
    }

  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.errors) {
      console.error('詳細:', error.errors);
    }
  }
}

checkCollections();
