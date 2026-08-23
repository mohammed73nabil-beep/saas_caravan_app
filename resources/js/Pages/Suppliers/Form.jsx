import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Form({ supplier }) {
    const isEdit = !!supplier;

    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier?.name || '',
        contact_person: supplier?.contact_person || '',
        phone: supplier?.phone || '',
        supply_type: supplier?.supply_type || '',
        notes: supplier?.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/suppliers/${supplier.id}`);
        } else {
            post('/suppliers');
        }
    };

    return (
        <MainLayout title={isEdit ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}>
            <Head title={isEdit ? 'تعديل مورد' : 'إضافة مورد'} />

            <div className="max-w-2xl bg-white rounded border p-6" style={{ borderColor: '#E4E7EC' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            اسم المورد / الشركة <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.name && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.name}</p>
                        )}
                    </div>

                    {/* Contact Person */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            المسؤول التواصلي <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.contact_person}
                            onChange={e => setData('contact_person', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.contact_person && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.contact_person}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            رقم الجوال <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.phone && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.phone}</p>
                        )}
                    </div>

                    {/* Supply Type */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            نوع التوريد (مثال: مواد خام، قطع غيار، خدمات) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.supply_type}
                            onChange={e => setData('supply_type', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                            required
                        />
                        {errors.supply_type && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.supply_type}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            ملاحظات المورد
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t flex justify-end gap-2" style={{ borderColor: '#E4E7EC' }}>
                        <Link
                            href="/suppliers"
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
                            {processing ? 'جاري الحفظ...' : 'حفظ المورد'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
