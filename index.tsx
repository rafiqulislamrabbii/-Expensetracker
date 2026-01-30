import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { LayoutDashboard, PieChart as PieChartIcon, Settings, LogOut, Plus, Trash2, Wallet, PiggyBank, TrendingUp, TrendingDown, Bell, Search, Calendar, Filter, ChevronDown, CheckCircle } from 'lucide-react';

// --- MOCK DATA & TRANSLATIONS ---

const bn = {
  "appName": "এক্সপেন্স ট্রেসার",
  "login": "লগইন",
  "email": "ইমেল",
  "password": "পাসওয়ার্ড",
  "submit": "জমা দিন",
  "dashboard": "ড্যাশবোর্ড",
  "transactions": "লেনদেন",
  "accounts": "অ্যাকাউন্টস",
  "budgets": "বাজেট",
  "income": "আয়",
  "expense": "ব্যয়",
  "totalIncome": "মোট আয়",
  "totalExpense": "মোট ব্যয়",
  "netBalance": "মোট ব্যালেন্স",
  "savingsRate": "সঞ্চয় হার",
  "addTransaction": "লেনদেন যুক্ত করুন",
  "amount": "টাকার পরিমাণ",
  "category": "ক্যাটাগরি",
  "account": "অ্যাকাউন্ট",
  "date": "তারিখ",
  "notes": "নোট",
  "save": "সংরক্ষণ করুন",
  "cancel": "বাতিল",
  "logout": "লগ আউট",
  "settings": "সেটিংস",
  "recentTransactions": "সাম্প্রতিক লেনদেন",
  "monthlyOverview": "মাসিক ওভারভিউ",
  "budgetLimit": "বাজেট সীমা",
  "spent": "খরচ হয়েছে",
  "remaining": "বাকি আছে",
  "cash": "নগদ",
  "bank": "ব্যাংক",
  "mobile": "মোবাইল ব্যাংকিং",
  "recurring": "পুনরাবৃত্ত লেনদেন?",
  "previewNote": "এটি একটি প্রিভিউ সংস্করণ। নতুন ফিচারগুলো টেস্ট করুন।"
};

const en = {
  "appName": "Expense Tracer",
  "login": "Login",
  "email": "Email",
  "password": "Password",
  "submit": "Submit",
  "dashboard": "Dashboard",
  "transactions": "Transactions",
  "accounts": "Accounts",
  "budgets": "Budgets",
  "income": "Income",
  "expense": "Expense",
  "totalIncome": "Total Income",
  "totalExpense": "Total Expense",
  "netBalance": "Net Balance",
  "savingsRate": "Savings Rate",
  "addTransaction": "Add Transaction",
  "amount": "Amount",
  "category": "Category",
  "account": "Account",
  "date": "Date",
  "notes": "Notes",
  "save": "Save",
  "cancel": "Cancel",
  "logout": "Logout",
  "settings": "Settings",
  "recentTransactions": "Recent Transactions",
  "monthlyOverview": "Monthly Overview",
  "budgetLimit": "Budget Limit",
  "spent": "Spent",
  "remaining": "Remaining",
  "cash": "Cash",
  "bank": "Bank",
  "mobile": "Mobile Banking",
  "recurring": "Recurring Transaction?",
  "previewNote": "This is a preview version. Test the new features."
};

const mockCategories = [
  { id: '1', nameEn: 'Salary', nameBn: 'বেতন', type: 'INCOME', color: '#10B981' },
  { id: '2', nameEn: 'Food', nameBn: 'খাবার', type: 'EXPENSE', color: '#F59E0B' },
  { id: '3', nameEn: 'Transport', nameBn: 'যাতায়াত', type: 'EXPENSE', color: '#3B82F6' },
  { id: '4', nameEn: 'Rent', nameBn: 'ভাড়া', type: 'EXPENSE', color: '#8B5CF6' },
  { id: '5', nameEn: 'Bills', nameBn: 'বিল', type: 'EXPENSE', color: '#EF4444' },
  { id: '6', nameEn: 'Business', nameBn: 'ব্যবসা', type: 'INCOME', color: '#06B6D4' },
];

const mockAccounts = [
  { id: 'a1', nameEn: 'Cash Wallet', nameBn: 'নগদ টাকা', type: 'CASH', balance: 5000 },
  { id: 'a2', nameEn: 'City Bank', nameBn: 'সিটি ব্যাংক', type: 'BANK', balance: 150000 },
  { id: 'a3', nameEn: 'bKash', nameBn: 'বিকাশ', type: 'MOBILE', balance: 2500 },
];

