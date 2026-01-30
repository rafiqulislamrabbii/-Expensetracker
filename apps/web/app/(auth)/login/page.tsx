'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '@expense-tracer/shared';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema)
  });
  const router = useRouter();
  const { t } = useTranslation();

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('accessToken', res.data.data.accessToken);
      router.push('/app/dashboard');
    } catch (e) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">{t('appName')}</h1>
        <h2 className="text-xl mb-4 text-center">{t('login')}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('email')}</label>
            <input {...register('email')} className="w-full border p-2 rounded mt-1" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium">{t('password')}</label>
            <input type="password" {...register('password')} className="w-full border p-2 rounded mt-1" />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-teal-700">
            {t('submit')}
          </button>
        </form>
        <div className="mt-4 text-center">
            <Link href="/auth/register" className="text-sm text-blue-600 hover:underline">{t('register')}</Link>
        </div>
      </div>
    </div>
  );
}
