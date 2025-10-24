const { createDirectus, rest, readPermissions, readRoles, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function checkPermissions() {
  try {
    console.log('\n=== Checking Directus Permissions ===\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // Login
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('✓ Login successful\n');

    // Get all roles
    console.log('Fetching roles...');
    const roles = await client.request(readRoles());
    console.log(`Found ${roles.length} roles:\n`);

    for (const role of roles) {
      console.log(`- ${role.name} (ID: ${role.id || 'null'})`);
    }
    console.log('');

    // Get all permissions
    console.log('Fetching permissions...');
    const permissions = await client.request(readPermissions());
    console.log(`Found ${permissions.length} total permissions\n`);

    // Filter permissions for projects and tasks
    const projectsPerms = permissions.filter(p => p.collection === 'projects');
    const tasksPerms = permissions.filter(p => p.collection === 'tasks');

    console.log('=== Projects Collection Permissions ===');
    if (projectsPerms.length === 0) {
      console.log('⚠ No permissions found for projects collection\n');
    } else {
      projectsPerms.forEach(p => {
        console.log(`- Action: ${p.action}, Role: ${p.role || 'public'}`);
      });
      console.log('');
    }

    console.log('=== Tasks Collection Permissions ===');
    if (tasksPerms.length === 0) {
      console.log('⚠ No permissions found for tasks collection\n');
    } else {
      tasksPerms.forEach(p => {
        console.log(`- Action: ${p.action}, Role: ${p.role || 'public'}`);
      });
      console.log('');
    }

    // Show sample permissions from other collections for reference
    console.log('=== Sample Permissions (first 5) ===');
    permissions.slice(0, 5).forEach(p => {
      console.log(`Collection: ${p.collection}, Action: ${p.action}, Role: ${p.role || 'public'}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

checkPermissions();
