const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function getAdminToken() {
  const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return response.data.data.access_token;
}

async function addCommentEditFields() {
  try {
    const token = await getAdminToken();

    // is_editedフィールドを追加
    console.log('is_edited フィールドを追加中...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/community_comments`,
        {
          field: 'is_edited',
          type: 'boolean',
          meta: {
            interface: 'boolean',
            special: null,
            options: {
              label: '編集済み',
            },
            display: 'boolean',
            readonly: false,
            hidden: false,
            width: 'half',
          },
          schema: {
            default_value: false,
            is_nullable: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✓ is_edited フィールドを追加しました');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.extensions?.code === 'FAILED_VALIDATION') {
        console.log('⚠ is_edited フィールドは既に存在します');
      } else {
        throw error;
      }
    }

    // edited_atフィールドを追加
    console.log('edited_at フィールドを追加中...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/community_comments`,
        {
          field: 'edited_at',
          type: 'timestamp',
          meta: {
            interface: 'datetime',
            special: null,
            options: {
              label: '編集日時',
            },
            display: 'datetime',
            readonly: false,
            hidden: false,
            width: 'half',
          },
          schema: {
            is_nullable: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✓ edited_at フィールドを追加しました');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.extensions?.code === 'FAILED_VALIDATION') {
        console.log('⚠ edited_at フィールドは既に存在します');
      } else {
        throw error;
      }
    }

    console.log('\n✅ コメント編集フィールドの追加が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error.response?.data || error.message);
    process.exit(1);
  }
}

addCommentEditFields();
