const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function main() {
  try {
    // ログイン
    const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.data.access_token;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // ユーザー一覧を取得（usernameを含む）
    const usersResponse = await axios.get(
      `${DIRECTUS_URL}/users?fields=id,first_name,last_name,email,username`,
      { headers }
    );

    console.log('=== 現在のユーザー情報 ===');
    console.log(JSON.stringify(usersResponse.data.data, null, 2));

    const userId = usersResponse.data.data[0].id;
    const currentUsername = usersResponse.data.data[0].username;

    console.log(`\n現在のusername: ${currentUsername || '(未設定)'}`);

    if (!currentUsername) {
      console.log('\nusernameを "admin" に設定します...');

      const updateResponse = await axios.patch(
        `${DIRECTUS_URL}/users/${userId}`,
        {
          username: 'admin',
        },
        { headers }
      );

      console.log('✅ usernameを設定しました');
      console.log(JSON.stringify(updateResponse.data.data, null, 2));
    } else {
      console.log('\n既にusernameが設定されています。');
    }

  } catch (error) {
    console.error('エラー:', error.response?.data || error.message);
  }
}

main();
