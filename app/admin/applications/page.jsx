'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const STATUSES = ['submitted', 'reviewing', 'approved', 'rejected', 'completed'];

const ST = {
    submitted:  { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',    icon: 'send',         label: 'Diajukan' },
    reviewing:  { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: 'manage_search', label: 'Ditinjau' },
    approved:   { cls: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: 'check_circle', label: 'Disetujui' },
    rejected:   { cls: 'bg-red-500/15 text-red-400 border-red-500/30',       icon: 'cancel',       label: 'Ditolak' },
    completed:  { cls: 'bg-primary/15 text-primary border-primary/30',       icon: 'task_alt',     label: 'Selesai' },
};

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const emptyForm = {
    user_id: '', scheme_id: '', certification_type: '',
    applicant_name: '', applicant_email: '', applicant_phone: '', notes: '',
};

export default function AdminApplicationsPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    const [apps, setApps]             = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loadingData, setLoadingData] = useState(true);
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]             = useState(1);

    const [modal, setModal]           = useState(null); // null|'create'|'detail'|'review'|'delete'
    const [selected, setSelected]     = useState(null);
    const [form, setForm]             = useState(emptyForm);
    const [reviewForm, setReviewForm] = useState({ status: '', notes: '', rejection_reason: '' });
    const [formError, setFormError]   = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const [usersList, setUsersList]   = useState([]);
    const [schemesList, setSchemesList] = useState([]);

    // auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) { router.push('/login'); return; }
        if (!loading && user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            router.push('/'); return;
        }
    }, [loading, isAuthenticated, user, router]);

    const tok = () => localStorage.getItem('token');

    const fetchApps = useCallback(async () => {
        setLoadingData(true);
        try {
            const p = new URLSearchParams({ page, limit: 10 });
            if (search) p.set('search', search);
            if (statusFilter) p.set('status', statusFilter);
            const res  = await fetch(`/api/admin/applications?${p}`, { headers: { Authorization: `Bearer ${tok()}` } });
            const data = await res.json();
            if (data.success) { setApps(data.data); setPagination(data.pagination); }
        } catch (e) { console.error(e); }
        finally { setLoadingData(false); }
    }, [page, search, statusFilter]);

    const fetchDropdowns = useCallback(async () => {
        const t = tok();
        const [uRes, sRes] = await Promise.all([
            fetch('/api/admin/users?limit=200', { headers: { Authorization: `Bearer ${t}` } }),
            fetch('/api/admin/schemes?limit=100', { headers: { Authorization: `Bearer ${t}` } }),
        ]);
        const [uData, sData] = await Promise.all([uRes.json(), sRes.json()]);
        if (uData.success) setUsersList(uData.data);
        if (sData.success) setSchemesList(sData.data.filter(s => s.status === 'active'));
    }, []);

    useEffect(() => { if (!loading && user) { fetchApps(); fetchDropdowns(); } }, [loading, user, fetchApps, fetchDropdowns]);
    useEffect(() => { setPage(1); }, [search, statusFilter]);

    // --- handlers ---
    const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };

    const openDetail = (a) => { setSelected(a); setModal('detail'); };

    const openReview = (a) => {
        setSelected(a);
        setReviewForm({ status: a.status, notes: a.notes || '', rejection_reason: a.rejection_reason || '' });
        setFormError('');
        setModal('review');
    };

    const openDelete = (a) => { setSelected(a); setFormError(''); setModal('delete'); };
    const closeModal = () => { setModal(null); setSelected(null); setFormError(''); };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const res  = await fetch('/api/admin/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal membuat pendaftaran'); return; }
            closeModal(); fetchApps();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const body = { status: reviewForm.status, notes: reviewForm.notes };
            if (reviewForm.status === 'rejected') body.rejection_reason = reviewForm.rejection_reason;
            const res  = await fetch(`/api/admin/applications/${selected.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal update status'); return; }
            closeModal(); fetchApps();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res  = await fetch(`/api/admin/applications/${selected.id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` },
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal menghapus'); return; }
            closeModal(); fetchApps();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const quickStatus = async (a, newStatus) => {
        await fetch(`/api/admin/applications/${a.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchApps();
    };

    // auto-fill certification_type dari scheme
    const handleSchemeChange = (e) => {
        const sid  = e.target.value;
        const sch  = schemesList.find(s => String(s.id) === sid);
        setForm(f => ({ ...f, scheme_id: sid, certification_type: sch ? sch.name : f.certification_type }));
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
        </div>
    );

    // stat summary dari data halaman ini
    const statCounts = STATUSES.reduce((acc, s) => {
        acc[s] = apps.filter(a => a.status === s).length;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link>
                    <span className="material-icons-outlined text-base">chevron_right</span>
                    <span className="text-white">Pendaftaran</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <span className="material-icons-outlined text-blue-400 text-3xl">description</span>
                            Kelola Pendaftaran
                        </h1>
                        <p className="text-slate-400 mt-1">Total {pagination.total} pendaftaran</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2.5 rounded-lg font-bold hover:bg-white transition-all">
                        <span className="material-icons-outlined text-lg">add_circle</span>
                        Tambah Pendaftaran
                    </button>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {STATUSES.map(s => {
                        const st = ST[s];
                        return (
                            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${statusFilter === s ? st.cls + ' border-opacity-100' : 'bg-surface-dark border-white/10 hover:border-white/20'}`}>
                                <span className={`material-icons-outlined text-2xl mb-1 ${statusFilter === s ? '' : 'text-slate-400'}`}>{st.icon}</span>
                                <span className={`text-xs font-bold ${statusFilter === s ? '' : 'text-slate-400'}`}>{st.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input type="text" placeholder="Cari nama pendaftar, email, skema..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-surface-dark border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors" />
                </div>

                {/* Table */}
                <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-20">
                            <span className="material-icons-outlined text-primary text-5xl animate-spin">refresh</span>
                        </div>
                    ) : apps.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-icons-outlined text-slate-600 text-6xl mb-3">inbox</span>
                            <p className="text-slate-500 text-lg">Tidak ada pendaftaran ditemukan</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Pendaftar</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Skema / Sertifikasi</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Status</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Tanggal</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Reviewer</th>
                                            <th className="text-right px-6 py-4 text-slate-400 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {apps.map(a => {
                                            const st = ST[a.status] || ST.submitted;
                                            const name = a.applicant_name || a.user_full_name || a.username || '—';
                                            const email = a.applicant_email || a.user_email || '—';
                                            return (
                                                <tr key={a.id} className="hover:bg-white/3 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                                                                <span className="material-icons-outlined text-blue-400 text-base">person</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{name}</p>
                                                                <p className="text-slate-400 text-xs">{email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {a.scheme_name ? (
                                                            <>
                                                                <p className="text-white text-sm font-medium">{a.scheme_name}</p>
                                                                <p className="text-slate-500 text-xs font-mono">{a.scheme_code}</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-slate-300 text-sm">{a.certification_type || '—'}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                                                            <span className="material-icons-outlined text-[13px]">{st.icon}</span>
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">{fmtDate(a.application_date || a.created_at)}</td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">{a.reviewer_name || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => openDetail(a)}
                                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Detail">
                                                                <span className="material-icons-outlined text-base">visibility</span>
                                                            </button>
                                                            <button onClick={() => openReview(a)}
                                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Tinjau">
                                                                <span className="material-icons-outlined text-base">rate_review</span>
                                                            </button>
                                                            <button onClick={() => openDelete(a)}
                                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus">
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
                                {apps.map(a => {
                                    const st   = ST[a.status] || ST.submitted;
                                    const name = a.applicant_name || a.user_full_name || a.username || '—';
                                    return (
                                        <div key={a.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="text-white font-medium">{name}</p>
                                                    <p className="text-slate-400 text-xs">{a.applicant_email || a.user_email || '—'}</p>
                                                    <p className="text-slate-300 text-sm mt-1">{a.scheme_name || a.certification_type || '—'}</p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => openDetail(a)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                                                        <span className="material-icons-outlined text-base">visibility</span>
                                                    </button>
                                                    <button onClick={() => openReview(a)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                                        <span className="material-icons-outlined text-base">rate_review</span>
                                                    </button>
                                                    <button onClick={() => openDelete(a)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <span className="material-icons-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold border ${st.cls}`}>
                                                    <span className="material-icons-outlined text-[12px]">{st.icon}</span>{st.label}
                                                </span>
                                                <span className="text-slate-500">{fmtDate(a.application_date || a.created_at)}</span>
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
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-2 bg-surface-dark border border-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                                <span className="material-icons-outlined text-base">chevron_left</span>
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                                .map((p, i, arr) => (
                                    <>
                                        {i > 0 && arr[i - 1] !== p - 1 && <span key={`d${p}`} className="text-slate-500 px-1">…</span>}
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary text-background-dark font-bold' : 'bg-surface-dark border border-white/10 text-slate-400 hover:text-white'}`}>
                                            {p}
                                        </button>
                                    </>
                                ))}
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                                className="p-2 bg-surface-dark border border-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                                <span className="material-icons-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODAL DETAIL ─── */}
            {modal === 'detail' && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <h2 className="text-lg font-bold text-white">Detail Pendaftaran #{selected.id}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white"><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {/* Status */}
                            <div className="flex items-center gap-3">
                                {(() => { const st = ST[selected.status] || ST.submitted; return (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${st.cls}`}>
                                        <span className="material-icons-outlined text-base">{st.icon}</span>{st.label}
                                    </span>
                                ); })()}
                                <span className="text-slate-400 text-sm">{fmtDate(selected.application_date || selected.created_at)}</span>
                            </div>

                            {/* Pendaftar */}
                            <div className="bg-white/5 rounded-lg p-4 space-y-1">
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Pendaftar</p>
                                <p className="text-white font-bold">{selected.applicant_name || selected.user_full_name || selected.username || '—'}</p>
                                <p className="text-slate-400 text-sm">{selected.applicant_email || selected.user_email || '—'}</p>
                                {selected.applicant_phone && <p className="text-slate-400 text-sm">{selected.applicant_phone}</p>}
                            </div>

                            {/* Skema */}
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Skema / Sertifikasi</p>
                                <p className="text-white font-bold">{selected.scheme_name || selected.certification_type || '—'}</p>
                                {selected.scheme_code && <p className="text-slate-500 text-xs font-mono mt-0.5">{selected.scheme_code}</p>}
                            </div>

                            {/* Reviewer */}
                            {selected.reviewer_name && (
                                <div className="bg-white/5 rounded-lg p-4">
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Reviewer</p>
                                    <p className="text-white">{selected.reviewer_name}</p>
                                    {selected.review_date && <p className="text-slate-400 text-sm mt-1">{fmtDate(selected.review_date)}</p>}
                                </div>
                            )}

                            {selected.notes && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Catatan</p>
                                    <p className="text-slate-300 text-sm">{selected.notes}</p>
                                </div>
                            )}

                            {selected.rejection_reason && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Alasan Penolakan</p>
                                    <p className="text-slate-300 text-sm">{selected.rejection_reason}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 shrink-0 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 font-medium text-sm">Tutup</button>
                            <button onClick={() => { closeModal(); openReview(selected); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all text-sm">
                                <span className="material-icons-outlined text-base">rate_review</span>Tinjau
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MODAL REVIEW ─── */}
            {modal === 'review' && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">rate_review</span>
                                Tinjau Pendaftaran #{selected.id}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white"><span className="material-icons-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleReview} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>{formError}
                                </div>
                            )}

                            <div className="bg-white/5 rounded-lg p-3 text-sm">
                                <p className="text-white font-medium">{selected.applicant_name || selected.user_full_name || selected.username}</p>
                                <p className="text-slate-400">{selected.scheme_name || selected.certification_type}</p>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Ubah Status</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {STATUSES.map(s => {
                                        const st = ST[s];
                                        return (
                                            <button key={s} type="button"
                                                onClick={() => setReviewForm(f => ({ ...f, status: s }))}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${reviewForm.status === s ? st.cls + ' border-opacity-100' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}>
                                                <span className="material-icons-outlined text-base">{st.icon}</span>
                                                {st.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {reviewForm.status === 'rejected' && (
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Alasan Penolakan <span className="text-red-400">*</span></label>
                                    <textarea value={reviewForm.rejection_reason}
                                        onChange={e => setReviewForm(f => ({ ...f, rejection_reason: e.target.value }))}
                                        placeholder="Jelaskan alasan penolakan..." rows={3} required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none text-sm" />
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Catatan</label>
                                <textarea value={reviewForm.notes}
                                    onChange={e => setReviewForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Catatan tambahan (opsional)..." rows={2}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm" />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 font-medium">Batal</button>
                                <button type="submit" disabled={formLoading || !reviewForm.status}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                    {formLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                    Simpan Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── MODAL CREATE ─── */}
            {modal === 'create' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">add_circle</span>
                                Tambah Pendaftaran
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white"><span className="material-icons-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>{formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Pengguna Terdaftar</label>
                                <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors">
                                    <option value="">-- Pilih Pengguna (opsional) --</option>
                                    {usersList.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.email})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nama Pendaftar</label>
                                    <input type="text" placeholder="Nama lengkap pendaftar" value={form.applicant_name}
                                        onChange={e => setForm(f => ({ ...f, applicant_name: e.target.value }))}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1.5">Email</label>
                                        <input type="email" placeholder="email@..." value={form.applicant_email}
                                            onChange={e => setForm(f => ({ ...f, applicant_email: e.target.value }))}
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1.5">No. HP</label>
                                        <input type="text" placeholder="08xx..." value={form.applicant_phone}
                                            onChange={e => setForm(f => ({ ...f, applicant_phone: e.target.value }))}
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Skema Sertifikasi</label>
                                <select value={form.scheme_id} onChange={handleSchemeChange}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors">
                                    <option value="">-- Pilih Skema (opsional) --</option>
                                    {schemesList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Jenis Sertifikasi</label>
                                <input type="text" placeholder="Otomatis terisi dari skema, atau isi manual"
                                    value={form.certification_type}
                                    onChange={e => setForm(f => ({ ...f, certification_type: e.target.value }))}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Catatan</label>
                                <textarea placeholder="Catatan pendaftaran..." rows={2} value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 font-medium">Batal</button>
                                <button type="submit" disabled={formLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60">
                                    {formLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── MODAL DELETE ─── */}
            {modal === 'delete' && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-md shadow-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-outlined text-red-400 text-3xl">delete_forever</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Hapus Pendaftaran</h2>
                        <p className="text-slate-400 mb-1">Yakin hapus pendaftaran #{selected.id}?</p>
                        <p className="text-white font-bold">{selected.applicant_name || selected.user_full_name || selected.username}</p>
                        <p className="text-slate-400 text-sm mb-6">{selected.scheme_name || selected.certification_type}</p>
                        {formError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">{formError}</div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 font-medium">Batal</button>
                            <button onClick={handleDelete} disabled={formLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 font-bold disabled:opacity-60">
                                {formLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
