import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Pencil } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

export default function Show({ order }) {
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
        <MainLayout title={`أمر شراء: ${order.po_number}`}>
            <Head title={`أمر شراء - ${order.po_number}`} />

            <div className="mb-6 flex gap-2">
                <Link href="/purchase-orders" className="btn-back">
                    <ChevronLeft size={16} />
                    العودة للقائمة
                </Link>
                <Link href={`/purchase-orders/${order.id}/edit`} className="btn-secondary" style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px' }}>
                    <Pencil size={14} /> تعديل أمر الشراء
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Area: Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Details Card */}
                    <div className="p-6 rounded border bg-white space-y-4 shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>معلومات السجل</h3>
                        
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>رقم أمر الشراء</p>
                                <p className="font-extrabold mt-0.5">{order.po_number}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>حالة الأمر</p>
                                <span className="text-xs px-2.5 py-1 rounded font-bold mt-1 inline-block" style={{
                                    backgroundColor: getStatusColor(order.status).bg,
                                    color: getStatusColor(order.status).text
                                }}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>الإجمالي الكلي</p>
                                <p className="font-extrabold text-lg mt-0.5" style={{ color: '#2B5D7C' }}>
                                    {Number(order.total_amount).toLocaleString()} ر.س
                                </p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>تاريخ الطلب</p>
                                <p className="font-semibold mt-0.5">{order.order_date}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>تاريخ التسليم المتوقع</p>
                                <p className="font-semibold mt-0.5">{order.expected_delivery_date || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Supplier details card */}
                    <div className="p-6 rounded border bg-white space-y-4 shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>المورد المطلوب منه</h3>
                        {order.supplier ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>اسم المورد</p>
                                    <Link href={`/suppliers/${order.supplier.id}`} className="font-bold hover:underline" style={{ color: '#2B5D7C' }}>
                                        {order.supplier.name}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>المسؤول</p>
                                    <p className="font-semibold mt-0.5">{order.supplier.contact_person}</p>
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>رقم الجوال</p>
                                    <p className="font-semibold mt-0.5">{order.supplier.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: '#6B7280' }}>لا توجد معلومات للمورد.</p>
                        )}
                    </div>

                    {/* Caravan Unit allocation details */}
                    {order.caravan_unit && (
                        <div className="p-6 rounded border bg-white space-y-4 shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                            <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>الكرفان المخصص له التوريد</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>رقم / اسم الكرفان</p>
                                    <p className="font-bold mt-0.5">🏢 {order.caravan_unit.name}</p>
                                </div>
                                {order.caravan_unit.contract && (
                                    <div>
                                        <p className="text-xs" style={{ color: '#6B7280' }}>عقد العميل المرتبط</p>
                                        <Link href={`/contracts/${order.caravan_unit.contract.id}`} className="font-bold hover:underline block mt-0.5" style={{ color: '#2B5D7C' }}>
                                            عقد رقم: {order.caravan_unit.contract.contract_number}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Left Area: Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded border bg-white shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-4 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>الأصناف المطلوبة</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                        <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>اسم المادة / الصنف</th>
                                        <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>الكمية</th>
                                        <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>سعر الوحدة</th>
                                        <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="border-b last:border-0" style={{ borderColor: '#E4E7EC' }}>
                                            <td className="py-3.5 font-semibold">{item.item_name}</td>
                                            <td className="py-3.5 text-center">{Number(item.quantity).toLocaleString()}</td>
                                            <td className="py-3.5 text-left">{Number(item.unit_price).toLocaleString()} ر.س</td>
                                            <td className="py-3.5 text-left font-bold" style={{ color: '#2B5D7C' }}>
                                                {Number(item.total).toLocaleString()} ر.س
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Grand Total */}
                        <div className="border-t pt-4 flex justify-between items-center mt-4" style={{ borderColor: '#E4E7EC' }}>
                            <span className="font-bold text-sm" style={{ color: '#6B7280' }}>الإجمالي الكلي:</span>
                            <span className="text-xl font-extrabold" style={{ color: '#2B5D7C' }}>
                                {Number(order.total_amount).toLocaleString()} ر.س
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
