import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    // system fields (date_created, date_updated) are not accessible by Public policy
    const url = `${DIRECTUS_URL}/items/projects?fields=*,owner.first_name,owner.last_name,owner.username`;

    // 一時的にPublicアクセスを試す（認証なし）
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ERROR] Failed to fetch projects:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error('プロジェクト取得エラー:', error);
    return NextResponse.json(
      { error: 'プロジェクトの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = await getAdminToken();

    // keyフィールドが存在しない場合は自動生成
    if (!body.key) {
      // 既存のプロジェクトを取得して次の番号を決定
      const existingResponse = await fetch(`${DIRECTUS_URL}/items/projects?sort=-date_created&limit=1`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let nextNumber = 1;
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        if (existingData.data && existingData.data.length > 0) {
          // 既存のプロジェクト数から次の番号を決定
          const allProjectsResponse = await fetch(`${DIRECTUS_URL}/items/projects?aggregate[count]=*`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (allProjectsResponse.ok) {
            const countData = await allProjectsResponse.json();
            nextNumber = (countData.data?.[0]?.count || 0) + 1;
          }
        }
      }

      // PROJ-001 形式のキーを生成
      body.key = `PROJ-${String(nextNumber).padStart(3, '0')}`;
    }

    const response = await fetch(`${DIRECTUS_URL}/items/projects`, {
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
    return NextResponse.json(data.data, { status: 201 });
  } catch (error: any) {
    console.error('プロジェクト作成エラー:', error);
    return NextResponse.json(
      { error: 'プロジェクトの作成に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
