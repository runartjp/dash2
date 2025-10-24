const DIRECTUS_URL = 'http://localhost:8056';

async function checkTaskAssignee() {
  try {
    // タスク一覧を取得
    const response = await fetch(`${DIRECTUS_URL}/items/tasks?limit=3&fields=id,title,assignee`);
    const data = await response.json();

    console.log('=== タスク一覧のassigneeフィールド ===\n');
    data.data.forEach(task => {
      console.log(`ID: ${task.id}`);
      console.log(`タイトル: ${task.title}`);
      console.log(`Assignee: ${JSON.stringify(task.assignee, null, 2)}`);
      console.log('---');
    });

    // 詳細取得（assignee展開あり）
    if (data.data.length > 0) {
      const taskId = data.data[0].id;
      console.log(`\n=== タスク詳細 (ID: ${taskId}) - assignee展開あり ===\n`);

      const detailResponse = await fetch(
        `${DIRECTUS_URL}/items/tasks/${taskId}?fields=*,assignee.id,assignee.first_name,assignee.last_name,assignee.username`
      );
      const detailData = await detailResponse.json();

      console.log('Assigneeフィールド:', JSON.stringify(detailData.data.assignee, null, 2));
    }

  } catch (error) {
    console.error('エラー:', error.message);
  }
}

checkTaskAssignee();
