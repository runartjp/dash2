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

    // 投稿の所有者確認
    const postResponse = await fetch(`${DIRECTUS_URL}/items/community_posts/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!postResponse.ok) {
      throw new Error(`投稿の取得に失敗しました: ${postResponse.status}`);
    }

    const postData = await postResponse.json();
    const userId = (session.user as any).id;

    // 所有者チェック（自分の投稿のみ編集可能）
    if (postData.data.user !== userId) {
      return NextResponse.json(
        { error: '他のユーザーの投稿は編集できません' },
        { status: 403 }
      );
    }

    // 編集実行
    const response = await fetch(`${DIRECTUS_URL}/items/community_posts/${params.id}`, {
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

    const updatedPost = await response.json();
    return NextResponse.json(updatedPost.data);
  } catch (error: any) {
    console.error('投稿編集エラー:', error);
    return NextResponse.json(
      { error: '投稿の編集に失敗しました', details: error.message },
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

    const token = await getAdminToken();

    // 投稿の所有者確認
    const postResponse = await fetch(`${DIRECTUS_URL}/items/community_posts/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!postResponse.ok) {
      throw new Error(`投稿の取得に失敗しました: ${postResponse.status}`);
    }

    const postData = await postResponse.json();
    const userId = (session.user as any).id;

    // 所有者チェック（自分の投稿のみ削除可能）
    if (postData.data.user !== userId) {
      return NextResponse.json(
        { error: '他のユーザーの投稿は削除できません' },
        { status: 403 }
      );
    }

    // 削除実行
    const response = await fetch(`${DIRECTUS_URL}/items/community_posts/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ message: '削除しました' });
  } catch (error: any) {
    console.error('投稿削除エラー:', error);
    return NextResponse.json(
      { error: '投稿の削除に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
