import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Bell, AlertTriangle, Clock, ChevronRight, BarChart3, PieChart as PieIcon, LineChart as LineIcon, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import MainLayout from '../Layouts/MainLayout';

// Colors for status donut matching system styles
const STATUS_COLORS = {
    due_soon: '#E8A33D',  // Warning yellow-orange
    due_now: '#F59E0B',   // Yellow
    overdue: '#EF4444',   // Danger red
    claimed: '#3B82F6',   // Info blue
    promised: '#8B5CF6',  // Purple
    paid: '#10B981',      // Success green
};

const STATUS_NAMES = {
    due_soon: 'مستحق قريباً',
    due_now: 'مستحق الآن',
    overdue: 'متأخر الدفع',
    claimed: 'تمت المطالبة',
    promised: 'وعد بالدفع',
    paid: 'مدفوع'
};

export default function Dashboard({ stats, dueSoonPayments, overdueClaims, lateOrders, monthsData, claimsStats }) {
    // Check if chart data has values
    const hasLedgerData = monthsData && monthsData.some(m => m.net !== 0);
    const hasClaimsData = claimsStats && claimsStats.length > 0;

    return (
        <MainLayout title="لوحة التحكم الرئيسية">
            <Head title="لوحة التحكم" />

            {/* Stats Grid — 1 col mobile / 2 col tablet / 4 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Quotations */}
                <div className="card">
                    <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>عروض الأسعار المعلقة</p>
                    <h3 style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>{stats.pending_quotations}</h3>
                    <Link href="/quotations" className="link-with-arrow" style={{ marginTop: '16px' }}>
                        عرض كل عروض الأسعار
                        <ChevronRight size={14} />
                    </Link>
                </div>

                {/* 2. Contracts */}
                <div className="card">
                    <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>العقود النشطة</p>
                    <h3 style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>{stats.active_contracts}</h3>
                    <Link href="/contracts" className="link-with-arrow" style={{ marginTop: '16px' }}>
                        عرض كل العقود
                        <ChevronRight size={14} />
                    </Link>
                </div>

                {/* 3. Claims */}
                <div className="card">
                    <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>المطالبات المفتوحة</p>
                    <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: 'var(--badge-danger-text)' }}>
                        {Number(stats.open_claims_total).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </h3>
                    <Link href="/claims" className="link-with-arrow" style={{ marginTop: '16px' }}>
                        مراجعة المطالبات المفتوحة
                        <ChevronRight size={14} />
                    </Link>
                </div>

                {/* 4. Daily Ledger */}
                <div className="card">
                    <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>صافي الحسابات هذا الشهر</p>
                    <h3 style={{ fontSize: '26px', fontWeight: '800', marginTop: '8px', color: stats.net_this_month >= 0 ? 'var(--badge-success-text)' : 'var(--badge-danger-text)' }}>
                        {Number(stats.net_this_month).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </h3>
                    <Link href="/ledger" className="link-with-arrow" style={{ marginTop: '16px' }}>
                        دفتر الحسابات اليومي
                        <ChevronRight size={14} />
                    </Link>
                </div>
            </div>

            {/* 📊 Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Line Chart: 6 Months Ledger History */}
                <div className="card lg:col-span-2" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <LineIcon size={18} color="var(--color-primary)" />
                        <h2 style={{ fontWeight: '700', fontSize: '15px' }}>صافي الحركة المالية لآخر 6 أشهر (القبض - الصرف)</h2>
                    </div>

                    <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasLedgerData ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthsData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line name="صافي الحساب (ر.س)" type="monotone" dataKey="net" stroke="var(--color-primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                                <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                                <p style={{ fontSize: '14px', fontWeight: '600' }}>لا توجد قيود كافية في دفتر الحسابات لعرض الرسم البياني.</p>
                                <p style={{ fontSize: '11px', marginTop: '4px' }}>قم بإضافة سندات قبض وصرف لعرض إحصاءات الأشهر الماضية.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Donut Chart: Claims Status distribution */}
                <div className="card lg:col-span-1" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <PieIcon size={18} color="var(--color-primary)" />
                        <h2 style={{ fontWeight: '700', fontSize: '15px' }}>توزيع حالة المطالبات المالية المفتوحة</h2>
                    </div>

                    <div style={{ flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {hasClaimsData ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={claimsStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="total"
                                            nameKey="status"
                                        >
                                            {claimsStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#CBD5E1'} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => `${Number(value).toLocaleString()} ر.س`}
                                            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', justifyContent: 'center', marginTop: '16px', fontSize: '11px', fontWeight: '600' }}>
                                    {claimsStats.map((entry, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: STATUS_COLORS[entry.status] }} />
                                            <span>{STATUS_NAMES[entry.status] || entry.status}: {Number(entry.total).toLocaleString()} ر.س ({entry.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                                <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                                <p style={{ fontSize: '14px', fontWeight: '600' }}>لا توجد مطالبات مالية مفتوحة حالياً.</p>
                                <p style={{ fontSize: '11px', marginTop: '4px' }}>يتم ملء الرسم البياني تلقائياً عند إصدار مطالبات مالية جديدة.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Due soon payments */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }} className="flex justify-between items-center">
                        <h2 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={18} color="#B8860B" />
                            دفعات مستحقة خلال 7 أيام
                        </h2>
                        <span className="badge badge-warning">
                            {dueSoonPayments.length} دفعة قريبة
                        </span>
                    </div>

                    {dueSoonPayments.length === 0 ? (
                        <p style={{ fontSize: '13px', padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد دفعات مستحقة قريباً.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }} className="divide-y divide-gray-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                            {dueSoonPayments.map((p) => (
                                <div key={p.id} style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px', gap: '8px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: '700' }} className="truncate">{p.customer_name}</p>
                                        <p style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-secondary)' }} className="truncate">
                                            {p.description} — عقد: {p.contract_number}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'left', flexShrink: 0 }}>
                                        <p style={{ fontWeight: '800', color: 'var(--color-primary)' }}>
                                            {Number(p.amount).toLocaleString()} ر.س
                                        </p>
                                        <p style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-secondary)' }}>{p.due_date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Overdue claims */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }} className="flex justify-between items-center">
                        <h2 style={{ fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={18} color="#C92A2A" />
                            مطالبات متأخرة الدفع
                        </h2>
                        <span className="badge badge-danger">
                            {overdueClaims.length} مطالبة متأخرة
                        </span>
                    </div>

                    {overdueClaims.length === 0 ? (
                        <p style={{ fontSize: '13px', padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد مطالبات متأخرة.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }} className="divide-y divide-gray-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                            {overdueClaims.map((c) => (
                                <div key={c.id} style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px', gap: '8px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: '700' }} className="truncate">{c.customer}</p>
                                        <p style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-secondary)' }}>مطالبة رقم: {c.claim_number}</p>
                                    </div>
                                    <div style={{ textAlign: 'left', flexShrink: 0 }}>
                                        <p style={{ fontWeight: '800', color: 'var(--badge-danger-text)' }}>
                                            {Number(c.amount).toLocaleString()} ر.س
                                        </p>
                                        <p className="badge badge-danger" style={{ fontSize: '10px', marginTop: '2px', padding: '1px 6px' }}>
                                            {c.days_overdue} يوم تأخر
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Overdue Purchase Orders */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <Clock size={18} color="#B8860B" />
                    <h2 style={{ fontWeight: '700', fontSize: '15px' }}>أوامر شراء متأخرة عن التوريد</h2>
                </div>

                {lateOrders.length === 0 ? (
                    <p style={{ fontSize: '13px', padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد أوامر شراء متأخرة.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="premium-table responsive-table">
                            <thead>
                                <tr>
                                    <th>رقم الأمر</th>
                                    <th>المورد</th>
                                    <th>تاريخ التسليم المتوقع</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lateOrders.map((o) => (
                                    <tr key={o.id}>
                                        <td data-label="رقم الأمر">
                                            <Link href={`/purchase-orders/${o.id}`} style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'none' }}>
                                                {o.po_number}
                                            </Link>
                                        </td>
                                        <td data-label="المورد">{o.supplier}</td>
                                        <td data-label="تاريخ التسليم" style={{ color: 'var(--badge-danger-text)', fontWeight: '700' }}>{o.expected_at}</td>
                                        <td data-label="الحالة">
                                            <span className="badge badge-danger">
                                                {o.status === 'requested' ? 'مطلوب' : 'تم الطلب'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
