'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const STATUSES = ['draft', 'active', 'inactive'];
const STATUS_STYLE = {
    active:   { cls: 'bg-green-500/15 text-green-400 border-green-500/30',   icon: 'check_circle', label: 'Aktif' },
    draft:    { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: 'edit_note',    label: 'Draft' },
    inactive: { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',   icon: 'pause_circle', label: 'Nonaktif' },
};

const emptyForm = {
    code: '', name: '', description: '', category: '', level: '',
    duration_months: 36, requirements: '', status: 'draft',
    competency_units: [], image: '',
};

const emptyUnit = { code: '', name: '', standard: 'SKKNI' };

export default function AdminSchemesPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    const [schemes, setSchemes]       = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loadingData, setLoadingData] = useState(true);
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage]             = useState(1);

    const [modal, setModal]           = useState(null); // null | 'create' | 'edit' | 'delete' | 'detail'
    const [selected, setSelected]     = useState(null);
    const [form, setForm]             = useState(emptyForm);
    const [formError, setFormError]   = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [uploading, setUploading]   = useState(false);

    // Auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) { router.push('/login'); return; }
        if (!loading && user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            router.push('/'); return;
        }
    }, [loading, isAuthenticated, user, router]);

    const tok = () => localStorage.getItem('token');

    const fetchSchemes = useCallback(async () => {
        setLoadingData(true);
        try {
            const p = new URLSearchParams({ page, limit: 10 });
            if (search) p.set('search', search);
            if (statusFilter) p.set('status', statusFilter);
            const res  = await fetch(`/api/admin/schemes?${p}`, { headers: { Authorization: `Bearer ${tok()}` } });
            const data = await res.json();
            if (data.success) { setSchemes(data.data); setPagination(data.pagination); }
        } catch (e) { console.error(e); }
        finally { setLoadingData(false); }
    }, [page, search, statusFilter]);

    useEffect(() => { if (!loading && user) fetchSchemes(); }, [loading, user, fetchSchemes]);
    useEffect(() => { setPage(1); }, [search, statusFilter]);

    // --- CRUD ---
    const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };

    const openEdit = (s) => {
        setSelected(s);
        setForm({
            code: s.code,
            name: s.name,
            description: s.description || '',
            category: s.category || '',
            level: s.level || '',
            duration_months: s.duration_months || 36,
            requirements: s.requirements || '',
            status: s.status,
            competency_units: Array.isArray(s.competency_units) ? s.competency_units : [],
            image: s.image || '',
        });
        setFormError('');
        setModal('edit');
    };

    const openDetail = (s) => { setSelected(s); setModal('detail'); };
    const openDelete = (s) => { setSelected(s); setFormError(''); setModal('delete'); };
    const closeModal = () => { setModal(null); setSelected(null); setFormError(''); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'duration_months' ? parseInt(value) || 0 : value }));
    };

    // --- Unit kompetensi ---
    const addUnit    = () => setForm(f => ({ ...f, competency_units: [...f.competency_units, { ...emptyUnit }] }));
    const removeUnit = (i) => setForm(f => ({ ...f, competency_units: f.competency_units.filter((_, idx) => idx !== i) }));
    const updateUnit = (i, field, val) => setForm(f => ({
        ...f,
        competency_units: f.competency_units.map((u, idx) => idx === i ? { ...u, [field]: val } : u),
    }));

    const handleImageUpload = async (file) => {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res  = await fetch('/api/admin/upload/scheme', {
                method: 'POST',
                headers: { Authorization: `Bearer ${tok()}` },
                body: fd,
            });
            const data = await res.json();
            if (data.success) setForm(f => ({ ...f, image: data.url }));
            else setFormError(data.error || 'Gagal upload gambar');
        } catch { setFormError('Terjadi kesalahan saat upload'); }
        finally { setUploading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const res  = await fetch('/api/admin/schemes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal membuat skema'); return; }
            closeModal(); fetchSchemes();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const res  = await fetch(`/api/admin/schemes/${selected.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal mengupdate skema'); return; }
            closeModal(); fetchSchemes();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res  = await fetch(`/api/admin/schemes/${selected.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${tok()}` },
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal menghapus skema'); return; }
            closeModal(); fetchSchemes();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const quickStatus = async (s, newStatus) => {
        const tok_ = tok();
        await fetch(`/api/admin/schemes/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok_}` },
            body: JSON.stringify({ status: newStatus }),
        });
        fetchSchemes();
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
                    <span className="text-white">Skema Sertifikasi</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <span className="material-icons-outlined text-primary text-3xl">schema</span>
                            Skema Sertifikasi Kompetensi
                        </h1>
                        <p className="text-slate-400 mt-1">Total {pagination.total} skema terdaftar</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2.5 rounded-lg font-bold hover:bg-white transition-all">
                        <span className="material-icons-outlined text-lg">add_circle</span>
                        Tambah Skema
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input type="text" placeholder="Cari nama, kode, kategori..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-surface-dark border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="bg-surface-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 min-w-[150px]">
                        <option value="">Semua Status</option>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                    </select>
                </div>

                {/* Cards Grid */}
                {loadingData ? (
                    <div className="flex items-center justify-center py-24">
                        <span className="material-icons-outlined text-primary text-5xl animate-spin">refresh</span>
                    </div>
                ) : schemes.length === 0 ? (
                    <div className="text-center py-24">
                        <span className="material-icons-outlined text-slate-600 text-6xl mb-3">schema</span>
                        <p className="text-slate-500 text-lg">Tidak ada skema ditemukan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {schemes.map(s => {
                            const st   = STATUS_STYLE[s.status] || STATUS_STYLE.draft;
                            const units = Array.isArray(s.competency_units) ? s.competency_units : [];
                            return (
                                <div key={s.id} className="bg-surface-dark border border-white/10 rounded-xl p-6 flex flex-col hover:border-white/20 transition-all">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <span className="inline-block font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded mb-2">
                                                {s.code}
                                            </span>
                                            <h3 className="text-white font-bold text-base leading-snug">{s.name}</h3>
                                        </div>
                                        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>
                                            <span className="material-icons-outlined text-[12px]">{st.icon}</span>
                                            {st.label}
                                        </span>
                                    </div>

                                    {/* Meta */}
                                    <div className="space-y-1.5 mb-4 text-sm">
                                        {s.category && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <span className="material-icons-outlined text-base">category</span>
                                                {s.category}
                                            </div>
                                        )}
                                        {s.level && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <span className="material-icons-outlined text-base">signal_cellular_alt</span>
                                                {s.level}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="material-icons-outlined text-base">schedule</span>
                                            Masa berlaku: {s.duration_months} bulan
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="material-icons-outlined text-base">checklist</span>
                                            {units.length} unit kompetensi
                                        </div>
                                    </div>

                                    {/* Description preview */}
                                    {s.description && (
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
                                            {s.description}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                                        <button onClick={() => openDetail(s)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium transition-all">
                                            <span className="material-icons-outlined text-base">visibility</span>
                                            Detail
                                        </button>
                                        <button onClick={() => openEdit(s)}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit">
                                            <span className="material-icons-outlined text-base">edit</span>
                                        </button>
                                        {s.status !== 'active' && (
                                            <button onClick={() => quickStatus(s, 'active')}
                                                className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all" title="Aktifkan">
                                                <span className="material-icons-outlined text-base">check_circle</span>
                                            </button>
                                        )}
                                        {s.status === 'active' && (
                                            <button onClick={() => quickStatus(s, 'inactive')}
                                                className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all" title="Nonaktifkan">
                                                <span className="material-icons-outlined text-base">pause_circle</span>
                                            </button>
                                        )}
                                        <button onClick={() => openDelete(s)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus">
                                            <span className="material-icons-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8">
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
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <div>
                                <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                    {selected.code}
                                </span>
                                <h2 className="text-xl font-bold text-white mt-2">{selected.name}</h2>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-5">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Kategori', val: selected.category || '—', icon: 'category' },
                                    { label: 'Level',    val: selected.level || '—',    icon: 'signal_cellular_alt' },
                                    { label: 'Masa Berlaku', val: `${selected.duration_months} bulan`, icon: 'schedule' },
                                ].map(item => (
                                    <div key={item.label} className="bg-white/5 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                                            <span className="material-icons-outlined text-sm">{item.icon}</span>
                                            {item.label}
                                        </div>
                                        <p className="text-white font-medium text-sm">{item.val}</p>
                                    </div>
                                ))}
                            </div>

                            {selected.description && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Deskripsi</p>
                                    <p className="text-slate-300 text-sm leading-relaxed">{selected.description}</p>
                                </div>
                            )}

                            {selected.requirements && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Persyaratan</p>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        {selected.requirements.split('\n').map((line, i) => (
                                            <p key={i} className="text-slate-300 text-sm leading-relaxed">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(selected.competency_units) && selected.competency_units.length > 0 && (
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                                        Unit Kompetensi ({selected.competency_units.length})
                                    </p>
                                    <div className="space-y-2">
                                        {selected.competency_units.map((u, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-lg p-3">
                                                <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-primary text-xs font-bold">{i + 1}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium text-sm">{u.name}</p>
                                                    <p className="text-slate-500 text-xs font-mono mt-0.5">{u.code} · {u.standard}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 shrink-0 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium text-sm">
                                Tutup
                            </button>
                            <button onClick={() => { closeModal(); openEdit(selected); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all text-sm">
                                <span className="material-icons-outlined text-base">edit</span>
                                Edit Skema
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MODAL CREATE / EDIT ─── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">{modal === 'create' ? 'add_circle' : 'edit'}</span>
                                {modal === 'create' ? 'Tambah Skema Sertifikasi' : 'Edit Skema Sertifikasi'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={modal === 'create' ? handleCreate : handleEdit}
                            className="p-6 overflow-y-auto space-y-5">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>
                                    {formError}
                                </div>
                            )}

                            {/* Kode & Nama */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Kode Skema <span className="text-red-400">*</span></label>
                                    <input type="text" name="code" value={form.code} onChange={handleChange}
                                        placeholder="SKK-TI-001" required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors font-mono uppercase" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-slate-400 text-sm mb-1.5">Nama Skema <span className="text-red-400">*</span></label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange}
                                        placeholder="cth. Junior Web Developer" required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Deskripsi</label>
                                <textarea name="description" value={form.description} onChange={handleChange}
                                    placeholder="Deskripsi singkat skema sertifikasi..." rows={2}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                            </div>

                            {/* Kategori, Level, Durasi, Status */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-slate-400 text-sm mb-1.5">Kategori</label>
                                    <input type="text" name="category" value={form.category} onChange={handleChange}
                                        placeholder="cth. Teknologi Informasi"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Level</label>
                                    <input type="text" name="level" value={form.level} onChange={handleChange}
                                        placeholder="cth. Level 4 KKNI"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Durasi (bulan)</label>
                                    <input type="number" name="duration_months" value={form.duration_months} onChange={handleChange}
                                        min="1" max="120"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Status</label>
                                    <select name="status" value={form.status} onChange={handleChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors">
                                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Persyaratan */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Persyaratan Peserta</label>
                                <textarea name="requirements" value={form.requirements} onChange={handleChange}
                                    placeholder="1. Persyaratan pertama&#10;2. Persyaratan kedua" rows={3}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors resize-none" />
                            </div>

                            {/* Gambar Skema */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Gambar Skema</label>
                                <div className="flex items-start gap-4">
                                    {form.image ? (
                                        <div className="relative shrink-0">
                                            <img src={form.image} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-white/20" />
                                            <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="material-icons-outlined text-white text-xs">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-lg border border-dashed border-white/20 flex items-center justify-center shrink-0 bg-white/5">
                                            <span className="material-icons-outlined text-slate-600 text-2xl">image</span>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <label className={`flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-lg cursor-pointer transition-all text-sm font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5 text-slate-300'}`}>
                                            {uploading
                                                ? <><span className="material-icons-outlined text-base animate-spin text-primary">refresh</span> Mengupload...</>
                                                : <><span className="material-icons-outlined text-base">upload</span> {form.image ? 'Ganti Gambar' : 'Upload Gambar'}</>
                                            }
                                            <input type="file" accept="image/*" className="hidden" disabled={uploading}
                                                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-600 text-xs">atau ketik path:</span>
                                        </div>
                                        <input type="text" value={form.image} placeholder="cth. /assets/rigger.jpg"
                                            onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors text-sm font-mono" />
                                    </div>
                                </div>
                                <p className="text-slate-600 text-xs mt-1.5">Upload file (JPG/PNG/WEBP, maks 2MB) atau ketik path gambar yang sudah ada di folder <span className="font-mono">/public/</span></p>
                            </div>

                            {/* Unit Kompetensi */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-slate-400 text-sm font-medium">
                                        Unit Kompetensi ({form.competency_units.length})
                                    </label>
                                    <button type="button" onClick={addUnit}
                                        className="flex items-center gap-1 text-primary text-sm hover:text-white transition-colors font-medium">
                                        <span className="material-icons-outlined text-base">add</span>
                                        Tambah Unit
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {form.competency_units.length === 0 && (
                                        <p className="text-slate-600 text-sm text-center py-4 border border-dashed border-white/10 rounded-lg">
                                            Belum ada unit kompetensi. Klik "Tambah Unit" untuk menambahkan.
                                        </p>
                                    )}
                                    {form.competency_units.map((u, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-slate-400 text-xs font-semibold">Unit #{i + 1}</span>
                                                <button type="button" onClick={() => removeUnit(i)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors">
                                                    <span className="material-icons-outlined text-base">close</span>
                                                </button>
                                            </div>
                                            <input type="text" value={u.name}
                                                onChange={e => updateUnit(i, 'name', e.target.value)}
                                                placeholder="Nama unit kompetensi"
                                                className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" value={u.code}
                                                    onChange={e => updateUnit(i, 'code', e.target.value)}
                                                    placeholder="Kode (cth. J.620100.001.01)"
                                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors text-sm font-mono" />
                                                <input type="text" value={u.standard}
                                                    onChange={e => updateUnit(i, 'standard', e.target.value)}
                                                    placeholder="Standar (cth. SKKNI)"
                                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors text-sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-2 sticky bottom-0">
                                <button type="button" onClick={closeModal}
                                    className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium">
                                    Batal
                                </button>
                                <button type="submit" disabled={formLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                    {formLoading && <span className="material-icons-outlined text-base animate-spin">refresh</span>}
                                    {modal === 'create' ? 'Simpan Skema' : 'Update Skema'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── MODAL DELETE ─── */}
            {modal === 'delete' && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-red-400 text-3xl">delete_forever</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Hapus Skema</h2>
                            <p className="text-slate-400 mb-1">Yakin ingin menghapus skema ini?</p>
                            <p className="text-white font-bold">{selected.name}</p>
                            <p className="text-slate-500 text-xs font-mono mt-1 mb-6">{selected.code}</p>
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
                                    {formError}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 transition-all font-medium">
                                    Batal
                                </button>
                                <button onClick={handleDelete} disabled={formLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-bold disabled:opacity-60">
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
