import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Index({ entries, filters, total_receipt, total_payment, net }) {
    const [from, setFrom] = useState(filters.from || new Date().toISOString().split('T')[0]);
    const [to, setTo] = useState(filters.to || '');
    const [type, setType] = useState(filters.type || '');
    const [editingEntryId, setEditingEntryId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        date: '',
        description: '',
        type: 'receipt',
        amount: '',
        source: '',
        notes: '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/ledger', { from, to, type }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setFrom('');
        setTo('');
        setType('');
        router.get('/ledger');
    };

    const handleEditClick = (entry) => {
        setEditingEntryId(entry.id);
        setData({
            date: entry.date,
            description: entry.description,
            type: entry.type,
            amount: entry.amount,
            source: entry.source || '',
            notes: entry.notes || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingEntryId(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingEntryId) {
            put(`/ledger/${editingEntryId}`, {
                onSuccess: () => {
                    setEditingEntryId(null);
                    reset();
                }
            });
        } else {
            post('/ledger', {
                onSuccess: () => reset()
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا القيد المالي؟')) {
            router.delete(`/ledger/${id}`);
        }
    };

    return (
        <MainLayout title="دفتر الحسابات اليومي">
            <Head title="الحسابات اليومية" />

            {/* Totals Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                    <span className="text-xs font-bold" style={{ color: '#6B7280' }}>إجمالي المقبوضات (القبض)</span>
                    <p className="text-xl font-extrabold mt-1" style={{ color: '#2F9E44' }}>
                        {Number(total_receipt).toLocaleString()} ر.س
                    </p>
                </div>
                <div className="p-4 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                    <span className="text-xs font-bold" style={{ color: '#6B7280' }}>إجمالي المصروفات (الصرف)</span>
                    <p className="text-xl font-extrabold mt-1" style={{ color: '#E03131' }}>
                        {Number(total_payment).toLocaleString()} ر.s
                    </p>
                </div>
                <div className="p-4 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                    <span className="text-xs font-bold" style={{ color: '#6B7280' }}>الصافي</span>
                    <p className="text-xl font-extrabold mt-1" style={{ color: net >= 0 ? '#2F9E44' : '#E03131' }}>
                        {Number(net).toLocaleString()} ر.س
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Panel: Transaction Entry Form */}
                <div className="lg:col-span-1 p-6 rounded border bg-white space-y-4 h-fit" style={{ borderColor: '#E4E7EC' }}>
                    <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>
                        {editingEntryId ? 'تعديل قيد مالي' : 'تسجيل قيد مالي جديد'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Date */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>التاريخ *</label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.date && <p className="text-xs text-red-500 mt-0.5">{errors.date}</p>}
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>نوع العملية</label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={data.type === 'receipt'}
                                        onChange={() => setData('type', 'receipt')}
                                    />
                                    <span style={{ color: '#2F9E44', fontWeight: 'bold' }}>قبض (+)</span>
                                </label>
                                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={data.type === 'payment'}
                                        onChange={() => setData('type', 'payment')}
                                    />
                                    <span style={{ color: '#E03131', fontWeight: 'bold' }}>صرف (-)</span>
                                </label>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>المبلغ المالي *</label>
                            <input
                                type="number"
                                step="any"
                                min="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.amount && <p className="text-xs text-red-500 mt-0.5">{errors.amount}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>البيان / الوصف *</label>
                            <input
                                type="text"
                                placeholder="وصف موجز للمصروف أو القبض..."
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
                        </div>

                        {/* Source */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>المصدر (اختياري)</label>
                            <input
                                type="text"
                                placeholder="رقم العقد أو اسم جهة التوريد..."
                                value={data.source}
                                onChange={e => setData('source', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: '#1F2430' }}>ملاحظات إضافية</label>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows="2"
                                className="w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                            />
                        </div>

                        {/* Form buttons */}
                        <div className="pt-2 flex justify-end gap-2">
                            {editingEntryId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1.5 border rounded text-xs font-bold bg-white"
                                    style={{ borderColor: '#E4E7EC', color: '#6B7280' }}
                                >
                                    إلغاء
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-1.5 rounded text-xs font-bold text-white"
                                style={{ backgroundColor: '#2B5D7C' }}
                            >
                                {processing ? 'جاري الحفظ...' : editingEntryId ? 'تحديث القيد' : 'تسجيل القيد'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Left Panel: Filter & Records Table */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters Bar */}
                    <div className="p-4 rounded border bg-white" style={{ borderColor: '#E4E7EC' }}>
                        <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
                            <div>
                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>من تاريخ</label>
                                <input
                                    type="date"
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                    className="px-2 py-1.5 border rounded text-xs focus:outline-none"
                                    style={{ borderColor: '#E4E7EC' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>إلى تاريخ</label>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    className="px-2 py-1.5 border rounded text-xs focus:outline-none"
                                    style={{ borderColor: '#E4E7EC' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>النوع</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="px-2 py-1.5 border rounded text-xs focus:outline-none bg-white"
                                    style={{ borderColor: '#E4E7EC' }}
                                >
                                    <option value="">الكل</option>
                                    <option value="receipt">المقبوضات فقط</option>
                                    <option value="payment">المصروفات فقط</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-1.5 rounded text-xs font-bold text-white"
                                style={{ backgroundColor: '#2B5D7C' }}
                            >
                                تطبيق
                            </button>
                            {(from || to || type) && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-4 py-1.5 border rounded text-xs font-semibold bg-white"
                                    style={{ borderColor: '#E4E7EC', color: '#6B7280' }}
                                >
                                    مسح
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Table of entries */}
                    <div className="bg-white rounded border overflow-hidden" style={{ borderColor: '#E4E7EC' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead>
                                    <tr className="border-b font-bold text-gray-500" style={{ borderColor: '#E4E7EC', backgroundColor: '#F7F8FA' }}>
                                        <th className="p-4">التاريخ</th>
                                        <th className="p-4">البيان / الوصف</th>
                                        <th className="p-4">النوع</th>
                                        <th className="p-4">المبلغ</th>
                                        <th className="p-4">المصدر</th>
                                        <th className="p-4 text-left">العمليات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {entries.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-sm text-gray-500" style={{ color: '#6B7280' }}>
                                                لا توجد قيود مضافة في هذه الفترة المحددة.
                                            </td>
                                        </tr>
                                    ) : (
                                        entries.data.map((e) => (
                                            <tr key={e.id} className="hover:bg-slate-50 transition-colors duration-150">
                                                <td className="p-4 whitespace-nowrap">{e.date}</td>
                                                <td className="p-4">
                                                    <p className="font-semibold">{e.description}</p>
                                                    {e.notes && <p className="text-xs text-gray-400 mt-0.5">{e.notes}</p>}
                                                </td>
                                                <td className="p-4 font-bold">
                                                    <span className="text-xs px-2 py-0.5 rounded" style={{
                                                        backgroundColor: e.type === 'receipt' ? '#EBFBEE' : '#FFE3E3',
                                                        color: e.type === 'receipt' ? '#2F9E44' : '#E03131',
                                                    }}>
                                                        {e.type === 'receipt' ? 'قبض' : 'صرف'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold" style={{ color: e.type === 'receipt' ? '#2F9E44' : '#E03131' }}>
                                                    {e.type === 'receipt' ? '+' : '-'}{Number(e.amount).toLocaleString()} ر.س
                                                </td>
                                                <td className="p-4 text-gray-500">{e.source || '-'}</td>
                                                <td className="p-4 text-left flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(e)}
                                                        className="text-xs font-bold text-amber-600 hover:underline"
                                                    >
                                                        تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(e.id)}
                                                        className="text-xs font-bold text-red-600 hover:underline"
                                                    >
                                                        حذف
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {entries.links && entries.links.length > 3 && (
                            <div className="p-4 border-t flex justify-center gap-1" style={{ borderColor: '#E4E7EC' }}>
                                {entries.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded text-xs transition-colors ${link.active ? 'font-bold' : ''}`}
                                        style={{
                                            backgroundColor: link.active ? '#2B5D7C' : 'transparent',
                                            color: link.active ? '#ffffff' : link.url ? '#1F2430' : '#6B7280',
                                            pointerEvents: link.url ? 'auto' : 'none'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
