import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LayoutDashboard, PieChart as PieChartIcon, Settings, LogOut, Plus, Trash2 } from 'lucide-react';

// --- MOCK DATA & TRANSLATIONS ---

const bn = {
  "appName": "এক্সপেন্স ট্রেসার",
  "login": "লগইন",
  "email": "ইমেল",
  "password": "পাসওয়ার্ড",
  "submit": "জমা দিন",
  "dashboard": "ড্যাশবোর্ড",
  "transactions": "লেনদেন",
  "income": "আয়",
  "expense": "ব্যয়",
  "totalIncome": "মোট আয়",
  "totalExpense": "মোট ব্যয়",
  "netBalance": "অবশিষ্ট",
  "addTransaction": "নতুন লেনদেন যুক্ত করুন",
  "amount": "টাকার পরিমাণ",
  "category": "ক্যাটাগরি",
  "date": "তারিখ",
  "notes": "নোট",
  "save": "সংরক্ষণ করুন",
  "cancel": "বাতিল",
  "loading": "লোড হচ্ছে...",
  "logout": "লগ আউট",
  "settings": "সেটিংস",
  "language": "ভাষা",
  "selectCategory": "ক্যাটাগরি নির্বাচন করুন",
  "previewNote": "এটি একটি প্রিভিউ সংস্করণ। সম্পূর্ণ সোর্স কোড apps ফোল্ডারে আছে।"
};

const en = {
  "appName": "Expense Tracer",
  "login": "Login",
  "email": "Email",
  "password": "Password",
  "submit": "Submit",
  "dashboard": "Dashboard",
  "transactions": "Transactions",
  "income": "Income",
  "expense": "Expense",
  "totalIncome": "Total Income",
  "totalExpense": "Total Expense",
  "netBalance": "Net Balance",
  "addTransaction": "Add Transaction",
  "amount": "Amount",
  "category": "Category",
  "date": "Date",
  "notes": "Notes",
  "save": "Save",
  "cancel": "Cancel",
  "loading": "Loading...",
  "logout": "Logout",
  "settings": "Settings",
  "language": "Language",
  "selectCategory": "Select Category",
  "previewNote": "This is a preview version. Full source code is in the apps folder."
};

const mockCategories = [
  { id: '1', nameEn: 'Salary', nameBn: 'বেতন', type: 'INCOME' },
  { id: '2', nameEn: 'Food', nameBn: 'খাবার', type: 'EXPENSE' },
  { id: '3', nameEn: 'Transport', nameBn: 'যাতায়াত', type: 'EXPENSE' },
  { id: '4', nameEn: 'Rent', nameBn: 'ভাড়া', type: 'EXPENSE' },
  { id: '5', nameEn: 'Bills', nameBn: 'বিল', type: 'EXPENSE' },
];

const initialTransactions = [
  { id: '1', amount: 50000, type: 'INCOME', categoryId: '1', date: new Date().toISOString(), notes: 'February Salary' },
  { id: '2', amount: 1200, type: 'EXPENSE', categoryId: '2', date: new Date().toISOString(), notes: 'Grocery' },
  { id: '3', amount: 500, type: 'EXPENSE', categoryId: '3', date: new Date().toISOString(), notes: 'Uber' },
];

// --- I18N CONTEXT ---
const I18nContext = createContext<any>(null);
const useTranslation = () => useContext(I18nContext);

// --- APP COMPONENT ---

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const TransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string(),
  date: z.string(),
  notes: z.string().optional()
});

