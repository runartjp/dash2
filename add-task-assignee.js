const { createDirectus, rest, createField, createRelation, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8056';
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'dash2admin';

async function addTaskAssignee() {
  try {
    console.log('\nAdding Tasks.assignee field\n');

    const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

    // Login
    await client.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    console.log('Login successful\n');

    // Add Tasks.assignee field
    console.log('Creating Tasks.assignee field...');
    await client.request(
      createField('tasks', {
        field: 'assignee',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          note: 'Task assignee',
          display: 'related-values',
          display_options: {
            template: '{{first_name}} {{last_name}}',
          },
        },
        schema: {
          is_nullable: true,
        },
      })
    );
    console.log('   Done\n');

    // Create Tasks.assignee → directus_users relation
    console.log('Creating Tasks.assignee -> directus_users relation...');
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

    console.log('========================================\n');
    console.log('Tasks.assignee field and relation created!\n');
    console.log('========================================\n');

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

addTaskAssignee();
