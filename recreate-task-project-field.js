import { createDirectus, rest, deleteField, createField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8056')
  .with(authentication())
  .with(rest());

async function recreateTaskProjectField() {
  try {
    // ログイン
    await client.login('admin@example.com', 'dash2admin');
    console.log('✓ Logged in successfully');

    // 既存の project フィールドを削除
    console.log('Deleting old tasks.project field...');
    await client.request(deleteField('tasks', 'project'));
    console.log('✓ Deleted tasks.project field');

    // 新しい project フィールドを integer型で作成
    console.log('Creating new tasks.project field with integer type...');
    await client.request(
      createField('tasks', {
        field: 'project',
        type: 'integer',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: { template: '{{name}}' },
          options: { template: '{{name}}' },
        },
        schema: {
          is_nullable: true,
          foreign_key_table: 'projects',
          foreign_key_column: 'id',
        },
      })
    );

    console.log('✓ Created tasks.project field as integer with M2O relation to projects');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

recreateTaskProjectField();
