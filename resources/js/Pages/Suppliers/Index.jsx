import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2, Plus, Search } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

export default function Index({ suppliers, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/suppliers', { search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
            router.delete(`/suppliers/${id}`);
        }
    };

    return (
        <MainLayout title="إدارة الموردين">
            <Head title="الموردون" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input type="text" placeholder="ابحث عن مورد..." value={search}
                            onChange={e => setSearch(e.target.value)} className="form-input"
                            style={{ paddingRight: '32px', width: '260px', minHeight: '40px' }} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ minHeight: '40px', padding: '8px 16px', fontSize: '13px' }}>
                        <Search size={14} /> بحث
                    </button>
                </form>
                <Link href="/suppliers/create" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> إضافة مورد جديد
                </Link>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E4E7EC', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="overflow-x-auto">
                    <table className="premium-table responsive-table">
                        <thead>
                            <tr>
                                <th>اسم المورد</th>
                                <th>المسؤول</th>
                                <th>رقم الجوال</th>
                                <th>نوع التوريد</th>
                                <th>أوامر الشراء</th>
                                <th style={{ textAlign: 'left' }}>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.data.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>لا يوجد موردون مضافون.</td></tr>
                            ) : suppliers.data.map((s) => (
                                <tr key={s.id}>
                                    <td data-label="اسم المورد">
                                        <Link href={`/suppliers/${s.id}`} style={{ color: '#2B5D7C', fontWeight: '700', textDecoration: 'none' }}
                                            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                            onMouseLeave={e => e.target.style.textDecoration = 'none'}>{s.name}</Link>
                                    </td>
                                    <td data-label="المسؤول">{s.contact_person}</td>
                                    <td data-label="الجوال">{s.phone}</td>
                                    <td data-label="نوع التوريد">{s.supply_type}</td>
                                    <td data-label="أوامر الشراء">
                                        <span className="badge badge-info">{s.purchase_orders_count} طلب</span>
                                    </td>
                                    <td data-label="العمليات" style={{ textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                            <Link href={`/suppliers/${s.id}`} className="btn-icon view" title="الملف الكامل"><Eye size={15} /></Link>
                                            <Link href={`/suppliers/${s.id}/edit`} className="btn-icon edit" title="تعديل"><Pencil size={15} /></Link>
                                            <button onClick={() => handleDelete(s.id)} className="btn-icon delete" title="حذف"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {suppliers.links?.length > 3 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {suppliers.links.map((link, i) => (
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
