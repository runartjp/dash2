import { createDirectus, rest, createItem, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8056')
  .with(authentication())
  .with(rest());

async function createTestData() {
  try {
    // ログイン
    await client.login('admin@example.com', 'dash2admin');
    console.log('✓ Logged in successfully');

    // プロジェクト作成
    const project1 = await client.request(
      createItem('projects', {
        name: 'Webサイトリニューアル',
        key: 'PROJ-001',
        description: 'コーポレートサイトの全面リニューアルプロジェクト',
        status: 'active',
        priority: 'high',
        progress: 30,
        start_date: '2025-10-01',
        end_date: '2025-12-31',
      })
    );
    console.log('✓ Created project:', project1.name);

    const project2 = await client.request(
      createItem('projects', {
        name: 'モバイルアプリ開発',
        key: 'PROJ-002',
        description: 'iOS/Androidアプリの新規開発',
        status: 'planning',
        priority: 'medium',
        progress: 10,
        start_date: '2025-11-01',
        end_date: '2026-03-31',
      })
    );
    console.log('✓ Created project:', project2.name);

    // タスク作成
    const task1 = await client.request(
      createItem('tasks', {
        title: 'デザインカンプ作成',
        description: 'トップページのデザインカンプを作成する',
        status: 'in_progress',
        priority: 'high',
        project: project1.id,
        due_date: '2025-10-30',
      })
    );
    console.log('✓ Created task:', task1.title);

    const task2 = await client.request(
      createItem('tasks', {
        title: 'フロントエンド実装',
        description: 'React + Next.jsでフロントエンドを実装',
        status: 'todo',
        priority: 'medium',
        project: project1.id,
        due_date: '2025-11-15',
      })
    );
    console.log('✓ Created task:', task2.title);

    const task3 = await client.request(
      createItem('tasks', {
        title: '要件定義',
        description: 'アプリの要件を整理して定義する',
        status: 'todo',
        priority: 'high',
        project: project2.id,
        due_date: '2025-10-25',
      })
    );
    console.log('✓ Created task:', task3.title);

    console.log('\n✅ Test data created successfully!');
    console.log('- 2 projects');
    console.log('- 3 tasks');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

createTestData();