const mockBudgets = [
  { categoryId: '2', limit: 10000 }, // Food
  { categoryId: '3', limit: 5000 },  // Transport
  { categoryId: '5', limit: 8000 },  // Bills
];

const initialTransactions = [
  { id: '1', amount: 50000, type: 'INCOME', categoryId: '1', accountId: 'a2', date: new Date().toISOString(), notes: 'February Salary' },
  { id: '2', amount: 1200, type: 'EXPENSE', categoryId: '2', accountId: 'a1', date: new Date().toISOString(), notes: 'Grocery Shopping' },
  { id: '3', amount: 500, type: 'EXPENSE', categoryId: '3', accountId: 'a3', date: new Date().toISOString(), notes: 'Uber Ride' },
  { id: '4', amount: 3500, type: 'EXPENSE', categoryId: '5', accountId: 'a3', date: new Date(Date.now() - 86400000).toISOString(), notes: 'Electricity Bill' },
  { id: '5', amount: 15000, type: 'INCOME', categoryId: '6', accountId: 'a2', date: new Date(Date.now() - 172800000).toISOString(), notes: 'Project Payment' },
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
  accountId: z.string(),
  date: z.string(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional()
});

function App() {
  const [lang, setLang] = useState('bn');
  const [view, setView] = useState('login'); 
  const [transactions, setTransactions] = useState(initialTransactions);
  const [accounts, setAccounts] = useState(mockAccounts);
  const [budgets, setBudgets] = useState(mockBudgets);
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
    
    // Update account balance
    setAccounts(accounts.map(acc => {
      if (acc.id === data.accountId) {
        const amt = data.type === 'INCOME' ? data.amount : -data.amount;
        return { ...acc, balance: acc.balance + amt };
      }
      return acc;
    }));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    
    // Revert balance
    setAccounts(accounts.map(acc => {
      if (acc.id === tx.accountId) {
        const amt = tx.type === 'INCOME' ? -tx.amount : tx.amount;
        return { ...acc, balance: acc.balance + amt };
      }
      return acc;
    }));

    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Helper to format currency
  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amt);
  };

  // Derived Data
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, c) => acc + c.amount, 0);
  const netWorth = accounts.reduce((acc, c) => acc + c.balance, 0);

  const contextValue = { t, lang, setLang };

  return (
    <I18nContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        
        {/* Auth View */}
        {!isLoggedIn && (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
              <div className="flex flex-col items-center mb-6">
                <div className="bg-primary-600 p-3 rounded-full mb-4 shadow-lg shadow-primary-500/30">
                  <Wallet className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{t('appName')}</h1>
                <p className="text-slate-500 text-sm mt-1">Premium Financial Tracking</p>
              </div>
              
              <div className="flex justify-center gap-2 mb-6">
                 <button onClick={() => setLang('bn')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${lang === 'bn' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>বাংলা</button>
                 <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${lang === 'en' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>English</button>
              </div>
              
              <LoginForm onLogin={handleLogin} t={t} />
              
              <div className="mt-6 p-4 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200 flex gap-2">
                <Bell size={16} className="shrink-0" />
                {t('previewNote')}
              </div>
            </div>
          </div>
        )}

        {/* Main App View */}
        {isLoggedIn && (
          <div className="flex flex-col md:flex-row min-h-screen">
            {/* Premium Sidebar */}
            <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between shadow-xl z-20">
              <div>
                <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
                  <div className="bg-primary-600 p-2 rounded-lg">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold leading-tight">{t('appName')}</h1>
                    <p className="text-xs text-slate-500">Pro Edition</p>
                  </div>
                </div>

                <nav className="p-4 space-y-1">
                  <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={20} />} label={t('dashboard')} />
                  <NavButton active={view === 'transactions'} onClick={() => setView('transactions')} icon={<TrendingUp size={20} />} label={t('transactions')} />
                  <NavButton active={view === 'accounts'} onClick={() => setView('accounts')} icon={<Wallet size={20} />} label={t('accounts')} />
                  <NavButton active={view === 'budgets'} onClick={() => setView('budgets')} icon={<PiggyBank size={20} />} label={t('budgets')} />
                </nav>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                 <div className="flex items-center justify-between mb-4 bg-slate-800 rounded-lg p-2">
                    <button onClick={() => setLang('bn')} className={`flex-1 text-xs py-1.5 rounded-md transition-all ${lang === 'bn' ? 'bg-primary-600 text-white shadow' : 'hover:text-white'}`}>বাংলা</button>
                    <button onClick={() => setLang('en')} className={`flex-1 text-xs py-1.5 rounded-md transition-all ${lang === 'en' ? 'bg-primary-600 text-white shadow' : 'hover:text-white'}`}>English</button>
                 </div>
                 <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 p-3 rounded-lg w-full transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">{t('logout')}</span>
                 </button>
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-auto bg-slate-50">
              <header className="bg-white h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">{t(view)}</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64 transition-all" />
                  </div>
                  <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <Settings size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-primary-500/30">
                    JD
                  </div>
                </div>
              </header>

              <div className="p-8 max-w-7xl mx-auto space-y-8">
                {view === 'dashboard' && (
                  <DashboardView 
                    t={t} 
                    summary={{ income: totalIncome, expense: totalExpense, net: netWorth }} 
                    transactions={transactions}
                    accounts={accounts}
                    categories={mockCategories}
                    formatCurrency={formatCurrency} 
                    lang={lang}
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
                    categories={mockCategories}
                    accounts={accounts}
                  />
                )}
                {view === 'accounts' && (
                  <AccountsView 
                    t={t} 
                    lang={lang} 
                    accounts={accounts} 
                    formatCurrency={formatCurrency} 
                  />
                )}
                {view === 'budgets' && (
                  <BudgetsView 
                    t={t} 
                    lang={lang}
                    budgets={budgets}
                    categories={mockCategories}
                    transactions={transactions}
                    formatCurrency={formatCurrency}
                  />
                )}
              </div>
            </main>
          </div>
        )}
      </div>
    </I18nContext.Provider>
  );
}

// --- SUB COMPONENTS ---

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' 
        : 'hover:bg-slate-800 text-slate-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

function LoginForm({ onLogin, t }: any) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(LoginSchema)
  });
  return (
    <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
        <input {...register('email')} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none" placeholder="demo@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
        <input type="password" {...register('password')} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none" placeholder="******" />
      </div>
      <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30">
        {t('login')}
      </button>
    </form>
  );
}

