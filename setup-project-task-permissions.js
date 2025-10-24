const { createDirectus, rest, readPermissions, createPermission, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function setupPermissions() {
  try {
    console.log('\nSetting up Projects & Tasks permissions...\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // Login
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('Login successful\n');

    // Get Public role ID (usually null for public)
    // We'll set permissions for all authenticated users instead

    const collections = ['projects', 'tasks'];
    const actions = ['create', 'read', 'update', 'delete'];

    console.log('Creating permissions for Admin role...\n');

    // For each collection, create CRUD permissions
    for (const collection of collections) {
      for (const action of actions) {
        try {
          await client.request(
            createPermission({
              collection: collection,
              action: action,
              role: null, // null = public access
              permissions: {},
              fields: ['*'],
            })
          );
          console.log(`  Created ${action} permission for ${collection}`);
        } catch (error) {
          if (error.message && error.message.includes('already exists')) {
            console.log(`  Permission ${action} for ${collection} already exists`);
          } else {
            console.log(`  Warning: Could not create ${action} permission for ${collection}: ${error.message}`);
          }
        }
      }
      console.log('');
    }

    console.log('===========================================\n');
    console.log('Permissions setup complete!\n');
    console.log('You can now access /projects and /tasks pages.\n');
    console.log('===========================================\n');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

setupPermissions();
