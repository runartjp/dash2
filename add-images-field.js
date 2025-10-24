const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function addImagesField() {
  try {
    // ログイン
    const loginResponse = await axios.post(`${DIRECTUS_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const token = loginResponse.data.data.access_token;
    console.log('✓ ログイン成功\n');

    // community_postsにimagesフィールドを追加（複数画像対応）
    console.log('community_postsにimagesフィールドを追加中...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/fields/community_posts`,
        {
          field: 'images',
          type: 'alias',
          meta: {
            interface: 'files',
            special: ['files'],
            options: {
              folder: null,
              template: '{{title}}',
            },
            display: 'related-values',
            display_options: {
              template: '{{directus_files_id.title}}',
            },
            note: '投稿画像（複数可、最大4枚）',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✓ imagesフィールドを追加しました');
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.extensions?.code === 'FAILED_VALIDATION') {
        console.log('⚠ imagesフィールドは既に存在します');
      } else {
        throw error;
      }
    }

    // community_posts_filesジャンクションテーブルを作成
    console.log('\ncommunity_posts_filesジャンクションテーブルを作成中...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/collections`,
        {
          collection: 'community_posts_files',
          meta: {
            hidden: true,
            icon: 'import_export',
          },
          schema: {
            name: 'community_posts_files',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✓ ジャンクションテーブルを作成しました');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠ ジャンクションテーブルは既に存在します');
      } else {
        throw error;
      }
    }

    // ジャンクションテーブルのフィールドを追加
    const junctionFields = [
      {
        field: 'id',
        type: 'integer',
        schema: { is_primary_key: true, has_auto_increment: true },
        meta: { hidden: true },
      },
      {
        field: 'community_posts_id',
        type: 'integer',
        meta: {
          interface: 'select-dropdown-m2o',
          hidden: true,
        },
      },
      {
        field: 'directus_files_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          hidden: true,
        },
      },
      {
        field: 'sort',
        type: 'integer',
        meta: {
          interface: 'input',
          hidden: true,
        },
      },
    ];

    console.log('\nジャンクションテーブルのフィールドを追加中...');
    for (const field of junctionFields) {
      try {
        await axios.post(
          `${DIRECTUS_URL}/fields/community_posts_files`,
          field,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(`  ✓ ${field.field}`);
      } catch (error) {
        if (error.response?.data?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
          console.log(`  ⚠ ${field.field} は既に存在します`);
        } else {
          console.error(`  ✗ ${field.field}:`, error.response?.data || error.message);
        }
      }
    }

    // リレーションを作成
    console.log('\nリレーションを作成中...');
    try {
      await axios.post(
        `${DIRECTUS_URL}/relations`,
        {
          collection: 'community_posts',
          field: 'images',
          related_collection: 'community_posts_files',
          meta: {
            one_field: null,
            sort_field: 'sort',
            junction_field: 'community_posts_id',
          },
          schema: {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✓ リレーション（community_posts → community_posts_files）を作成しました');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠ リレーションは既に存在します');
      } else {
        console.error('リレーション作成エラー:', error.response?.data || error.message);
      }
    }

    try {
      await axios.post(
        `${DIRECTUS_URL}/relations`,
        {
          collection: 'community_posts_files',
          field: 'directus_files_id',
          related_collection: 'directus_files',
          meta: {
            one_field: null,
          },
          schema: {
            on_delete: 'SET NULL',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✓ リレーション（community_posts_files → directus_files）を作成しました');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠ リレーションは既に存在します');
      } else {
        console.error('リレーション作成エラー:', error.response?.data || error.message);
      }
    }

    console.log('\n✅ 画像フィールドの設定が完了しました');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.response?.data || error.message);
    process.exit(1);
  }
}

addImagesField();
