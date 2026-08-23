import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Pencil } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';
import Attachments from '../../Components/Attachments';

export default function Show({ contract }) {
    const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

    const handlePaymentStatusChange = (paymentId, newStatus) => {
        setUpdatingPaymentId(paymentId);
        router.patch(`/contracts/${contract.id}/payments/${paymentId}`, {
            status: newStatus
        }, {
            onFinish: () => setUpdatingPaymentId(null)
        });
    };

    const getStatusText = (status) => {
        const statuses = {
            active: 'نشط',
            completed: 'مكتمل',
            cancelled: 'ملغى',
            pending: 'انتظار الاستحقاق',
            due: 'مستحق الآن',
            overdue: 'متأخر الدفع',
            paid: 'تم السداد'
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status) => {
        if (['paid', 'completed'].includes(status)) return { bg: '#EBFBEE', text: '#2F9E44' };
        if (['active', 'due', 'pending'].includes(status)) return { bg: '#FFF9DB', text: '#E8A33D' };
        if (['overdue', 'cancelled'].includes(status)) return { bg: '#FFE3E3', text: '#E03131' };
        return { bg: '#F7F8FA', text: '#6B7280' };
    };

    return (
        <MainLayout title={`تفاصيل العقد: ${contract.contract_number}`}>
            <Head title={`العقد - ${contract.contract_number}`} />

            <div className="mb-6 flex gap-2 flex-wrap">
                <Link href="/contracts" className="btn-back">
                    <ChevronLeft size={16} />
                    العودة للقائمة
                </Link>
                <Link href={`/contracts/${contract.id}/edit`} className="btn-secondary" style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px' }}>
                    <Pencil size={14} /> تعديل العقد
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right: Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>بيانات العقد</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>الرقم المرجعي</p>
                                <p className="font-extrabold mt-0.5">{contract.contract_number}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>العميل</p>
                                {contract.customer ? (
                                    <Link href={`/customers/${contract.customer.id}`} className="font-bold hover:underline" style={{ color: '#2B5D7C' }}>
                                        {contract.customer.name}
                                    </Link>
                                ) : '-'}
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>قيمة العقد الكلية</p>
                                <p className="font-extrabold text-lg mt-0.5" style={{ color: '#2B5D7C' }}>
                                    {Number(contract.total_value).toLocaleString()} ر.س
                                </p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>حالة العقد</p>
                                <span className="text-xs px-2.5 py-1 rounded font-bold mt-1 inline-block" style={{
                                    backgroundColor: getStatusColor(contract.status).bg,
                                    color: getStatusColor(contract.status).text
                                }}>
                                    {getStatusText(contract.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>تاريخ التوقيع</p>
                                <p className="font-semibold mt-0.5">{contract.signed_at}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>تاريخ التسليم المتوقع</p>
                                <p className="font-semibold mt-0.5">{contract.delivery_due_at}</p>
                            </div>
                        </div>
                    </div>

                    {/* Caravan Units Simple List */}
                    <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: '#E4E7EC' }}>
                            <h3 className="font-bold text-base" style={{ color: '#2B5D7C' }}>الوحدات (الكرفانات)</h3>
                        </div>

                        {contract.caravan_units.length === 0 ? (
                            <p className="text-xs" style={{ color: '#6B7280' }}>لم يتم تسجيل وحدات كرفانات لهذا العقد.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {contract.caravan_units.map((unit) => (
                                    <li key={unit.id} className="p-3 bg-gray-50 rounded border" style={{ borderColor: '#E4E7EC' }}>
                                        🏢 {unit.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Attachments Card */}
                    <Attachments
                        attachments={contract.attachments}
                        attachableType="Contract"
                        attachableId={contract.id}
                    />
                </div>

                {/* Left Area: Payments Schedule & Claims */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Payments Schedule Card */}
                    <div className="p-6 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-4 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>جدولة دفعات العقد والمتابعة</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                        <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>الدفعة / البيان</th>
                                        <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>مبلغ الدفعة</th>
                                        <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>تاريخ الاستحقاق</th>
                                        <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>حالة الدفعة والتحصيل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contract.payments.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                            <td className="py-4 font-semibold">{p.description}</td>
                                            <td className="py-4 text-center font-bold">{Number(p.amount).toLocaleString()} ر.س</td>
                                            <td className="py-4 text-center">{p.due_date}</td>
                                            <td className="py-4 text-left">
                                                {updatingPaymentId === p.id ? (
                                                    <span className="text-xs" style={{ color: '#6B7280' }}>جاري التحديث...</span>
                                                ) : (
                                                    <select
                                                        value={p.status}
                                                        onChange={e => handlePaymentStatusChange(p.id, e.target.value)}
                                                        className="text-xs font-bold rounded p-1 border cursor-pointer"
                                                        style={{
                                                            backgroundColor: getStatusColor(p.status).bg,
                                                            color: getStatusColor(p.status).text,
                                                            borderColor: '#E4E7EC'
                                                        }}
                                                    >
                                                        <option value="pending">انتظار الاستحقاق</option>
                                                        <option value="due">مستحق الآن</option>
                                                        <option value="overdue">متأخر الدفع</option>
                                                        <option value="paid">تم السداد</option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Claims Card */}
                    <div className="p-6 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-4 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>المطالبات المالية التابعة للعقد</h3>
                        
                        {contract.claims.length === 0 ? (
                            <p className="text-sm py-4 text-center text-gray-500" style={{ color: '#6B7280' }}>لا توجد مطالبات مالية مفتوحة لهذا العقد.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                            <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>رقم المطالبة</th>
                                            <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>المبلغ</th>
                                            <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>تاريخ الاستحقاق</th>
                                            <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contract.claims.map((claim) => (
                                            <tr key={claim.id} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                                <td className="py-4 font-bold">
                                                    <Link href={`/claims/${claim.id}`} className="hover:underline" style={{ color: '#2B5D7C' }}>
                                                        {claim.claim_number}
                                                    </Link>
                                                </td>
                                                <td className="py-4 text-center font-semibold">{Number(claim.amount).toLocaleString()} ر.س</td>
                                                <td className="py-4 text-center">{claim.due_date}</td>
                                                <td className="py-4 text-left">
                                                    <span className="text-xs px-2.5 py-1 rounded font-bold" style={{
                                                        backgroundColor: getStatusColor(claim.status).bg,
                                                        color: getStatusColor(claim.status).text
                                                    }}>
                                                        {getStatusText(claim.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
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
