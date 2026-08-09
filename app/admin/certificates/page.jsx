'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const STATUSES = ['pending', 'active', 'expired', 'revoked'];

const STATUS_STYLE = {
    active:  { cls: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: 'verified',       label: 'Aktif' },
    pending: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: 'pending',       label: 'Pending' },
    expired: { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',   icon: 'event_busy',    label: 'Kadaluarsa' },
    revoked: { cls: 'bg-red-500/15 text-red-400 border-red-500/30',         icon: 'cancel',        label: 'Dicabut' },
};

const emptyForm = {
    user_id: '',
    scheme_id: '',
    certification_name: '',
    certification_type: '',
    certification_number: '',
    registration_no: '',
    form_no: '',
    full_name: '',
    status: 'pending',
    issued_date: '',
    expiry_date: '',
    score: '',
    notes: '',
};

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminCertificatesPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    // List state
    const [certs, setCerts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCertificates: 0 });
    const [loadingCerts, setLoadingCerts] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    // Users list for dropdown
    const [usersList, setUsersList] = useState([]);
    const [schemesList, setSchemesList] = useState([]);

    // Modal state
    const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete' | 'import'
    const [selectedCert, setSelectedCert] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Import Excel state
    const [importFile, setImportFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError] = useState('');
    const [importResult, setImportResult] = useState(null);
    const [importConfirm, setImportConfirm] = useState(null); // { missingSchemes, affectedRows, total }
    const [templateLoading, setTemplateLoading] = useState(false);

    // Auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) { router.push('/login'); return; }
        if (!loading && user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            router.push('/'); return;
        }
    }, [loading, isAuthenticated, user, router]);

    const token = () => localStorage.getItem('token');

    const fetchCerts = useCallback(async () => {
        setLoadingCerts(true);
        try {
            const params = new URLSearchParams({ page, limit: 10 });
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/api/admin/certificates?${params}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (data.success) {
                setCerts(data.data);
                setPagination(data.pagination);
            }
        } catch (e) { console.error(e); }
        finally { setLoadingCerts(false); }
    }, [page, search, statusFilter]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users?limit=100', {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (data.success) setUsersList(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchSchemes = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/schemes?limit=100', {
                headers: { Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (data.success) setSchemesList(data.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { if (!loading && user) { fetchCerts(); fetchUsers(); fetchSchemes(); } }, [loading, user, fetchCerts, fetchUsers, fetchSchemes]);
    useEffect(() => { setPage(1); }, [search, statusFilter]);

    // --- CRUD ---
    const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };

    const openEdit = (c) => {
        setSelectedCert(c);
        setForm({
            user_id: c.user_id,
            scheme_id: c.scheme_id || '',
            certification_name: c.certification_name,
            certification_type: c.certification_type || '',
            certification_number: c.certification_number || '',
            registration_no: c.registration_no || '',
            form_no: c.form_no || '',
            full_name: c.full_name || '',
            status: c.status,
            issued_date: c.issued_date ? c.issued_date.split('T')[0] : '',
            expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : '',
            score: c.score ?? '',
            notes: c.notes || '',
        });
        setFormError('');
        setModal('edit');
    };

    const openDelete = (c) => { setSelectedCert(c); setFormError(''); setModal('delete'); };
    const closeModal = () => { setModal(null); setSelectedCert(null); setFormError(''); };

    const openImport = () => { setImportFile(null); setImportError(''); setImportResult(null); setImportConfirm(null); setModal('import'); };

    const handleDownloadTemplate = async () => {
        setTemplateLoading(true);
        try {
            const res = await fetch('/api/admin/certificates/import', {
                headers: { Authorization: `Bearer ${token()}` },
            });
            if (!res.ok) throw new Error('Gagal mengunduh template');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template-import-sertifikat.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) { setImportError('Gagal mengunduh template'); }
        finally { setTemplateLoading(false); }
    };

    const submitImport = async (proceed) => {
        setImportLoading(true); setImportError('');
        try {
            const fd = new FormData();
            fd.append('file', importFile);
            if (proceed) fd.append('proceed', 'true');
            const res = await fetch('/api/admin/certificates/import', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token()}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) { setImportError(data.error || 'Gagal mengimpor file'); return; }
            if (data.needsConfirmation) {
                setImportConfirm(data);
            } else {
                setImportConfirm(null);
                setImportResult(data);
                if (data.imported > 0) fetchCerts();
            }
        } catch { setImportError('Terjadi kesalahan saat mengimpor file'); }
        finally { setImportLoading(false); }
    };

    const handleImport = (e) => {
        e.preventDefault();
        if (!importFile) { setImportError('Pilih file Excel terlebih dahulu'); return; }
        setImportResult(null);
        submitImport(false);
    };

    const handleImportProceed = () => submitImport(true);
    const handleImportCancelConfirm = () => setImportConfirm(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    // auto-fill certification_type dari skema yang dipilih
    const handleSchemeChange = (e) => {
        const sid = e.target.value;
        const sch = schemesList.find(s => String(s.id) === sid);
        setForm(f => ({ ...f, scheme_id: sid, certification_type: sch ? sch.name : f.certification_type }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const body = { ...form, score: form.score !== '' ? parseFloat(form.score) : null };
            if (!body.scheme_id) delete body.scheme_id;
            if (!body.issued_date) delete body.issued_date;
            if (!body.expiry_date) delete body.expiry_date;
            if (!body.certification_number) delete body.certification_number;
            if (!body.registration_no) delete body.registration_no;
            if (!body.form_no) delete body.form_no;
            if (!body.full_name) delete body.full_name;
            if (!body.notes) delete body.notes;

            const res = await fetch('/api/admin/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal membuat sertifikat'); return; }
            closeModal();
            fetchCerts();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const body = {
                scheme_id: form.scheme_id || null,
                certification_name: form.certification_name,
                certification_type: form.certification_type,
                certification_number: form.certification_number || null,
                registration_no: form.registration_no || null,
                form_no: form.form_no || null,
                full_name: form.full_name || null,
                status: form.status,
                issued_date: form.issued_date || null,
                expiry_date: form.expiry_date || null,
                score: form.score !== '' ? parseFloat(form.score) : null,
                notes: form.notes || null,
            };
            const res = await fetch(`/api/admin/certificates/${selectedCert.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal mengupdate sertifikat'); return; }
            closeModal();
            fetchCerts();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res = await fetch(`/api/admin/certificates/${selectedCert.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token()}` },
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal menghapus sertifikat'); return; }
            closeModal();
            fetchCerts();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link>
                    <span className="material-icons-outlined text-base">chevron_right</span>
                    <span className="text-white">Kelola Sertifikat</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <span className="material-icons-outlined text-yellow-400 text-3xl">workspace_premium</span>
                            Kelola Sertifikat
                        </h1>
                        <p className="text-slate-400 mt-1">Total {pagination.totalCertificates} sertifikat terdaftar</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openImport}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-white/10 transition-all"
                        >
                            <span className="material-icons-outlined text-lg">upload_file</span>
                            Import Excel
                        </button>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2.5 rounded-lg font-bold hover:bg-white transition-all"
                        >
                            <span className="material-icons-outlined text-lg">add_circle</span>
                            Terbitkan Sertifikat
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Cari nama sertifikat, nomor, pengguna, skema..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-surface-dark border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-surface-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors min-w-[150px]"
                    >
                        <option value="">Semua Status</option>
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_STYLE[s]?.label || s}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                    {loadingCerts ? (
                        <div className="flex items-center justify-center py-20">
                            <span className="material-icons-outlined text-primary text-5xl animate-spin">refresh</span>
                        </div>
                    ) : certs.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-icons-outlined text-slate-600 text-6xl mb-3">workspace_premium</span>
                            <p className="text-slate-500 text-lg">Tidak ada sertifikat ditemukan</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Sertifikat</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Skema</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Pemegang</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Status</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Berlaku</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Nilai</th>
                                            <th className="text-right px-6 py-4 text-slate-400 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {certs.map(c => {
                                            const st = STATUS_STYLE[c.status] || STATUS_STYLE.pending;
                                            return (
                                                <tr key={c.id} className="hover:bg-white/3 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                                                <span className="material-icons-outlined text-yellow-400 text-base">workspace_premium</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{c.certification_name}</p>
                                                                <p className="text-slate-400 text-xs mt-0.5">{c.certification_type || '—'}</p>
                                                                {c.certification_number && (
                                                                    <p className="text-slate-500 text-xs font-mono mt-0.5">{c.certification_number}</p>
                                                                )}
                                                                {(c.registration_no || c.form_no) && (
                                                                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                                                                        {c.registration_no && <>Reg: {c.registration_no}</>}
                                                                        {c.registration_no && c.form_no && ' · '}
                                                                        {c.form_no && <>Blanko: {c.form_no}</>}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {c.scheme_name ? (
                                                            <>
                                                                <p className="text-white text-sm font-medium">{c.scheme_name}</p>
                                                                <p className="text-slate-500 text-xs font-mono">{c.scheme_code}</p>
                                                            </>
                                                        ) : <span className="text-slate-500">—</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-white font-medium text-sm">{c.full_name || c.user_full_name || c.username}</p>
                                                        <p className="text-slate-400 text-xs">{c.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                                                            <span className="material-icons-outlined text-[13px]">{st.icon}</span>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-300 text-sm">{fmtDate(c.issued_date)}</p>
                                                        {c.expiry_date && (
                                                            <p className="text-slate-500 text-xs mt-0.5">s/d {fmtDate(c.expiry_date)}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {c.score != null ? (
                                                            <span className={`font-bold ${parseFloat(c.score) >= 80 ? 'text-green-400' : parseFloat(c.score) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                {parseFloat(c.score).toFixed(1)}
                                                            </span>
                                                        ) : <span className="text-slate-500">—</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEdit(c)}
                                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                                title="Edit"
                                                            >
                                                                <span className="material-icons-outlined text-base">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => openDelete(c)}
                                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Hapus"
                                                            >
                                                                <span className="material-icons-outlined text-base">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden divide-y divide-white/5">
                                {certs.map(c => {
                                    const st = STATUS_STYLE[c.status] || STATUS_STYLE.pending;
                                    return (
                                        <div key={c.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                                                        <span className="material-icons-outlined text-yellow-400">workspace_premium</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{c.certification_name}</p>
                                                        <p className="text-slate-400 text-xs">{c.certification_type || '—'}</p>
                                                        {c.certification_number && (
                                                            <p className="text-slate-500 text-xs font-mono">{c.certification_number}</p>
                                                        )}
                                                        {(c.registration_no || c.form_no) && (
                                                            <p className="text-slate-500 text-xs font-mono">
                                                                {c.registration_no && <>Reg: {c.registration_no}</>}
                                                                {c.registration_no && c.form_no && ' · '}
                                                                {c.form_no && <>Blanko: {c.form_no}</>}
                                                            </p>
                                                        )}
                                                        {c.scheme_name && (
                                                            <p className="text-slate-500 text-xs mt-0.5">Skema: {c.scheme_name} ({c.scheme_code})</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                                        <span className="material-icons-outlined text-base">edit</span>
                                                    </button>
                                                    <button onClick={() => openDelete(c)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <span className="material-icons-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold border ${st.cls}`}>
                                                    <span className="material-icons-outlined text-[12px]">{st.icon}</span>
                                                    {st.label}
                                                </span>
                                                <span className="text-slate-400">{c.full_name || c.user_full_name || c.username}</span>
                                                {c.score != null && (
                                                    <span className={`font-bold ${parseFloat(c.score) >= 80 ? 'text-green-400' : parseFloat(c.score) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                        Nilai: {parseFloat(c.score).toFixed(1)}
                                                    </span>
                                                )}
                                                <span className="text-slate-500">{fmtDate(c.issued_date)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-slate-400 text-sm">Halaman {pagination.page} dari {pagination.totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-surface-dark border border-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-icons-outlined text-base">chevron_left</span>
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                                .map((p, idx, arr) => (
                                    <>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`d${p}`} className="text-slate-500 px-1">…</span>}
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary text-background-dark font-bold' : 'bg-surface-dark border border-white/10 text-slate-400 hover:text-white'}`}>
                                            {p}
                                        </button>
                                    </>
                                ))
                            }
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="p-2 bg-surface-dark border border-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-icons-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Modal Create / Edit ─── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-yellow-400">
                                    {modal === 'create' ? 'add_circle' : 'edit'}
                                </span>
                                {modal === 'create' ? 'Terbitkan Sertifikat' : 'Edit Sertifikat'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={modal === 'create' ? handleCreate : handleEdit} className="p-6 space-y-4 overflow-y-auto">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>
                                    {formError}
                                </div>
                            )}

                            {/* User (only on create) */}
                            {modal === 'create' && (
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Pengguna <span className="text-red-400">*</span></label>
                                    <select
                                        name="user_id"
                                        value={form.user_id}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="">-- Pilih Pengguna --</option>
                                        {usersList.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.full_name || u.username} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {modal === 'edit' && selectedCert && (
                                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                                    <span className="material-icons-outlined text-slate-400 text-lg">person</span>
                                    <div>
                                        <p className="text-white font-medium text-sm">{selectedCert.user_full_name || selectedCert.username}</p>
                                        <p className="text-slate-400 text-xs">{selectedCert.email}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Skema Sertifikasi</label>
                                <select
                                    name="scheme_id"
                                    value={form.scheme_id}
                                    onChange={handleSchemeChange}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="">-- Tanpa Skema --</option>
                                    {schemesList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Nama Lengkap (di Sertifikat)</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleFormChange}
                                    placeholder="cth. Budi Santoso (kosongkan jika sama dengan nama akun)"
                                    maxLength={100}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nama Sertifikat <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="certification_name"
                                        value={form.certification_name}
                                        onChange={handleFormChange}
                                        placeholder="cth. Junior Web Developer"
                                        required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Jenis Sertifikasi <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="certification_type"
                                        value={form.certification_type}
                                        onChange={handleFormChange}
                                        placeholder="cth. Teknik Informatika"
                                        required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nomor Sertifikat</label>
                                    <input
                                        type="text"
                                        name="certification_number"
                                        value={form.certification_number}
                                        onChange={handleFormChange}
                                        placeholder="cth. LSP-A3I-2024-001"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleFormChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        {STATUSES.map(s => (
                                            <option key={s} value={s}>{STATUS_STYLE[s]?.label || s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nomor Registrasi</label>
                                    <input
                                        type="text"
                                        name="registration_no"
                                        value={form.registration_no}
                                        onChange={handleFormChange}
                                        placeholder="cth. REG-2024-001"
                                        maxLength={50}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nomor Blanko</label>
                                    <input
                                        type="text"
                                        name="form_no"
                                        value={form.form_no}
                                        onChange={handleFormChange}
                                        placeholder="cth. BLK-2024-001"
                                        maxLength={50}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Tanggal Terbit</label>
                                    <input
                                        type="date"
                                        name="issued_date"
                                        value={form.issued_date}
                                        onChange={handleFormChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Tanggal Kadaluarsa</label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={form.expiry_date}
                                        onChange={handleFormChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nilai (0–100)</label>
                                    <input
                                        type="number"
                                        name="score"
                                        value={form.score}
                                        onChange={handleFormChange}
                                        placeholder="cth. 85.5"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Catatan</label>
                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleFormChange}
                                    placeholder="Catatan tambahan (opsional)..."
                                    rows={2}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium">
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {formLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                    {modal === 'create' ? 'Terbitkan' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modal Import Excel ─── */}
            {modal === 'import' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-yellow-400">upload_file</span>
                                Import Sertifikat dari Excel
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-slate-400 space-y-2">
                                <p>File harus berformat <span className="text-white font-mono">.xlsx</span>/<span className="text-white font-mono">.xls</span> dengan kolom header berikut (urutan bebas):</p>
                                <p className="font-mono text-xs text-slate-300 leading-relaxed">No · Tanggal Terbit · No. Sertifikat · No. Registrasi · No. Blanko · Nama · Skema Sertifikasi · Masa Berlaku</p>
                                <p>Kolom <span className="text-white">No</span> diabaikan. Kolom <span className="text-white">Skema Sertifikasi</span> harus cocok dengan nama/kode skema yang sudah ada. Sertifikat hasil import tidak terhubung ke akun pengguna manapun.</p>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    disabled={templateLoading}
                                    className="flex items-center gap-1.5 text-primary hover:text-white transition-colors font-medium disabled:opacity-60"
                                >
                                    <span className="material-icons-outlined text-base">{templateLoading ? 'refresh' : 'download'}</span>
                                    Unduh Template
                                </button>
                            </div>

                            {importError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>
                                    {importError}
                                </div>
                            )}

                            {importConfirm ? (
                                /* ─── Konfirmasi: ada skema yang belum terdaftar ─── */
                                <div className="space-y-4">
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-300 flex items-start gap-2">
                                        <span className="material-icons-outlined text-base shrink-0 mt-0.5">warning</span>
                                        <span>
                                            {importConfirm.affectedRows} dari {importConfirm.total} baris menggunakan skema sertifikasi yang belum terdaftar di sistem.
                                            Tambahkan skema tersebut terlebih dahulu di halaman <Link href="/admin/schemes" target="_blank" className="underline font-medium hover:text-white">Kelola Skema</Link>,
                                            atau lanjutkan import dengan melewati baris-baris tersebut.
                                        </span>
                                    </div>

                                    <div className="border border-white/10 rounded-lg divide-y divide-white/5 max-h-56 overflow-y-auto">
                                        {importConfirm.missingSchemes.map((m, idx) => (
                                            <div key={idx} className="px-3 py-2.5 text-sm flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-white font-medium">{m.name}</p>
                                                    <p className="text-slate-500 text-xs font-mono">Baris {m.rows.join(', ')}</p>
                                                </div>
                                                <span className="shrink-0 text-xs text-yellow-400 font-bold">{m.count} baris</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button type="button" onClick={handleImportCancelConfirm} disabled={importLoading} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium disabled:opacity-60">
                                            Batalkan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleImportProceed}
                                            disabled={importLoading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {importLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                            Lanjutkan &amp; Lewati Baris Ini
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleImport} className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1.5">File Excel <span className="text-red-400">*</span></label>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={e => setImportFile(e.target.files?.[0] || null)}
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-background-dark file:font-bold file:cursor-pointer focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>

                                    {importResult && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                                                    <span className="material-icons-outlined text-[14px]">check_circle</span>
                                                    {importResult.imported} berhasil
                                                </span>
                                                {importResult.failed > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                                        <span className="material-icons-outlined text-[14px]">error</span>
                                                        {importResult.failed} gagal
                                                    </span>
                                                )}
                                                {importResult.skippedCount > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                                                        <span className="material-icons-outlined text-[14px]">skip_next</span>
                                                        {importResult.skippedCount} dilewati (skema belum ada)
                                                    </span>
                                                )}
                                                <span className="text-slate-500">dari {importResult.total} baris</span>
                                            </div>
                                            {importResult.errors.length > 0 && (
                                                <div className="max-h-40 overflow-y-auto border border-white/10 rounded-lg divide-y divide-white/5">
                                                    {importResult.errors.map((err, idx) => (
                                                        <div key={idx} className="px-3 py-2 text-xs">
                                                            <span className="text-slate-500 font-mono">Baris {err.row}:</span>{' '}
                                                            <span className="text-red-400">{err.message}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {importResult.skipped?.length > 0 && (
                                                <div className="max-h-40 overflow-y-auto border border-white/10 rounded-lg divide-y divide-white/5">
                                                    {importResult.skipped.map((s, idx) => (
                                                        <div key={idx} className="px-3 py-2 text-xs">
                                                            <span className="text-slate-500 font-mono">Baris {s.row}:</span>{' '}
                                                            <span className="text-yellow-400">{s.message}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium">
                                            {importResult ? 'Tutup' : 'Batal'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={importLoading || !importFile}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {importLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                            Import
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Modal Delete ─── */}
            {modal === 'delete' && selectedCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-red-400 text-3xl">delete_forever</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Hapus Sertifikat</h2>
                            <p className="text-slate-400 mb-1">Yakin ingin menghapus sertifikat ini?</p>
                            <p className="text-white font-bold">{selectedCert.certification_name}</p>
                            <p className="text-slate-400 text-sm mb-1">{selectedCert.full_name || selectedCert.user_full_name || selectedCert.username}</p>
                            {selectedCert.certification_number && (
                                <p className="text-slate-500 text-xs font-mono mb-1">{selectedCert.certification_number}</p>
                            )}
                            {(selectedCert.registration_no || selectedCert.form_no) && (
                                <p className="text-slate-500 text-xs font-mono mb-6">
                                    {selectedCert.registration_no && <>Reg: {selectedCert.registration_no}</>}
                                    {selectedCert.registration_no && selectedCert.form_no && ' · '}
                                    {selectedCert.form_no && <>Blanko: {selectedCert.form_no}</>}
                                </p>
                            )}

                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={closeModal} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium">
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={formLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold disabled:opacity-60"
                                >
                                    {formLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
