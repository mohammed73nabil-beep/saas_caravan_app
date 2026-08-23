import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Form({ contract, customers, nextNumber }) {
    const isEdit = !!contract;

    const { data, setData, post, put, processing, errors } = useForm({
        customer_id: contract?.customer_id || '',
        total_value: contract?.total_value || '',
        signed_at: contract?.signed_at || '',
        delivery_due_at: contract?.delivery_due_at || '',
        status: contract?.status || 'active',
        payments: contract?.payments || [{ description: '', amount: '', due_date: '' }],
    });

    const handleAddPayment = () => {
        setData('payments', [...data.payments, { description: '', amount: '', due_date: '' }]);
    };

    const handleRemovePayment = (index) => {
        const newPayments = data.payments.filter((_, i) => i !== index);
        setData('payments', newPayments.length ? newPayments : [{ description: '', amount: '', due_date: '' }]);
    };

    const handlePaymentChange = (index, field, value) => {
        const newPayments = data.payments.map((p, i) => {
            if (i === index) {
                return { ...p, [field]: value };
            }
            return p;
        });
        setData('payments', newPayments);
    };

    const getPaymentsTotal = () => {
        return data.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Sum validation
        const total = parseFloat(data.total_value) || 0;
        const sum = getPaymentsTotal();
        if (Math.abs(sum - total) > 0.01 && !isEdit) {
            alert(`تنبيه: مجموع الدفعات (${sum.toLocaleString()} ر.س) لا يساوي قيمة العقد الكلية (${total.toLocaleString()} ر.س). يرجى مطابقتها.`);
            return;
        }

        if (isEdit) {
            put(`/contracts/${contract.id}`);
        } else {
            post('/contracts');
        }
    };

    return (
        <MainLayout title={isEdit ? `تعديل عقد: ${contract.contract_number}` : 'إنشاء عقد كرفانات جديد'}>
            <Head title={isEdit ? 'تعديل العقد' : 'إنشاء عقد جديد'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Right: Info Card */}
                    <div className="lg:col-span-1 p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>معلومات العقد</h3>

                        {!isEdit && (
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>رقم العقد المتوقع</p>
                                <p className="font-bold mt-1 text-sm">{nextNumber}</p>
                            </div>
                        )}

                        {/* Customer */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                اختيار العميل <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.customer_id}
                                onChange={e => setData('customer_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                                required
                            >
                                <option value="">اختر العميل...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.customer_id && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.customer_id}</p>
                            )}
                        </div>

                        {/* Total Value */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                القيمة الإجمالية للعقد <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="1"
                                value={data.total_value}
                                onChange={e => setData('total_value', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                                disabled={isEdit} // Can't change value directly on edit to prevent schedule mismatch
                            />
                            {errors.total_value && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.total_value}</p>
                            )}
                        </div>

                        {/* Signed Date */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                تاريخ توقيع العقد <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.signed_at}
                                onChange={e => setData('signed_at', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.signed_at && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.signed_at}</p>
                            )}
                        </div>

                        {/* Delivery Due Date */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                تاريخ التسليم المتوقع <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.delivery_due_at}
                                onChange={e => setData('delivery_due_at', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.delivery_due_at && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.delivery_due_at}</p>
                            )}
                        </div>

                        {/* Status (Edit only) */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                    حالة العقد
                                </label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                    style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                                >
                                    <option value="active">نشط</option>
                                    <option value="completed">مكتمل</option>
                                    <option value="cancelled">ملغى</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Left: Payments Scheduler (Create only) */}
                    <div className="lg:col-span-2 p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: '#E4E7EC' }}>
                            <h3 className="font-bold text-base" style={{ color: '#2B5D7C' }}>
                                {isEdit ? 'جدولة الدفعات (للقراءة فقط)' : 'جدولة دفعات العقد'}
                            </h3>
                            {!isEdit && (
                                <button
                                    type="button"
                                    onClick={handleAddPayment}
                                    className="px-3 py-1.5 rounded text-xs font-bold text-white transition-colors duration-150"
                                    style={{ backgroundColor: '#2B5D7C' }}
                                >
                                    + إضافة دفعة جديدة
                                </button>
                            )}
                        </div>

                        {errors.payments && (
                            <p className="text-sm" style={{ color: '#E03131' }}>{errors.payments}</p>
                        )}

                        <div className="space-y-3">
                            {data.payments.map((p, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-3 last:border-0" style={{ borderColor: '#F7F8FA' }}>
                                    {/* Description */}
                                    <div className="col-span-5">
                                        {index === 0 && (
                                            <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>بيان الدفعة (مثال: دفعة مقدمة 30%)</label>
                                        )}
                                        <input
                                            type="text"
                                            placeholder="وصف الدفعة..."
                                            value={p.description}
                                            onChange={e => handlePaymentChange(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                            style={{ borderColor: '#E4E7EC' }}
                                            required
                                            disabled={isEdit}
                                        />
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-3">
                                        {index === 0 && (
                                            <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>المبلغ</label>
                                        )}
                                        <input
                                            type="number"
                                            step="any"
                                            min="0.01"
                                            placeholder="0.00"
                                            value={p.amount}
                                            onChange={e => handlePaymentChange(index, 'amount', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-sky-700"
                                            style={{ borderColor: '#E4E7EC' }}
                                            required
                                            disabled={isEdit}
                                        />
                                    </div>

                                    {/* Due Date */}
                                    <div className="col-span-3">
                                        {index === 0 && (
                                            <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>تاريخ الاستحقاق</label>
                                        )}
                                        <input
                                            type="date"
                                            value={p.due_date}
                                            onChange={e => handlePaymentChange(index, 'due_date', e.target.value)}
                                            className="w-full px-3 py-2 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-sky-700"
                                            style={{ borderColor: '#E4E7EC' }}
                                            required
                                            disabled={isEdit}
                                        />
                                    </div>

                                    {/* Delete Row */}
                                    <div className="col-span-1 flex justify-center pb-1">
                                        {!isEdit && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePayment(index)}
                                                className="p-2 rounded text-red-600 hover:bg-red-50 text-sm"
                                                title="حذف الدفعة"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals Comparison */}
                        {!isEdit && (
                            <div className="border-t pt-4 space-y-2" style={{ borderColor: '#E4E7EC' }}>
                                <div className="flex justify-between items-center text-sm" style={{ color: '#6B7280' }}>
                                    <span>مجموع الدفعات المجدولة:</span>
                                    <span className="font-bold">{getPaymentsTotal().toLocaleString()} ر.س</span>
                                </div>
                                <div className="flex justify-between items-center text-sm" style={{ color: '#6B7280' }}>
                                    <span>قيمة العقد المستهدفة:</span>
                                    <span className="font-bold">{(parseFloat(data.total_value) || 0).toLocaleString()} ر.س</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2" style={{ borderColor: '#F7F8FA' }}>
                                    <span className="font-bold text-sm">الفارق:</span>
                                    <span className="font-extrabold text-sm" style={{
                                        color: Math.abs(getPaymentsTotal() - (parseFloat(data.total_value) || 0)) < 0.01 ? '#2F9E44' : '#E03131'
                                    }}>
                                        {(getPaymentsTotal() - (parseFloat(data.total_value) || 0)).toLocaleString()} ر.س
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Panel */}
                <div className="flex justify-end gap-2 p-6 border-t bg-gray-50 rounded" style={{ borderColor: '#E4E7EC' }}>
                    <Link
                        href="/contracts"
                        className="px-4 py-2 border rounded text-sm font-bold bg-white"
                        style={{ borderColor: '#E4E7EC', color: '#6B7280' }}
                    >
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 rounded text-sm font-bold text-white"
                        style={{ backgroundColor: '#2B5D7C' }}
                    >
                        {processing ? 'جاري الحفظ...' : 'حفظ بيانات العقد'}
                    </button>
                </div>
            </form>
        </MainLayout>
    );
}
