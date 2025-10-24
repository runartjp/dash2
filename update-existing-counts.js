const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function updateExistingCounts() {
  try {
    // 1. ログイン
    console.log('Logging in to Directus...');
    const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.data.access_token;
    console.log('✓ Logged in successfully');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. すべての投稿を取得
    console.log('\nFetching all posts...');
    const postsResponse = await axios.get(
      `${DIRECTUS_URL}/items/community_posts`,
      { headers }
    );
    const posts = postsResponse.data.data;
    console.log(`Found ${posts.length} posts`);

    // 3. 各投稿のいいね数とコメント数をカウント・更新
    console.log('\nUpdating counts for each post...');
    for (const post of posts) {
      console.log(`\nProcessing post ${post.id}...`);

      // いいね数をカウント
      const likesResponse = await axios.get(
        `${DIRECTUS_URL}/items/community_likes?filter[post][_eq]=${post.id}`,
        { headers }
      );
      const likesCount = likesResponse.data.data.length;
      console.log(`  Likes: ${likesCount}`);

      // コメント数をカウント
      const commentsResponse = await axios.get(
        `${DIRECTUS_URL}/items/community_comments?filter[post][_eq]=${post.id}`,
        { headers }
      );
      const commentsCount = commentsResponse.data.data.length;
      console.log(`  Comments: ${commentsCount}`);

      // 投稿を更新
      await axios.patch(
        `${DIRECTUS_URL}/items/community_posts/${post.id}`,
        {
          likes_count: likesCount,
          comments_count: commentsCount,
        },
        { headers }
      );
      console.log(`  ✓ Updated post ${post.id}`);
    }

    console.log('\n✅ All counts updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

updateExistingCounts();
