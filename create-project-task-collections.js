const { createDirectus, rest, createCollection, createField, createRelation, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function setupCollections() {
  try {
    console.log('\n🚀 プロジェクト・タスク管理システム セットアップ開始\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // ログイン
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('✅ ログイン成功\n');

    // ========================================
    // 1. Projectsコレクション作成
    // ========================================
    console.log('📦 1/2: Projectsコレクション作成中...');

    await client.request(
      createCollection({
        collection: 'projects',
        meta: {
          icon: 'folder_open',
          note: 'プロジェクト管理',
          display_template: '{{name}}',
        },
        schema: {
          name: 'projects',
        },
      })
    );

    // Projectsフィールド作成
    const projectFields = [
      {
        field: 'name',
        type: 'string',
        meta: { interface: 'input', required: true, note: 'プロジェクト名' },
        schema: { is_nullable: false },
      },
      {
        field: 'key',
        type: 'string',
        meta: { interface: 'input', note: 'プロジェクトキー（例: PROJ-001）', readonly: true },
        schema: { is_nullable: true, is_unique: true },
      },
      {
        field: 'description',
        type: 'text',
        meta: { interface: 'input-multiline', note: 'プロジェクトの説明' },
        schema: { is_nullable: true },
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          note: 'プロジェクトステータス',
          options: {
            choices: [
              { text: '計画中', value: 'planning' },
              { text: '進行中', value: 'active' },
              { text: '保留', value: 'on_hold' },
              { text: '完了', value: 'completed' },
              { text: 'キャンセル', value: 'cancelled' },
            ],
          },
        },
        schema: { default_value: 'planning', is_nullable: false },
      },
      {
        field: 'priority',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          note: '優先度',
          options: {
            choices: [
              { text: '低', value: 'low' },
              { text: '中', value: 'medium' },
              { text: '高', value: 'high' },
            ],
          },
        },
        schema: { default_value: 'medium', is_nullable: false },
      },
      {
        field: 'start_date',
        type: 'date',
        meta: { interface: 'datetime', note: '開始日' },
        schema: { is_nullable: true },
      },
      {
        field: 'end_date',
        type: 'date',
        meta: { interface: 'datetime', note: '終了日' },
        schema: { is_nullable: true },
      },
      {
        field: 'progress',
        type: 'integer',
        meta: {
          interface: 'slider',
          note: '進捗率（0-100%）',
          options: { min: 0, max: 100, step: 5 },
        },
        schema: { default_value: 0, is_nullable: false },
      },
    ];

    for (const field of projectFields) {
      await client.request(createField('projects', field));
    }

    console.log('   ✅ Projectsコレクション完了\n');

    // ========================================
    // 2. Tasksコレクション作成
    // ========================================
    console.log('📦 2/2: Tasksコレクション作成中...');

    await client.request(
      createCollection({
        collection: 'tasks',
        meta: {
          icon: 'task_alt',
          note: 'タスク管理',
          display_template: '{{title}}',
        },
        schema: {
          name: 'tasks',
        },
      })
    );

    // Tasksフィールド作成
    const taskFields = [
      {
        field: 'title',
        type: 'string',
        meta: { interface: 'input', required: true, note: 'タスク名' },
        schema: { is_nullable: false },
      },
      {
        field: 'description',
        type: 'text',
        meta: { interface: 'input-multiline', note: 'タスクの詳細説明' },
        schema: { is_nullable: true },
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          note: 'タスクステータス',
          options: {
            choices: [
              { text: '未着手', value: 'todo' },
              { text: '進行中', value: 'in_progress' },
              { text: 'レビュー中', value: 'review' },
              { text: '完了', value: 'done' },
            ],
          },
        },
        schema: { default_value: 'todo', is_nullable: false },
      },
      {
        field: 'priority',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          note: '優先度',
          options: {
            choices: [
              { text: '低', value: 'low' },
              { text: '中', value: 'medium' },
              { text: '高', value: 'high' },
            ],
          },
        },
        schema: { default_value: 'medium', is_nullable: false },
      },
      {
        field: 'due_date',
        type: 'date',
        meta: { interface: 'datetime', note: '期限' },
        schema: { is_nullable: true },
      },
    ];

    for (const field of taskFields) {
      await client.request(createField('tasks', field));
    }

    console.log('   ✅ Tasksコレクション完了\n');

    // ========================================
    // 3. リレーション設定
    // ========================================
    console.log('🔗 リレーション設定中...\n');

    // Projects.owner → directus_users (Many-to-One)
    console.log('   - Projects.owner → directus_users');
    await client.request(
      createField('projects', {
        field: 'owner',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          note: 'プロジェクトオーナー',
          display: 'related-values',
          display_options: {
            template: '{{first_name}} {{last_name}}',
          },
        },
        schema: {
          is_nullable: true,
        },
      })
    );

    await client.request(
      createRelation({
        collection: 'projects',
        field: 'owner',
        related_collection: 'directus_users',
        meta: {
          one_field: null,
        },
        schema: {
          on_delete: 'SET NULL',
        },
      })
    );

    // Tasks.project → projects (Many-to-One)
    console.log('   - Tasks.project → projects');
    await client.request(
      createField('tasks', {
        field: 'project',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          note: '所属プロジェクト',
          display: 'related-values',
          display_options: {
            template: '{{name}}',
          },
        },
        schema: {
          is_nullable: true,
        },
      })
    );

    await client.request(
      createRelation({
        collection: 'tasks',
        field: 'project',
        related_collection: 'projects',
        meta: {
          one_field: 'tasks',
        },
        schema: {
          on_delete: 'SET NULL',
        },
      })
    );

    // Tasks.assignee → directus_users (Many-to-One)
    console.log('   - Tasks.assignee → directus_users');
    await client.request(
      createField('tasks', {
        field: 'assignee',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          note: '担当者',
          display: 'related-values',
          display_options: {
            template: '{{first_name}} {{last_name}}',
          },
        },
        schema: {
          is_nullable: true,
        },
      })
    );

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

    console.log('\n✅ リレーション設定完了\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 プロジェクト・タスク管理システム セットアップ完了！\n');
    console.log('📊 作成されたコレクション:');
    console.log('   1. projects - プロジェクト管理（9フィールド + owner）');
    console.log('   2. tasks - タスク管理（5フィールド + project + assignee）\n');
    console.log('🔗 リレーション:');
    console.log('   - Projects.owner → directus_users (M2O)');
    console.log('   - Tasks.project → projects (M2O)');
    console.log('   - Tasks.assignee → directus_users (M2O)');
    console.log('   - Projects.tasks ← tasks (O2M 逆参照)\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    if (error.errors) {
      console.error('詳細:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

setupCollections();
