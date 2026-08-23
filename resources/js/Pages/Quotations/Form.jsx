import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import axios from 'axios';

export default function Form({ quotation, customers, nextNumber }) {
    const isEdit = !!quotation;

    const [localCustomers, setLocalCustomers] = useState(customers || []);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
    const [customerSubmitting, setCustomerSubmitting] = useState(false);
    const [customerError, setCustomerError] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        customer_id: quotation?.customer_id || '',
        description: quotation?.description || '',
        expires_at: quotation?.expires_at || '',
        status: quotation?.status || 'draft',
        items: quotation?.items || [{ item_name: '', quantity: 1, unit_price: 0 }],
        deposit_amount:  quotation?.deposit_amount  ?? '',
        delivery_amount: quotation?.delivery_amount ?? '',
    });

    const handleAddItem = () => {
        setData('items', [...data.items, { item_name: '', quantity: 1, unit_price: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems.length ? newItems : [{ item_name: '', quantity: 1, unit_price: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = data.items.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setData('items', newItems);
    };

    const calculateGrandTotal = () => {
        return data.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unit_price) || 0;
            return sum + (qty * price);
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/quotations/${quotation.id}`);
        } else {
            post('/quotations');
        }
    };

    const handleQuickCustomerSubmit = async (e) => {
        e.preventDefault();
        setCustomerSubmitting(true);
        setCustomerError('');
        try {
            const response = await axios.post('/api/customers/quick', newCustomer);
            const created = response.data;
            setLocalCustomers([...localCustomers, created]);
            setData('customer_id', created.id);
            setShowCustomerModal(false);
            setNewCustomer({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
        } catch (err) {
            setCustomerError(err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات العميل.');
        } finally {
            setCustomerSubmitting(false);
        }
    };

    return (
        <MainLayout title={isEdit ? `تعديل عرض سعر: ${quotation.quotation_number}` : 'إنشاء عرض سعر جديد'}>
            <Head title={isEdit ? 'تعديل عرض سعر' : 'إنشاء عرض سعر'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Right: Info Card */}
                    <div className="lg:col-span-1 p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>معلومات العرض</h3>
                        
                        {!isEdit && (
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>الرقم المرجعي المتوقع</p>
                                <p className="font-bold mt-1 text-sm">{nextNumber}</p>
                            </div>
                        )}

                        {/* Customer */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-bold" style={{ color: '#1F2430' }}>
                                    اختيار العميل <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(true)}
                                    className="text-xs font-bold hover:underline"
                                    style={{ color: '#2B5D7C' }}
                                >
                                    ➕ إضافة عميل جديد
                                </button>
                            </div>
                            <select
                                value={data.customer_id}
                                onChange={e => setData('customer_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                                required
                            >
                                <option value="">اختر العميل...</option>
                                {localCustomers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.customer_id && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.customer_id}</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                تاريخ صلاحية العرض <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.expires_at}
                                onChange={e => setData('expires_at', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.expires_at && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.expires_at}</p>
                            )}
                        </div>

                        {/* Status (Edit only) */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                    حالة عرض السعر
                                </label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                    style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                                >
                                    <option value="draft">مسودة</option>
                                    <option value="sent">مرسل</option>
                                    <option value="accepted">مقبول</option>
                                    <option value="rejected">مرفوض</option>
                                    <option value="expired">منتهي الصلاحية</option>
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                تفاصيل / شروط إضافية
                            </label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                placeholder="شروط الدفع والتسليم..."
                            />
                        </div>
                    </div>

                    {/* Left: Dynamic Items Table */}
                    <div className="lg:col-span-2 p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: '#E4E7EC' }}>
                            <h3 className="font-bold text-base" style={{ color: '#2B5D7C' }}>بنود عرض السعر</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1.5 rounded text-xs font-bold text-white transition-colors duration-150"
                                style={{ backgroundColor: '#2B5D7C' }}
                            >
                                + إضافة بند جديد
                            </button>
                        </div>

                        {errors.items && (
                            <p className="text-sm" style={{ color: '#E03131' }}>{errors.items}</p>
                        )}

                        <div className="space-y-3">
                            {data.items.map((item, index) => {
                                const qty = parseFloat(item.quantity) || 0;
                                const price = parseFloat(item.unit_price) || 0;
                                const itemTotal = qty * price;

                                return (
                                    <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-3 last:border-0" style={{ borderColor: '#F7F8FA' }}>
                                        {/* Item Name */}
                                        <div className="col-span-6">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>البند / التفاصيل</label>
                                            )}
                                            <input
                                                type="text"
                                                placeholder="وصف البند..."
                                                value={item.item_name}
                                                onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                                style={{ borderColor: '#E4E7EC' }}
                                                required
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-2">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>الكمية</label>
                                            )}
                                            <input
                                                type="number"
                                                step="any"
                                                min="0.01"
                                                value={item.quantity}
                                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-sky-700"
                                                style={{ borderColor: '#E4E7EC' }}
                                                required
                                            />
                                        </div>

                                        {/* Unit Price */}
                                        <div className="col-span-2">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>السعر</label>
                                            )}
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={e => handleItemChange(index, 'unit_price', e.target.value)}
                                                className="w-full px-3 py-2 border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-sky-700"
                                                style={{ borderColor: '#E4E7EC' }}
                                                required
                                            />
                                        </div>

                                        {/* Row Total (read-only) */}
                                        <div className="col-span-1 text-center self-center pb-2">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold mb-3" style={{ color: '#6B7280' }}>الإجمالي</label>
                                            )}
                                            <span className="font-bold text-sm block">
                                                {itemTotal.toLocaleString('en-US')}
                                            </span>
                                        </div>

                                        {/* Delete Button */}
                                        <div className="col-span-1 flex justify-center pb-1">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 rounded text-red-600 hover:bg-red-50 text-sm"
                                                title="حذف البند"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grand Total Bar */}
                        <div className="border-t pt-4" style={{ borderColor: '#E4E7EC' }}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-sm" style={{ color: '#6B7280' }}>الإجمالي الكلي للعرض:</span>
                                <span className="text-xl font-extrabold" style={{ color: '#2B5D7C' }}>
                                    {calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                </span>
                            </div>

                            {/* Payment Terms Section */}
                            <div style={{
                                backgroundColor: 'var(--bg-app)',
                                border: '1px dashed var(--border-color)',
                                borderRadius: '10px',
                                padding: '16px',
                            }}>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px', marginTop: 0 }}>
                                    💳 شروط الدفع (اختياري)
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {/* Deposit */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                            المبلغ الأول <span style={{ color: '#6B7280', fontWeight: '400' }}>(العربون / الدفعة الأولى)</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={data.deposit_amount}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        deposit_amount: val,
                                                        delivery_amount: val !== '' ? Math.max(0, calculateGrandTotal() - parseFloat(val || 0)).toFixed(2) : '',
                                                    }));
                                                }}
                                                placeholder="0.00"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 40px 8px 8px',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'var(--bg-card)',
                                                    color: 'var(--text-primary)',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#6B7280' }}>ر.س</span>
                                        </div>
                                        {errors.deposit_amount && <p style={{ color: '#E03131', fontSize: '11px', marginTop: '3px' }}>{errors.deposit_amount}</p>}
                                    </div>

                                    {/* Delivery */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                            المبلغ الثاني <span style={{ color: '#6B7280', fontWeight: '400' }}>(المتبقي عند التسليم)</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={data.delivery_amount}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        delivery_amount: val,
                                                        deposit_amount: val !== '' ? Math.max(0, calculateGrandTotal() - parseFloat(val || 0)).toFixed(2) : '',
                                                    }));
                                                }}
                                                placeholder="0.00"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 40px 8px 8px',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    backgroundColor: 'var(--bg-card)',
                                                    color: 'var(--text-primary)',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#6B7280' }}>ر.س</span>
                                        </div>
                                        {errors.delivery_amount && <p style={{ color: '#E03131', fontSize: '11px', marginTop: '3px' }}>{errors.delivery_amount}</p>}
                                    </div>
                                </div>

                                {/* Validation warning if amounts don't match total */}
                                {(() => {
                                    const total = calculateGrandTotal();
                                    const dep   = parseFloat(data.deposit_amount  || 0);
                                    const del   = parseFloat(data.delivery_amount || 0);
                                    if ((data.deposit_amount || data.delivery_amount) && Math.abs((dep + del) - total) > 0.01) {
                                        return (
                                            <p style={{ fontSize: '11px', color: '#E8A33D', marginTop: '8px', padding: '6px 10px', backgroundColor: 'rgba(232,163,61,0.1)', borderRadius: '6px', border: '1px solid rgba(232,163,61,0.3)', margin: '8px 0 0 0' }}>
                                                ⚠️ مجموع المبلغين ({(dep + del).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س) لا يساوي الإجمالي الكلي ({total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س)
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Action Controls */}
                <div className="flex justify-end gap-2 p-6 border-t bg-gray-50 rounded" style={{ borderColor: '#E4E7EC' }}>
                    <Link
                        href="/quotations"
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
                        {processing ? 'جاري الحفظ...' : 'حفظ عرض السعر'}
                    </button>
                </div>
            </form>

            {/* Quick Add Customer Modal */}
            {showCustomerModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 100,
                        padding: '16px'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #E4E7EC',
                            width: '100%',
                            maxWidth: '480px',
                            padding: '24px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E4E7EC', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#2B5D7C', margin: 0 }}>➕ إضافة عميل جديد سريعاً</h3>
                            <button
                                type="button"
                                onClick={() => setShowCustomerModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                            >
                                ✕
                            </button>
                        </div>

                        {customerError && (
                            <div style={{ backgroundColor: '#FFE3E3', border: '1px solid #FFC9C9', color: '#E03131', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
                                {customerError}
                            </div>
                        )}

                        <form onSubmit={handleQuickCustomerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>اسم العميل / الشركة *</label>
                                <input
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>اسم الشخص المسؤول *</label>
                                <input
                                    type="text"
                                    value={newCustomer.contact_person}
                                    onChange={e => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>رقم الجوال *</label>
                                <input
                                    type="text"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>البريد الإلكتروني (اختياري)</label>
                                <input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>العنوان (اختياري)</label>
                                <input
                                    type="text"
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid #E4E7EC', paddingTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(false)}
                                    style={{ padding: '8px 16px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={customerSubmitting}
                                    style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '13px', backgroundColor: '#2B5D7C', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {customerSubmitting ? 'جاري الحفظ...' : 'حفظ العميل'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
