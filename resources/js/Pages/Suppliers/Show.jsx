import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Pencil } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

export default function Show({ supplier, stats }) {
    const getStatusText = (status) => {
        const statuses = {
            requested: 'مطلوب',
            ordered: 'تم الطلب',
            partially_received: 'تم الاستلام جزئياً',
            fully_received: 'تم الاستلام بالكامل'
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status) => {
        if (status === 'fully_received') return { bg: '#EBFBEE', text: '#2F9E44' };
        if (['requested', 'ordered', 'partially_received'].includes(status)) return { bg: '#FFF9DB', text: '#E8A33D' };
        return { bg: '#F7F8FA', text: '#6B7280' };
    };

    return (
        <MainLayout title={`ملف المورد: ${supplier.name}`}>
            <Head title={`المورد - ${supplier.name}`} />

            <div className="mb-6 flex gap-2">
                <Link href="/suppliers" className="btn-back">
                    <ChevronLeft size={16} />
                    العودة للموردين
                </Link>
                <Link href={`/suppliers/${supplier.id}/edit`} className="btn-secondary" style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px' }}>
                    <Pencil size={14} /> تعديل البيانات
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Panel: Info & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Info Card */}
                    <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>بيانات المورد</h3>
                        
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>اسم المورد</p>
                                <p className="font-bold mt-0.5">{supplier.name}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>المسؤول للتواصل</p>
                                <p className="font-semibold mt-0.5">{supplier.contact_person}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>رقم الجوال</p>
                                <p className="font-semibold mt-0.5">{supplier.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>نوع التوريد</p>
                                <p className="font-semibold mt-0.5">{supplier.supply_type}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>ملاحظات</p>
                                <p className="mt-0.5 whitespace-pre-wrap">{supplier.notes || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>ملخص المعاملات المالية</h3>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span style={{ color: '#6B7280' }}>عدد أوامر الشراء:</span>
                                <span className="font-bold">{stats.total_orders} طلب</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: '#6B7280' }}>إجمالي التوريد والتعامل:</span>
                                <span className="font-extrabold text-sm" style={{ color: '#2B5D7C' }}>
                                    {Number(stats.total_amount).toLocaleString()} ر.س
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2" style={{ borderColor: '#F7F8FA' }}>
                                <span style={{ color: '#6B7280' }}>المبالغ المفتوحة/المستحقة له:</span>
                                <span className="font-extrabold text-sm" style={{ color: '#E8A33D' }}>
                                    {Number(stats.pending_amount).toLocaleString()} ر.س
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Panel: Purchase Orders List */}
                <div className="lg:col-span-2 p-6 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                    <h3 className="font-bold text-base border-b pb-4 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>أوامر الشراء المرتبطة بالمورد</h3>
                    
                    {supplier.purchase_orders.length === 0 ? (
                        <p className="text-sm py-4 text-center text-gray-500" style={{ color: '#6B7280' }}>لا توجد أوامر شراء صادرة لهذا المورد.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                        <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>رقم الأمر</th>
                                        <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>الوحدة المرتبطة</th>
                                        <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>قيمة الطلب</th>
                                        <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>تاريخ التسليم المتوقع</th>
                                        <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplier.purchase_orders.map((po) => (
                                        <tr key={po.id} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                            <td className="py-4 font-bold">
                                                <Link href={`/purchase-orders/${po.id}`} className="hover:underline" style={{ color: '#2B5D7C' }}>
                                                    {po.po_number}
                                                </Link>
                                            </td>
                                            <td className="py-4">
                                                {po.caravan_unit ? (
                                                    <span>{po.caravan_unit.name}</span>
                                                ) : (
                                                    <span className="text-xs" style={{ color: '#6B7280' }}>عام (غير مخصص لكرفان)</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-center font-semibold">{Number(po.total_amount).toLocaleString()} ر.س</td>
                                            <td className="py-4 text-center">{po.expected_delivery_date || '-'}</td>
                                            <td className="py-4 text-left">
                                                <span className="text-xs px-2.5 py-1 rounded font-bold" style={{
                                                    backgroundColor: getStatusColor(po.status).bg,
                                                    color: getStatusColor(po.status).text
                                                }}>
                                                    {getStatusText(po.status)}
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
        </MainLayout>
    );
}
