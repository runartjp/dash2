'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  project: {
    id: number;
    name: string;
    key: string;
  } | null;
  assignee: {
    first_name: string;
    last_name: string;
    username: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  todo: '未着手',
  in_progress: '進行中',
  review: 'レビュー中',
  done: '完了',
};

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setTask(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
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

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task?.status !== 'done';
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('タスクの削除に失敗しました');
      }

      router.push('/tasks');
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

  if (error || !task) {
    return (
      <div className="p-8">
        <p className="text-red-500">エラー: {error || 'タスクが見つかりません'}</p>
        <Link href="/tasks" className="text-blue-500 hover:underline mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/tasks" className="text-blue-500 hover:underline">
          ← タスク一覧に戻る
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/tasks/${task.id}/edit`}
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
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(task.status)}`}>
              {statusLabels[task.status] || task.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(task.priority)}`}>
              {priorityLabels[task.priority] || task.priority}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">説明</h2>
          <p className="text-gray-600">{task.description || '説明なし'}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">期限</h2>
            <p className={`${isOverdue(task.due_date) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
              {task.due_date || '未設定'}
              {isOverdue(task.due_date) && <span className="ml-2">⚠️ 期限切れ</span>}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">プロジェクト</h2>
            {task.project ? (
              <Link 
                href={`/projects/${task.project.id}`}
                className="text-blue-500 hover:underline"
              >
                {task.project.key} - {task.project.name}
              </Link>
            ) : (
              <p className="text-gray-900">未設定</p>
            )}
          </div>
        </div>

        {task.assignee && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">担当者</h2>
            <p className="text-gray-900">
              {task.assignee.first_name} {task.assignee.last_name} (@{task.assignee.username})
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="タスクを削除"
        message={`「${task.title}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmText={deleting ? '削除中...' : '削除'}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </div>
  );
}
