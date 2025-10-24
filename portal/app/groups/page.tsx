import { getGroups } from '@/lib/directus';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faNewspaper,
  faLock,
  faGlobe,
  faUserCheck,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

export default async function GroupsPage() {
  const groups = await getGroups('active');

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">グループ</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            グループを作成
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          共通の興味・関心を持つメンバーと交流しましょう
        </p>

        {groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">まだグループがありません。</p>
            <p className="text-sm text-gray-400 mt-2">
              最初のグループを作成してコミュニティを始めましょう！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <article
                key={group.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* カバー画像 */}
                {group.cover_image ? (
                  <img
                    src={group.cover_image}
                    alt={group.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
                    style={{
                      backgroundColor: group.color || '#3b82f6',
                    }}
                  >
                    {group.icon ? (
                      <span className="text-4xl">{group.icon}</span>
                    ) : (
                      <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-white" />
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* グループ名とプライバシー */}
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">
                      <Link
                        href={`/groups/${group.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {group.name}
                      </Link>
                    </h2>
                    <div className="flex-shrink-0 ml-2">
                      <FontAwesomeIcon
                        icon={group.is_private ? faLock : faGlobe}
                        className={`w-4 h-4 ${
                          group.is_private ? 'text-gray-500' : 'text-green-600'
                        }`}
                        title={group.is_private ? '非公開グループ' : '公開グループ'}
                      />
                    </div>
                  </div>

                  {/* 説明 */}
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  {/* カテゴリ */}
                  {group.category && typeof group.category === 'object' && (
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {group.category.name}
                      </span>
                    </div>
                  )}

                  {/* 統計情報 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                      {group.member_count || 0} メンバー
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faNewspaper} className="w-4 h-4" />
                      {group.post_count || 0} 投稿
                    </span>
                  </div>

                  {/* グループ設定アイコン */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {group.allow_member_posts && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                        メンバー投稿可
                      </span>
                    )}
                    {group.require_approval && (
                      <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                        <FontAwesomeIcon icon={faUserCheck} className="w-3 h-3" />
                        承認制
                      </span>
                    )}
                  </div>

                  {/* プライバシー説明 */}
                  {group.is_private && (
                    <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <FontAwesomeIcon icon={faLock} className="w-3 h-3 mr-1" />
                      メンバー以外は閲覧のみ可能です
                    </div>
                  )}
                </div>

                {/* アクション */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/groups/${group.slug}`}
                    className="block w-full py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    グループを見る
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
