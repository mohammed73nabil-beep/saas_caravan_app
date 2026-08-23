import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, X } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

const STATUS_TEXT = { draft: 'مسودة', sent: 'مرسل', accepted: 'مقبول', rejected: 'مرفوض', expired: 'منتهي الصلاحية' };
const STATUS_CLASS = (s) => {
    if (s === 'accepted') return 'badge-success';
    if (s === 'sent') return 'badge-warning';
    if (['rejected', 'expired'].includes(s)) return 'badge-danger';
    return 'badge-neutral';
};

export default function Index({ quotations, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/quotations', { search, status }, { preserveState: true });
    };
    const handleReset = () => { setSearch(''); setStatus(''); router.get('/quotations'); };

    return (
        <MainLayout title="إدارة عروض الأسعار">
            <Head title="عروض الأسعار" />

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="رقم العرض أو اسم العميل..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="form-input"
                            style={{ paddingRight: '32px', width: '220px', minHeight: '40px' }}
                        />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="form-input" style={{ width: '160px', minHeight: '40px' }}>
                        <option value="">جميع الحالات</option>
                        <option value="draft">مسودة</option>
                        <option value="sent">مرسل</option>
                        <option value="accepted">مقبول</option>
                        <option value="rejected">مرفوض</option>
                        <option value="expired">منتهي الصلاحية</option>
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
                <Link href="/quotations/create" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> إنشاء عرض سعر
                </Link>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E4E7EC', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="premium-table responsive-table">
                        <thead>
                            <tr>
                                <th>رقم العرض</th>
                                <th>العميل</th>
                                <th>الإجمالي الكلي</th>
                                <th>صالح حتى</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'left' }}>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.data.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>لا توجد عروض أسعار متطابقة.</td></tr>
                            ) : quotations.data.map((q) => (
                                <tr key={q.id}>
                                    <td data-label="رقم العرض">
                                        <Link href={`/quotations/${q.id}`} style={{ color: '#2B5D7C', fontWeight: '700', textDecoration: 'none' }}
                                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                                            {q.quotation_number}
                                        </Link>
                                    </td>
                                    <td data-label="العميل">
                                        {q.customer
                                            ? <Link href={`/customers/${q.customer.id}`} style={{ color: '#2B5D7C', textDecoration: 'none' }}
                                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.target.style.textDecoration = 'none'}>{q.customer.name}</Link>
                                            : '-'}
                                    </td>
                                    <td data-label="الإجمالي" style={{ fontWeight: '600' }}>{Number(q.total_amount).toLocaleString()} ر.س</td>
                                    <td data-label="صالح حتى">{q.expires_at}</td>
                                    <td data-label="الحالة"><span className={`badge ${STATUS_CLASS(q.status)}`}>{STATUS_TEXT[q.status] || q.status}</span></td>
                                    <td data-label="العمليات" style={{ textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                            <Link href={`/quotations/${q.id}`} className="btn-icon view" title="عرض التفاصيل"><Eye size={15} /></Link>
                                            <Link href={`/quotations/${q.id}/edit`} className="btn-icon edit" title="تعديل"><Pencil size={15} /></Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {quotations.links?.length > 3 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {quotations.links.map((link, i) => (
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
