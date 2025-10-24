const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function main() {
  try {
    // ログイン
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

    // directus_users に username フィールドを追加
    console.log('username フィールドを追加中...');

    const fieldData = {
      field: 'username',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'ユーザー名（例: admin）',
        },
        display: 'raw',
        readonly: false,
        hidden: false,
        sort: 5, // first_name の後
        width: 'half',
        translations: [
          {
            language: 'ja-JP',
            translation: 'ユーザー名',
          },
        ],
        note: 'メンション用のユーザー名（@username）',
      },
      schema: {
        is_nullable: true,
        is_unique: true, // ユーザー名は一意
        default_value: null,
      },
    };

    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/directus_users`,
        fieldData,
        { headers }
      );
      console.log('✅ username フィールドを作成しました');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        console.log('⚠️ username フィールドは既に存在します');
      } else {
        throw error;
      }
    }

    // 既存ユーザーに username を設定
    console.log('\n既存ユーザーに username を設定中...');

    const usersResponse = await axios.get(
      `${DIRECTUS_URL}/users?fields=id,first_name,last_name,email,username`,
      { headers }
    );

    const users = usersResponse.data.data;

    for (const user of users) {
      // username が既に設定されている場合はスキップ
      if (user.username) {
        console.log(`⏭️ ${user.email}: username は既に設定済み (@${user.username})`);
        continue;
      }

      // email から username を生成（@ の前の部分）
      const suggestedUsername = user.email.split('@')[0];

      await axios.patch(
        `${DIRECTUS_URL}/users/${user.id}`,
        { username: suggestedUsername },
        { headers }
      );

      console.log(`✅ ${user.email} → @${suggestedUsername}`);
    }

    console.log('\n✅ 完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
