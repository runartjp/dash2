import { NextResponse } from 'next/server';
import { updateProjectProgress } from '../utils/progress';

const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

// 管理者認証情報で一時トークン取得
async function getAdminToken() {
  console.log('[DEBUG] Logging in to Directus:', DIRECTUS_URL);
  console.log('[DEBUG] Email:', process.env.DIRECTUS_ADMIN_EMAIL || 'admin@example.com');

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
    console.error('[ERROR] Login failed:', response.status, data);
    throw new Error('Failed to get admin token');
  }

  console.log('[DEBUG] Login successful, token:', data.data.access_token.substring(0, 20) + '...');
  return data.data.access_token;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project');

    // system fields (date_created, date_updated) are not accessible by Public policy
    let url = `${DIRECTUS_URL}/items/tasks?fields=*,project.id,project.name,project.key,assignee.first_name,assignee.last_name,assignee.username`;

    // プロジェクトIDでフィルタリング
    if (projectId) {
      url += `&filter[project][_eq]=${projectId}`;
    }

    // 一時的にPublicアクセスを試す（認証なし）
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ERROR] Failed to fetch tasks:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error('タスク取得エラー:', error);
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = await getAdminToken();

    const response = await fetch(`${DIRECTUS_URL}/items/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Directus error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // プロジェクトに紐づいている場合は進捗を自動更新
    if (body.project) {
      try {
        await updateProjectProgress(body.project);
      } catch (progressError) {
        console.error('Failed to update project progress:', progressError);
        // 進捗更新失敗はタスク作成を失敗させない
      }
    }

    return NextResponse.json(data.data, { status: 201 });
  } catch (error: any) {
    console.error('タスク作成エラー:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
