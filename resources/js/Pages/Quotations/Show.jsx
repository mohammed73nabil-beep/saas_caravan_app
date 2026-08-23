import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Pencil, Printer, Zap } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';
import Attachments from '../../Components/Attachments';

export default function Show({ quotation, auth, shareUrl }) {
    const handleConvert = () => {
        if (confirm('هل أنت متأكد من تحويل عرض السعر هذا إلى عقد؟ سيتم نسخ بيانات العميل والبنود والقيمة الكلية.')) {
            router.post(`/quotations/${quotation.id}/convert`);
        }
    };

    const getStatusText = (status) => {
        const statuses = {
            draft: 'مسودة',
            sent: 'مرسل',
            accepted: 'مقبول (جاهز للتحويل)',
            rejected: 'مرفوض',
            expired: 'منتهي الصلاحية'
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status) => {
        if (status === 'accepted') return { bg: '#EBFBEE', text: '#2F9E44' };
        if (status === 'sent') return { bg: '#FFF9DB', text: '#E8A33D' };
        if (['rejected', 'expired'].includes(status)) return { bg: '#FFE3E3', text: '#E03131' };
        return { bg: '#F7F8FA', text: '#6B7280' };
    };

    return (
        <MainLayout title={`عرض سعر: ${quotation.quotation_number}`}>
            <Head title={`عرض سعر - ${quotation.quotation_number}`} />

            <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                    <Link href="/quotations" className="btn-back">
                        <ChevronLeft size={16} />
                        العودة للقائمة
                    </Link>
                    <Link href={`/quotations/${quotation.id}/edit`} className="btn-secondary" style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px' }}>
                        <Pencil size={14} /> تعديل البيانات
                    </Link>
                    <a
                        href={`/quotations/${quotation.id}/print?print=true`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px' }}
                    >
                        <Printer size={14} /> طباعة / PDF
                    </a>
                    {quotation.customer?.phone && (
                        <button
                            onClick={() => {
                                let rawPhone = quotation.customer.phone;
                                let cleaned = rawPhone.replace(/[^0-9]/g, '');
                                if (cleaned.startsWith('05') && cleaned.length === 10) {
                                    cleaned = '966' + cleaned.substring(1);
                                } else if (cleaned.startsWith('5') && cleaned.length === 9) {
                                    cleaned = '966' + cleaned;
                                }
                                const message = `مرحباً ${quotation.customer.name}،\nنرسل لكم عرض السعر رقم ${quotation.quotation_number} بقيمة ${Number(quotation.total_amount).toLocaleString()} ريال.\nيمكنكم الاطلاع على تفاصيل العرض من الرابط التالي:\n${shareUrl}\n\nمع تحيات ${auth.user?.company?.name || ''}`;
                                window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="btn-secondary"
                            style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px', borderColor: '#25D366', color: '#25D366' }}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            واتساب
                        </button>
                    )}
                </div>

                {quotation.status === 'accepted' && !quotation.contract && (
                    <button
                        onClick={handleConvert}
                        className="btn-primary"
                        style={{ fontSize: '13px' }}
                    >
                        <Zap size={14} /> تحويل إلى عقد رسمي
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Area: Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Main info card */}
                    <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>بيانات السجل</h3>
                        
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>رقم عرض السعر</p>
                                <p className="font-extrabold mt-0.5">{quotation.quotation_number}</p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>حالة العرض</p>
                                <span className="text-xs px-2.5 py-1 rounded font-bold mt-1 inline-block" style={{
                                    backgroundColor: getStatusColor(quotation.status).bg,
                                    color: getStatusColor(quotation.status).text
                                }}>
                                    {getStatusText(quotation.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>الإجمالي الكلي</p>
                                <p className="font-extrabold text-lg mt-0.5" style={{ color: '#2B5D7C' }}>
                                    {Number(quotation.total_amount).toLocaleString()} ر.س
                                </p>
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>تاريخ الصلاحية</p>
                                <p className="font-semibold mt-0.5">{quotation.expires_at}</p>
                            </div>
                            {quotation.contract && (
                                <div className="p-3 rounded border text-xs" style={{ backgroundColor: '#EBFBEE', borderColor: '#D3F9D8', color: '#2F9E44' }}>
                                    <p className="font-bold">مرتبط بالعقد الحالي:</p>
                                    <Link href={`/contracts/${quotation.contract.id}`} className="underline font-bold mt-1 block">
                                        رقم: {quotation.contract.contract_number}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer info card */}
                    <div className="p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>العميل الموجه له</h3>
                        {quotation.customer ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>اسم العميل</p>
                                    <Link href={`/customers/${quotation.customer.id}`} className="font-bold hover:underline" style={{ color: '#2B5D7C' }}>
                                        {quotation.customer.name}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>المسؤول للتواصل</p>
                                    <p className="font-semibold mt-0.5">{quotation.customer.contact_person}</p>
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>رقم الجوال</p>
                                    <p className="font-semibold mt-0.5">{quotation.customer.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: '#6B7280' }}>لا توجد معلومات للعميل.</p>
                        )}
                    </div>

                    {/* Attachments Card */}
                    <Attachments
                        attachments={quotation.attachments}
                        attachableType="Quotation"
                        attachableId={quotation.id}
                    />
                </div>

                {/* Left Area: Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-4 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>بنود عرض السعر بالتفصيل</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: '#E4E7EC' }}>
                                        <th className="pb-3 font-bold" style={{ color: '#6B7280' }}>البند / الوصف</th>
                                        <th className="pb-3 font-bold text-center" style={{ color: '#6B7280' }}>الكمية</th>
                                        <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>سعر الوحدة</th>
                                        <th className="pb-3 font-bold text-left" style={{ color: '#6B7280' }}>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items.map((item, index) => (
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
                                {Number(quotation.total_amount).toLocaleString()} ر.س
                            </span>
                        </div>
                    </div>

                    {/* Terms card */}
                    {quotation.description && (
                        <div className="p-6 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                            <h3 className="font-bold text-sm border-b pb-2 mb-2" style={{ color: '#1F2430', borderColor: '#E4E7EC' }}>شروط وأحكام إضافية</h3>
                            <p className="text-sm whitespace-pre-wrap" style={{ color: '#6B7280' }}>
                                {quotation.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
