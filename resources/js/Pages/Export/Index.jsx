import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Index() {
    const [type, setType] = useState('sales');
    const [from, setFrom] = useState(new Date().toISOString().split('T')[0]);
    const [to, setTo] = useState('');

    const handleDownload = (e) => {
        e.preventDefault();
        if (!from || !to) {
            alert('يرجى اختيار الفترة الزمنية أولاً.');
            return;
        }
        // Redirect browser to trigger file download stream
        window.open(`/export/download?type=${type}&from=${from}&to=${to}`, '_blank');
    };

    return (
        <MainLayout title="تصدير البيانات">
            <Head title="تصدير التقارير" />

            <div className="max-w-xl bg-white rounded border p-6" style={{ borderColor: '#E4E7EC' }}>
                <h3 className="font-bold text-base mb-4" style={{ color: '#2B5D7C' }}>
                    تجهيز البيانات للتصدير الخارجي
                </h3>
                <p className="text-xs mb-6" style={{ color: '#6B7280' }}>
                    اختر نوع التقرير والفترة الزمنية لتوليد ملف CSV متوافق بالكامل مع برنامج Excel ومعالج للتنسيق العربي لعرضه على محاسب الشركة أو مراجعته بشكل مستقل.
                </p>

                <form onSubmit={handleDownload} className="space-y-4">
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            نوع التقرير المراد تصديره
                        </label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700 bg-white"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        >
                            <option value="sales">المبيعات (عروض وعقود)</option>
                            <option value="claims">المطالبات والتحصيلات</option>
                            <option value="ledger">دفتر الحسابات اليومي (القبض والصرف)</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>من تاريخ</label>
                            <input
                                type="date"
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>إلى تاريخ</label>
                            <input
                                type="date"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Download button */}
                    <div className="pt-4 border-t" style={{ borderColor: '#E4E7EC' }}>
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded text-sm font-bold text-white transition-colors duration-150"
                            style={{ backgroundColor: '#2B5D7C' }}
                        >
                            📥 توليد وتحميل ملف البيانات (CSV)
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
