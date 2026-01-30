'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionSchema, TransactionInput } from '@expense-tracer/shared';

export default function TransactionsPage() {
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch Transactions
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => (await api.get('/transactions')).data.data
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data.data
  });

  // Create Mutation
  const mutation = useMutation({
    mutationFn: (newTx: TransactionInput) => api.post('/transactions', newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsOpen(false);
      reset();
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      date: new Date().toISOString(),
      type: 'EXPENSE'
    }
  });

  const onSubmit = (data: TransactionInput) => {
    // Ensure date is ISO
    mutation.mutate({ ...data, date: new Date(data.date).toISOString() });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('transactions')}</h2>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-teal-700"
        >
          {t('addTransaction')}
        </button>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('notes')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions?.map((tx: any) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tx.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {lang === 'bn' ? tx.category?.nameBn : tx.category?.nameEn}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{tx.notes}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US').format(tx.amount)} ৳
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
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
                {errors.amount && <span className="text-red-500 text-xs">{errors.amount.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('category')}</label>
                <select {...register('categoryId')} className="w-full border p-2 rounded">
                  <option value="">{t('selectCategory')}</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'bn' ? cat.nameBn : cat.nameEn} ({cat.type})
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="text-red-500 text-xs">Required</span>}
              </div>
              
              <div>
                 <label className="block text-sm font-medium mb-1">Type</label>
                 <select {...register('type')} className="w-full border p-2 rounded">
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
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
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 rounded">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
