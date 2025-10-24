const { createDirectus, rest, createRelation, readFields, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function fixRelations() {
  try {
    console.log('\nRelation Fix Script\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // Login
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('Login successful\n');

    // Check existing fields
    console.log('Checking existing fields...\n');

    const projectFields = await client.request(readFields('projects'));
    const taskFields = await client.request(readFields('tasks'));

    console.log('Projects fields: ' + projectFields.length);
    console.log('Tasks fields: ' + taskFields.length + '\n');

    const hasProjectOwner = projectFields.some(f => f.field === 'owner');
    const hasTaskProject = taskFields.some(f => f.field === 'project');
    const hasTaskAssignee = taskFields.some(f => f.field === 'assignee');

    console.log('Projects.owner: ' + (hasProjectOwner ? 'OK' : 'NG'));
    console.log('Tasks.project: ' + (hasTaskProject ? 'OK' : 'NG'));
    console.log('Tasks.assignee: ' + (hasTaskAssignee ? 'OK' : 'NG'));
    console.log('');

    // Create Tasks.project → projects relation
    if (hasTaskProject) {
      console.log('Creating Tasks.project -> projects relation...');
      try {
        await client.request(
          createRelation({
            collection: 'tasks',
            field: 'project',
            related_collection: 'projects',
            meta: {
              one_field: 'tasks',
              sort_field: null,
            },
            schema: {
              on_delete: 'SET NULL',
            },
          })
        );
        console.log('   Done\n');
      } catch (error) {
        console.log('   Skipped (already exists or error: ' + error.message + ')\n');
      }
    }

    // Create Tasks.assignee → directus_users relation
    if (hasTaskAssignee) {
      console.log('Creating Tasks.assignee -> directus_users relation...');
      try {
        await client.request(
          createRelation({
            collection: 'tasks',
            field: 'assignee',
            related_collection: 'directus_users',
            meta: {
              one_field: null,
            },
            schema: {
              on_delete: 'SET NULL',
            },
          })
        );
        console.log('   Done\n');
      } catch (error) {
        console.log('   Skipped (already exists or error: ' + error.message + ')\n');
      }
    }

    console.log('=====================================\n');
    console.log('Relations fix completed!\n');
    console.log('Next: Check relations in Directus admin');
    console.log('URL: http://localhost:8056/admin\n');
    console.log('=====================================\n');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

fixRelations();
