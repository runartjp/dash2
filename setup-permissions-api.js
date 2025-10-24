const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function setupPermissions() {
  try {
    console.log('\n=== Setting up Permissions via REST API ===\n');

    // Step 1: Login and get access token
    console.log('Logging in...');
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DIRECTUS_EMAIL,
        password: DIRECTUS_PASSWORD,
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    console.log('✓ Login successful\n');

    // Step 2: Get roles
    console.log('Fetching roles...');
    const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const rolesData = await rolesResponse.json();
    const adminRole = rolesData.data.find(r => r.name === 'Administrator');
    console.log('✓ Administrator Role ID:', adminRole.id, '\n');

    // Step 3: Get existing policies for admin role
    console.log('Fetching policies...');
    const policiesResponse = await fetch(`${DIRECTUS_URL}/policies?filter[roles][_eq]=${adminRole.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const policiesData = await policiesResponse.json();
    console.log('✓ Found', policiesData.data.length, 'policies\n');

    // Use the first admin policy or try to find the main one
    let adminPolicy = policiesData.data[0];
    if (!adminPolicy) {
      console.log('Creating new policy for Administrator...');
      const createPolicyResponse = await fetch(`${DIRECTUS_URL}/policies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Administrator Policy',
          roles: [adminRole.id],
          admin_access: false,
          app_access: true
        }),
      });
      const policyData = await createPolicyResponse.json();
      console.log('Policy creation response:', JSON.stringify(policyData, null, 2));

      if (policyData.errors) {
        console.error('✗ Failed to create policy:', policyData.errors);
        console.log('\n⚠ Unable to create policy automatically.');
        console.log('Please use the manual setup guide: PERMISSIONS_SETUP_GUIDE.md\n');
        return;
      }

      adminPolicy = policyData.data;
      console.log('✓ Created policy:', adminPolicy.id, '\n');
    } else {
      console.log('✓ Using existing policy:', adminPolicy.id, '\n');
    }

    // Step 4: Create permissions for projects and tasks
    const collections = ['projects', 'tasks'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const collection of collections) {
      console.log(`Creating permissions for ${collection}...`);

      for (const action of actions) {
        try {
          const permissionResponse = await fetch(`${DIRECTUS_URL}/permissions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              collection: collection,
              action: action,
              policy: adminPolicy.id,
              permissions: {},
              fields: ['*'],
            }),
          });

          const permissionData = await permissionResponse.json();

          if (permissionResponse.ok) {
            console.log('  ✓', action);
          } else {
            const errorMsg = permissionData.errors?.[0]?.message || JSON.stringify(permissionData);
            if (errorMsg.includes('already exists') || errorMsg.includes('UNIQUE')) {
              console.log('  ○', action, '(already exists)');
            } else {
              console.log('  ✗', action, '-', errorMsg);
            }
          }
        } catch (error) {
          console.log('  ✗', action, '-', error.message);
        }
      }
      console.log('');
    }

    console.log('===========================================');
    console.log('✓ Permission setup complete!');
    console.log('===========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

setupPermissions();
