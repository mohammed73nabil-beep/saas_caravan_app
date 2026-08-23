import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, Search, X } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

const STATUS_TEXT = { due_soon: 'مستحق قريباً', due_now: 'مستحق الآن', overdue: 'متأخر الدفع', claimed: 'تمت المطالبة', promised: 'وعد بالدفع', paid: 'مدفوع' };
const STATUS_CLASS = (s) => {
    if (s === 'paid') return 'badge-success';
    if (s === 'overdue') return 'badge-danger';
    if (['due_soon', 'due_now', 'claimed', 'promised'].includes(s)) return 'badge-warning';
    return 'badge-neutral';
};

export default function Index({ claims, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get('/claims', { search, status }, { preserveState: true });
    };
    const handleReset = () => { setSearch(''); setStatus(''); router.get('/claims'); };

    return (
        <MainLayout title="المطالبات المالية والتحصيلات">
            <Head title="المطالبات" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input type="text" placeholder="رقم المطالبة أو اسم العميل..." value={search}
                            onChange={e => setSearch(e.target.value)} className="form-input"
                            style={{ paddingRight: '32px', width: '220px', minHeight: '40px' }} />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="form-input" style={{ width: '160px', minHeight: '40px' }}>
                        <option value="">جميع الحالات</option>
                        <option value="due_soon">مستحق قريباً</option>
                        <option value="due_now">مستحق الآن</option>
                        <option value="overdue">متأخر الدفع</option>
                        <option value="claimed">تمت المطالبة</option>
                        <option value="promised">وعد بالدفع</option>
                        <option value="paid">مدفوع</option>
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
                <Link href="/claims/create" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> تسجيل مطالبة يدوية
                </Link>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E4E7EC', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="premium-table responsive-table">
                        <thead>
                            <tr>
                                <th>رقم المطالبة</th>
                                <th>العميل</th>
                                <th>العقد المرتبط</th>
                                <th>المبلغ المطلوب</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>التأخير</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'left' }}>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.data.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>لا توجد مطالبات مسجلة.</td></tr>
                            ) : claims.data.map((c) => (
                                <tr key={c.id}>
                                    <td data-label="رقم المطالبة">
                                        <Link href={`/claims/${c.id}`} style={{ color: '#2B5D7C', fontWeight: '700', textDecoration: 'none' }}
                                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>{c.claim_number}</Link>
                                    </td>
                                    <td data-label="العميل">
                                        {c.customer
                                            ? <Link href={`/customers/${c.customer.id}`} style={{ color: '#2B5D7C', textDecoration: 'none' }}
                                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.target.style.textDecoration = 'none'}>{c.customer.name}</Link>
                                            : '-'}
                                    </td>
                                    <td data-label="العقد">
                                        {c.contract
                                            ? <Link href={`/contracts/${c.contract.id}`} style={{ color: '#2B5D7C', textDecoration: 'none' }}
                                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                onMouseLeave={e => e.target.style.textDecoration = 'none'}>{c.contract.contract_number}</Link>
                                            : <span style={{ fontSize: '12px', color: '#94A3B8' }}>يدوية</span>}
                                    </td>
                                    <td data-label="المبلغ" style={{ fontWeight: '700', color: '#1F2430' }}>{Number(c.amount).toLocaleString()} ر.س</td>
                                    <td data-label="الاستحقاق">{c.due_date}</td>
                                    <td data-label="التأخير">
                                        {c.days_overdue > 0
                                            ? <span className="badge badge-danger">{c.days_overdue} يوم</span>
                                            : <span style={{ color: '#94A3B8' }}>—</span>}
                                    </td>
                                    <td data-label="الحالة"><span className={`badge ${STATUS_CLASS(c.status)}`}>{STATUS_TEXT[c.status] || c.status}</span></td>
                                    <td data-label="العمليات" style={{ textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                            <Link href={`/claims/${c.id}`} className="btn-icon view" title="الملف والسجل"><Eye size={15} /></Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {claims.links?.length > 3 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {claims.links.map((link, i) => (
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
