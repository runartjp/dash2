import { getGroupBySlug, getCommunityPosts } from '@/lib/directus';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faNewspaper,
  faLock,
  faGlobe,
  faUserPlus,
  faArrowLeft,
  faHeart,
  faComment,
  faThumbTack
} from '@fortawesome/free-solid-svg-icons';

export default async function GroupDetailPage({ params }: { params: { slug: string } }) {
  const group = await getGroupBySlug(params.slug);

  if (!group) {
    notFound();
  }

  // グループの投稿を取得
  const posts = await getCommunityPosts(group.id);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          グループ一覧に戻る
        </Link>

        {/* グループヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* カバー画像 */}
          {group.cover_image ? (
            <img
              src={group.cover_image}
              alt={group.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div
              className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
              style={{
                backgroundColor: group.color || '#3b82f6',
              }}
            >
              {group.icon ? (
                <span className="text-6xl">{group.icon}</span>
              ) : (
                <FontAwesomeIcon icon={faUsers} className="w-16 h-16 text-white" />
              )}
            </div>
          )}

          <div className="p-6">
            {/* グループ名とステータス */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FontAwesomeIcon
                    icon={group.is_private ? faLock : faGlobe}
                    className="w-4 h-4"
                  />
                  <span>{group.is_private ? '非公開グループ' : '公開グループ'}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
                参加する
              </button>
            </div>

            {/* 説明 */}
            {group.description && (
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{group.description}</p>
            )}

            {/* カテゴリ */}
            {group.category && typeof group.category === 'object' && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {group.category.name}
                </span>
              </div>
            )}

            {/* 統計情報 */}
            <div className="flex items-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                <strong>{group.member_count || 0}</strong> メンバー
              </span>
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faNewspaper} className="w-4 h-4" />
                <strong>{group.post_count || 0}</strong> 投稿
              </span>
            </div>

            {/* グループ設定情報 */}
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              {group.allow_member_posts && (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  メンバー投稿可
                </span>
              )}
              {group.require_approval && (
                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                  参加承認制
                </span>
              )}
              {group.is_private && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  <FontAwesomeIcon icon={faLock} className="w-3 h-3 mr-1" />
                  メンバー以外は閲覧のみ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">投稿</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              投稿する
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">まだ投稿がありません。</p>
              <p className="text-sm text-gray-400 mt-2">
                最初の投稿をしてディスカッションを始めましょう！
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                    post.is_pinned ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        U
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">ユーザー</span>
                          {post.is_pinned && (
                            <FontAwesomeIcon
                              icon={faThumbTack}
                              className="w-3 h-3 text-blue-600"
                              title="ピン留め"
                            />
                          )}
                        </div>
                        {post.date_created && (
                          <span className="text-xs text-gray-500">
                            {new Date(post.date_created).toLocaleString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* アクション */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <button className="flex items-center gap-2 hover:text-red-600 transition-colors">
                      <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
                      <span>{post.like_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                      <span>{post.comment_count || 0}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
