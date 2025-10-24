'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner, faImage, faTimes } from '@fortawesome/free-solid-svg-icons';

interface PostFormProps {
  onPostCreated?: () => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('画像ファイルは5MB以下にしてください');
      return;
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    setImageFile(file);
    setError('');

    // プレビュー作成
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !imageFile) {
      setError('投稿内容または画像を追加してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let imageId: string | undefined;

      // 画像がある場合、先にアップロード
      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || '画像のアップロードに失敗しました');
        }

        const uploadData = await uploadResponse.json();
        imageId = uploadData.id;
        setIsUploading(false);
      }

      // 投稿作成
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          imageId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '投稿に失敗しました');
      }

      // クリア
      setContent('');
      setImageFile(null);
      setImagePreview(null);

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err: any) {
      setError(err.message || '投稿に失敗しました');
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <p className="text-gray-500 text-center">
          投稿するにはログインが必要です
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4">
          {/* アバター */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {session.user.name?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* 入力エリア */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="何を共有しますか？"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isSubmitting}
            />

            {/* 画像プレビュー */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isSubmitting || !!imageFile}
                  />
                  <FontAwesomeIcon icon={faImage} className="w-5 h-5" />
                </label>
                <div className="text-sm text-gray-500">
                  {content.length} 文字
                  {imageFile && ' · 画像あり'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploading || (!content.trim() && !imageFile)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                    {isUploading ? 'アップロード中...' : '投稿中...'}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                    投稿する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
