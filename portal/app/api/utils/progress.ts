const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

// 管理者認証情報で一時トークン取得
async function getAdminToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.DIRECTUS_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.DIRECTUS_ADMIN_PASSWORD || 'dash2admin',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.data?.access_token) {
    throw new Error('Failed to get admin token');
  }

  return data.data.access_token;
}

/**
 * プロジェクトの進捗を自動計算して更新
 * @param projectId プロジェクトID
 * @returns 更新された進捗率
 */
export async function updateProjectProgress(projectId: number): Promise<number> {
  try {
    const token = await getAdminToken();

    // プロジェクトに紐づくタスクを取得
    const tasksUrl = `${DIRECTUS_URL}/items/tasks?filter[project][_eq]=${projectId}&fields=id,status`;
    const tasksResponse = await fetch(tasksUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!tasksResponse.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasksData = await tasksResponse.json();
    const tasks = tasksData.data || [];

    // タスクが0件の場合は進捗0%
    if (tasks.length === 0) {
      await updateProgress(projectId, 0, token);
      return 0;
    }

    // 完了タスク数を計算（status === 'done'）
    const completedTasks = tasks.filter((task: any) => task.status === 'done').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    // プロジェクトの進捗を更新
    await updateProgress(projectId, progress, token);

    console.log(`[Progress] Project ${projectId}: ${completedTasks}/${tasks.length} tasks completed = ${progress}%`);
    return progress;
  } catch (error) {
    console.error(`Failed to update project progress for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * プロジェクトの進捗率を更新
 */
async function updateProgress(projectId: number, progress: number, token: string) {
  const updateUrl = `${DIRECTUS_URL}/items/projects/${projectId}`;
  const updateResponse = await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ progress }),
  });

  if (!updateResponse.ok) {
    throw new Error('Failed to update project progress');
  }
}
