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

    console.log('=== プロフィール用フィールドを追加中 ===\n');

    // 追加するカスタムフィールド
    const customFields = [
      {
        field: 'bio',
        type: 'text',
        meta: {
          interface: 'input-rich-text-md',
          note: '詳細な自己紹介文（Markdown対応）',
          options: {
            toolbar: [
              'bold',
              'italic',
              'strikethrough',
              'link',
              'code',
              'bullist',
              'numlist',
              'blockquote'
            ]
          }
        },
        schema: {
          is_nullable: true,
        },
      },
      {
        field: 'website',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'ウェブサイトURL',
          placeholder: 'https://example.com',
        },
        schema: {
          is_nullable: true,
          max_length: 255,
        },
      },
      {
        field: 'twitter',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Twitterハンドル（@なし）',
          placeholder: 'username',
        },
        schema: {
          is_nullable: true,
          max_length: 50,
        },
      },
      {
        field: 'linkedin',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'LinkedInプロフィールURL',
          placeholder: 'https://linkedin.com/in/username',
        },
        schema: {
          is_nullable: true,
          max_length: 255,
        },
      },
      {
        field: 'github',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'GitHubユーザー名',
          placeholder: 'username',
        },
        schema: {
          is_nullable: true,
          max_length: 50,
        },
      },
      {
        field: 'birth_date',
        type: 'date',
        meta: {
          interface: 'datetime',
          note: '生年月日',
          display: 'datetime',
          display_options: {
            relative: false,
          },
        },
        schema: {
          is_nullable: true,
        },
      },
      {
        field: 'phone',
        type: 'string',
        meta: {
          interface: 'input',
          note: '電話番号',
          placeholder: '090-1234-5678',
        },
        schema: {
          is_nullable: true,
          max_length: 20,
        },
      },
      {
        field: 'occupation',
        type: 'string',
        meta: {
          interface: 'input',
          note: '職業',
          placeholder: 'エンジニア、デザイナー、etc',
        },
        schema: {
          is_nullable: true,
          max_length: 100,
        },
      },
      {
        field: 'company',
        type: 'string',
        meta: {
          interface: 'input',
          note: '所属会社・組織',
          placeholder: '株式会社〇〇',
        },
        schema: {
          is_nullable: true,
          max_length: 100,
        },
      },
    ];

    for (const field of customFields) {
      try {
        await axios.post(
          `${DIRECTUS_URL}/fields/directus_users`,
          field,
          { headers }
        );
        console.log(`✅ フィールド "${field.field}" を追加しました`);
      } catch (error) {
        if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
          console.log(`⚠️  フィールド "${field.field}" は既に存在します`);
        } else {
          console.error(`❌ フィールド "${field.field}" の追加に失敗:`, error.response?.data || error.message);
        }
      }
    }

    console.log('\n=== 完了 ===');
    console.log('既存のフィールド:');
    console.log('- avatar: プロフィール画像（directus_filesへのリレーション）');
    console.log('- description: 自己紹介文（短文）');
    console.log('- location: 場所');
    console.log('- title: 肩書き');
    console.log('- username: ユーザー名（@username）');
    console.log('\n追加したカスタムフィールド:');
    customFields.forEach(f => {
      console.log(`- ${f.field}: ${f.meta.note}`);
    });

  } catch (error) {
    console.error('エラー:', error.response?.data || error.message);
  }
}

main();
