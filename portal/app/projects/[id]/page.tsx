'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface Project {
  id: number;
  name: string;
  key: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  progress: number;
  owner: {
    first_name: string;
    last_name: string;
    username: string;
  } | null;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProject();
      fetchTasks();
    }
  }, [params.id]);

  const fetchProject = async () => {
    if (!params.id) return;
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!params.id) return;
    try {
      const response = await fetch(`/api/tasks?project=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('プロジェクトの削除に失敗しました');
      }

      router.push('/projects');
    } catch (err: any) {
      setError(err.message);
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <p className="text-red-500">エラー: {error || 'プロジェクトが見つかりません'}</p>
        <Link href="/projects" className="text-blue-500 hover:underline mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/projects" className="text-blue-500 hover:underline">
          ← プロジェクト一覧に戻る
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            編集
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            削除
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-gray-500">{project.key}</span>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(project.status)}`}>
              {project.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(project.priority)}`}>
              {project.priority}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">説明</h2>
          <p className="text-gray-600">{project.description || '説明なし'}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">開始日</h2>
            <p className="text-gray-900">{project.start_date || '未設定'}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">終了日</h2>
            <p className="text-gray-900">{project.end_date || '未設定'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">進捗状況</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
          </div>
        </div>

        {project.owner && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">オーナー</h2>
            <p className="text-gray-900">
              {project.owner.first_name} {project.owner.last_name} (@{project.owner.username})
            </p>
          </div>
        )}
      </div>

      {/* 紐づくタスク一覧 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">関連タスク ({tasks.length})</h2>
          <Link
            href={`/tasks/new?project=${project.id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            + タスクを追加
          </Link>
        </div>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">このプロジェクトに紐づくタスクはありません</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    {task.due_date && (
                      <p className="text-sm text-gray-500">期限: {task.due_date}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'todo' ? '未着手' :
                       task.status === 'in_progress' ? '進行中' :
                       task.status === 'review' ? 'レビュー中' : '完了'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.priority === 'low' ? '低' :
                       task.priority === 'medium' ? '中' :
                       task.priority === 'high' ? '高' : '緊急'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="プロジェクトを削除"
        message={`「${project.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmText={deleting ? '削除中...' : '削除'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </div>
  );
}
