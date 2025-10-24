const { createDirectus, rest, readRoles, createPermission, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function fixPermissions() {
  try {
    console.log('\n=== Setting up Projects & Tasks Permissions ===\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // Login
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('✓ Login successful\n');

    // Get the Administrator role ID
    const roles = await client.request(readRoles());
    const adminRole = roles.find(r => r.name === 'Administrator');

    if (!adminRole) {
      throw new Error('Administrator role not found');
    }

    console.log('Administrator Role ID:', adminRole.id);
    console.log('');

    const collections = ['projects', 'tasks'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const collection of collections) {
      console.log('Creating permissions for ' + collection + '...');

      for (const action of actions) {
        try {
          await client.request(
            createPermission({
              collection: collection,
              action: action,
              role: adminRole.id,
              permissions: {},  // No restrictions
              fields: ['*'],    // All fields
            })
          );
          console.log('  ✓ ' + action);
        } catch (error) {
          // Check if it already exists
          const errorMsg = JSON.stringify(error);
          if (errorMsg.includes('already exists') || errorMsg.includes('UNIQUE')) {
            console.log('  ○ ' + action + ' (already exists)');
          } else {
            console.log('  ✗ ' + action + ' - Error: ' + (error.message || JSON.stringify(error)));
          }
        }
      }
      console.log('');
    }

    console.log('===========================================');
    console.log('✓ Permissions setup complete!');
    console.log('===========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

fixPermissions();
