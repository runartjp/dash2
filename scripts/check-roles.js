#!/usr/bin/env node

/**
 * Directus ロール確認スクリプト
 */

const axios = require('axios');

const DIRECTUS_URL = 'http://localhost:8056';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'dash2admin';

let authToken = null;

const api = axios.create({
  baseURL: DIRECTUS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function login() {
  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    authToken = response.data.data.access_token;
    console.log('✅ ログイン成功！\n');
  } catch (error) {
    console.error('❌ ログインエラー:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('========================================');
  console.log('  Directus ロール確認  ');
  console.log('========================================\n');

  await login();

  try {
    const response = await api.get('/roles');
    console.log('📋 既存のロール:\n');

    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach(role => {
        console.log(`  - ${role.name} (ID: ${role.id})`);
        console.log(`    Admin: ${role.admin_access || false}`);
        console.log(`    App Access: ${role.app_access || false}`);
        console.log('');
      });
    } else {
      console.log('  ロールが見つかりませんでした');
    }
  } catch (error) {
    console.error('❌ エラー:', error.response?.data || error.message);
  }
}

main();