function DashboardView({ t, summary, transactions, formatCurrency, accounts, categories, lang }: any) {
  // Mock data for charts
  const chartData = [
    { name: 'Week 1', income: 4000, expense: 2400 },
    { name: 'Week 2', income: 3000, expense: 1398 },
    { name: 'Week 3', income: 2000, expense: 9800 },
    { name: 'Week 4', income: 2780, expense: 3908 },
  ];

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label={t('netBalance')} 
          value={summary.net} 
          formatCurrency={formatCurrency} 
          icon={<Wallet className="text-white" />} 
          color="bg-primary-600" 
        />
        <StatCard 
          label={t('totalIncome')} 
          value={summary.income} 
          formatCurrency={formatCurrency} 
          icon={<TrendingUp className="text-white" />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label={t('totalExpense')} 
          value={summary.expense} 
          formatCurrency={formatCurrency} 
          icon={<TrendingDown className="text-white" />} 
          color="bg-red-500" 
        />
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t('savingsRate')}</h3>
           <div className="flex items-end gap-2">
             <span className="text-3xl font-bold text-slate-800">
               {summary.income > 0 ? Math.round(((summary.income - summary.expense) / summary.income) * 100) : 0}%
             </span>
             <span className="text-emerald-500 text-sm font-medium mb-1">+2.4%</span>
           </div>
           <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${summary.income > 0 ? ((summary.income - summary.expense) / summary.income) * 100 : 0}%` }}></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">{t('monthlyOverview')}</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-slate-100 rounded-md text-slate-600 hover:bg-slate-200">Weekly</button>
              <button className="px-3 py-1 text-xs bg-primary-50 text-primary-600 rounded-md font-medium">Monthly</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Widget */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{t('recentTransactions')}</h3>
          <div className="flex-1 overflow-auto space-y-4">
            {recentTx.map((tx: any) => {
               const cat = categories.find(c => c.id === tx.categoryId);
               return (
                 <div key={tx.id} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: cat?.color }}>
                          {lang === 'bn' ? cat.nameBn.charAt(0) : cat.nameEn.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-slate-800">{lang === 'bn' ? cat.nameBn : cat.nameEn}</p>
                          <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800'}`}>
                       {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                 </div>
               )
            })}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, formatCurrency, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300`}>
       <div className={`w-16 h-16 rounded-full ${color}`}></div>
    </div>
    <div className="relative z-10">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4`}>
        {icon}
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
      <p className="text-2xl font-bold text-slate-800">{formatCurrency(value)}</p>
    </div>
  </div>
);

