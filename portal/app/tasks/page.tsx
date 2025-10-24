'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTasks,
  faCalendar,
  faUser,
  faFolder,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  project: {
    id: string;
    name: string;
    key: string;
  } | null;
  assignee: {
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
  } | null;
  date_created: string;
  date_updated: string;
}

const statusLabels: Record<Task['status'], string> = {
  todo: '未着手',
  in_progress: '進行中',
  review: 'レビュー中',
  done: '完了',
};

const statusColors: Record<Task['status'], string> = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
};

const priorityLabels: Record<Task['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
};

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
      ]);

      if (!tasksResponse.ok) {
        throw new Error('タスクの取得に失敗しました');
      }

      const tasksData = await tasksResponse.json();
      const projectsData = projectsResponse.ok ? await projectsResponse.json() : [];

      // プロジェクト情報をマッピング
      const projectsMap = new Map(projectsData.map((p: any) => [p.id, p]));

      // タスクにプロジェクト情報を補完
      const enrichedTasks = tasksData.map((task: any) => ({
        ...task,
        project: typeof task.project === 'number' && projectsMap.has(task.project)
          ? projectsMap.get(task.project)
          : task.project,
      }));

      setTasks(enrichedTasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'done';
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました');
      }

      // タスク一覧を再取得
      fetchTasks();
    } catch (err: any) {
      alert(`エラー: ${err.message}`);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: Task['priority']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error('優先度の更新に失敗しました');
      }

      // タスク一覧を再取得
      fetchTasks();
    } catch (err: any) {
      alert(`エラー: ${err.message}`);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority)
      return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">タスク</h1>
          <p className="text-gray-600 mt-2">
            {filteredTasks.length}件のタスク
            {filterStatus !== 'all' || filterPriority !== 'all'
              ? ` (全${tasks.length}件)`
              : ''}
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          新規タスク
        </Link>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="review">レビュー中</option>
            <option value="done">完了</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            優先度
          </label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">緊急</option>
          </select>
        </div>

        {(filterStatus !== 'all' || filterPriority !== 'all') && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterPriority('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {/* タスク一覧 */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FontAwesomeIcon
            icon={faTasks}
            className="text-6xl text-gray-300 mb-4"
          />
          <p className="text-gray-600 text-lg">タスクがありません</p>
          <Link
            href="/tasks/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            最初のタスクを作成
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タスク
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロジェクト
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期限
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => (window.location.href = `/tasks/${task.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        className={`px-2 py-1 text-xs font-semibold rounded border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          statusColors[task.status]
                        }`}
                      >
                        <option value="todo">未着手</option>
                        <option value="in_progress">進行中</option>
                        <option value="review">レビュー中</option>
                        <option value="done">完了</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.priority}
                        onChange={(e) => handlePriorityChange(task.id, e.target.value as Task['priority'])}
                        className={`px-2 py-1 text-xs font-semibold rounded border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          priorityColors[task.priority]
                        }`}
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                        <option value="urgent">緊急</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.project ? (
                        <Link
                          href={`/projects/${task.project.id}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FontAwesomeIcon icon={faFolder} className="w-3" />
                          <span className="truncate max-w-xs" title={`${task.project.key} - ${task.project.name}`}>
                            {task.project.key} - {task.project.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.assignee ? (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faUser} className="w-3" />
                          {task.assignee.first_name} {task.assignee.last_name}
                        </div>
                      ) : (
                        <span className="text-gray-400">未割り当て</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {task.due_date ? (
                        <div
                          className={`flex items-center gap-1 ${
                            overdue ? 'text-red-600 font-semibold' : 'text-gray-900'
                          }`}
                        >
                          {overdue && (
                            <FontAwesomeIcon
                              icon={faExclamationCircle}
                              className="w-3"
                            />
                          )}
                          <FontAwesomeIcon icon={faCalendar} className="w-3" />
                          {new Date(task.due_date).toLocaleDateString('ja-JP')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
