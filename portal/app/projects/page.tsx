'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faFolder,
  faCalendar,
  faUser,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  start_date: string | null;
  end_date: string | null;
  progress: number;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
  } | null;
  date_created: string;
  date_updated: string;
}

const statusLabels: Record<Project['status'], string> = {
  planning: '計画中',
  active: '進行中',
  on_hold: '保留',
  completed: '完了',
  cancelled: 'キャンセル',
};

const statusColors: Record<Project['status'], string> = {
  planning: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityLabels: Record<Project['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const priorityColors: Record<Project['priority'], string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('プロジェクトの取得に失敗しました');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">プロジェクト</h1>
          <p className="text-gray-600 mt-2">
            {projects.length}件のプロジェクト
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          新規プロジェクト
        </Link>
      </div>

      {/* プロジェクト一覧 */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FontAwesomeIcon
            icon={faFolder}
            className="text-6xl text-gray-300 mb-4"
          />
          <p className="text-gray-600 text-lg">プロジェクトがありません</p>
          <Link
            href="/projects/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            最初のプロジェクトを作成
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">{project.key}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      priorityColors[project.priority]
                    }`}
                  >
                    {priorityLabels[project.priority]}
                  </span>
                </div>

                {/* 説明 */}
                {project.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* ステータス */}
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[project.status]
                    }`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>

                {/* 進捗バー */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">進捗</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* メタ情報 */}
                <div className="space-y-2 text-sm text-gray-600">
                  {project.owner && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="w-4" />
                      <span>
                        {project.owner.first_name} {project.owner.last_name}
                      </span>
                    </div>
                  )}
                  {project.end_date && (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} className="w-4" />
                      <span>
                        期限: {new Date(project.end_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