function AccountsView({ t, lang, accounts, formatCurrency }: any) {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">{t('accounts')}</h2>
                <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2">
                   <Plus size={18} /> Add Account
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accounts.map((acc: any) => (
                    <div key={acc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                           <div className={`p-3 rounded-xl ${acc.type === 'CASH' ? 'bg-emerald-100 text-emerald-600' : acc.type === 'BANK' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                              {acc.type === 'CASH' ? <Wallet /> : acc.type === 'BANK' ? <LayoutDashboard /> : <TrendingUp />}
                           </div>
                           <button className="text-slate-400 hover:text-slate-600"><Settings size={18} /></button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{lang === 'bn' ? acc.nameBn : acc.nameEn}</h3>
                        <p className="text-slate-500 text-sm mb-4 capitalize">{acc.type.toLowerCase()}</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(acc.balance)}</p>
                    </div>
                ))}
             </div>
        </div>
    )
}

function BudgetsView({ t, lang, budgets, categories, transactions, formatCurrency }: any) {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">{t('budgets')}</h2>
                <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2">
                   <Plus size={18} /> Set Budget
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map((budget: any, idx: number) => {
                    const cat = categories.find(c => c.id === budget.categoryId);
                    // Mock calculation for spent amount in this category
                    const spent = transactions
                        .filter(t => t.categoryId === budget.categoryId && t.type === 'EXPENSE')
                        .reduce((acc, t) => acc + t.amount, 0);
                    const percentage = Math.min((spent / budget.limit) * 100, 100);
                    const isOver = spent > budget.limit;

                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                           <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: cat?.color }}>
                                    {lang === 'bn' ? cat.nameBn.charAt(0) : cat.nameEn.charAt(0)}
                                 </div>
                                 <h3 className="font-bold text-slate-800">{lang === 'bn' ? cat.nameBn : cat.nameEn}</h3>
                              </div>
                              <span className="text-sm font-medium text-slate-500">{percentage.toFixed(0)}%</span>
                           </div>
                           
                           <div className="w-full bg-slate-100 h-3 rounded-full mb-4 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-primary-600'}`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                           </div>

                           <div className="flex justify-between text-sm">
                              <div>
                                 <p className="text-slate-400 mb-1">{t('spent')}</p>
                                 <p className="font-bold text-slate-800">{formatCurrency(spent)}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-slate-400 mb-1">{t('remaining')}</p>
                                 <p className={`font-bold ${isOver ? 'text-red-500' : 'text-slate-800'}`}>{formatCurrency(budget.limit - spent)}</p>
                              </div>
                           </div>
                        </div>
                    )
                })}
             </div>
        </div>
    )
}

function TransactionsView({ t, lang, transactions, onAdd, onDelete, formatCurrency, categories, accounts }: any) {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().slice(0, 16),
      accountId: 'a1',
      isRecurring: false
    }
  });

  const onSubmit = (data: any) => {
    onAdd(data);
    setShowModal(false);
    reset();
  };

  const type = watch('type');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium">
                <Filter size={16} /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium">
                <Calendar size={16} /> This Month
            </button>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> {t('addTransaction')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('date')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('category')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('account')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('notes')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('amount')}</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {transactions.map((tx: any) => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const acc = accounts.find(a => a.id === tx.accountId);
              return (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(tx.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: cat?.color}}></span>
                        {lang === 'bn' ? cat?.nameBn : cat?.nameEn}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {lang === 'bn' ? acc?.nameBn : acc?.nameEn}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{tx.notes}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(tx.id)} className="text-slate-400 hover:text-red-500 transition-colors">
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-800">{t('addTransaction')}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Type Selector */}
              <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-xl">
                 <label className={`cursor-pointer text-center py-2 rounded-lg text-sm font-semibold transition-all ${type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}>
                    <input type="radio" value="EXPENSE" {...register('type')} className="hidden" />
                    {t('expense')}
                 </label>
                 <label className={`cursor-pointer text-center py-2 rounded-lg text-sm font-semibold transition-all ${type === 'INCOME' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-500'}`}>
                    <input type="radio" value="INCOME" {...register('type')} className="hidden" />
                    {t('income')}
                 </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('amount')}</label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                   <input 
                    type="number" 
                    step="0.01" 
                    {...register('amount', { valueAsNumber: true })} 
                    className="w-full border border-slate-300 pl-8 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-bold text-lg text-slate-800"
                    placeholder="0.00"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('category')}</label>
                    <select {...register('categoryId')} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white">
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {lang === 'bn' ? cat.nameBn : cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('account')}</label>
                    <select {...register('accountId')} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white">
                      {accounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>
                          {lang === 'bn' ? acc.nameBn : acc.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('date')}</label>
                <input type="datetime-local" {...register('date')} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-600" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('notes')}</label>
                <textarea {...register('notes')} rows={2} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Optional notes..."></textarea>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" {...register('isRecurring')} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
                 <span className="text-sm text-slate-600 font-medium">{t('recurring')}</span>
              </label>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors">{t('save')}</button>
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
