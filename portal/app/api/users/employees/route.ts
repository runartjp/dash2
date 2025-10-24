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

export async function GET() {
  try {
    const token = await getAdminToken();

    // Administrator と Employee ロールのユーザーのみ取得
    // ロール名でフィルタリング
    const url = `${DIRECTUS_URL}/users?fields=id,first_name,last_name,email,role.name&filter[role][name][_in]=Administrator,Employee&filter[status][_eq]=active`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ユーザー名でソート（姓→名の順）
    const sortedUsers = data.data.sort((a: any, b: any) => {
      const nameA = `${a.last_name}${a.first_name}`;
      const nameB = `${b.last_name}${b.first_name}`;
      return nameA.localeCompare(nameB, 'ja');
    });

    return NextResponse.json(sortedUsers);
  } catch (error: any) {
    console.error('社員ユーザー取得エラー:', error);
    return NextResponse.json(
      { error: '社員ユーザーの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
