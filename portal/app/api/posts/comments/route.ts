import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

// 管理者認証情報で一時トークン取得
async function getAdminToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'dash2admin',
    }),
  });
  const data = await response.json();
  return data.data.access_token;
}

// コメント数を更新
async function updatePostCommentsCount(postId: string, token: string): Promise<void> {
  try {
    // コメント数をカウント
    const response = await fetch(
      `${DIRECTUS_URL}/items/community_comments?filter[post][_eq]=${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const count = data.data?.length || 0;

    // 投稿のコメント数を更新
    await fetch(`${DIRECTUS_URL}/items/community_posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        comments_count: count,
      }),
    });
  } catch (error) {
    console.error('Error updating comments count:', error);
  }
}

// コメント一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'postIdが必要です' },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    const response = await fetch(
      `${DIRECTUS_URL}/items/community_comments?filter[post][_eq]=${postId}&fields=*,user.*,is_edited,edited_at&sort=date_created`,
      {
        headers: {
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
    console.error('コメント取得エラー:', error);
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

// コメントを追加
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
    const { postId, content } = body;
    const authorId = (session.user as any).id;

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'postIdとcontentが必要です' },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    // コメントを作成
    const response = await fetch(`${DIRECTUS_URL}/items/community_comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        post: postId,
        user: authorId,
        content,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // コメント数を更新
    await updatePostCommentsCount(postId, token);

    return NextResponse.json(data.data, { status: 201 });
  } catch (error: any) {
    console.error('コメント追加エラー:', error);
    return NextResponse.json(
      { error: 'コメントの追加に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
