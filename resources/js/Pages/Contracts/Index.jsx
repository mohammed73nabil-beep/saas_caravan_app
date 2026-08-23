import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, X } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

const STATUS_TEXT = { active: 'نشط', completed: 'مكتمل', cancelled: 'ملغى' };
const STATUS_CLASS = (s) => {
    if (s === 'completed') return 'badge-success';
    if (s === 'active') return 'badge-warning';
    if (s === 'cancelled') return 'badge-danger';
    return 'badge-neutral';
};

export default function Index({ contracts, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/contracts', { search, status }, { preserveState: true });
    };
    const handleReset = () => { setSearch(''); setStatus(''); router.get('/contracts'); };

    return (
        <MainLayout title="إدارة عقود الكرفانات">
            <Head title="العقود" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input type="text" placeholder="رقم العقد أو اسم العميل..." value={search}
                            onChange={e => setSearch(e.target.value)} className="form-input"
                            style={{ paddingRight: '32px', width: '220px', minHeight: '40px' }} />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="form-input" style={{ width: '160px', minHeight: '40px' }}>
                        <option value="">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغى</option>
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
                <Link href="/contracts/create" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> إنشاء عقد جديد
                </Link>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E4E7EC', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="premium-table responsive-table">
                        <thead>
                            <tr>
                                <th>رقم العقد</th>
                                <th>العميل</th>
                                <th>القيمة الإجمالية</th>
                                <th>تاريخ التوقيع</th>
                                <th>تاريخ التسليم</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'left' }}>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.data.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>لا توجد عقود مسجلة.</td></tr>
                            ) : contracts.data.map((c) => (
                                <tr key={c.id}>
                                    <td data-label="رقم العقد">
                                        <Link href={`/contracts/${c.id}`} style={{ color: '#2B5D7C', fontWeight: '700', textDecoration: 'none' }}
                                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>{c.contract_number}</Link>
                                    </td>
                                    <td data-label="العميل">
                                        {c.customer
                                            ? <Link href={`/customers/${c.customer.id}`} style={{ color: '#2B5D7C', textDecoration: 'none' }}
                                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.target.style.textDecoration = 'none'}>{c.customer.name}</Link>
                                            : '-'}
                                    </td>
                                    <td data-label="القيمة" style={{ fontWeight: '600' }}>{Number(c.total_value).toLocaleString()} ر.س</td>
                                    <td data-label="تاريخ التوقيع">{c.signed_at}</td>
                                    <td data-label="تاريخ التسليم">{c.delivery_due_at}</td>
                                    <td data-label="الحالة"><span className={`badge ${STATUS_CLASS(c.status)}`}>{STATUS_TEXT[c.status] || c.status}</span></td>
                                    <td data-label="العمليات" style={{ textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                            <Link href={`/contracts/${c.id}`} className="btn-icon view" title="عرض التفاصيل"><Eye size={15} /></Link>
                                            <Link href={`/contracts/${c.id}/edit`} className="btn-icon edit" title="تعديل"><Pencil size={15} /></Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {contracts.links?.length > 3 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {contracts.links.map((link, i) => (
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
