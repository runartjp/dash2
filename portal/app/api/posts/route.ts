import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

export async function GET(request: Request) {
  try {
    const token = await getAdminToken();

    // クエリパラメータを取得（ページネーション用）
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    const hashtag = searchParams.get('hashtag');
    const user = searchParams.get('user');

    // ベースURL
    let url = `${DIRECTUS_URL}/items/community_posts?fields=id,content,post_type,mentioned_users,hashtags,is_pinned,is_edited,edited_at,status,date_created,date_updated,user.*,group,likes_count,comments_count,image&sort=-date_created&limit=${limit}&offset=${offset}`;

    // ハッシュタグフィルタリング（投稿内容を検索）
    if (hashtag) {
      url += `&filter[content][_contains]=${encodeURIComponent('#' + hashtag)}`;
    }

    // ユーザーフィルタリング（メンション）（投稿内容を検索）
    if (user) {
      url += `&filter[content][_contains]=${encodeURIComponent('@' + user)}`;
    }

    // 投稿一覧を取得（新しい順、user情報付き、いいね数・コメント数、画像）
    const response = await fetch(url,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error('投稿取得エラー:', error);
    return NextResponse.json(
      { error: '投稿の取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const token = await getAdminToken();

    // セッションユーザーのIDを使用
    const userId = (session.user as any).id;

    const response = await fetch(`${DIRECTUS_URL}/items/community_posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: body.content,
        user: userId,
        image: body.imageId || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data, { status: 201 });
  } catch (error: any) {
    console.error('投稿作成エラー:', error);
    return NextResponse.json(
      { error: '投稿の作成に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
