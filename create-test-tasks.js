import { createDirectus, rest, createItem, readItems, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8056')
  .with(authentication())
  .with(rest());

async function createTestTasks() {
  try {
    // ログイン
    await client.login('admin@example.com', 'dash2admin');
    console.log('✓ Logged in successfully');

    // 既存のプロジェクトを取得
    const projects = await client.request(readItems('projects'));
    console.log(`✓ Found ${projects.length} existing projects`);

    if (projects.length === 0) {
      console.log('❌ No projects found. Please create projects first.');
      return;
    }

    const project1 = projects[0];
    const project2 = projects[1];

    console.log(`Using project 1: ${project1.name} (ID: ${project1.id})`);
    if (project2) console.log(`Using project 2: ${project2.name} (ID: ${project2.id})`);

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

    if (project2) {
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
    }

    console.log('\n✅ Test tasks created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

createTestTasks();
