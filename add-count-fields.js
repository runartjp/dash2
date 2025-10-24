const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function addCountFields() {
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

    // 2. likes_count フィールド追加
    console.log('\nAdding likes_count field to community_posts...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/community_posts`,
        {
          field: 'likes_count',
          type: 'integer',
          schema: {
            default_value: 0,
          },
          meta: {
            interface: 'input',
            display: 'raw',
            readonly: true,
            note: 'Number of likes (auto-updated)',
          },
        },
        { headers }
      );
      console.log('  ✓ Created field: likes_count');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('  ⚠ Field likes_count already exists');
      } else {
        throw error;
      }
    }

    // 3. comments_count フィールド追加
    console.log('Adding comments_count field to community_posts...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/community_posts`,
        {
          field: 'comments_count',
          type: 'integer',
          schema: {
            default_value: 0,
          },
          meta: {
            interface: 'input',
            display: 'raw',
            readonly: true,
            note: 'Number of comments (auto-updated)',
          },
        },
        { headers }
      );
      console.log('  ✓ Created field: comments_count');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('  ⚠ Field comments_count already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Count fields created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

addCountFields();
