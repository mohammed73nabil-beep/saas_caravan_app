import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Sun, Moon, Laptop, Building, Sliders, DollarSign, Percent } from 'lucide-react';
import MainLayout from '../../Layouts/MainLayout';

export default function Index({ company, auth }) {
    const user = auth?.user;

    const { data, setData, post, processing, errors } = useForm({
        name: company?.name || '',
        contact_name: company?.contact_name || '',
        phone: company?.phone || '',
        email: company?.email || '',
        logo: null,
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || user?.theme_preference || 'light';
    });

    const [logoPreview, setLogoPreview] = useState(
        company?.logo_path ? `/storage/${company.logo_path}` : null
    );

    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('currency') || 'SAR';
    });

    const [vat, setVat] = useState(() => {
        return localStorage.getItem('vat') || '15';
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        router.post('/settings/theme', { theme_preference: newTheme }, {
            preserveScroll: true,
            preserveState: true
        });
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        post('/settings');
    };

    const handleSavePreferences = (e) => {
        e.preventDefault();
        localStorage.setItem('currency', currency);
        localStorage.setItem('vat', vat);
        alert('تم حفظ تفضيلات الفواتير بنجاح في المتصفح!');
    };

    return (
        <MainLayout title="إعدادات النظام">
            <Head title="الإعدادات" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                
                {/* ─── القسم الأول: المظهر والسمة ─── */}
                <div className="card">
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎨 مظهر النظام وتجربة المستخدم
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label" style={{ marginBottom: '10px' }}>
                                اختر سمة الألوان المفضلة للواجهة
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <button
                                    onClick={() => handleThemeChange('light')}
                                    className="btn-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        borderWidth: theme === 'light' ? '2px' : '1px',
                                        borderColor: theme === 'light' ? 'var(--color-primary)' : 'var(--border-color)',
                                        fontWeight: '700',
                                        backgroundColor: theme === 'light' ? 'rgba(74, 158, 219, 0.08)' : 'transparent',
                                    }}
                                >
                                    <Sun size={18} color="#E8A33D" />
                                    <span>مظهر مضيء</span>
                                </button>
                                <button
                                    onClick={() => handleThemeChange('dark')}
                                    className="btn-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        borderWidth: (theme === 'dark' || theme === 'slate') ? '2px' : '1px',
                                        borderColor: (theme === 'dark' || theme === 'slate') ? 'var(--color-primary)' : 'var(--border-color)',
                                        fontWeight: '700',
                                        backgroundColor: (theme === 'dark' || theme === 'slate') ? 'rgba(74, 158, 219, 0.08)' : 'transparent',
                                    }}
                                >
                                    <Moon size={18} color="#818CF8" />
                                    <span>مظهر مظلم</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── القسم الثاني: الملف التعريفي للشركة ─── */}
                <div className="card">
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={20} color="var(--color-primary)" />
                        🏢 معلومات المنشأة / المصنع
                    </h2>
                    
                    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Logo Upload Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '8px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '12px',
                                border: '2px dashed var(--border-color)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--bg-app)',
                                flexShrink: 0,
                            }}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Building size={32} color="var(--text-secondary)" />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="form-label" style={{ fontWeight: '700', marginBottom: '4px' }}>شعار الشركة / المصنع</label>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    صيغ الملفات المدعومة: PNG, JPG, JPEG (الحد الأقصى: 2 ميجابايت)
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    style={{ fontSize: '12px' }}
                                />
                                {errors.logo && <p style={{ color: '#E03131', fontSize: '12px', marginTop: '4px' }}>{errors.logo}</p>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="form-label">اسم الشركة / المصنع</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="form-input"
                                    required
                                />
                                {errors.name && <p style={{ color: '#E03131', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
                            </div>
                            <div>
                                <label className="form-label">اسم المسؤول</label>
                                <input
                                    type="text"
                                    value={data.contact_name}
                                    onChange={e => setData('contact_name', e.target.value)}
                                    className="form-input"
                                    required
                                />
                                {errors.contact_name && <p style={{ color: '#E03131', fontSize: '12px', marginTop: '4px' }}>{errors.contact_name}</p>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="form-label">رقم الجوال</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="form-input"
                                    required
                                />
                                {errors.phone && <p style={{ color: '#E03131', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="form-label">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="form-input"
                                    required
                                />
                                {errors.email && <p style={{ color: '#E03131', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                {processing ? 'جاري الحفظ...' : 'حفظ بيانات الشركة'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ─── القسم الثالث: تفضيلات أخرى ─── */}
                <div className="card">
                    <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sliders size={20} color="var(--color-primary)" />
                        ⚙️ إعدادات الحسابات والفواتير
                    </h2>
                    
                    <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="form-label">العملة الافتراضية</label>
                                <select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className="form-input"
                                    style={{ height: '44px' }}
                                >
                                    <option value="SAR">ر.س (ريال سعودي)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="AED">د.إ (درهم إماراتي)</option>
                                    <option value="KWD">د.ك (دينار كويتي)</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">نسبة الضريبة الافتراضية (%)</label>
                                <input
                                    type="number"
                                    value={vat}
                                    onChange={e => setVat(e.target.value)}
                                    min="0"
                                    max="100"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ backgroundColor: '#2F9E44' }}
                            >
                                حفظ التفضيلات والخيارات
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </MainLayout>
    );
}
