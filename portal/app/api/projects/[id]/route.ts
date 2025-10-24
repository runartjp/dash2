import { NextResponse } from 'next/server';

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
    const url = `${DIRECTUS_URL}/items/projects/${params.id}?fields=*,owner.first_name,owner.last_name,owner.username`;

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
    console.error('プロジェクト取得エラー:', error);
    return NextResponse.json(
      { error: 'プロジェクトの取得に失敗しました', details: error.message },
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

    const response = await fetch(`${DIRECTUS_URL}/items/projects/${params.id}`, {
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
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error('プロジェクト更新エラー:', error);
    return NextResponse.json(
      { error: 'プロジェクトの更新に失敗しました', details: error.message },
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

    const response = await fetch(`${DIRECTUS_URL}/items/projects/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('プロジェクト削除エラー:', error);
    return NextResponse.json(
      { error: 'プロジェクトの削除に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
