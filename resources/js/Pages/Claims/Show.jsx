import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

export default function Show({ claim, auth }) {
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Note form
    const { data: noteData, setData: setNoteData, post: postNote, processing: noteProcessing, reset: resetNote } = useForm({
        note: ''
    });

    const handleStatusChange = (newStatus) => {
        setUpdatingStatus(true);
        router.patch(`/claims/${claim.id}`, {
            status: newStatus
        }, {
            onFinish: () => setUpdatingStatus(false)
        });
    };

    const handleAddNote = (e) => {
        e.preventDefault();
        postNote(`/claims/${claim.id}/notes`, {
            onSuccess: () => resetNote('note')
        });
    };

    const getStatusText = (status) => {
        const statuses = {
            due_soon: 'مستحق قريباً',
            due_now: 'مستحق الآن',
            overdue: 'متأخر الدفع',
            claimed: 'تمت المطالبة',
            promised: 'وعد بالدفع',
            paid: 'مدفوع'
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status) => {
        if (status === 'paid') return { bg: '#EBFBEE', text: '#2F9E44' };
        if (['due_soon', 'due_now', 'claimed', 'promised'].includes(status)) return { bg: '#FFF9DB', text: '#E8A33D' };
        if (status === 'overdue') return { bg: '#FFE3E3', text: '#E03131' };
        return { bg: '#F7F8FA', text: '#6B7280' };
    };

    return (
        <MainLayout title={`تفاصيل المطالبة: ${claim.claim_number}`}>
            <Head title={`المطالبة - ${claim.claim_number}`} />

            <div className="mb-6 flex gap-2 flex-wrap">
                <Link href="/claims" className="btn-back">
                    <ChevronLeft size={16} />
                    العودة للقائمة
                </Link>
                {claim.customer?.phone && (
                    <button
                        onClick={() => {
                            let rawPhone = claim.customer.phone;
                            let cleaned = rawPhone.replace(/[^0-9]/g, '');
                            if (cleaned.startsWith('05') && cleaned.length === 10) {
                                cleaned = '966' + cleaned.substring(1);
                            } else if (cleaned.startsWith('5') && cleaned.length === 9) {
                                cleaned = '966' + cleaned;
                            }
                            const message = `مرحباً ${claim.customer.name}،\nنود تذكيركم بوجود مبلغ مستحق قدره ${Number(claim.amount).toLocaleString()} ريال (مرجع: ${claim.claim_number})، تاريخ الاستحقاق ${claim.due_date}.\nنرجو التكرم بالتواصل لترتيب السداد.\n\nمع تحيات ${auth.user?.company?.name || ''}`;
                            window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="btn-secondary"
                        style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px', borderColor: '#25D366', color: '#25D366' }}
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        ارسال تذكير واتساب
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right: Info Card */}
                <div className="lg:col-span-1 p-6 rounded border bg-white space-y-4 shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                    <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>بيانات التحصيل</h3>

                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>رقم المطالبة</p>
                            <p className="font-extrabold mt-0.5">{claim.claim_number}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>العميل المستحق عليه</p>
                            {claim.customer ? (
                                <Link href={`/customers/${claim.customer.id}`} className="font-bold hover:underline" style={{ color: '#2B5D7C' }}>
                                    {claim.customer.name}
                                </Link>
                            ) : '-'}
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>المبلغ المطلوب</p>
                            <p className="font-extrabold text-lg mt-0.5 text-red-600">
                                {Number(claim.amount).toLocaleString()} ر.س
                            </p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>تاريخ الاستحقاق</p>
                            <p className="font-semibold mt-0.5">{claim.due_date}</p>
                        </div>
                        {claim.days_overdue > 0 && (
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>عدد أيام التأخير</p>
                                <p className="font-bold mt-0.5" style={{ color: '#E03131' }}>{claim.days_overdue} يوم</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs" style={{ color: '#6B7280' }}>العقد المرتبط</p>
                            {claim.contract ? (
                                <Link href={`/contracts/${claim.contract.id}`} className="font-bold hover:underline block mt-0.5" style={{ color: '#2B5D7C' }}>
                                    عقد رقم: {claim.contract.contract_number}
                                </Link>
                            ) : (
                                <p className="mt-0.5" style={{ color: '#6B7280' }}>مطالبة يدوية مستقلة (بدون عقد)</p>
                            )}
                        </div>
                        <div className="pt-2 border-t" style={{ borderColor: '#E4E7EC' }}>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>تعديل حالة التحصيل</label>
                            {updatingStatus ? (
                                <span className="text-xs" style={{ color: '#6B7280' }}>جاري التحديث...</span>
                            ) : (
                                <select
                                    value={claim.status}
                                    onChange={e => handleStatusChange(e.target.value)}
                                    className="w-full text-xs font-bold rounded p-2 border cursor-pointer mt-1"
                                    style={{
                                        backgroundColor: getStatusColor(claim.status).bg,
                                        color: getStatusColor(claim.status).text,
                                        borderColor: '#E4E7EC'
                                    }}
                                >
                                    <option value="due_soon">مستحق قريباً</option>
                                    <option value="due_now">مستحق الآن</option>
                                    <option value="overdue">متأخر الدفع</option>
                                    <option value="claimed">تمت المطالبة</option>
                                    <option value="promised">وعد بالدفع</option>
                                    <option value="paid">مدفوع</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Left Area: Follow-up Timeline notes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add note form */}
                    <div className="p-6 rounded border bg-white shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-3 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>إضافة ملاحظة متابعة أو اتصال جديد</h3>
                        
                        <form onSubmit={handleAddNote} className="space-y-3">
                            <textarea
                                value={noteData.note}
                                onChange={e => setNoteData('note', e.target.value)}
                                placeholder="اكتب تفاصيل الاتصال بالعميل (مثال: تم الاتصال ووعد بالدفع يوم الأحد القادم)..."
                                rows="3"
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={noteProcessing}
                                    className="px-4 py-2 rounded text-xs font-bold text-white transition-colors duration-150"
                                    style={{ backgroundColor: '#2B5D7C' }}
                                >
                                    {noteProcessing ? 'جاري الإضافة...' : 'تسجيل الملاحظة'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Timeline History */}
                    <div className="p-6 rounded border bg-white shadow-sm" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-3 mb-4" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>سجل متابعة التحصيل (Timeline)</h3>
                        
                        {!claim.timeline || claim.timeline.length === 0 ? (
                            <p className="text-sm py-4 text-center text-gray-500" style={{ color: '#6B7280' }}>لم يتم تسجيل أي ملاحظات متابعة بعد.</p>
                        ) : (
                            <div className="relative border-r pr-6 space-y-6" style={{ borderColor: '#E4E7EC' }}>
                                {claim.timeline.map((item, index) => (
                                    <div key={index} className="relative">
                                        {/* Dot Indicator */}
                                        <div className="absolute right-[-29px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white" style={{ borderColor: '#2B5D7C' }} />
                                        
                                        <div className="text-sm">
                                            <p className="font-bold" style={{ color: '#2B5D7C' }}>{item.date}</p>
                                            <p className="mt-1 whitespace-pre-wrap text-gray-800">{item.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
