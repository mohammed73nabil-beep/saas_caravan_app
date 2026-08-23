import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, X } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

const STATUS_TEXT = { requested: 'مطلوب', ordered: 'تم الطلب', partially_received: 'استلام جزئي', fully_received: 'مكتمل' };
const STATUS_CLASS = (s) => {
    if (s === 'fully_received') return 'badge-success';
    if (['requested', 'ordered', 'partially_received'].includes(s)) return 'badge-warning';
    return 'badge-neutral';
};

export default function Index({ orders, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/purchase-orders', { search, status }, { preserveState: true });
    };
    const handleReset = () => { setSearch(''); setStatus(''); router.get('/purchase-orders'); };

    return (
        <MainLayout title="إدارة أوامر الشراء">
            <Head title="أوامر الشراء" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input type="text" placeholder="رقم الأمر أو اسم المورد..." value={search}
                            onChange={e => setSearch(e.target.value)} className="form-input"
                            style={{ paddingRight: '32px', width: '220px', minHeight: '40px' }} />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="form-input" style={{ width: '160px', minHeight: '40px' }}>
                        <option value="">جميع الحالات</option>
                        <option value="requested">مطلوب</option>
                        <option value="ordered">تم الطلب</option>
                        <option value="partially_received">تم الاستلام جزئياً</option>
                        <option value="fully_received">تم الاستلام بالكامل</option>
                    </select>
                    <button type="submit" className="btn-primary" style={{ minHeight: '40px', padding: '8px 16px', fontSize: '13px' }}>
                        <Search size={14} /> تصفية
                    </button>
                    {(search || status) && (
                        <button type="button" onClick={handleReset} className="btn-secondary" style={{ minHeight: '40px', padding: '8px 14px', fontSize: '13px' }}>
                            <X size={14} /> إعادة تعيين
                        </button>
                    )}
                </form>
                <Link href="/purchase-orders/create" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> إنشاء أمر شراء
                </Link>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E4E7EC', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="premium-table responsive-table">
                        <thead>
                            <tr>
                                <th>رقم الأمر</th>
                                <th>المورد</th>
                                <th>الكرفان المرتبط</th>
                                <th>الإجمالي</th>
                                <th>تاريخ الطلب</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'left' }}>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>لا توجد أوامر شراء.</td></tr>
                            ) : orders.data.map((o) => (
                                <tr key={o.id}>
                                    <td data-label="رقم الأمر">
                                        <Link href={`/purchase-orders/${o.id}`} style={{ color: '#2B5D7C', fontWeight: '700', textDecoration: 'none' }}
                                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>{o.po_number}</Link>
                                    </td>
                                    <td data-label="المورد">
                                        {o.supplier
                                            ? <Link href={`/suppliers/${o.supplier.id}`} style={{ color: '#2B5D7C', textDecoration: 'none' }}
                                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.target.style.textDecoration = 'none'}>{o.supplier.name}</Link>
                                            : '-'}
                                    </td>
                                    <td data-label="الكرفان">
                                        {o.caravan_unit
                                            ? <span style={{ fontWeight: '600' }}>{o.caravan_unit.name}</span>
                                            : <span style={{ fontSize: '12px', color: '#94A3B8' }}>عام</span>}
                                    </td>
                                    <td data-label="الإجمالي" style={{ fontWeight: '600' }}>{Number(o.total_amount).toLocaleString()} ر.س</td>
                                    <td data-label="تاريخ الطلب">{o.order_date}</td>
                                    <td data-label="الحالة"><span className={`badge ${STATUS_CLASS(o.status)}`}>{STATUS_TEXT[o.status] || o.status}</span></td>
                                    <td data-label="العمليات" style={{ textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                            <Link href={`/purchase-orders/${o.id}`} className="btn-icon view" title="التفاصيل"><Eye size={15} /></Link>
                                            <Link href={`/purchase-orders/${o.id}/edit`} className="btn-icon edit" title="تعديل"><Pencil size={15} /></Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.links?.length > 3 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {orders.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'}
                                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: link.active ? '700' : '400',
                                    backgroundColor: link.active ? '#2B5D7C' : 'transparent',
                                    color: link.active ? '#fff' : link.url ? '#374151' : '#94A3B8',
                                    pointerEvents: link.url ? 'auto' : 'none', textDecoration: 'none' }}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
