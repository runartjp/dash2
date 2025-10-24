import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Dash2 Portal
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          治療・医療系プラットフォーム - データベース構築完了
        </p>

        {/* ステータスバナー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                ✓
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-green-900 mb-2">バックエンド構築完了</h2>
              <p className="text-gray-700 mb-3">
                Directus 11 + PostgreSQL 15でデータベース構築が完了しました
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-800">✅ 10コレクション作成済み</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-800">✅ 15リレーション設定済み</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-800">✅ 8コミュニティコレクション</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-800">✅ 23コミュニティリレーション</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Directus管理画面:</strong>{' '}
                  <a
                    href="http://localhost:8056/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    http://localhost:8056/admin
                  </a>
                  {' '}（ログイン: admin@example.com / dash2admin）
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">📰 公開コンテンツ</h3>
            <p className="text-sm text-gray-600 mb-4">ブログ記事、FAQ管理</p>
            <div className="flex gap-2">
              <Link href="/articles" className="text-sm text-blue-600 hover:underline">
                記事一覧 →
              </Link>
              <Link href="/faq" className="text-sm text-blue-600 hover:underline">
                FAQ →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">👨‍⚕️ 会員機能</h3>
            <p className="text-sm text-gray-600 mb-4">治療家、コース管理</p>
            <div className="flex gap-2">
              <Link href="/therapists" className="text-sm text-blue-600 hover:underline">
                治療家 →
              </Link>
              <Link href="/courses" className="text-sm text-blue-600 hover:underline">
                コース →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">👥 コミュニティ</h3>
            <p className="text-sm text-gray-600 mb-4">投稿、グループ、通知</p>
            <div className="flex gap-2">
              <Link href="/community" className="text-sm text-blue-600 hover:underline">
                タイムライン →
              </Link>
              <Link href="/groups" className="text-sm text-blue-600 hover:underline">
                グループ →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">🏥 患者管理</h3>
            <p className="text-sm text-gray-600 mb-4">カルテ、診療記録</p>
            <Link href="/patients" className="text-sm text-blue-600 hover:underline">
              患者一覧 →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">🛒 商品管理</h3>
            <p className="text-sm text-gray-600 mb-4">自社・競合商品、レビュー</p>
            <div className="flex gap-2">
              <Link href="/products" className="text-sm text-blue-600 hover:underline">
                商品一覧 →
              </Link>
              <Link href="/reviews" className="text-sm text-blue-600 hover:underline">
                レビュー →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">📋 プロジェクト管理</h3>
            <p className="text-sm text-gray-600 mb-4">プロジェクト、タスク管理</p>
            <div className="flex gap-2">
              <Link href="/projects" className="text-sm text-blue-600 hover:underline">
                プロジェクト →
              </Link>
              <Link href="/tasks" className="text-sm text-blue-600 hover:underline">
                タスク →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">⚙️ 管理機能</h3>
            <p className="text-sm text-gray-600 mb-4">カテゴリ、設定</p>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
              管理画面 →
            </Link>
          </div>
        </div>

        {/* API情報 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">📡 API情報</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>REST API:</strong> http://localhost:8056</p>
            <p><strong>ポート:</strong> Directus 8056 / PostgreSQL 5433 / Portal 3002</p>
            <p><strong>SDK:</strong> @directus/sdk v17.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
