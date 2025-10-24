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

    // 2. community_postsにimageフィールドを追加（Many-to-One → directus_files）
    console.log('imageフィールドを追加中...');

    // まず、フィールドを作成
    const fieldData = {
      field: 'image',
      type: 'uuid',
      meta: {
        interface: 'file-image',
        special: ['file'],
        options: {
          folder: null,
        },
      },
      schema: {
        is_nullable: true,
        default_value: null,
      },
    };

    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/community_posts`,
        fieldData,
        { headers }
      );
      console.log('✅ imageフィールドを作成しました');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        console.log('⚠️ imageフィールドは既に存在します');
      } else {
        throw error;
      }
    }

    // 3. リレーションを作成（community_posts.image → directus_files）
    console.log('リレーションを作成中...');

    const relationData = {
      collection: 'community_posts',
      field: 'image',
      related_collection: 'directus_files',
      meta: {
        many_collection: 'community_posts',
        many_field: 'image',
        one_collection: 'directus_files',
        one_field: null,
        one_allowed_collections: null,
        junction_field: null,
        sort_field: null,
        one_deselect_action: 'nullify',
      },
      schema: {
        on_delete: 'SET NULL',
      },
    };

    try {
      await axios.post(
        `${DIRECTUS_URL}/relations`,
        relationData,
        { headers }
      );
      console.log('✅ リレーションを作成しました');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        console.log('⚠️ リレーションは既に存在します');
      } else {
        console.error('リレーション作成エラー:', error.response?.data || error.message);
        // リレーションエラーは続行可能
      }
    }

    console.log('\n✅ imageフィールドの追加が完了しました！');
    console.log('📝 community_posts.image → directus_files (Many-to-One)');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
