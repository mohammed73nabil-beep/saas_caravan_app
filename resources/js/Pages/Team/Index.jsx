import React from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Index({ members }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/team', {
            onSuccess: () => reset()
        });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من إزالة هذا العضو من الفريق؟ لن يتمكن من تسجيل الدخول أو الوصول لبيانات شركتك.')) {
            router.delete(`/team/${id}`);
        }
    };

    return (
        <MainLayout title="إدارة فريق العمل">
            <Head title="الفريق" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Panel: Add Member Form */}
                <div className="lg:col-span-1 p-6 rounded border bg-white space-y-4 h-fit" style={{ borderColor: '#E4E7EC' }}>
                    <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>دعوة عضو جديد للفريق</h3>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>الاسم الكامل *</label>
                            <input
                                type="text"
                                placeholder="اسم الموظف..."
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>البريد الإلكتروني *</label>
                            <input
                                type="email"
                                placeholder="email@company.com"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>كلمة المرور المؤقتة *</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>تأكيد كلمة المرور *</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-1.5 rounded text-xs font-bold text-white w-full"
                                style={{ backgroundColor: '#2B5D7C' }}
                            >
                                {processing ? 'جاري الحفظ...' : 'إضافة العضو'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Left Panel: Members Table */}
                <div className="lg:col-span-2 bg-white rounded border overflow-hidden" style={{ borderColor: '#E4E7EC' }}>
                    <div className="p-4 border-b font-bold text-sm" style={{ borderColor: '#E4E7EC', color: '#2B5D7C' }}>
                        أعضاء الفريق المسجلين حالياً بالشركة
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead>
                                <tr className="border-b text-gray-500" style={{ borderColor: '#E4E7EC', backgroundColor: '#F7F8FA' }}>
                                    <th className="p-4">اسم الموظف</th>
                                    <th className="p-4">البريد الإلكتروني</th>
                                    <th className="p-4">الصلاحية</th>
                                    <th className="p-4">تاريخ الإضافة</th>
                                    <th className="p-4 text-left">العمليات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {members.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="p-4 font-bold">{m.name}</td>
                                        <td className="p-4 text-gray-500">{m.email}</td>
                                        <td className="p-4">
                                            <span className="text-xs px-2 py-0.5 rounded font-bold" style={{
                                                backgroundColor: m.role === 'owner' ? '#EBFBEE' : '#F7F8FA',
                                                color: m.role === 'owner' ? '#2F9E44' : '#6B7280'
                                            }}>
                                                {m.role === 'owner' ? 'المالك (Owner)' : 'عضو (Member)'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="p-4 text-left">
                                            {m.role !== 'owner' ? (
                                                <button
                                                    onClick={() => handleDelete(m.id)}
                                                    className="text-xs font-bold text-red-600 hover:underline"
                                                >
                                                    إلغاء الصلاحية
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-semibold">حساب رئيسي غير قابل للحذف</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
