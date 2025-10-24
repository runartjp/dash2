import { getArticles } from '@/lib/directus';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faEye, faTag } from '@fortawesome/free-solid-svg-icons';

export default async function ArticlesPage() {
  const articles = await getArticles('published');

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">ブログ記事</h1>

        {articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">まだ記事が投稿されていません。</p>
            <p className="text-sm text-gray-400 mt-2">
              Directus管理画面で記事を作成してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {article.featured_image && (
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {article.date_created && (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                        {new Date(article.date_created).toLocaleDateString('ja-JP')}
                      </span>
                    )}

                    {article.view_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                        {article.view_count} views
                      </span>
                    )}

                    {article.tags && Array.isArray(article.tags) && (article.tags as string[]).length > 0 && (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                        {(article.tags as string[])[0]}
                      </span>
                    )}
                  </div>

                  {article.category && typeof article.category === 'object' && (
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {(article.category as any).name}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
