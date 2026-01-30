'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const { t, lang } = useTranslation();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/stats/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div>{t('loading')}</div>;

  const { summary, pieData } = data || { summary: {}, pieData: [] };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('dashboard')}</h2>

      {/* Summary Cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow min-h-[400px]">
           <h3 className="text-lg font-semibold mb-4">{t('expense')} ({t('category')})</h3>
           {pieData.length > 0 ? (
             <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey={lang === 'bn' ? 'nameBn' : 'nameEn'}
                    label
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
           ) : (
             <p className="text-center text-gray-500 mt-10">No data available</p>
           )}
        </div>
      </div>
    </div>
  );
}
