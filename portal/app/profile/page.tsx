'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faCamera,
  faGlobe,
  faMapMarkerAlt,
  faBriefcase,
  faBuilding,
  faPhone,
  faBirthdayCake,
  faSave,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  faTwitter,
  faLinkedin,
  faGithub,
} from '@fortawesome/free-brands-svg-icons';

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  avatar?: string;
  description?: string;
  bio?: string;
  location?: string;
  title?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  occupation?: string;
  company?: string;
  birth_date?: string;
  phone?: string;
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');

      if (!response.ok) {
        throw new Error('プロフィールの取得に失敗しました');
      }

      const data = await response.json();
      setProfile(data.data);
      setEditedProfile(data.data);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      setError('プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile || {});
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile || {});
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const data = await response.json();
      setProfile(data.data);
      setIsEditing(false);
      setSuccess('プロフィールを更新しました');

      // セッションを更新
      await update();

      // 少し待ってからリロード（セッション更新を反映）
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('画像ファイルは5MB以下にしてください');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロード可能です');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');

      // 画像をアップロード
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const uploadData = await uploadResponse.json();

      // プロフィール画像を更新
      const updateResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: uploadData.id,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('プロフィール画像の更新に失敗しました');
      }

      // プロフィールを再取得
      await fetchProfile();
      setSuccess('プロフィール画像を更新しました');

      // セッションを更新
      await update();

      // 少し待ってからリロード（セッション更新を反映）
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      setError('画像のアップロードに失敗しました');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">プロフィールが見つかりません</div>
      </div>
    );
  }

  const avatarUrl = profile.avatar
    ? `${DIRECTUS_URL}/assets/${profile.avatar}?width=400&height=400&fit=cover&quality=80`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* カバー画像エリア */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* プロフィール情報 */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              {/* プロフィール画像 */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer bg-blue-500 text-white w-10 h-10 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin">⏳</div>
                    ) : (
                      <FontAwesomeIcon icon={faCamera} />
                    )}
                  </label>
                </div>
              </div>

              {/* 名前とアクション */}
              <div className="flex-1 mt-4 md:mt-0 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    {isEditing ? (
                      <div className="space-y-2 mb-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editedProfile.first_name || ''}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            placeholder="名"
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={editedProfile.last_name || ''}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            placeholder="姓"
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">@</span>
                          <input
                            type="text"
                            value={editedProfile.username || ''}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            placeholder="ユーザー名（英数字とアンダースコアのみ）"
                            pattern="[a-zA-Z0-9_]+"
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </h1>
                        {profile.username && (
                          <p className="text-gray-600">@{profile.username}</p>
                        )}
                      </div>
                    )}
                    {profile.title && !isEditing && (
                      <p className="text-gray-700 font-medium">{profile.title}</p>
                    )}
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="mt-3 md:mt-0 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-2" />
                      編集
                    </button>
                  ) : (
                    <div className="mt-3 md:mt-0 flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {saving ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左カラム：基本情報 */}
          <div className="md:col-span-1 space-y-6">
            {/* 基本情報カード */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                      肩書き
                    </label>
                    <input
                      type="text"
                      value={editedProfile.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="例: シニアエンジニア"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                      職業
                    </label>
                    <input
                      type="text"
                      value={editedProfile.occupation || ''}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      placeholder="例: ソフトウェアエンジニア"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                      所属
                    </label>
                    <input
                      type="text"
                      value={editedProfile.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="例: 株式会社〇〇"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      場所
                    </label>
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="例: 東京都"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faBirthdayCake} className="mr-2" />
                      生年月日
                    </label>
                    <input
                      type="date"
                      value={editedProfile.birth_date || ''}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faPhone} className="mr-2" />
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="例: 090-1234-5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.occupation && (
                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon icon={faBriefcase} className="w-5 mr-3 text-gray-500" />
                      <span>{profile.occupation}</span>
                    </div>
                  )}
                  {profile.company && (
                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon icon={faBuilding} className="w-5 mr-3 text-gray-500" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 mr-3 text-gray-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.birth_date && (
                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon icon={faBirthdayCake} className="w-5 mr-3 text-gray-500" />
                      <span>{new Date(profile.birth_date).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center text-gray-700">
                      <FontAwesomeIcon icon={faPhone} className="w-5 mr-3 text-gray-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SNSリンクカード */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">SNS・リンク</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                      ウェブサイト
                    </label>
                    <input
                      type="url"
                      value={editedProfile.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faTwitter} className="mr-2" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={editedProfile.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faGithub} className="mr-2" />
                      GitHub
                    </label>
                    <input
                      type="text"
                      value={editedProfile.github || ''}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faLinkedin} className="mr-2" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={editedProfile.linkedin || ''}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <FontAwesomeIcon icon={faGlobe} className="w-5 mr-3" />
                      <span className="truncate">{profile.website}</span>
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-500"
                    >
                      <FontAwesomeIcon icon={faTwitter} className="w-5 mr-3" />
                      <span>@{profile.twitter}</span>
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-800 hover:text-gray-900"
                    >
                      <FontAwesomeIcon icon={faGithub} className="w-5 mr-3" />
                      <span>@{profile.github}</span>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-700 hover:text-blue-800"
                    >
                      <FontAwesomeIcon icon={faLinkedin} className="w-5 mr-3" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右カラム：詳細情報 */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">自己紹介</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      短い自己紹介
                    </label>
                    <textarea
                      value={editedProfile.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="一言で自己紹介（140文字以内）"
                      rows={3}
                      maxLength={140}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-sm text-gray-500 text-right mt-1">
                      {(editedProfile.description || '').length}/140
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      詳細プロフィール（Markdown対応）
                    </label>
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="詳しい自己紹介やスキル、経歴などを記入"
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.description && (
                    <div className="text-gray-700 text-lg leading-relaxed">
                      {profile.description}
                    </div>
                  )}
                  {profile.bio && (
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap border-t pt-4">
                      {profile.bio}
                    </div>
                  )}
                  {!profile.description && !profile.bio && (
                    <div className="text-gray-500 italic">
                      自己紹介文がまだ登録されていません
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
