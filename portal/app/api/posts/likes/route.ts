import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.data || !data.data.access_token) {
    throw new Error('No access token received');
  }

  return data.data.access_token;
}

// いいね数を更新
async function updatePostLikesCount(postId: string, token: string): Promise<void> {
  try {
    // いいね数をカウント
    const response = await fetch(
      `${DIRECTUS_URL}/items/community_likes?filter[post][_eq]=${postId}`,
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

    // 投稿のいいね数を更新
    await fetch(`${DIRECTUS_URL}/items/community_posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        likes_count: count,
      }),
    });
  } catch (error) {
    console.error('Error updating likes count:', error);
  }
}

// いいねを追加
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
    const { postId } = body;
    const userId = (session.user as any).id;

    if (!postId) {
      return NextResponse.json(
        { error: 'postIdが必要です' },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    // いいねを作成
    const response = await fetch(`${DIRECTUS_URL}/items/community_likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        post: postId,
        user: userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // いいね数を更新
    await updatePostLikesCount(postId, token);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('いいね追加エラー:', error);
    return NextResponse.json(
      { error: 'いいねの追加に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

// いいねを削除
export async function DELETE(request: Request) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = (session.user as any).id;

    if (!postId) {
      return NextResponse.json(
        { error: 'postIdが必要です' },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    // いいねを検索
    const response = await fetch(
      `${DIRECTUS_URL}/items/community_likes?filter[post][_eq]=${postId}&filter[user][_eq]=${userId}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: 'いいねが見つかりません' },
        { status: 404 }
      );
    }

    const likeId = data.data[0].id;

    // いいねを削除
    const deleteResponse = await fetch(`${DIRECTUS_URL}/items/community_likes/${likeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!deleteResponse.ok) {
      throw new Error(`HTTP error! status: ${deleteResponse.status}`);
    }

    // いいね数を更新
    await updatePostLikesCount(postId, token);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('いいね削除エラー:', error);
    return NextResponse.json(
      { error: 'いいねの削除に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

// ユーザーがいいねしているかチェック
export async function GET(request: Request) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ liked: false });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = (session.user as any).id;

    if (!postId) {
      return NextResponse.json(
        { error: 'postIdが必要です' },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    const response = await fetch(
      `${DIRECTUS_URL}/items/community_likes?filter[post][_eq]=${postId}&filter[user][_eq]=${userId}&limit=1`,
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
    const liked = data.data && data.data.length > 0;

    return NextResponse.json({ liked });
  } catch (error: any) {
    console.error('いいねチェックエラー:', error);
    return NextResponse.json(
      { error: 'いいねのチェックに失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
