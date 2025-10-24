import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = await getAdminToken();
    const body = await request.json();

    // コメントの所有者確認
    const commentResponse = await fetch(`${DIRECTUS_URL}/items/community_comments/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!commentResponse.ok) {
      throw new Error(`コメントの取得に失敗しました: ${commentResponse.status}`);
    }

    const commentData = await commentResponse.json();
    const userId = (session.user as any).id;

    // 所有者チェック（自分のコメントのみ編集可能）
    if (commentData.data.user !== userId) {
      return NextResponse.json(
        { error: '他のユーザーのコメントは編集できません' },
        { status: 403 }
      );
    }

    // 編集実行
    const response = await fetch(`${DIRECTUS_URL}/items/community_comments/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: body.content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedComment = await response.json();
    return NextResponse.json(updatedComment.data);
  } catch (error: any) {
    console.error('コメント編集エラー:', error);
    return NextResponse.json(
      { error: 'コメントの編集に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (!postId) {
      return NextResponse.json(
        { error: 'postIdが必要です' },
        { status: 400 }
      );
    }

    const token = await getAdminToken();

    // コメントの所有者確認
    const commentResponse = await fetch(`${DIRECTUS_URL}/items/community_comments/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!commentResponse.ok) {
      throw new Error(`コメントの取得に失敗しました: ${commentResponse.status}`);
    }

    const commentData = await commentResponse.json();
    const userId = (session.user as any).id;

    // 所有者チェック（自分のコメントのみ削除可能）
    if (commentData.data.user !== userId) {
      return NextResponse.json(
        { error: '他のユーザーのコメントは削除できません' },
        { status: 403 }
      );
    }

    // 削除実行
    const response = await fetch(`${DIRECTUS_URL}/items/community_comments/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // コメント数を更新
    await updatePostCommentsCount(postId, token);

    return NextResponse.json({ message: '削除しました' });
  } catch (error: any) {
    console.error('コメント削除エラー:', error);
    return NextResponse.json(
      { error: 'コメントの削除に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
