'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const NOTIF_KEY = 'a3i_notif_prefs';

const defaultNotif = {
    email_sertifikat: true,
    email_aplikasi: true,
    email_assessment: true,
    email_pengumuman: false,
};

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                checked ? 'bg-primary' : 'bg-white/10'
            }`}
        >
            <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

function SettingRow({ icon, title, desc, children }) {
    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-start gap-3 min-w-0">
                <span className="material-icons-outlined text-slate-500 text-xl mt-0.5 shrink-0">{icon}</span>
                <div className="min-w-0">
                    <p className="text-white font-medium text-sm">{title}</p>
                    {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
                </div>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function SectionCard({ icon, title, children }) {
    return (
        <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2.5">
                <span className="material-icons-outlined text-primary text-xl">{icon}</span>
                <h2 className="text-white font-bold text-base">{title}</h2>
            </div>
            <div className="px-6 divide-y divide-white/5">{children}</div>
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated, logout } = useAuth();

    const [notif, setNotif] = useState(defaultNotif);
    const [notifSaved, setNotifSaved] = useState(false);

    const [deactivateModal, setDeactivateModal] = useState(false);
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [deactivateError, setDeactivateError] = useState('');
    const [deactivateConfirm, setDeactivateConfirm] = useState('');

    // Auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Load notification preferences from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(NOTIF_KEY);
            if (stored) setNotif({ ...defaultNotif, ...JSON.parse(stored) });
        } catch {}
    }, []);

    const handleNotifChange = (key, val) => {
        const updated = { ...notif, [key]: val };
        setNotif(updated);
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
        setNotifSaved(true);
        setTimeout(() => setNotifSaved(false), 2000);
    };

    const handleLogout = () => {
        logout();
    };

    const handleDeactivate = async () => {
        if (deactivateConfirm !== user?.username) {
            setDeactivateError('Username tidak sesuai');
            return;
        }
        setDeactivateLoading(true);
        setDeactivateError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user/profile/deactivate', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                setDeactivateError(data.error || 'Gagal menonaktifkan akun');
                return;
            }
            logout();
        } catch {
            setDeactivateError('Terjadi kesalahan, coba lagi');
        } finally {
            setDeactivateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard max-w-3xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
                    <span className="material-icons-outlined text-base">chevron_right</span>
                    <span className="text-white">Pengaturan</span>
                </div>

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <span className="material-icons-outlined text-primary text-3xl">settings</span>
                        Pengaturan Akun
                    </h1>
                    <p className="text-slate-400 mt-1">Kelola preferensi dan keamanan akun Anda</p>
                </div>

                <div className="space-y-6">
                    {/* Informasi Akun */}
                    <SectionCard icon="account_circle" title="Informasi Akun">
                        <SettingRow
                            icon="person"
                            title="Nama Lengkap"
                            desc={user?.full_name || '—'}
                        >
                            <Link
                                href="/profile/edit"
                                className="text-xs text-primary hover:text-white font-semibold transition-colors flex items-center gap-1"
                            >
                                <span className="material-icons-outlined text-sm">edit</span>
                                Edit
                            </Link>
                        </SettingRow>
                        <SettingRow
                            icon="alternate_email"
                            title="Username"
                            desc={`@${user?.username}`}
                        >
                            <Link
                                href="/profile/edit"
                                className="text-xs text-primary hover:text-white font-semibold transition-colors flex items-center gap-1"
                            >
                                <span className="material-icons-outlined text-sm">edit</span>
                                Edit
                            </Link>
                        </SettingRow>
                        <SettingRow
                            icon="email"
                            title="Alamat Email"
                            desc={user?.email}
                        >
                            <Link
                                href="/profile/edit"
                                className="text-xs text-primary hover:text-white font-semibold transition-colors flex items-center gap-1"
                            >
                                <span className="material-icons-outlined text-sm">edit</span>
                                Edit
                            </Link>
                        </SettingRow>
                        <SettingRow
                            icon="verified_user"
                            title="Role Akun"
                            desc="Role ditentukan oleh administrator"
                        >
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                {
                                    SUPERADMIN: 'bg-red-500/20 text-red-400 border-red-500/40',
                                    ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
                                    ASESOR: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
                                    ASESI: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
                                }[user?.role] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                            }`}>
                                {user?.role}
                            </span>
                        </SettingRow>
                    </SectionCard>

                    {/* Keamanan */}
                    <SectionCard icon="lock" title="Keamanan">
                        <SettingRow
                            icon="password"
                            title="Password"
                            desc="Ubah password akun Anda"
                        >
                            <Link
                                href="/profile/edit"
                                className="text-xs text-primary hover:text-white font-semibold transition-colors flex items-center gap-1"
                            >
                                <span className="material-icons-outlined text-sm">edit</span>
                                Ubah
                            </Link>
                        </SettingRow>
                        <SettingRow
                            icon="calendar_today"
                            title="Akun Dibuat"
                            desc={
                                user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString('id-ID', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                      })
                                    : '—'
                            }
                        >
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                user?.is_active
                                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user?.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                                {user?.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </SettingRow>
                        <SettingRow
                            icon="logout"
                            title="Keluar dari Akun"
                            desc="Akhiri sesi login saat ini"
                        >
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors"
                            >
                                <span className="material-icons-outlined text-sm">logout</span>
                                Logout
                            </button>
                        </SettingRow>
                    </SectionCard>

                    {/* Preferensi Notifikasi */}
                    <SectionCard icon="notifications" title="Preferensi Notifikasi">
                        <div className="py-2 pb-3">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-slate-500 text-xs">
                                    Kelola notifikasi email yang ingin Anda terima
                                </p>
                                {notifSaved && (
                                    <span className="text-green-400 text-xs flex items-center gap-1">
                                        <span className="material-icons-outlined text-sm">check_circle</span>
                                        Tersimpan
                                    </span>
                                )}
                            </div>
                        </div>
                        <SettingRow
                            icon="workspace_premium"
                            title="Notifikasi Sertifikat"
                            desc="Pembaruan status dan kedaluwarsa sertifikat"
                        >
                            <Toggle
                                checked={notif.email_sertifikat}
                                onChange={(v) => handleNotifChange('email_sertifikat', v)}
                            />
                        </SettingRow>
                        <SettingRow
                            icon="assignment"
                            title="Notifikasi Aplikasi"
                            desc="Status permohonan sertifikasi"
                        >
                            <Toggle
                                checked={notif.email_aplikasi}
                                onChange={(v) => handleNotifChange('email_aplikasi', v)}
                            />
                        </SettingRow>
                        <SettingRow
                            icon="fact_check"
                            title="Notifikasi Asesmen"
                            desc="Jadwal dan hasil asesmen kompetensi"
                        >
                            <Toggle
                                checked={notif.email_assessment}
                                onChange={(v) => handleNotifChange('email_assessment', v)}
                            />
                        </SettingRow>
                        <SettingRow
                            icon="campaign"
                            title="Pengumuman Umum"
                            desc="Info terbaru, program, dan berita LSP A3I"
                        >
                            <Toggle
                                checked={notif.email_pengumuman}
                                onChange={(v) => handleNotifChange('email_pengumuman', v)}
                            />
                        </SettingRow>
                    </SectionCard>

                    {/* Zona Bahaya */}
                    <div className="bg-surface-dark border border-red-500/20 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-2.5">
                            <span className="material-icons-outlined text-red-400 text-xl">warning</span>
                            <h2 className="text-red-400 font-bold text-base">Zona Bahaya</h2>
                        </div>
                        <div className="px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-white font-medium text-sm">Nonaktifkan Akun</p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Akun Anda akan dinonaktifkan dan tidak dapat digunakan untuk login.
                                        Hubungi administrator untuk mengaktifkan kembali.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setDeactivateModal(true); setDeactivateError(''); setDeactivateConfirm(''); }}
                                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors"
                                >
                                    <span className="material-icons-outlined text-base">block</span>
                                    Nonaktifkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deactivate Modal */}
            {deactivateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-6">
                            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-red-400 text-3xl">block</span>
                            </div>
                            <h2 className="text-xl font-bold text-white text-center mb-2">
                                Nonaktifkan Akun?
                            </h2>
                            <p className="text-slate-400 text-sm text-center mb-5">
                                Akun Anda akan dinonaktifkan. Anda tidak akan bisa login sampai administrator mengaktifkan kembali.
                            </p>

                            <div className="mb-4">
                                <label className="block text-slate-400 text-sm mb-1.5">
                                    Ketik username <span className="text-white font-bold">@{user?.username}</span> untuk konfirmasi
                                </label>
                                <input
                                    type="text"
                                    value={deactivateConfirm}
                                    onChange={(e) => { setDeactivateConfirm(e.target.value); setDeactivateError(''); }}
                                    placeholder={user?.username}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                            </div>

                            {deactivateError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4 flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>
                                    {deactivateError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeactivateModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeactivate}
                                    disabled={deactivateLoading || deactivateConfirm !== user?.username}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deactivateLoading && (
                                        <span className="material-icons-outlined text-base animate-spin">refresh</span>
                                    )}
                                    Nonaktifkan Akun
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
