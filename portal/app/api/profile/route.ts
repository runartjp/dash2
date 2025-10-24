import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

// 管理者認証情報で一時トークン取得（Directus API呼び出し用）
async function getAdminToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'dash2admin',
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.data || !data.data.access_token) {
    throw new Error('No access token received');
  }

  return data.data.access_token;
}

// プロフィール取得（GET）
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = await getAdminToken();

    // ユーザーIDまたはクエリパラメータからユーザーを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // プロフィール情報を取得
    const response = await fetch(
      `${DIRECTUS_URL}/users/${userId}?fields=id,first_name,last_name,email,username,avatar,description,bio,location,title,website,twitter,linkedin,github,occupation,company,birth_date,phone`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
    });

  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// プロフィール更新（PATCH）
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = await getAdminToken();
    const body = await request.json();

    // 更新可能なフィールドのホワイトリスト
    const allowedFields = [
      'first_name',
      'last_name',
      'username',
      'avatar',
      'description',
      'bio',
      'location',
      'title',
      'website',
      'twitter',
      'linkedin',
      'github',
      'occupation',
      'company',
      'birth_date',
      'phone',
    ];

    // 許可されたフィールドのみを抽出
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    }

    // プロフィール情報を更新
    const response = await fetch(
      `${DIRECTUS_URL}/users/${session.user.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update profile: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
    });

  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }
}
