import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Users, FileText, ScrollText,
    CircleDollarSign, Package, ShoppingCart,
    BookOpen, Upload, Settings, Handshake,
    LogOut, Menu, X, Truck, CheckCircle, AlertCircle, User,
    Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
    { name: 'لوحة التحكم',      url: '/',                Icon: LayoutDashboard },
    { name: 'العملاء',           url: '/customers',       Icon: Users },
    { name: 'عروض الأسعار',     url: '/quotations',      Icon: FileText },
    { name: 'العقود',            url: '/contracts',       Icon: ScrollText },
    { name: 'المطالبات المالية', url: '/claims',          Icon: CircleDollarSign },
    { name: 'الموردين',          url: '/suppliers',       Icon: Package },
    { name: 'أوامر الشراء',     url: '/purchase-orders', Icon: ShoppingCart },
    { name: 'الحسابات اليومية', url: '/ledger',          Icon: BookOpen },
    { name: 'تصدير البيانات',   url: '/export',          Icon: Upload },
    { name: 'الإعدادات',        url: '/settings',        Icon: Settings },
];

export default function MainLayout({ children, title }) {
    const { auth, flash, overdueClaimsCount } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );

    // Track window resize to update isMobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when switching from mobile to desktop
    useEffect(() => {
        if (!isMobile) setSidebarOpen(false);
    }, [isMobile]);

    // Dark/Light Theme Handler
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || user?.theme_preference || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark' || theme === 'slate') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' || theme === 'slate' ? 'light' : 'dark';
        setTheme(newTheme);
        router.post('/settings/theme', { theme_preference: newTheme }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    const navItems = [...NAV_ITEMS];
    if (user?.role === 'owner') {
        navItems.push({ name: 'إدارة الفريق', url: '/team', Icon: Handshake });
    }

    const isActive = (path) => {
        const cur = window.location.pathname;
        if (path === '/') return cur === '/';
        return cur.startsWith(path);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    /* ─── Sidebar inner content ─── */
    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--sidebar-bg)' }}>

            {/* Logo + close button row */}
            <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: user?.company?.logo_url ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--color-primary), #4A9EDB)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: user?.company?.logo_url ? 'none' : '0 2px 8px rgba(74,158,219,0.35)',
                        overflow: 'hidden',
                        border: user?.company?.logo_url ? '1px solid var(--sidebar-border)' : 'none',
                    }}>
                        {user?.company?.logo_url ? (
                            <img src={user.company.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                        ) : (
                            <Truck size={22} color="#ffffff" />
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontWeight: '800', fontSize: '15px', color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                            إدارة الكرفانات
                        </h2>
                        <p style={{ fontSize: '11px', color: 'var(--sidebar-text)', margin: 0, marginTop: '2px' }}>
                            {user?.company?.name || 'منصة الكرفانات'}
                        </p>
                    </div>
                </div>
                {/* Close button — visible on mobile */}
                {isMobile && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                        aria-label="إغلاق القائمة"
                    >
                        <X size={18} color="var(--sidebar-text)" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
                {navItems.map((item, i) => {
                    const active = isActive(item.url);
                    const { Icon } = item;
                    return (
                        <Link
                            key={i}
                            href={item.url}
                            onClick={() => setSidebarOpen(false)}
                            className={`nav-link ${active ? 'active' : ''}`}
                        >
                            <Icon size={18} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                            <span>{item.name}</span>
                            {item.url === '/claims' && overdueClaimsCount > 0 && (
                                <span style={{
                                    marginRight: 'auto',
                                    backgroundColor: '#EF4444',
                                    color: '#ffffff',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '18px',
                                    height: '18px',
                                }} className="overdue-badge">
                                    {overdueClaimsCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Quick theme toggler + User card */}
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--sidebar-border)' }}>
                {/* Theme Toggle Row */}
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--sidebar-border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--sidebar-text)', fontWeight: '600' }}>مظهر النظام</span>
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '20px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--sidebar-border)',
                            color: '#FFFFFF', cursor: 'pointer', fontSize: '11px', transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {theme === 'dark' || theme === 'slate' ? (
                            <>
                                <Sun size={14} color="#FBBF24" />
                                <span>مضيء</span>
                            </>
                        ) : (
                            <>
                                <Moon size={14} color="#94A3B8" />
                                <span>مظلم</span>
                            </>
                        )}
                    </button>
                </div>

                {/* User Info & Logout */}
                <div className="sidebar-user">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div className="sidebar-avatar">
                            <User size={16} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: '700', fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#E2E8F0' }}>
                                {user?.name}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--sidebar-text)', margin: 0 }}>
                                {user?.role === 'owner' ? 'مالك الحساب' : 'عضو فريق'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="تسجيل الخروج"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '34px',
                            borderRadius: '8px',
                            border: '1px solid rgba(201,42,42,0.4)',
                            background: 'rgba(201,42,42,0.1)',
                            cursor: 'pointer',
                            color: '#F87171',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(201,42,42,0.25)';
                            e.currentTarget.style.borderColor = '#C92A2A';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(201,42,42,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(201,42,42,0.4)';
                        }}
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '252px',
                backgroundColor: 'var(--sidebar-bg)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                position: isMobile ? 'fixed' : 'relative',
                top: 0,
                right: isMobile ? (sidebarOpen ? '0' : '-260px') : 'auto',
                bottom: 0,
                zIndex: 50,
                transition: 'right 0.25s ease',
                height: isMobile ? '100vh' : 'auto',
                overflowY: isMobile ? 'auto' : 'visible',
                boxShadow: isMobile && sidebarOpen ? '-4px 0 24px rgba(0,0,0,0.3)' : '4px 0 24px rgba(0,0,0,0.12)',
            }}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Header */}
                <header style={{
                    height: '56px',
                    padding: '0 16px',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    direction: 'rtl',
                }}>
                    {/* Hamburger button — right side on RTL mobile */}
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            style={{
                                display: 'flex',
                                padding: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                width: '40px',
                                height: '40px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--table-header-bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                            aria-label="فتح القائمة"
                        >
                            <Menu size={20} color="var(--text-secondary)" />
                        </button>
                    )}

                    {/* Title */}
                    <h1 style={{
                        fontWeight: '700',
                        fontSize: isMobile ? '14px' : '16px',
                        margin: 0,
                        flex: 1,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {title}
                    </h1>

                    {/* Company badge — desktop only */}
                    {!isMobile && (
                        <span style={{
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            backgroundColor: 'var(--table-header-bg)',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            fontWeight: '600',
                        }}>
                            {user?.company?.name}
                        </span>
                    )}
                </header>

                {/* Body */}
                <main style={{ flex: 1, padding: isMobile ? '16px 12px' : '24px 20px', overflowY: 'auto' }}>
                    {flash?.success && (
                        <div className="flash-success">
                            <CheckCircle size={16} style={{ flexShrink: 0 }} />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="flash-error">
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <span>{flash.error}</span>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
