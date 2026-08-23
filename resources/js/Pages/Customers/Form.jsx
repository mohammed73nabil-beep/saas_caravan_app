import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';

export default function Form({ customer }) {
    const isEdit = !!customer;

    const { data, setData, post, put, processing, errors } = useForm({
        name: customer?.name || '',
        contact_person: customer?.contact_person || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        address: customer?.address || '',
        notes: customer?.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/customers/${customer.id}`);
        } else {
            post('/customers');
        }
    };

    return (
        <MainLayout title={isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}>
            <Head title={isEdit ? 'تعديل عميل' : 'إضافة عميل'} />

            <div className="max-w-2xl bg-white rounded border p-6" style={{ borderColor: '#E4E7EC' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            الاسم الكامل / اسم الشركة <span className="text-red-500">*</span>
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
                            الشخص المسؤول للتواصل <span className="text-red-500">*</span>
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

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                        />
                        {errors.email && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.email}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            العنوان
                        </label>
                        <textarea
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                        />
                        {errors.address && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.address}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                            ملاحظات
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                            style={{ borderColor: '#E4E7EC' }}
                        />
                        {errors.notes && (
                            <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.notes}</p>
                        )}
                    </div>

                    {/* Submit Actions */}
                    <div className="pt-4 border-t flex justify-end gap-2" style={{ borderColor: '#E4E7EC' }}>
                        <Link
                            href="/customers"
                            className="px-4 py-2 border rounded text-sm font-bold"
                            style={{ borderColor: '#E4E7EC', color: '#6B7280', backgroundColor: '#ffffff' }}
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded text-sm font-bold text-white"
                            style={{ backgroundColor: '#2B5D7C' }}
                        >
                            {processing ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
