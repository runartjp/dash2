const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

async function createCollections() {
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

    // 2. community_post_likes コレクション作成
    console.log('\nCreating community_post_likes collection...');
    try {
      await axios.post(`${DIRECTUS_URL}/collections`, {
        collection: 'community_post_likes',
        meta: {
          collection: 'community_post_likes',
          icon: 'favorite',
          note: 'Likes for community posts',
        },
        schema: {
          name: 'community_post_likes',
        },
      }, { headers });
      console.log('✓ community_post_likes collection created');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠ community_post_likes already exists');
      } else {
        throw error;
      }
    }

    // 3. community_post_likes フィールド作成
    console.log('Creating fields for community_post_likes...');

    const likesFields = [
      {
        field: 'id',
        type: 'integer',
        schema: {
          is_primary_key: true,
          has_auto_increment: true,
        },
        meta: {
          hidden: true,
        },
      },
      {
        field: 'post',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input',
          display: 'raw',
        },
      },
      {
        field: 'user',
        type: 'uuid',
        schema: {},
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
        },
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {
          default_value: 'CURRENT_TIMESTAMP',
        },
        meta: {
          special: ['date-created'],
          interface: 'datetime',
          readonly: true,
        },
      },
    ];

    for (const field of likesFields) {
      try {
        await axios.post(
          `${DIRECTUS_URL}/fields/community_post_likes`,
          field,
          { headers }
        );
        console.log(`  ✓ Created field: ${field.field}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`  ⚠ Field ${field.field} already exists`);
        } else {
          console.error(`  ✗ Error creating field ${field.field}:`, error.response?.data);
        }
      }
    }

    // 4. community_post_comments コレクション作成
    console.log('\nCreating community_post_comments collection...');
    try {
      await axios.post(`${DIRECTUS_URL}/collections`, {
        collection: 'community_post_comments',
        meta: {
          collection: 'community_post_comments',
          icon: 'comment',
          note: 'Comments for community posts',
        },
        schema: {
          name: 'community_post_comments',
        },
      }, { headers });
      console.log('✓ community_post_comments collection created');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠ community_post_comments already exists');
      } else {
        throw error;
      }
    }

    // 5. community_post_comments フィールド作成
    console.log('Creating fields for community_post_comments...');

    const commentsFields = [
      {
        field: 'id',
        type: 'integer',
        schema: {
          is_primary_key: true,
          has_auto_increment: true,
        },
        meta: {
          hidden: true,
        },
      },
      {
        field: 'post',
        type: 'string',
        schema: {},
        meta: {
          interface: 'input',
          display: 'raw',
        },
      },
      {
        field: 'author',
        type: 'uuid',
        schema: {},
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
        },
      },
      {
        field: 'content',
        type: 'text',
        schema: {},
        meta: {
          interface: 'input-multiline',
          display: 'raw',
        },
      },
      {
        field: 'date_created',
        type: 'timestamp',
        schema: {
          default_value: 'CURRENT_TIMESTAMP',
        },
        meta: {
          special: ['date-created'],
          interface: 'datetime',
          readonly: true,
        },
      },
    ];

    for (const field of commentsFields) {
      try {
        await axios.post(
          `${DIRECTUS_URL}/fields/community_post_comments`,
          field,
          { headers }
        );
        console.log(`  ✓ Created field: ${field.field}`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`  ⚠ Field ${field.field} already exists`);
        } else {
          console.error(`  ✗ Error creating field ${field.field}:`, error.response?.data);
        }
      }
    }

    // 6. パーミッション設定（Public role）
    console.log('\nSetting permissions for Public role...');

    // Get Public role ID
    const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
    const publicRole = rolesResponse.data.data.find(r => r.name === 'Public');

    if (publicRole) {
      const permissions = [
        {
          collection: 'community_post_likes',
          action: 'create',
          permissions: {},
          fields: ['*'],
        },
        {
          collection: 'community_post_likes',
          action: 'read',
          permissions: {},
          fields: ['*'],
        },
        {
          collection: 'community_post_likes',
          action: 'delete',
          permissions: {},
          fields: ['*'],
        },
        {
          collection: 'community_post_comments',
          action: 'create',
          permissions: {},
          fields: ['*'],
        },
        {
          collection: 'community_post_comments',
          action: 'read',
          permissions: {},
          fields: ['*'],
        },
        {
          collection: 'community_post_comments',
          action: 'delete',
          permissions: {},
          fields: ['*'],
        },
      ];

      for (const perm of permissions) {
        try {
          await axios.post(
            `${DIRECTUS_URL}/permissions`,
            { ...perm, role: publicRole.id },
            { headers }
          );
          console.log(`  ✓ Set ${perm.action} permission for ${perm.collection}`);
        } catch (error) {
          if (error.response?.status === 400) {
            console.log(`  ⚠ Permission already exists`);
          } else {
            console.error(`  ✗ Error setting permission:`, error.response?.data);
          }
        }
      }
    }

    console.log('\n✅ All collections and permissions created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

createCollections();
