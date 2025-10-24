'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PostForm from '@/components/PostForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faComment,
  faThumbTack,
  faHashtag,
  faPaperPlane,
  faTrash,
  faEdit,
  faEllipsisV,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

interface Post {
  id: string;
  content: string;
  user?: any;
  date_created?: string;
  post_type?: string;
  is_pinned?: boolean;
  hashtags?: string[];
  group?: any;
  likes_count?: number;
  comments_count?: number;
  is_edited?: boolean;
  edited_at?: string;
  image?: string; // Directus file ID
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const fetchPosts = async (reset = false) => {
    try {
      const offset = reset ? 0 : posts.length;
      let url = `/api/posts?limit=20&offset=${offset}`;

      // ハッシュタグフィルタリング
      if (selectedHashtag) {
        url += `&hashtag=${encodeURIComponent(selectedHashtag)}`;
      }

      // ユーザーフィルタリング
      if (selectedUser) {
        url += `&user=${encodeURIComponent(selectedUser)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('投稿の取得に失敗しました');
      }
      const data = await response.json();

      if (reset) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }

      // 20件未満ならこれ以上データがない
      setHasMore(data.length === 20);

      // いいね状態をロード（新規投稿分のみ）- 並列処理で高速化
      if (session?.user) {
        const likedPostIds = new Set(reset ? [] : likedPosts);

        // 全ての投稿のいいね状態を並列で取得
        const likePromises = data.map(post =>
          fetch(`/api/posts/likes?postId=${post.id}`)
            .then(res => res.ok ? res.json() : null)
            .then(likeData => ({ postId: post.id, liked: likeData?.liked || false }))
            .catch(() => ({ postId: post.id, liked: false }))
        );

        const likeResults = await Promise.all(likePromises);

        likeResults.forEach(result => {
          if (result.liked) {
            likedPostIds.add(result.postId);
          }
        });

        setLikedPosts(likedPostIds);
      }

      setIsLoadingMore(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session !== undefined) {
      fetchPosts(true);
    }
  }, [session]);

  // ハッシュタグフィルタが変更されたら再取得
  useEffect(() => {
    if (session !== undefined) {
      fetchPosts(true);
    }
  }, [selectedHashtag]);

  // ユーザーフィルタが変更されたら再取得
  useEffect(() => {
    if (session !== undefined) {
      fetchPosts(true);
    }
  }, [selectedUser]);

  // ESCキーでライトボックスを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxImage) {
        setLightboxImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  // 無限スクロール
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !loading) {
          setIsLoadingMore(true);
          fetchPosts(false);
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, isLoadingMore, loading, posts.length]);

  const handlePostCreated = () => {
    fetchPosts(true);
  };

  // ハッシュタグとメンションをクリック可能にする関数
  const renderContentWithLinks = (content: string) => {
    const parts = content.split(/(#[^\s#]+|@[^\s@]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const tag = part.slice(1); // #を除去
        return (
          <span
            key={index}
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => {
              setSelectedHashtag(tag);
              setSelectedUser(null); // ユーザーフィルタ解除
            }}
          >
            {part}
          </span>
        );
      } else if (part.startsWith('@')) {
        const username = part.slice(1); // @を除去
        return (
          <span
            key={index}
            className="text-purple-600 hover:underline cursor-pointer"
            onClick={() => {
              setSelectedUser(username);
              setSelectedHashtag(null); // ハッシュタグフィルタ解除
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  async function handleToggleLike(postId: string) {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    const isLiked = likedPosts.has(postId);

    if (isLiked) {
      // いいねを削除
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes_count: (post.likes_count || 1) - 1 } : post
        )
      );

      try {
        const response = await fetch(`/api/posts/likes?postId=${postId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // 失敗したら元に戻す
          setLikedPosts((prev) => new Set(prev).add(postId));
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1 } : post
            )
          );
        }
      } catch (error) {
        console.error('Error removing like:', error);
        setLikedPosts((prev) => new Set(prev).add(postId));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1 } : post
          )
        );
      }
    } else {
      // いいねを追加
      setLikedPosts((prev) => new Set(prev).add(postId));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1 } : post
        )
      );

      try {
        const response = await fetch('/api/posts/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) {
          // 失敗したら元に戻す
          setLikedPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, likes_count: (post.likes_count || 1) - 1 } : post
            )
          );
        }
      } catch (error) {
        console.error('Error adding like:', error);
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes_count: (post.likes_count || 1) - 1 } : post
          )
        );
      }
    }
  }

  async function handleToggleComments(postId: string) {
    const isExpanded = expandedComments.has(postId);

    if (isExpanded) {
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setExpandedComments((prev) => new Set(prev).add(postId));

      if (!comments[postId]) {
        try {
          const response = await fetch(`/api/posts/comments?postId=${postId}`);
          if (response.ok) {
            const postComments = await response.json();
            setComments((prev) => ({ ...prev, [postId]: postComments }));
          }
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    }
  }

  async function handleAddComment(postId: string) {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content }),
      });

      if (response.ok) {
        setNewComment((prev) => ({ ...prev, [postId]: '' }));

        const commentsResponse = await fetch(`/api/posts/comments?postId=${postId}`);
        if (commentsResponse.ok) {
          const updatedComments = await commentsResponse.json();
          setComments((prev) => ({ ...prev, [postId]: updatedComments }));
        }

        // 投稿を再取得してカウントを更新
        const postsResponse = await fetch('/api/posts');
        if (postsResponse.ok) {
          const updatedPosts = await postsResponse.json();
          setPosts(updatedPosts);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async function handleDeleteComment(commentId: string, postId: string) {
    if (!confirm('このコメントを削除しますか？')) return;

    try {
      const response = await fetch(`/api/posts/comments/${commentId}?postId=${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const commentsResponse = await fetch(`/api/posts/comments?postId=${postId}`);
        if (commentsResponse.ok) {
          const updatedComments = await commentsResponse.json();
          setComments((prev) => ({ ...prev, [postId]: updatedComments }));
        }

        // 投稿を再取得してカウントを更新
        const postsResponse = await fetch('/api/posts');
        if (postsResponse.ok) {
          const updatedPosts = await postsResponse.json();
          setPosts(updatedPosts);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  // 投稿編集開始
  function handleEditPost(post: Post) {
    setEditingPostId(post.id);
    setEditingPostContent(post.content);
    setOpenMenuId(null);
  }

  // 投稿編集保存
  async function handleSavePost(postId: string) {
    if (!editingPostContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingPostContent }),
      });

      if (response.ok) {
        setEditingPostId(null);
        setEditingPostContent('');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error editing post:', error);
    }
  }

  // 投稿編集キャンセル
  function handleCancelEditPost() {
    setEditingPostId(null);
    setEditingPostContent('');
  }

  // 投稿削除
  async function handleDeletePost(postId: string) {
    if (!confirm('この投稿を削除しますか？')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    setOpenMenuId(null);
  }

  // コメント編集開始
  function handleEditComment(comment: any) {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  }

  // コメント編集保存
  async function handleSaveComment(commentId: string, postId: string) {
    if (!editingCommentContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingCommentContent }),
      });

      if (response.ok) {
        setEditingCommentId(null);
        setEditingCommentContent('');

        // コメント一覧を再取得
        const commentsResponse = await fetch(`/api/posts/comments?postId=${postId}`);
        if (commentsResponse.ok) {
          const updatedComments = await commentsResponse.json();
          setComments((prev) => ({ ...prev, [postId]: updatedComments }));
        }
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  }

  // コメント編集キャンセル
  function handleCancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentContent('');
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">タイムライン</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">タイムライン</h1>

        {/* 投稿フォーム */}
        <PostForm onPostCreated={handlePostCreated} />

        {/* ハッシュタグフィルタ表示 */}
        {selectedHashtag && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">
                フィルタ中: <strong>#{selectedHashtag}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedHashtag(null)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              フィルタ解除
            </button>
          </div>
        )}

        {/* ユーザーフィルタ表示 */}
        {selectedUser && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-900">
                メンション中: <strong>@{selectedUser}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              フィルタ解除
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">まだ投稿がありません。</p>
            <p className="text-sm text-gray-400 mt-2">
              最初の投稿をしてコミュニティを盛り上げましょう！
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const postType = post.post_type || 'text';
              const postTypeLabels: Record<string, { label: string; color: string }> = {
                text: { label: 'テキスト', color: 'bg-gray-100 text-gray-800' },
                question: { label: '質問', color: 'bg-purple-100 text-purple-800' },
                discussion: { label: 'ディスカッション', color: 'bg-blue-100 text-blue-800' },
                announcement: { label: 'お知らせ', color: 'bg-yellow-100 text-yellow-800' },
                poll: { label: 'アンケート', color: 'bg-green-100 text-green-800' },
              };
              const typeInfo = postTypeLabels[postType] || postTypeLabels.text;

              return (
                <article
                  key={post.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                    post.is_pinned ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* アバター */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.user?.first_name?.[0]?.toUpperCase() ||
                         post.user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-baseline gap-1">
                            <span className="font-semibold text-gray-900">
                              {post.user?.first_name && post.user?.last_name
                                ? `${post.user.first_name} ${post.user.last_name}`
                                : post.user?.email || 'ユーザー'}
                            </span>
                            {post.user?.username && (
                              <span className="text-sm text-gray-500">
                                @{post.user.username}
                              </span>
                            )}
                          </div>
                          {post.is_pinned && (
                            <FontAwesomeIcon
                              icon={faThumbTack}
                              className="w-3 h-3 text-blue-600"
                              title="ピン留め"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {post.date_created && new Date(post.date_created).toLocaleString('ja-JP')}
                          </span>
                          {post.is_edited && (
                            <span className="text-xs text-gray-400">(編集済み)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 投稿タイプバッジ（テキスト以外のみ表示） */}
                      {postType !== 'text' && (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      )}

                      {/* 編集・削除メニュー（自分の投稿のみ） */}
                      {session?.user && (session.user as any).id === post.user?.id && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4 text-gray-500" />
                          </button>

                          {openMenuId === post.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                編集
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                削除
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="mb-4">
                    {editingPostId === post.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingPostContent}
                          onChange={(e) => setEditingPostContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                          placeholder="投稿内容を編集..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSavePost(post.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                            保存
                          </button>
                          <button
                            onClick={handleCancelEditPost}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {renderContentWithLinks(post.content)}
                      </p>
                    )}
                  </div>

                  {/* 画像 */}
                  {post.image && (
                    <div className="mb-4 rounded-lg overflow-hidden cursor-pointer" onClick={() => setLightboxImage(post.image!)}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.image}?width=800&fit=contain&quality=80&format=webp`}
                        alt="投稿画像"
                        className="w-full max-h-96 object-contain bg-gray-100 hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}

                  {/* 旧画像グリッド（削除予定） */}
                  {post.images && post.images.length > 0 && (
                    <div className="mb-4">
                      {post.images.length === 1 && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.images[0].directus_files_id?.id}`}
                            alt={post.images[0].directus_files_id?.filename_download || '画像'}
                            className="w-full max-h-96 object-contain bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => {/* TODO: ライトボックス */}}
                          />
                        </div>
                      )}
                      {post.images.length === 2 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((img, idx) => (
                            <div key={idx} className="rounded-lg overflow-hidden">
                              <img
                                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${img.directus_files_id?.id}`}
                                alt={img.directus_files_id?.filename_download || `画像 ${idx + 1}`}
                                className="w-full h-48 object-cover bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => {/* TODO: ライトボックス */}}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {post.images.length === 3 && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 rounded-lg overflow-hidden">
                            <img
                              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${post.images[0].directus_files_id?.id}`}
                              alt={post.images[0].directus_files_id?.filename_download || '画像 1'}
                              className="w-full h-64 object-cover bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => {/* TODO: ライトボックス */}}
                            />
                          </div>
                          {post.images.slice(1).map((img, idx) => (
                            <div key={idx} className="rounded-lg overflow-hidden">
                              <img
                                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${img.directus_files_id?.id}`}
                                alt={img.directus_files_id?.filename_download || `画像 ${idx + 2}`}
                                className="w-full h-32 object-cover bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => {/* TODO: ライトボックス */}}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {post.images.length === 4 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((img, idx) => (
                            <div key={idx} className="rounded-lg overflow-hidden">
                              <img
                                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${img.directus_files_id?.id}`}
                                alt={img.directus_files_id?.filename_download || `画像 ${idx + 1}`}
                                className="w-full h-48 object-cover bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => {/* TODO: ライトボックス */}}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ハッシュタグ */}
                  {post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.hashtags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="text-sm text-blue-600 hover:underline cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* アクション */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        likedPosts.has(post.id) ? 'text-red-600' : 'hover:text-red-600'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={likedPosts.has(post.id) ? faHeart : faHeartRegular}
                        className="w-4 h-4"
                      />
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* コメントセクション */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      {/* コメント入力フォーム */}
                      {session?.user && (
                        <div className="flex gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={newComment[post.id] || ''}
                              onChange={(e) =>
                                setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="コメントを追加..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                              <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* コメント一覧 */}
                      <div className="space-y-3">
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {comment.user?.first_name?.[0]?.toUpperCase() ||
                               comment.user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-semibold text-sm text-gray-900">
                                      {comment.user?.first_name && comment.user?.last_name
                                        ? `${comment.user.first_name} ${comment.user.last_name}`
                                        : comment.user?.email || 'ユーザー'}
                                    </span>
                                    {comment.user?.username && (
                                      <span className="text-xs text-gray-500">
                                        @{comment.user.username}
                                      </span>
                                    )}
                                  </div>
                                  {comment.is_edited && (
                                    <span className="text-xs text-gray-400">(編集済み)</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {comment.date_created &&
                                      new Date(comment.date_created).toLocaleString('ja-JP')}
                                  </span>
                                  {session?.user &&
                                    comment.user?.id === (session.user as any).id && (
                                      <>
                                        <button
                                          onClick={() => handleEditComment(comment)}
                                          className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                          <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(comment.id, post.id)}
                                          className="text-red-600 hover:text-red-800 transition-colors"
                                        >
                                          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                </div>
                              </div>
                              {editingCommentId === comment.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingCommentContent}
                                    onChange={(e) => setEditingCommentContent(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSaveComment(comment.id, post.id)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    >
                                      <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                                      保存
                                    </button>
                                    <button
                                      onClick={handleCancelEditComment}
                                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors flex items-center gap-1"
                                    >
                                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                                      キャンセル
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-800">{comment.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {comments[post.id]?.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            まだコメントがありません
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 編集済みマーク */}
                  {post.is_edited && (
                    <div className="text-xs text-gray-400 mt-2">
                      編集済み
                      {post.edited_at && ` • ${new Date(post.edited_at).toLocaleString('ja-JP')}`}
                    </div>
                  )}
                </article>
              );
            })}

            {/* スクロール監視要素 */}
            {hasMore && (
              <div
                id="scroll-sentinel"
                className="flex justify-center py-8"
              >
                {isLoadingMore && (
                  <div className="text-gray-500">読み込み中...</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ライトボックス */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl font-light hover:text-gray-300 transition-colors z-10"
              onClick={() => setLightboxImage(null)}
            >
              ×
            </button>
            <img
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${lightboxImage}?width=1920&fit=contain&quality=90&format=webp`}
              alt="拡大画像"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
