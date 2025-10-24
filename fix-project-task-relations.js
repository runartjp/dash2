const { createDirectus, rest, createRelation, readFields, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function fixRelations() {
  try {
    console.log('\n🔧 リレーション修正スクリプト\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // ログイン
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('✅ ログイン成功\n');

    // 既存のフィールドを確認
    console.log('📋 既存のフィールド確認中...\n');

    const projectFields = await client.request(readFields('projects'));
    const taskFields = await client.request(readFields('tasks'));

    console.log(`Projects フィールド数: ${projectFields.length}`);
    console.log(`Tasks フィールド数: ${taskFields.length}\n`);

    const hasProjectOwner = projectFields.some(f => f.field === 'owner');
    const hasTaskProject = taskFields.some(f => f.field === 'project');
    const hasTaskAssignee = taskFields.some(f => f.field === 'assignee');

    console.log(`Projects.owner: ${hasProjectOwner ? '✅' : '❌'}`);
    console.log(`Tasks.project: ${hasTaskProject ? '✅' : '❌'}`);
    console.log(`Tasks.assignee: ${hasTaskAssignee ? '✅' : '❌'}\n');

    // Tasks.project → projects リレーションを再作成
    if (hasTaskProject) {
      console.log('🔗 Tasks.project → projects リレーションを作成中...');
      try {
        await client.request(
          createRelation({
            collection: 'tasks',
            field: 'project',
            related_collection: 'projects',
            meta: {
              one_field: 'tasks',
              sort_field: null,
            },
            schema: {
              on_delete: 'SET NULL',
            },
          })
        );
        console.log('   ✅ 完了\n');
      } catch (error) {
        console.log(`   ⚠️  スキップ (既に存在するか、エラー: ${error.message})\n`);
      }
    }

    // Tasks.assignee → directus_users リレーションを再作成
    if (hasTaskAssignee) {
      console.log('🔗 Tasks.assignee → directus_users リレーションを作成中...');
      try {
        await client.request(
          createRelation({
            collection: 'tasks',
            field: 'assignee',
            related_collection: 'directus_users',
            meta: {
              one_field: null,
            },
            schema: {
              on_delete: 'SET NULL',
            },
          })
        );
        console.log('   ✅ 完了\n');
      } catch (error) {
        console.log(`   ⚠️  スキップ (既に存在するか、エラー: ${error.message})\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ リレーション修正完了！\n');
    console.log('次のステップ: Directus管理画面でリレーションを確認してください');
    console.log('URL: http://localhost:8056/admin\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    if (error.errors) {
      console.error('詳細:', JSON.stringify(error.errors, null, 2));
    }
  }
}

fixRelations();
