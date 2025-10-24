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

    // ユーザー一覧を取得
    const usersResponse = await axios.get(
      `${DIRECTUS_URL}/users?fields=id,first_name,last_name,email,role`,
      { headers }
    );

    console.log('=== ユーザー一覧 ===');
    console.log(JSON.stringify(usersResponse.data.data, null, 2));

    // ユーザーフィールド構造を確認
    const fieldsResponse = await axios.get(
      `${DIRECTUS_URL}/fields/directus_users`,
      { headers }
    );

    console.log('\n=== directus_users のフィールド一覧 ===');
    fieldsResponse.data.data.forEach(field => {
      console.log(`- ${field.field} (${field.type})`);
    });

  } catch (error) {
    console.error('エラー:', error.response?.data || error.message);
  }
}

main();
