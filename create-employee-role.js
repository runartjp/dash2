const DIRECTUS_URL = 'http://localhost:8056';

async function getAdminToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'dash2admin',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.data?.access_token) {
    throw new Error('Failed to get admin token');
  }

  return data.data.access_token;
}

async function createEmployeeRole() {
  try {
    const token = await getAdminToken();

    console.log('=== Employee ロール作成 ===\n');

    // 1. Employee ロールを作成
    const roleResponse = await fetch(`${DIRECTUS_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Employee',
        icon: 'badge',
        description: '社員用ロール。プロジェクト・タスク管理などの業務機能にアクセス可能。',
        admin_access: false,
        app_access: true, // Directus管理画面にアクセス可能
      }),
    });

    if (!roleResponse.ok) {
      const errorData = await roleResponse.json();
      console.error('ロール作成エラー:', errorData);
      throw new Error('Failed to create Employee role');
    }

    const roleData = await roleResponse.json();
    const employeeRoleId = roleData.data.id;

    console.log('✅ Employee ロールを作成しました');
    console.log(`   ID: ${employeeRoleId}`);
    console.log(`   名前: ${roleData.data.name}\n`);

    // 2. Employee ロールに必要なコレクションへのアクセス権限を設定
    console.log('=== 権限設定中 ===\n');

    const collections = ['projects', 'tasks'];

    for (const collection of collections) {
      try {
        const permissionResponse = await fetch(`${DIRECTUS_URL}/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: employeeRoleId,
            collection: collection,
            action: 'create',
            permissions: {},
            fields: ['*'],
          }),
        });

        if (permissionResponse.ok) {
          console.log(`✅ ${collection} - 作成権限を設定`);
        }

        // Read権限
        await fetch(`${DIRECTUS_URL}/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: employeeRoleId,
            collection: collection,
            action: 'read',
            permissions: {},
            fields: ['*'],
          }),
        });
        console.log(`✅ ${collection} - 読取権限を設定`);

        // Update権限
        await fetch(`${DIRECTUS_URL}/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: employeeRoleId,
            collection: collection,
            action: 'update',
            permissions: {},
            fields: ['*'],
          }),
        });
        console.log(`✅ ${collection} - 更新権限を設定`);

        // Delete権限
        await fetch(`${DIRECTUS_URL}/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: employeeRoleId,
            collection: collection,
            action: 'delete',
            permissions: {},
            fields: ['*'],
          }),
        });
        console.log(`✅ ${collection} - 削除権限を設定\n`);

      } catch (err) {
        console.error(`❌ ${collection} の権限設定エラー:`, err.message);
      }
    }

    // 3. directus_usersへの読取権限を設定（担当者選択のため）
    try {
      await fetch(`${DIRECTUS_URL}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: employeeRoleId,
          collection: 'directus_users',
          action: 'read',
          permissions: {},
          fields: ['id', 'first_name', 'last_name', 'email', 'role'],
        }),
      });
      console.log('✅ directus_users - 読取権限を設定（担当者選択用）\n');
    } catch (err) {
      console.error('❌ directus_users の権限設定エラー:', err.message);
    }

    // 4. テスト用の社員ユーザーを作成
    console.log('=== テスト用社員ユーザー作成 ===\n');

    const testEmployees = [
      {
        first_name: '太郎',
        last_name: '山田',
        email: 'yamada@example.com',
        password: 'employee123',
      },
      {
        first_name: '花子',
        last_name: '佐藤',
        email: 'sato@example.com',
        password: 'employee123',
      },
      {
        first_name: '次郎',
        last_name: '田中',
        email: 'tanaka@example.com',
        password: 'employee123',
      },
    ];

    for (const employee of testEmployees) {
      try {
        const userResponse = await fetch(`${DIRECTUS_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...employee,
            role: employeeRoleId,
            status: 'active',
          }),
        });

        if (userResponse.ok) {
          console.log(`✅ ${employee.last_name} ${employee.first_name} (${employee.email}) を作成`);
        } else {
          const errorData = await userResponse.json();
          console.error(`❌ ${employee.email} の作成失敗:`, errorData.errors?.[0]?.message || 'Unknown error');
        }
      } catch (err) {
        console.error(`❌ ${employee.email} の作成エラー:`, err.message);
      }
    }

    console.log('\n✅ すべての設定が完了しました！\n');
    console.log('次のステップ:');
    console.log('1. Directus管理画面 (http://localhost:8056/admin) で確認');
    console.log('2. 社員ユーザーでログインテスト');
    console.log('   - メール: yamada@example.com');
    console.log('   - パスワード: employee123\n');

  } catch (error) {
    console.error('エラー:', error.message);
  }
}

createEmployeeRole();
