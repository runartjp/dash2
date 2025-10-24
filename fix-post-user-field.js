const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function fixPostUserField() {
  try {
    // ログイン
    const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const token = loginResponse.data.data.access_token;

    // ユーザー情報を取得
    const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userId = userResponse.data.data.id;

    console.log(`ログイン成功: ユーザーID = ${userId}`);

    // 全投稿を取得
    const postsResponse = await axios.get(`${DIRECTUS_URL}/items/community_posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const posts = postsResponse.data.data;
    console.log(`\n投稿数: ${posts.length}`);

    // userフィールドがnullの投稿を更新
    for (const post of posts) {
      if (!post.user) {
        console.log(`\n投稿 ID ${post.id} を更新中...`);
        await axios.patch(
          `${DIRECTUS_URL}/items/community_posts/${post.id}`,
          {
            user: userId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`✓ 投稿 ID ${post.id} のuserフィールドを設定しました`);
      }
    }

    // コメントも同様に更新
    const commentsResponse = await axios.get(`${DIRECTUS_URL}/items/community_comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const comments = commentsResponse.data.data;
    console.log(`\nコメント数: ${comments.length}`);

    for (const comment of comments) {
      if (!comment.user) {
        console.log(`\nコメント ID ${comment.id} を更新中...`);
        await axios.patch(
          `${DIRECTUS_URL}/items/community_comments/${comment.id}`,
          {
            user: userId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`✓ コメント ID ${comment.id} のuserフィールドを設定しました`);
      }
    }

    console.log('\n✅ 全ての投稿とコメントのuserフィールドを更新しました');
  } catch (error) {
    console.error('エラー:', error.response?.data || error.message);
    process.exit(1);
  }
}

fixPostUserField();
