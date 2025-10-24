#!/bin/bash

echo "=== Checking Directus Permissions in Database ==="
echo ""

# PostgreSQLに接続してpermissionsテーブルを確認
docker exec dash2-database-1 psql -U dash2_user -d dash2_db -c "
SELECT
  p.id,
  p.policy,
  p.collection,
  p.action,
  pol.name as policy_name
FROM directus_permissions p
LEFT JOIN directus_policies pol ON p.policy = pol.id
WHERE p.collection IN ('projects', 'tasks')
ORDER BY p.collection, p.action;
"

echo ""
echo "=== Checking Policies ==="
docker exec dash2-database-1 psql -U dash2_user -d dash2_db -c "
SELECT id, name, admin_access, app_access
FROM directus_policies;
"
