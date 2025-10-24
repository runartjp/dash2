'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSidebar } from '@/contexts/SidebarContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faNewspaper,
  faQuestionCircle,
  faUserMd,
  faGraduationCap,
  faUsers,
  faHospital,
  faShoppingCart,
  faCog,
  faBars,
  faTimes,
  faSignInAlt,
  faSignOutAlt,
  faUser,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
  name: string;
  icon: IconDefinition;
  path: string;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    section: 'ダッシュボード',
    items: [
      { name: 'ホーム', icon: faHome, path: '/' },
    ]
  },
  {
    section: '公開コンテンツ',
    items: [
      { name: 'ブログ記事', icon: faNewspaper, path: '/articles' },
      { name: 'FAQ', icon: faQuestionCircle, path: '/faq' },
    ]
  },
  {
    section: '会員機能',
    items: [
      { name: '治療家', icon: faUserMd, path: '/therapists' },
      { name: 'コース', icon: faGraduationCap, path: '/courses' },
    ]
  },
  {
    section: 'コミュニティ',
    items: [
      { name: 'タイムライン', icon: faNewspaper, path: '/community' },
      { name: 'グループ', icon: faUsers, path: '/groups' },
    ]
  },
  {
    section: 'その他',
    items: [
      { name: '患者管理', icon: faHospital, path: '/patients' },
      { name: '商品', icon: faShoppingCart, path: '/products' },
      { name: '設定', icon: faCog, path: '/admin' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'ダッシュボード': true,
    '公開コンテンツ': true,
    '会員機能': true,
    'コミュニティ': true,
    'その他': false,
  });

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* モバイル用トップヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="メニューを開く"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
          <img src="/dashlogo.png" alt="Dash" className="h-6" />
          <div className="w-9" />
        </div>
      </header>

      {/* モバイル用オーバーレイ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm z-50
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <img src="/dashlogo.png" alt="Dash" className="h-8" />
          )}
          <div className="flex items-center gap-2">
            {/* モバイル用閉じるボタン */}
            <button
              onClick={closeMobileMenu}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-md lg:hidden"
              aria-label="メニューを閉じる"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
            {/* デスクトップ用折りたたみボタン */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-md hidden lg:block"
              aria-label={collapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
            >
              <FontAwesomeIcon
                icon={collapsed ? faChevronRight : faChevronLeft}
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>

        {/* メニュー */}
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((menuSection) => {
            const isOpen = openSections[menuSection.section] ?? true;

            return (
              <div key={menuSection.section} className="mb-6">
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(menuSection.section)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-700 transition-colors"
                  >
                    <span>{menuSection.section}</span>
                    <FontAwesomeIcon
                      icon={isOpen ? faChevronUp : faChevronDown}
                      className="w-3 h-3"
                    />
                  </button>
                )}

                {(!collapsed && isOpen) && (
                  <ul className="space-y-1">
                    {menuSection.items.map((item) => {
                      const isActive = pathname === item.path;

                      return (
                        <li key={item.path}>
                          <Link
                            href={item.path}
                            onClick={closeMobileMenu}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                              ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}
                            />
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {collapsed && (
                  <ul className="space-y-1">
                    {menuSection.items.map((item) => {
                      const isActive = pathname === item.path;

                      return (
                        <li key={item.path}>
                          <Link
                            href={item.path}
                            onClick={closeMobileMenu}
                            className={`
                              flex items-center justify-center px-3 py-3 rounded-md transition-colors
                              ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                            title={item.name}
                          >
                            <FontAwesomeIcon
                              icon={item.icon}
                              className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* フッター - ユーザーメニュー */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            {status === 'loading' ? (
              <div className="text-center text-sm text-gray-400">読み込み中...</div>
            ) : session?.user ? (
              <div className="space-y-3">
                {/* ユーザー情報 */}
                <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user.name || session.user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                {/* ログアウトボタン */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4" />
                ログイン
              </Link>
            )}

            <div className="text-xs text-gray-500 text-center mt-3">
              Dash2 Portal v0.1.0
            </div>
          </div>
        )}

        {/* Collapsed時のユーザーアイコンのみ */}
        {collapsed && session?.user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
