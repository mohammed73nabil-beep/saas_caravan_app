import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Show({ customer }) {
    const [activeTab, setActiveTab] = useState('quotations');

    const tabs = [
        { id: 'quotations', name: 'عروض الأسعار', count: customer.quotations.length },
        { id: 'contracts', name: 'العقود', count: customer.contracts.length },
        { id: 'claims', name: 'المطالبات المالية', count: customer.claims.length },
    ];

    const getStatusText = (status) => {
        const statuses = {
            draft: 'مسودة',
            sent: 'مرسل',
            accepted: 'مقبول',
            rejected: 'مرفوض',
            expired: 'منتهي',
            active: 'نشط',
            completed: 'مكتمل',
            cancelled: 'ملغى',
            due_soon: 'مستحق قريباً',
            due_now: 'مستحق الآن',
            overdue: 'متأخر',
            claimed: 'تمت المطالبة',
            promised: 'وعد بالدفع',
            paid: 'مدفوع'
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status) => {
        if (['paid', 'completed', 'accepted'].includes(status)) return { bg: '#EBFBEE', text: '#2F9E44' };
        if (['due_soon', 'due_now', 'promised', 'sent'].includes(status)) return { bg: '#FFF9DB', text: '#E8A33D' };
        if (['overdue', 'cancelled', 'rejected', 'expired'].includes(status)) return { bg: '#FFE3E3', text: '#E03131' };
        return { bg: '#F7F8FA', text: '#6B7280' };
    };

    return (
        <MainLayout title={`ملف العميل: ${customer.name}`}>
            <Head title={`العميل - ${customer.name}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right: Info Card */}
                <div className="lg:col-span-1 p-6 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                    <h2 className="font-bold text-lg mb-4" style={{ color: '#2B5D7C' }}>بيانات الاتصال</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>اسم العميل / الشركة</p>
                            <p className="font-bold mt-0.5">{customer.name}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>الشخص المسؤول</p>
                            <p className="font-semibold mt-0.5">{customer.contact_person}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>رقم الجوال</p>
                            <p className="font-semibold mt-0.5" dir="ltr" style={{ textAlign: 'right' }}>{customer.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>البريد الإلكتروني</p>
                            <p className="mt-0.5">{customer.email || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>العنوان</p>
                            <p className="mt-0.5">{customer.address || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>ملاحظات</p>
                            <p className="mt-0.5 whitespace-pre-wrap">{customer.notes || '-'}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t flex gap-2" style={{ borderColor: '#E4E7EC' }}>
                        <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex-1 text-center py-2 border rounded text-xs font-bold"
                            style={{ borderColor: '#E8A33D', color: '#E8A33D', backgroundColor: '#ffffff' }}
                        >
                            تعديل البيانات
                        </Link>
                        <Link
                            href="/customers"
                            className="px-4 py-2 border rounded text-xs font-bold"
                            style={{ borderColor: '#E4E7EC', color: '#6B7280', backgroundColor: '#ffffff' }}
                        >
                            رجوع
                        </Link>
                    </div>
                </div>

                {/* Left: Tabs Content */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b" style={{ borderColor: '#E4E7EC' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="px-6 py-3 border-b-2 text-sm font-bold transition-all duration-150 relative -mb-[2px] flex items-center gap-2"
                                style={{
                                    borderColor: activeTab === tab.id ? '#2B5D7C' : 'transparent',
                                    color: activeTab === tab.id ? '#2B5D7C' : '#6B7280',
                                }}
                            >
                                <span>{tab.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                                    backgroundColor: activeTab === tab.id ? '#E4E7EC' : '#F7F8FA',
                                    color: activeTab === tab.id ? '#2B5D7C' : '#6B7280',
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="bg-white rounded border p-6" style={{ borderColor: '#E4E7EC' }}>
                        {/* 1. Quotations */}
                        {activeTab === 'quotations' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>رقم العرض</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>المبلغ الإجمالي</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>صلاحية العرض</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customer.quotations.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="pt-6 text-center text-sm" style={{ color: '#6B7280' }}>
                                                    لا توجد عروض أسعار لهذا العميل.
                                                </td>
                                            </tr>
                                        ) : (
                                            customer.quotations.map((q) => (
                                                <tr key={q.id} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                                    <td className="py-4 font-bold">
                                                        <Link href={`/quotations/${q.id}`} className="hover:underline" style={{ color: '#2B5D7C' }}>
                                                            {q.quotation_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4">{Number(q.total_amount).toLocaleString()} ر.س</td>
                                                    <td className="py-4">{q.expires_at}</td>
                                                    <td className="py-4">
                                                        <span className="text-xs px-2.5 py-1 rounded font-bold" style={{
                                                            backgroundColor: getStatusColor(q.status).bg,
                                                            color: getStatusColor(q.status).text
                                                        }}>
                                                            {getStatusText(q.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 2. Contracts */}
                        {activeTab === 'contracts' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>رقم العقد</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>قيمة العقد</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>تاريخ التسليم</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customer.contracts.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="pt-6 text-center text-sm" style={{ color: '#6B7280' }}>
                                                    لا توجد عقود مسجلة لهذا العميل.
                                                </td>
                                            </tr>
                                        ) : (
                                            customer.contracts.map((c) => (
                                                <tr key={c.id} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                                    <td className="py-4 font-bold">
                                                        <Link href={`/contracts/${c.id}`} className="hover:underline" style={{ color: '#2B5D7C' }}>
                                                            {c.contract_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4">{Number(c.total_value).toLocaleString()} ر.س</td>
                                                    <td className="py-4">{c.delivery_due_at}</td>
                                                    <td className="py-4">
                                                        <span className="text-xs px-2.5 py-1 rounded font-bold" style={{
                                                            backgroundColor: getStatusColor(c.status).bg,
                                                            color: getStatusColor(c.status).text
                                                        }}>
                                                            {getStatusText(c.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 3. Claims */}
                        {activeTab === 'claims' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>رقم المطالبة</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>المبلغ</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>تاريخ الاستحقاق</th>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customer.claims.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="pt-6 text-center text-sm" style={{ color: '#6B7280' }}>
                                                    لا توجد مطالبات مالية مستحقة على العميل.
                                                </td>
                                            </tr>
                                        ) : (
                                            customer.claims.map((cl) => (
                                                <tr key={cl.id} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                                    <td className="py-4 font-bold">
                                                        <Link href={`/claims/${cl.id}`} className="hover:underline" style={{ color: '#2B5D7C' }}>
                                                            {cl.claim_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4">{Number(cl.amount).toLocaleString()} ر.س</td>
                                                    <td className="py-4">{cl.due_date}</td>
                                                    <td className="py-4">
                                                        <span className="text-xs px-2.5 py-1 rounded font-bold" style={{
                                                            backgroundColor: getStatusColor(cl.status).bg,
                                                            color: getStatusColor(cl.status).text
                                                        }}>
                                                            {getStatusText(cl.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
