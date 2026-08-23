import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import { Truck, UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F8FA' }}>
            <Head title="تسجيل شركة جديدة" />

            <div className="max-w-md w-full space-y-8 p-8 rounded-lg border shadow-sm my-auto" style={{ backgroundColor: '#ffffff', borderColor: '#E4E7EC', maxWidth: '480px', width: '100%', margin: '20px auto' }}>
                <div className="text-center">
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#2B5D7C' }}>
                        <Truck size={32} color="#ffffff" />
                    </div>
                    <h2 className="mt-4 text-3xl font-bold" style={{ color: '#2B5D7C' }}>
                        تسجيل شركة جديدة
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
                        ابدأ بتأسيس حساب شركتك على المنصة
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            اسم الشركة
                        </label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={e => setData('company_name', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.company_name && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.company_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            اسم المسؤول الأول (المالك)
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.name && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            رقم جوال التواصل
                        </label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                        />
                        {errors.phone && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.phone}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            البريد الإلكتروني (سيُستخدم لتسجيل الدخول)
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

                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            تأكيد كلمة المرور
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full"
                        >
                            <UserPlus size={16} />
                            {processing ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="font-bold hover:underline" style={{ color: '#2B5D7C' }}>
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
