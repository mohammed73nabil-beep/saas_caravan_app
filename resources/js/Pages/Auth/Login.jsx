import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import { Truck, LogIn } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F8FA' }}>
            <Head title="تسجيل الدخول" />

            <div className="max-w-md w-full space-y-8 p-8 rounded-lg border shadow-sm my-auto" style={{ backgroundColor: '#ffffff', borderColor: '#E4E7EC', maxWidth: '480px', width: '100%', margin: '20px auto' }}>
                <div className="text-center">
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#2B5D7C' }}>
                        <Truck size={32} color="#ffffff" />
                    </div>
                    <h2 className="mt-4 text-3xl font-bold" style={{ color: '#2B5D7C' }}>
                        تسجيل الدخول
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
                        نظام إدارة شركة الكرفانات
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.email && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                كلمة المرور
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.password && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="rounded"
                                style={{ borderColor: '#E4E7EC' }}
                            />
                            <span style={{ color: '#6B7280' }}>تذكرني</span>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full"
                        >
                            <LogIn size={16} />
                            {processing ? 'جاري التحميل...' : 'تسجيل الدخول'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                        ليس لديك حساب؟{' '}
                        <Link href="/register" className="font-bold hover:underline" style={{ color: '#2B5D7C' }}>
                            تسجيل شركة جديدة
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
