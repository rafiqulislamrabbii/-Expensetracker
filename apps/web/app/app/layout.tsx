'use client';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { LogOut, PieChart, LayoutDashboard, Settings } from 'lucide-react';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r min-h-[50px] md:min-h-screen p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-8">{t('appName')}</h1>
          <nav className="space-y-2">
            <Link href="/app/dashboard" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
              <LayoutDashboard size={20} />
              <span>{t('dashboard')}</span>
            </Link>
            <Link href="/app/transactions" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
              <PieChart size={20} />
              <span>{t('transactions')}</span>
            </Link>
            <Link href="/app/settings" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
              <Settings size={20} />
              <span>{t('settings')}</span>
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t pt-4">
             <div className="flex gap-2 mb-4">
                <button onClick={() => setLang('bn')} className={`px-2 py-1 text-xs rounded ${lang === 'bn' ? 'bg-primary text-white' : 'bg-gray-200'}`}>বাংলা</button>
                <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-gray-200'}`}>English</button>
             </div>
             <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600 p-2 hover:bg-red-50 rounded w-full">
                <LogOut size={20} />
                <span>{t('logout')}</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}