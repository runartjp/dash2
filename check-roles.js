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

async function checkRoles() {
  try {
    const token = await getAdminToken();

    // ロール一覧を取得
    const response = await fetch(`${DIRECTUS_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('\n=== Directus ロール一覧 ===\n');

    if (data.data && data.data.length > 0) {
      data.data.forEach(role => {
        console.log(`ID: ${role.id}`);
        console.log(`名前: ${role.name}`);
        console.log(`説明: ${role.description || '(なし)'}`);
        console.log(`管理者アクセス: ${role.admin_access ? 'はい' : 'いいえ'}`);
        console.log(`アプリアクセス: ${role.app_access ? 'はい' : 'いいえ'}`);
        console.log('---');
      });

      console.log(`\n合計: ${data.data.length}個のロール\n`);

      // Employeeロールの存在確認
      const employeeRole = data.data.find(r => r.name === 'Employee');
      if (employeeRole) {
        console.log('✅ Employeeロールは既に存在します');
      } else {
        console.log('❌ Employeeロールは存在しません（作成が必要）');
      }

      // Customerロールの存在確認
      const customerRole = data.data.find(r => r.name === 'Customer');
      if (customerRole) {
        console.log('✅ Customerロールは既に存在します');
      } else {
        console.log('❌ Customerロールは存在しません（将来的に作成予定）');
      }

    } else {
      console.log('ロールが見つかりませんでした');
    }

    // ユーザー一覧も確認
    console.log('\n=== ユーザー一覧 ===\n');
    const usersResponse = await fetch(`${DIRECTUS_URL}/users?fields=id,first_name,last_name,email,role.name`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      if (usersData.data && usersData.data.length > 0) {
        usersData.data.forEach(user => {
          console.log(`${user.first_name} ${user.last_name} (${user.email})`);
          console.log(`  ロール: ${user.role?.name || '未設定'}`);
          console.log('---');
        });
        console.log(`\n合計: ${usersData.data.length}人のユーザー\n`);
      }
    }

  } catch (error) {
    console.error('エラー:', error.message);
  }
}

checkRoles();
