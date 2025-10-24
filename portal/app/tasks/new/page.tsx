'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  key: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project: '',
    assignee: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();

    // クエリパラメータからプロジェクトIDを取得
    const projectId = searchParams.get('project');
    if (projectId) {
      setFormData(prev => ({ ...prev, project: projectId }));
    }
  }, [searchParams]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'project' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // project と assignee フィールドが空文字列の場合は null に変換
      const submitData = {
        ...formData,
        project: formData.project === '' ? null : formData.project,
        assignee: formData.assignee === '' ? null : formData.assignee,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'タスクの作成に失敗しました');
      }

      const task = await response.json();
      router.push(`/tasks/${task.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/tasks" className="text-blue-500 hover:underline">
          ← タスク一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">新規タスク作成</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* タスク名 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タスク名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: デザインカンプ作成"
            />
          </div>

          {/* 説明 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="タスクの詳細を入力してください"
            />
          </div>

          {/* プロジェクト */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プロジェクト
            </label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">プロジェクトを選択（任意）</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.key} - {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* 担当者 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              担当者
            </label>
            <select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">担当者を選択（任意）</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.last_name} {employee.first_name} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="review">レビュー中</option>
                <option value="done">完了</option>
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>
          </div>

          {/* 期限 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              期限
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? '作成中...' : 'タスクを作成'}
            </button>
            <Link
              href="/tasks"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold text-center transition-colors"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
