'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const emptyForm = { name: '', position: '', level: 3, display_order: 0, photo: '' };

const LEVEL_LABEL = {
    1: 'Level 1 — Puncak (cth. Dewan Pengarah)',
    2: 'Level 2 — Pimpinan (cth. Ketua LSP)',
    3: 'Level 3 — Manajer / Komite',
};

export default function AdminOrganisasiPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    const [members, setMembers]         = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [modal, setModal]             = useState(null); // null | 'create' | 'edit' | 'delete'
    const [selected, setSelected]       = useState(null);
    const [form, setForm]               = useState(emptyForm);
    const [formError, setFormError]     = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [uploading, setUploading]     = useState(false);

    // Auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) { router.push('/login'); return; }
        if (!loading && user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            router.push('/'); return;
        }
    }, [loading, isAuthenticated, user, router]);

    const tok = () => localStorage.getItem('token');

    const fetchMembers = useCallback(async () => {
        setLoadingData(true);
        try {
            const res  = await fetch('/api/admin/organisasi', { headers: { Authorization: `Bearer ${tok()}` } });
            const data = await res.json();
            if (data.success) setMembers(data.data);
        } catch (e) { console.error(e); }
        finally { setLoadingData(false); }
    }, []);

    useEffect(() => { if (!loading && user) fetchMembers(); }, [loading, user, fetchMembers]);

    // --- CRUD ---
    const openCreate = () => {
        const maxOrder = members.filter(m => m.level === 3).length;
        setForm({ ...emptyForm, display_order: maxOrder });
        setFormError('');
        setModal('create');
    };

    const openEdit = (m) => {
        setSelected(m);
        setForm({
            name: m.name,
            position: m.position,
            level: m.level,
            display_order: m.display_order,
            photo: m.photo || '',
        });
        setFormError('');
        setModal('edit');
    };

    const openDelete = (m) => { setSelected(m); setFormError(''); setModal('delete'); };
    const closeModal = () => { setModal(null); setSelected(null); setFormError(''); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: (name === 'level' || name === 'display_order') ? parseInt(value) || 0 : value }));
    };

    const handleImageUpload = async (file) => {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res  = await fetch('/api/admin/upload/organisasi', {
                method: 'POST',
                headers: { Authorization: `Bearer ${tok()}` },
                body: fd,
            });
            const data = await res.json();
            if (data.success) setForm(f => ({ ...f, photo: data.url }));
            else setFormError(data.error || 'Gagal upload foto');
        } catch { setFormError('Terjadi kesalahan saat upload'); }
        finally { setUploading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const res  = await fetch('/api/admin/organisasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal menambahkan anggota'); return; }
            closeModal(); fetchMembers();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const res  = await fetch(`/api/admin/organisasi/${selected.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal mengupdate anggota'); return; }
            closeModal(); fetchMembers();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const res  = await fetch(`/api/admin/organisasi/${selected.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${tok()}` },
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal menghapus anggota'); return; }
            closeModal(); fetchMembers();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <span className="material-icons-outlined text-primary text-6xl animate-spin">refresh</span>
        </div>
    );

    // Kelompokkan berdasarkan level untuk ditampilkan
    const grouped = members.reduce((acc, m) => {
        (acc[m.level] = acc[m.level] || []).push(m);
        return acc;
    }, {});
    const levels = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    return (
        <div className="min-h-screen bg-background-dark pt-32 pb-20">
            <div className="container-standard">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link>
                    <span className="material-icons-outlined text-base">chevron_right</span>
                    <span className="text-white">Struktur Organisasi</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <span className="material-icons-outlined text-primary text-3xl">account_tree</span>
                            Struktur Organisasi
                        </h1>
                        <p className="text-slate-400 mt-1">Kelola susunan pengurus yang tampil di halaman Profil Lembaga</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2.5 rounded-lg font-bold hover:bg-white transition-all">
                        <span className="material-icons-outlined text-lg">add_circle</span>
                        Tambah Anggota
                    </button>
                </div>

                {/* List */}
                {loadingData ? (
                    <div className="flex items-center justify-center py-24">
                        <span className="material-icons-outlined text-primary text-5xl animate-spin">refresh</span>
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-24">
                        <span className="material-icons-outlined text-slate-600 text-6xl mb-3">account_tree</span>
                        <p className="text-slate-500 text-lg">Belum ada data struktur organisasi</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {levels.map(level => (
                            <div key={level}>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                                    {LEVEL_LABEL[level] || `Level ${level}`}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {grouped[level].map(m => (
                                        <div key={m.id} className="bg-surface-dark border border-white/10 rounded-xl p-5 flex items-center gap-4 hover:border-white/20 transition-all">
                                            {m.photo ? (
                                                <img src={m.photo} alt={m.name} className="w-14 h-14 rounded-full object-cover border border-white/10 shrink-0" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                    <span className="material-icons-outlined text-slate-500">person</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-sm truncate">{m.name}</h3>
                                                <p className="text-slate-400 text-xs truncate">{m.position}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => openEdit(m)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit">
                                                    <span className="material-icons-outlined text-base">edit</span>
                                                </button>
                                                <button onClick={() => openDelete(m)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus">
                                                    <span className="material-icons-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── MODAL CREATE / EDIT ─── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">{modal === 'create' ? 'add_circle' : 'edit'}</span>
                                {modal === 'create' ? 'Tambah Anggota' : 'Edit Anggota'}
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

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Nama <span className="text-red-400">*</span></label>
                                <input type="text" name="name" value={form.name} onChange={handleChange}
                                    placeholder="cth. I Made Karmayoga" required
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Jabatan <span className="text-red-400">*</span></label>
                                <input type="text" name="position" value={form.position} onChange={handleChange}
                                    placeholder="cth. Ketua LSP" required
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Tingkat Hierarki</label>
                                    <select name="level" value={form.level} onChange={handleChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors">
                                        <option value={1}>1 — Puncak</option>
                                        <option value={2}>2 — Pimpinan</option>
                                        <option value={3}>3 — Manajer / Komite</option>
                                        <option value={4}>4 — Staf</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Urutan Tampil</label>
                                    <input type="number" name="display_order" value={form.display_order} onChange={handleChange}
                                        min="0"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors" />
                                </div>
                            </div>
                            <p className="text-slate-600 text-xs -mt-2">Anggota pada tingkat yang sama tampil berjajar, diurutkan dari nilai urutan terkecil.</p>

                            {/* Foto */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Foto</label>
                                <div className="flex items-start gap-4">
                                    {form.photo ? (
                                        <div className="relative shrink-0">
                                            <img src={form.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border border-white/20" />
                                            <button type="button" onClick={() => setForm(f => ({ ...f, photo: '' }))}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="material-icons-outlined text-white text-xs">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full border border-dashed border-white/20 flex items-center justify-center shrink-0 bg-white/5">
                                            <span className="material-icons-outlined text-slate-600 text-2xl">person</span>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <label className={`flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-lg cursor-pointer transition-all text-sm font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5 text-slate-300'}`}>
                                            {uploading
                                                ? <><span className="material-icons-outlined text-base animate-spin text-primary">refresh</span> Mengupload...</>
                                                : <><span className="material-icons-outlined text-base">upload</span> {form.photo ? 'Ganti Foto' : 'Upload Foto'}</>
                                            }
                                            <input type="file" accept="image/*" className="hidden" disabled={uploading}
                                                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                                        </label>
                                        <input type="text" value={form.photo} placeholder="atau ketik path, cth. /assets/karmayoga.jpg"
                                            onChange={e => setForm(f => ({ ...f, photo: e.target.value }))}
                                            className="w-full bg-background-dark border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors text-sm font-mono" />
                                    </div>
                                </div>
                                <p className="text-slate-600 text-xs mt-1.5">Opsional. Maks 2MB (JPG/PNG/WEBP).</p>
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
                                    {modal === 'create' ? 'Simpan' : 'Update'}
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
                            <h2 className="text-xl font-bold text-white mb-2">Hapus Anggota</h2>
                            <p className="text-slate-400 mb-1">Yakin ingin menghapus anggota ini?</p>
                            <p className="text-white font-bold">{selected.name}</p>
                            <p className="text-slate-500 text-xs mt-1 mb-6">{selected.position}</p>
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
