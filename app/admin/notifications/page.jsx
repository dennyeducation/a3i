'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

function authHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
    };
}

function urgencyClass(days) {
    if (days <= 7)  return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (days <= 30) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
}

function statusClass(status) {
    if (status === 'sent')    return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (status === 'failed')  return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
}

function fmtDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(date) {
    if (!date) return '—';
    return new Date(date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ────────────────────────────────────────────────────────────
// Tab: Pengaturan
// ────────────────────────────────────────────────────────────
function SettingsTab() {
    const [settings, setSettings] = useState({
        email_enabled: 'true', notify_days: '90,30,7',
        smtp_host: '', smtp_port: '587', smtp_user: '',
        smtp_secure: 'false', smtp_from: '', auto_send_enabled: 'true', send_time: '07:00',
    });
    const [smtpPass, setSmtpPass]   = useState('');
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [testing, setTesting]     = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [message, setMessage]     = useState(null);

    const intervalOptions = [
        { value: '7',  label: '7 hari' },
        { value: '14', label: '14 hari' },
        { value: '30', label: '30 hari' },
        { value: '60', label: '60 hari' },
        { value: '90', label: '90 hari' },
    ];

    const selectedIntervals = settings.notify_days.split(',').map((d) => d.trim()).filter(Boolean);

    const toggleInterval = (val) => {
        const current = new Set(selectedIntervals);
        if (current.has(val)) current.delete(val);
        else current.add(val);
        const sorted = Array.from(current).sort((a, b) => parseInt(b) - parseInt(a));
        setSettings((s) => ({ ...s, notify_days: sorted.join(',') }));
    };

    useEffect(() => {
        fetch('/api/admin/notifications/settings', { headers: authHeaders() })
            .then((r) => r.json())
            .then((d) => { if (d.success) setSettings((s) => ({ ...s, ...d.data })); })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const payload = { ...settings };
            if (smtpPass) payload.smtp_pass = smtpPass;
            const res  = await fetch('/api/admin/notifications/settings', {
                method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload),
            });
            const data = await res.json();
            setMessage(res.ok ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
        } catch {
            setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setMessage(null);
        try {
            const res  = await fetch('/api/admin/notifications/send-test', {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ email: testEmail || undefined }),
            });
            const data = await res.json();
            setMessage(res.ok ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
        } catch {
            setMessage({ type: 'error', text: 'Gagal mengirim email tes' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <span className="material-icons-outlined text-slate-500 text-4xl animate-spin">refresh</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
                    message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    <span className="material-icons-outlined text-base">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {message.text}
                </div>
            )}

            {/* Toggle notifikasi email */}
            <div className="bg-surface-dark border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-white">Notifikasi Email</h3>
                        <p className="text-sm text-slate-400 mt-0.5">Aktifkan pengiriman email otomatis untuk sertifikat yang akan kadaluarsa</p>
                    </div>
                    <button
                        onClick={() => setSettings((s) => ({ ...s, email_enabled: s.email_enabled === 'true' ? 'false' : 'true' }))}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            settings.email_enabled === 'true' ? 'bg-primary' : 'bg-slate-700'
                        }`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            settings.email_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>
            </div>

            {/* Interval notifikasi */}
            <div className="bg-surface-dark border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-1">Interval Notifikasi</h3>
                <p className="text-sm text-slate-400 mb-4">Kirim email peringatan berapa hari sebelum sertifikat kadaluarsa</p>
                <div className="flex flex-wrap gap-2">
                    {intervalOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => toggleInterval(opt.value)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                selectedIntervals.includes(opt.value)
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-primary/50 hover:text-primary'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {selectedIntervals.length > 0 && (
                    <p className="text-xs text-slate-500 mt-3">
                        Notifikasi akan dikirim pada:{' '}
                        <strong className="text-slate-300">
                            {selectedIntervals.sort((a, b) => parseInt(b) - parseInt(a)).join(', ')} hari
                        </strong>{' '}
                        sebelum kadaluarsa
                    </p>
                )}
            </div>

            {/* Pengiriman otomatis */}
            <div className="bg-surface-dark border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-white">Pengiriman Otomatis</h3>
                        <p className="text-sm text-slate-400 mt-0.5">Sistem akan otomatis mengecek dan mengirim setiap hari</p>
                    </div>
                    <button
                        onClick={() => setSettings((s) => ({ ...s, auto_send_enabled: s.auto_send_enabled === 'true' ? 'false' : 'true' }))}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            settings.auto_send_enabled === 'true' ? 'bg-primary' : 'bg-slate-700'
                        }`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            settings.auto_send_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                </div>
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Jam Pengiriman (UTC)</label>
                    <input
                        type="time"
                        value={settings.send_time}
                        onChange={(e) => setSettings((s) => ({ ...s, send_time: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </div>

            {/* Konfigurasi SMTP */}
            <div className="bg-surface-dark border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-1">Konfigurasi SMTP</h3>
                <p className="text-sm text-slate-400 mb-5">Pengaturan server email untuk pengiriman notifikasi</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Host</label>
                        <input
                            type="text" value={settings.smtp_host} placeholder="smtp.gmail.com"
                            onChange={(e) => setSettings((s) => ({ ...s, smtp_host: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Port</label>
                        <input
                            type="number" value={settings.smtp_port} placeholder="587"
                            onChange={(e) => setSettings((s) => ({ ...s, smtp_port: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Pengirim</label>
                        <input
                            type="email" value={settings.smtp_user} placeholder="admin@lsp-a3i.com"
                            onChange={(e) => setSettings((s) => ({ ...s, smtp_user: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password / App Password</label>
                        <input
                            type="password" value={smtpPass} placeholder="Kosongkan jika tidak diubah"
                            onChange={(e) => setSmtpPass(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Pengirim (From)</label>
                        <input
                            type="text" value={settings.smtp_from} placeholder={`"LSP A3I" <admin@lsp-a3i.com>`}
                            onChange={(e) => setSettings((s) => ({ ...s, smtp_from: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-3">
                        <button
                            onClick={() => setSettings((s) => ({ ...s, smtp_secure: s.smtp_secure === 'true' ? 'false' : 'true' }))}
                            className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors shrink-0 ${
                                settings.smtp_secure === 'true' ? 'bg-primary' : 'bg-slate-700'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                settings.smtp_secure === 'true' ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                        </button>
                        <span className="text-sm text-slate-300">Gunakan SSL/TLS (port 465)</span>
                    </div>
                </div>
            </div>

            {/* Tes email */}
            <div className="bg-surface-dark border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-1">Tes Konfigurasi Email</h3>
                <p className="text-sm text-slate-400 mb-4">Kirim email tes untuk memverifikasi konfigurasi SMTP Anda</p>
                <div className="flex gap-3">
                    <input
                        type="email" value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Email tujuan tes (kosongkan untuk pakai email Anda)"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                        onClick={handleTest} disabled={testing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                        <span className={`material-icons-outlined text-base ${testing ? 'animate-spin' : ''}`}>
                            {testing ? 'refresh' : 'science'}
                        </span>
                        {testing ? 'Mengirim...' : 'Kirim Tes'}
                    </button>
                </div>
            </div>

            {/* Tombol simpan */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <span className={`material-icons-outlined text-base ${saving ? 'animate-spin' : ''}`}>
                        {saving ? 'refresh' : 'save'}
                    </span>
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Tab: Akan Kadaluarsa
// ────────────────────────────────────────────────────────────
function ExpiringTab() {
    const [certs, setCerts]       = useState([]);
    const [pagination, setPag]    = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [days, setDays]         = useState('90');
    const [loading, setLoading]   = useState(true);
    const [selected, setSelected] = useState(new Set());
    const [sending, setSending]   = useState(null);
    const [message, setMessage]   = useState(null);

    const fetchCerts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res  = await fetch(`/api/admin/notifications/expiring?days=${days}&page=${page}&limit=20`, {
                headers: authHeaders(),
            });
            const data = await res.json();
            if (data.success) { setCerts(data.data); setPag(data.pagination); }
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        fetchCerts(1);
        setSelected(new Set());
    }, [fetchCerts]);

    const toggleSelect = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === certs.length) setSelected(new Set());
        else setSelected(new Set(certs.map((c) => c.id)));
    };

    const handleSend = async (ids) => {
        setSending(ids.length === 1 ? ids[0] : 'all');
        setMessage(null);
        try {
            const res  = await fetch('/api/admin/notifications/send', {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ certificationIds: ids }),
            });
            const data = await res.json();
            setMessage(res.ok ? { type: 'success', text: data.message } : { type: 'error', text: data.error });
            if (res.ok) { setSelected(new Set()); fetchCerts(pagination.page); }
        } catch {
            setMessage({ type: 'error', text: 'Gagal mengirim notifikasi' });
        } finally {
            setSending(null);
        }
    };

    return (
        <div className="space-y-5">
            {message && (
                <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
                    message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                    <span className="material-icons-outlined text-base">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {message.text}
                </div>
            )}

            {/* Filter & aksi */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-400">Tampilkan yang kadaluarsa dalam:</label>
                    <select
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="7">7 hari</option>
                        <option value="30">30 hari</option>
                        <option value="60">60 hari</option>
                        <option value="90">90 hari</option>
                        <option value="180">180 hari</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    {selected.size > 0 && (
                        <button
                            onClick={() => handleSend(Array.from(selected))}
                            disabled={sending !== null}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <span className={`material-icons-outlined text-base ${sending === 'all' ? 'animate-spin' : ''}`}>
                                {sending === 'all' ? 'refresh' : 'send'}
                            </span>
                            Kirim ke {selected.size} terpilih
                        </button>
                    )}
                    <button
                        onClick={() => fetchCerts(pagination.page)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/30 transition-colors"
                    >
                        <span className="material-icons-outlined text-base">refresh</span>
                    </button>
                </div>
            </div>

            {/* Tabel */}
            <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-4 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={certs.length > 0 && selected.size === certs.length}
                                        onChange={toggleAll}
                                        className="rounded border-white/20 bg-white/5 text-primary"
                                    />
                                </th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Sertifikasi</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Pemilik</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Kadaluarsa</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Sisa</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Notif Terkirim</th>
                                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <span className="material-icons-outlined text-slate-600 text-4xl animate-spin">refresh</span>
                                    </td>
                                </tr>
                            ) : certs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <span className="material-icons-outlined text-slate-600 text-5xl mb-2 block">workspace_premium</span>
                                        <p className="text-slate-500">Tidak ada sertifikat yang akan kadaluarsa dalam {days} hari ke depan</p>
                                    </td>
                                </tr>
                            ) : (
                                certs.map((cert) => (
                                    <tr key={cert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(cert.id)}
                                                onChange={() => toggleSelect(cert.id)}
                                                className="rounded border-white/20 bg-white/5 text-primary"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white font-medium text-sm">{cert.certificationName}</p>
                                            {cert.certificationNumber && (
                                                <p className="text-slate-500 text-xs font-mono mt-0.5">{cert.certificationNumber}</p>
                                            )}
                                            {cert.scheme && (
                                                <p className="text-slate-500 text-xs mt-0.5">{cert.scheme.code}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{cert.user.fullName || cert.user.username}</p>
                                            <p className="text-slate-500 text-xs">{cert.user.email}</p>
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm">{fmtDate(cert.expiryDate)}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded-lg border text-xs font-bold ${urgencyClass(cert.daysRemaining)}`}>
                                                {cert.daysRemaining} hari
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {cert.sentNotifications.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {cert.sentNotifications.map((n, i) => (
                                                        <span key={i} className="inline-block px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                                                            H-{n.daysBefore}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 text-xs">Belum ada</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleSend([cert.id])}
                                                disabled={sending !== null}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 disabled:opacity-50 transition-colors"
                                            >
                                                <span className={`material-icons-outlined text-sm ${sending === cert.id ? 'animate-spin' : ''}`}>
                                                    {sending === cert.id ? 'refresh' : 'send'}
                                                </span>
                                                Kirim
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/10">
                        <p className="text-slate-500 text-sm">
                            {pagination.total} sertifikat ditemukan
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchCerts(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <span className="material-icons-outlined text-base">chevron_left</span>
                            </button>
                            <span className="text-slate-400 text-sm px-2">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchCerts(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <span className="material-icons-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Tab: Riwayat
// ────────────────────────────────────────────────────────────
function HistoryTab() {
    const [logs, setLogs]         = useState([]);
    const [stats, setStats]       = useState({ sent: 0, failed: 0, pending: 0 });
    const [pagination, setPag]    = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading]   = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch]     = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (statusFilter) params.set('status', statusFilter);
            if (search) params.set('search', search);
            const res  = await fetch(`/api/admin/notifications/logs?${params}`, { headers: authHeaders() });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
                setStats(data.stats);
                setPag(data.pagination);
            }
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => { fetchLogs(1); }, [fetchLogs]);

    return (
        <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Terkirim',  value: stats.sent,    color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                    { label: 'Gagal',     value: stats.failed,  color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                    { label: 'Tertunda',  value: stats.pending, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-48 relative">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">search</span>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                        placeholder="Cari email, nama, atau sertifikasi..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="">Semua Status</option>
                    <option value="sent">Terkirim</option>
                    <option value="failed">Gagal</option>
                    <option value="pending">Tertunda</option>
                </select>
                <button
                    onClick={() => { setSearch(searchInput); fetchLogs(1); }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/30 transition-colors"
                >
                    <span className="material-icons-outlined text-base">search</span>
                </button>
            </div>

            {/* Tabel log */}
            <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Waktu</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Penerima</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Sertifikasi</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Interval</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <span className="material-icons-outlined text-slate-600 text-4xl animate-spin">refresh</span>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <span className="material-icons-outlined text-slate-600 text-5xl mb-2 block">history</span>
                                        <p className="text-slate-500">Belum ada riwayat notifikasi</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-slate-400 text-xs whitespace-nowrap">{fmtDateTime(log.createdAt)}</td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{log.user.fullName || log.user.username}</p>
                                            <p className="text-slate-500 text-xs">{log.recipientEmail}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-slate-300 text-sm">{log.certification.certificationName}</p>
                                            <p className="text-slate-500 text-xs">
                                                Kadaluarsa: {fmtDate(log.certification.expiryDate)}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                                                H-{log.daysBefore}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${statusClass(log.status)}`}>
                                                <span className="material-icons-outlined text-xs">
                                                    {log.status === 'sent' ? 'check_circle' : log.status === 'failed' ? 'error' : 'schedule'}
                                                </span>
                                                {log.status === 'sent' ? 'Terkirim' : log.status === 'failed' ? 'Gagal' : 'Tertunda'}
                                            </span>
                                            {log.errorMessage && (
                                                <p className="text-red-400 text-xs mt-1 max-w-xs truncate" title={log.errorMessage}>
                                                    {log.errorMessage}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/10">
                        <p className="text-slate-500 text-sm">{pagination.total} log ditemukan</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchLogs(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <span className="material-icons-outlined text-base">chevron_left</span>
                            </button>
                            <span className="text-slate-400 text-sm px-2">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchLogs(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                            >
                                <span className="material-icons-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('settings');

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (!loading && isAuthenticated()) {
            if (user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
                router.push('/');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
            </div>
        );
    }

    if (!user) return null;

    const tabs = [
        { id: 'settings', label: 'Pengaturan',       icon: 'settings' },
        { id: 'expiring', label: 'Akan Kadaluarsa',  icon: 'schedule' },
        { id: 'history',  label: 'Riwayat',           icon: 'history' },
    ];

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                        <span className="material-icons-outlined text-xs">chevron_right</span>
                        <span className="text-slate-300">Notifikasi</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-icons-outlined text-primary text-3xl">notifications</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Manajemen Notifikasi</h1>
                    </div>
                    <p className="text-slate-400">Kelola pengaturan email dan pantau notifikasi kadaluarsa sertifikat.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-8 w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-surface-dark text-white shadow-sm border border-white/10'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <span className="material-icons-outlined text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'expiring' && <ExpiringTab />}
                {activeTab === 'history'  && <HistoryTab />}
            </div>
        </div>
    );
}
