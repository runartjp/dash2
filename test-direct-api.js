const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function testDirectAPI() {
  try {
    console.log('\n=== Testing Direct Directus API Access ===\n');

    // Step 1: Login
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DIRECTUS_EMAIL,
        password: DIRECTUS_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      console.error('✗ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    console.log('✓ Login successful');
    console.log('  Token (first 20 chars):', token.substring(0, 20) + '...\n');

    // Step 2: Get user info to verify admin status
    console.log('2. Checking user info...');
    const userResponse = await fetch(`${DIRECTUS_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const userData = await userResponse.json();
    console.log('✓ User:', userData.data.email);
    console.log('  Role ID:', userData.data.role, '\n');

    // Step 3: Try to read projects collection
    console.log('3. Testing projects collection access...');
    const projectsResponse = await fetch(`${DIRECTUS_URL}/items/projects`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('  Status:', projectsResponse.status, projectsResponse.statusText);

    if (!projectsResponse.ok) {
      const errorData = await projectsResponse.json();
      console.error('✗ Failed to access projects:', JSON.stringify(errorData, null, 2));
    } else {
      const projectsData = await projectsResponse.json();
      console.log('✓ Projects accessible');
      console.log('  Found', projectsData.data.length, 'projects\n');
    }

    // Step 4: Try to read tasks collection
    console.log('4. Testing tasks collection access...');
    const tasksResponse = await fetch(`${DIRECTUS_URL}/items/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('  Status:', tasksResponse.status, tasksResponse.statusText);

    if (!tasksResponse.ok) {
      const errorData = await tasksResponse.json();
      console.error('✗ Failed to access tasks:', JSON.stringify(errorData, null, 2));
    } else {
      const tasksData = await tasksResponse.json();
      console.log('✓ Tasks accessible');
      console.log('  Found', tasksData.data.length, 'tasks\n');
    }

    // Step 5: Check permissions endpoint
    console.log('5. Checking permissions for current user...');
    const permissionsResponse = await fetch(`${DIRECTUS_URL}/permissions/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      console.log('✓ Found', permissionsData.data.length, 'permissions');

      const projectsPerms = permissionsData.data.filter(p => p.collection === 'projects');
      const tasksPerms = permissionsData.data.filter(p => p.collection === 'tasks');

      console.log('  Projects permissions:', projectsPerms.length);
      console.log('  Tasks permissions:', tasksPerms.length);
    }

    console.log('\n===========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

testDirectAPI();