function App() {
  const [lang, setLang] = useState('bn');
  const [view, setView] = useState('login'); // login, dashboard, transactions
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const t = (key: string) => (lang === 'bn' ? bn[key] : en[key]) || key;

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('login');
  };

  const addTransaction = (data: any) => {
    const newTx = { ...data, id: Math.random().toString(), date: new Date(data.date).toISOString() };
    setTransactions([newTx, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Stats Calculation
  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const net = income - expense;

  const pieData = mockCategories
    .filter(c => c.type === 'EXPENSE')
    .map(cat => {
      const total = transactions
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: lang === 'bn' ? cat.nameBn : cat.nameEn,
        value: total
      };
    })
    .filter(d => d.value > 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT'
    }).format(amt);
  };

  const contextValue = { t, lang, setLang };

  return (
    <I18nContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        
        {/* Auth View */}
        {!isLoggedIn && (
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
              <h1 className="text-2xl font-bold mb-6 text-center text-teal-600">{t('appName')}</h1>
              <div className="flex justify-center gap-2 mb-6">
                 <button onClick={() => setLang('bn')} className={`px-2 py-1 text-xs rounded ${lang === 'bn' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>বাংলা</button>
                 <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>English</button>
              </div>
              <LoginForm onLogin={handleLogin} t={t} />
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
                {t('previewNote')}
              </div>
            </div>
          </div>
        )}

        {/* Main App View */}
        {isLoggedIn && (
          <div className="flex flex-col md:flex-row min-h-screen">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r p-4 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-bold text-teal-600 mb-8 px-2">{t('appName')}</h1>
                <nav className="space-y-2">
                  <button 
                    onClick={() => setView('dashboard')} 
                    className={`flex w-full items-center space-x-2 p-2 rounded ${view === 'dashboard' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-100'}`}
                  >
                    <LayoutDashboard size={20} />
                    <span>{t('dashboard')}</span>
                  </button>
                  <button 
                    onClick={() => setView('transactions')} 
                    className={`flex w-full items-center space-x-2 p-2 rounded ${view === 'transactions' ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-100'}`}
                  >
                    <PieChartIcon size={20} />
                    <span>{t('transactions')}</span>
                  </button>
                </nav>
              </div>
              <div className="mt-8 border-t pt-4">
                <div className="flex gap-2 mb-4 px-2">
                  <button onClick={() => setLang('bn')} className={`px-2 py-1 text-xs rounded ${lang === 'bn' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>বাংলা</button>
                  <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>English</button>
                </div>
                <button onClick={handleLogout} className="flex w-full items-center space-x-2 text-red-600 p-2 hover:bg-red-50 rounded">
                  <LogOut size={20} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 p-4 md:p-8 overflow-auto">
              {view === 'dashboard' && (
                <DashboardView 
                  t={t} 
                  summary={{ income, expense, net }} 
                  pieData={pieData} 
                  formatCurrency={formatCurrency} 
                />
              )}
              {view === 'transactions' && (
                <TransactionsView 
                  t={t} 
                  lang={lang}
                  transactions={transactions} 
                  onAdd={addTransaction}
                  onDelete={deleteTransaction}
                  formatCurrency={formatCurrency}
                />
              )}
            </main>
          </div>
        )}
      </div>
    </I18nContext.Provider>
  );
}

// --- SUB COMPONENTS ---

function LoginForm({ onLogin, t }: any) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(LoginSchema)
  });
  return (
    <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">{t('email')}</label>
        <input {...register('email')} className="w-full border p-2 rounded mt-1" placeholder="demo@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('password')}</label>
        <input type="password" {...register('password')} className="w-full border p-2 rounded mt-1" placeholder="******" />
      </div>
      <button type="submit" className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700">
        {t('login')}
      </button>
    </form>
  );
}

function DashboardView({ t, summary, pieData, formatCurrency }: any) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm">{t('totalIncome')}</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm">{t('totalExpense')}</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm">{t('netBalance')}</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.net)}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{t('expense')} ({t('category')})</h3>
        <div className="h-[300px] w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400">No Data</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionsView({ t, lang, transactions, onAdd, onDelete, formatCurrency }: any) {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().slice(0, 16)
    }
  });

  const onSubmit = (data: any) => {
    onAdd(data);
    setShowModal(false);
    reset();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('transactions')}</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={16} /> {t('addTransaction')}
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('notes')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('amount')}</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx: any) => {
              const cat = mockCategories.find(c => c.id === tx.categoryId);
              return (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lang === 'bn' ? cat?.nameBn : cat?.nameEn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.notes}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(tx.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{t('addTransaction')}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('amount')}</label>
                <input 
                  type="number" 
                  step="0.01" 
                  {...register('amount', { valueAsNumber: true })} 
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select {...register('type')} className="w-full border p-2 rounded">
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('category')}</label>
                <select {...register('categoryId')} className="w-full border p-2 rounded">
                  <option value="">{t('selectCategory')}</option>
                  {mockCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'bn' ? cat.nameBn : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('date')}</label>
                <input type="datetime-local" {...register('date')} className="w-full border p-2 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('notes')}</label>
                <textarea {...register('notes')} className="w-full border p-2 rounded"></textarea>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- RENDER ---
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
