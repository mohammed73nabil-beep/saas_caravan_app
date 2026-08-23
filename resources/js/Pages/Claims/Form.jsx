import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Form({ customers, contracts, nextNumber }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        contract_id: '',
        amount: '',
        due_date: '',
        status: 'due_soon',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/claims');
    };

    // Filter contracts based on selected customer to make UX cleaner
    const filteredContracts = data.customer_id
        ? contracts.filter(c => c.customer_id === parseInt(data.customer_id))
        : [];

    return (
        <MainLayout title="تسجيل مطالبة مالية يدوية">
            <Head title="تسجيل مطالبة" />

            <div className="max-w-2xl bg-white rounded border p-6" style={{ borderColor: '#E4E7EC' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-xs" style={{ color: '#6B7280' }}>رقم المطالبة المتوقع</p>
                        <p className="font-extrabold mt-1 text-sm">{nextNumber}</p>
                    </div>

                    {/* Customer */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            العميل المستحق عليه <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.customer_id}
                            onChange={e => {
                                setData(data => ({
                                    ...data,
                                    customer_id: e.target.value,
                                    contract_id: '' // reset contract when customer changes
                                }));
                            }}
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

                    {/* Contract (Optional) */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            العقد المرتبط (اختياري)
                        </label>
                        <select
                            value={data.contract_id}
                            onChange={e => setData('contract_id', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                            disabled={!data.customer_id}
                        >
                            <option value="">مطالبة يدوية مستقلة (بدون عقد)</option>
                            {filteredContracts.map(c => (
                                <option key={c.id} value={c.id}>{c.contract_number}</option>
                            ))}
                        </select>
                        {errors.contract_id && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.contract_id}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            مبلغ المطالبة المالي <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.amount && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.amount}</p>
                        )}
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            تاريخ الاستحقاق المطلوب <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.due_date}
                            onChange={e => setData('due_date', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.due_date && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.due_date}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            حالة المطالبة البدئية
                        </label>
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                        >
                            <option value="due_soon">مستحق قريباً</option>
                            <option value="due_now">مستحق الآن</option>
                            <option value="overdue">متأخر الدفع</option>
                            <option value="claimed">تمت المطالبة</option>
                            <option value="promised">وعد بالدفع</option>
                            <option value="paid">مدفوعة</option>
                        </select>
                    </div>

                    {/* Submit buttons */}
                    <div className="pt-4 border-t flex justify-end gap-2" style={{ borderColor: '#E4E7EC' }}>
                        <Link
                            href="/claims"
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
                            {processing ? 'جاري الحفظ...' : 'تسجيل المطالبة'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
