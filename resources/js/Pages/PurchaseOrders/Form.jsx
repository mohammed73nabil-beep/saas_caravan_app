import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import axios from 'axios';

export default function Form({ order, suppliers, caravanUnits, nextNumber }) {
    const isEdit = !!order;
    
    const [localSuppliers, setLocalSuppliers] = useState(suppliers || []);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: '', contact_person: '', phone: '', supply_type: '', notes: '' });
    const [supplierSubmitting, setSupplierSubmitting] = useState(false);
    const [supplierError, setSupplierError] = useState('');

    const { data, setData, post, put, processing, errors } = useForm({
        supplier_id: order?.supplier_id || '',
        caravan_unit_id: order?.caravan_unit_id || '',
        order_date: order?.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: order?.expected_delivery_date || '',
        status: order?.status || 'requested',
        items: order?.items || [{ item_name: '', quantity: 1, unit_price: 0 }],
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
            put(`/purchase-orders/${order.id}`);
        } else {
            post('/purchase-orders');
        }
    };

    const handleQuickSupplierSubmit = async (e) => {
        e.preventDefault();
        setSupplierSubmitting(true);
        setSupplierError('');
        try {
            const response = await axios.post('/api/suppliers/quick', newSupplier);
            const created = response.data;
            setLocalSuppliers([...localSuppliers, created]);
            setData('supplier_id', created.id);
            setShowSupplierModal(false);
            setNewSupplier({ name: '', contact_person: '', phone: '', supply_type: '', notes: '' });
        } catch (err) {
            setSupplierError(err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات المورد.');
        } finally {
            setSupplierSubmitting(false);
        }
    };

    return (
        <MainLayout title={isEdit ? `تعديل أمر شراء: ${order.po_number}` : 'إنشاء أمر شراء جديد'}>
            <Head title={isEdit ? 'تعديل أمر الشراء' : 'إنشاء أمر شراء'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Right: metadata */}
                    <div className="lg:col-span-1 p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <h3 className="font-bold text-base border-b pb-2" style={{ color: '#2B5D7C', borderColor: '#E4E7EC' }}>معلومات أمر الشراء</h3>

                        {!isEdit && (
                            <div>
                                <p className="text-xs" style={{ color: '#6B7280' }}>رقم الأمر المتوقع</p>
                                <p className="font-bold mt-1 text-sm">{nextNumber}</p>
                            </div>
                        )}

                        {/* Supplier */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-bold" style={{ color: '#1F2430' }}>
                                    اختيار المورد <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowSupplierModal(true)}
                                    className="text-xs font-bold hover:underline"
                                    style={{ color: '#2B5D7C' }}
                                >
                                    ➕ إضافة مورد جديد
                                </button>
                            </div>
                            <select
                                value={data.supplier_id}
                                onChange={e => setData('supplier_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                                required
                            >
                                <option value="">اختر المورد...</option>
                                {localSuppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.supplier_id && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.supplier_id}</p>
                            )}
                        </div>

                        {/* Caravan Unit */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                كرفان مخصص له (اختياري)
                            </label>
                            <select
                                value={data.caravan_unit_id}
                                onChange={e => setData('caravan_unit_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                            >
                                <option value="">عام (غير مخصص لكرفان معين)</option>
                                {caravanUnits.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name} ({unit.contract?.contract_number ? `عقد: ${unit.contract.contract_number}` : 'مستقل'})
                                    </option>
                                ))}
                            </select>
                            {errors.caravan_unit_id && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.caravan_unit_id}</p>
                            )}
                        </div>

                        {/* Order Date */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                تاريخ الطلب <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.order_date}
                                onChange={e => setData('order_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                                required
                            />
                            {errors.order_date && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.order_date}</p>
                            )}
                        </div>

                        {/* Expected Delivery Date */}
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                تاريخ التسليم المتوقع
                            </label>
                            <input
                                type="date"
                                value={data.expected_delivery_date}
                                onChange={e => setData('expected_delivery_date', e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                style={{ borderColor: '#E4E7EC' }}
                            />
                            {errors.expected_delivery_date && (
                                <p className="text-xs mt-1" style={{ color: '#E03131' }}>{errors.expected_delivery_date}</p>
                            )}
                        </div>

                        {/* Status (Edit only) */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-bold mb-1" style={{ color: '#1F2430' }}>
                                    حالة أمر الشراء
                                </label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-sky-700"
                                    style={{ borderColor: '#E4E7EC', backgroundColor: '#ffffff' }}
                                >
                                    <option value="requested">مطلوب</option>
                                    <option value="ordered">تم الطلب</option>
                                    <option value="partially_received">تم الاستلام جزئياً</option>
                                    <option value="fully_received">تم الاستلام بالكامل</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Left: Dynamic Items Table */}
                    <div className="lg:col-span-2 p-6 rounded border bg-white space-y-4" style={{ borderColor: '#E4E7EC' }}>
                        <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: '#E4E7EC' }}>
                            <h3 className="font-bold text-base" style={{ color: '#2B5D7C' }}>أصناف وبنود أمر الشراء</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1.5 rounded text-xs font-bold text-white transition-colors duration-150"
                                style={{ backgroundColor: '#2B5D7C' }}
                            >
                                + إضافة صنف جديد
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
                                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>اسم الصنف</label>
                                            )}
                                            <input
                                                type="text"
                                                placeholder="اسم المادة/الصنف المطلوب..."
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

                                        {/* Unit price */}
                                        <div className="col-span-2">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold mb-1" style={{ color: '#6B7280' }}>سعر الوحدة</label>
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

                                        {/* Row Total */}
                                        <div className="col-span-1 text-center self-center pb-2">
                                            {index === 0 && (
                                                <label className="block text-xs font-bold mb-3" style={{ color: '#6B7280' }}>الإجمالي</label>
                                            )}
                                            <span className="font-bold text-sm block">
                                                {itemTotal.toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Delete Action */}
                                        <div className="col-span-1 flex justify-center pb-1">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 rounded text-red-600 hover:bg-red-50 text-sm"
                                                title="حذف الصنف"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grand Total */}
                        <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: '#E4E7EC' }}>
                            <span className="font-bold text-sm" style={{ color: '#6B7280' }}>الإجمالي الكلي لأمر الشراء:</span>
                            <span className="text-xl font-extrabold" style={{ color: '#2B5D7C' }}>
                                {calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Action Controls */}
                <div className="flex justify-end gap-2 p-6 border-t bg-gray-50 rounded" style={{ borderColor: '#E4E7EC' }}>
                    <Link
                        href="/purchase-orders"
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
                        {processing ? 'جاري الحفظ...' : 'حفظ أمر الشراء'}
                    </button>
                </div>
            </form>

            {/* Quick Add Supplier Modal */}
            {showSupplierModal && (
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
                            <h3 style={{ fontWeight: '700', fontSize: '16px', color: '#2B5D7C', margin: 0 }}>➕ إضافة مورد جديد سريعاً</h3>
                            <button
                                type="button"
                                onClick={() => setShowSupplierModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                            >
                                ✕
                            </button>
                        </div>

                        {supplierError && (
                            <div style={{ backgroundColor: '#FFE3E3', border: '1px solid #FFC9C9', color: '#E03131', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
                                {supplierError}
                            </div>
                        )}

                        <form onSubmit={handleQuickSupplierSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>اسم المورد / الشركة *</label>
                                <input
                                    type="text"
                                    value={newSupplier.name}
                                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>اسم الشخص المسؤول *</label>
                                <input
                                    type="text"
                                    value={newSupplier.contact_person}
                                    onChange={e => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>رقم الجوال *</label>
                                <input
                                    type="text"
                                    value={newSupplier.phone}
                                    onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>نوع التوريد / المواد *</label>
                                <input
                                    type="text"
                                    value={newSupplier.supply_type}
                                    onChange={e => setNewSupplier({ ...newSupplier, supply_type: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px' }}
                                    placeholder="مثال: خشب، حديد، صيانة كهرباء"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px', borderTop: '1px solid #E4E7EC', paddingTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowSupplierModal(false)}
                                    style={{ padding: '8px 16px', border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={supplierSubmitting}
                                    style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '13px', backgroundColor: '#2B5D7C', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {supplierSubmitting ? 'جاري الحفظ...' : 'حفظ المورد'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
