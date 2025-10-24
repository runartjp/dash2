import { createDirectus, rest, updateField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8056')
  .with(authentication())
  .with(rest());

async function fixTaskProjectField() {
  try {
    // ログイン
    await client.login('admin@example.com', 'dash2admin');
    console.log('✓ Logged in successfully');

    // tasks.project フィールドの型を UUID から integer に変更
    await client.request(
      updateField('tasks', 'project', {
        type: 'integer',
        schema: {
          data_type: 'integer',
          is_nullable: true,
        },
      })
    );

    console.log('✓ Updated tasks.project field type from UUID to integer');
    console.log('\nNote: You may need to recreate the relation in Directus admin UI');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

fixTaskProjectField();
