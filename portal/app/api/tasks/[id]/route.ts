import { NextResponse } from 'next/server';
import { updateProjectProgress } from '../../utils/progress';

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = `${DIRECTUS_URL}/items/tasks/${params.id}?fields=*,project.id,project.name,project.key,assignee.first_name,assignee.last_name,assignee.username`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error('タスク取得エラー:', error);
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const token = await getAdminToken();

    // 元のタスク情報を取得（プロジェクトIDを知るため）
    const currentTaskResponse = await fetch(`${DIRECTUS_URL}/items/tasks/${params.id}?fields=project`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    let oldProjectId: number | null = null;
    if (currentTaskResponse.ok) {
      const currentTask = await currentTaskResponse.json();
      oldProjectId = currentTask.data?.project;
    }

    const response = await fetch(`${DIRECTUS_URL}/items/tasks/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 新しいプロジェクトIDと古いプロジェクトIDの進捗を更新
    const newProjectId = body.project || data.data?.project;

    try {
      // 古いプロジェクトから削除された場合
      if (oldProjectId && oldProjectId !== newProjectId) {
        await updateProjectProgress(oldProjectId);
      }
      // 新しいプロジェクトに追加された場合
      if (newProjectId) {
        await updateProjectProgress(newProjectId);
      }
    } catch (progressError) {
      console.error('Failed to update project progress:', progressError);
      // 進捗更新失敗はタスク更新を失敗させない
    }

    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error('タスク更新エラー:', error);
    return NextResponse.json(
      { error: 'タスクの更新に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAdminToken();

    // 削除前にタスク情報を取得（プロジェクトIDを知るため）
    const currentTaskResponse = await fetch(`${DIRECTUS_URL}/items/tasks/${params.id}?fields=project`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    let projectId: number | null = null;
    if (currentTaskResponse.ok) {
      const currentTask = await currentTaskResponse.json();
      projectId = currentTask.data?.project;
    }

    const response = await fetch(`${DIRECTUS_URL}/items/tasks/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // プロジェクトに紐づいていた場合は進捗を更新
    if (projectId) {
      try {
        await updateProjectProgress(projectId);
      } catch (progressError) {
        console.error('Failed to update project progress:', progressError);
        // 進捗更新失敗はタスク削除を失敗させない
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('タスク削除エラー:', error);
    return NextResponse.json(
      { error: 'タスクの削除に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
