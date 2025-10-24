const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function main() {
  try {
    // 1. ログイン
    console.log('ログイン中...');
    const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.data.access_token;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. community_postsコレクションのimagesフィールドを削除
    console.log('imagesフィールドを削除中...');
    try {
      await axios.delete(
        `${DIRECTUS_URL}/fields/community_posts/images`,
        { headers }
      );
      console.log('✅ imagesフィールドを削除しました');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ imagesフィールドは既に存在しません');
      } else {
        throw error;
      }
    }

    // 3. community_posts_filesジャンクションテーブルを削除（存在する場合）
    console.log('community_posts_filesテーブルを削除中...');
    try {
      await axios.delete(
        `${DIRECTUS_URL}/collections/community_posts_files`,
        { headers }
      );
      console.log('✅ community_posts_filesテーブルを削除しました');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ community_posts_filesテーブルは既に存在しません');
      } else {
        throw error;
      }
    }

    console.log('\n✅ 画像関連フィールドの削除が完了しました！');
    console.log('サーバーを再起動してください。');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
