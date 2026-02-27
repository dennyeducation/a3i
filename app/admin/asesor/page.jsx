'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STATUS_LIST = ['Aktif', 'Tidak Aktif'];

const EMPTY_FORM = { nama: '', no_registrasi: '', bidang: 'Alat Angkat dan Angkut', status: 'Aktif' };

export default function AdminAsesorPage() {
    const [list,       setList]       = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [search,     setSearch]     = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [loading,    setLoading]    = useState(true);
    const [modal,      setModal]      = useState(null); // 'create' | 'edit' | 'delete'
    const [selected,   setSelected]   = useState(null);
    const [form,       setForm]       = useState(EMPTY_FORM);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');

    const fetchList = useCallback(async (page = 1, s = search, st = filterStatus) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const q = new URLSearchParams({ page, limit: 15, search: s, status: st }).toString();
            const res  = await fetch(`/api/admin/asesor?${q}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) { setList(data.data); setPagination(data.pagination); }
        } finally { setLoading(false); }
    }, [search, filterStatus]);

    useEffect(() => { fetchList(1); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchList(1, search, filterStatus); };

    const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
    const openEdit   = (a)  => { setSelected(a); setForm({ nama: a.nama, no_registrasi: a.no_registrasi || '', bidang: a.bidang, status: a.status }); setError(''); setModal('edit'); };
    const openDelete = (a)  => { setSelected(a); setModal('delete'); };
    const closeModal = ()   => { setModal(null); setSelected(null); setError(''); };

    const handleSave = async () => {
        if (!form.nama.trim()) { setError('Nama asesor wajib diisi'); return; }
        setSaving(true); setError('');
        try {
            const token  = localStorage.getItem('token');
            const url    = modal === 'create' ? '/api/admin/asesor' : `/api/admin/asesor/${selected.id}`;
            const method = modal === 'create' ? 'POST' : 'PUT';
            const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(form) });
            const data   = await res.json();
            if (!res.ok) { setError(data.error || 'Terjadi kesalahan'); return; }
            closeModal();
            fetchList(pagination.page, search, filterStatus);
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/asesor/${selected.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            closeModal();
            fetchList(pagination.page, search, filterStatus);
        } finally { setSaving(false); }
    };

    const F = (label, key, opts = {}) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}{opts.required && <span className="text-red-400 ml-1">*</span>}</label>
            {opts.select ? (
                <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                    {opts.options.map(o => <option key={o}>{o}</option>)}
                </select>
            ) : (
                <input type="text" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder={opts.placeholder || ''} />
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <span className="material-icons-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Kelola Asesor</h1>
                    <p className="text-gray-400 text-sm">Manajemen daftar asesor kompetensi LSP A3I</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
                        <input type="text" placeholder="Cari nama atau no. registrasi..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); fetchList(1, search, e.target.value); }}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                        <option value="">Semua Status</option>
                        {STATUS_LIST.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Cari</button>
                </form>
                <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <span className="material-icons-outlined text-lg">add</span>Tambah Asesor
                </button>
            </div>

            <div className="mb-3 text-sm text-gray-400">Total: <span className="text-white font-medium">{pagination.total}</span> asesor</div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-800/50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase w-12">No</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Nama Asesor</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">No. Registrasi</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Bidang</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500">
                                    <span className="material-icons-outlined animate-spin text-3xl">refresh</span>
                                    <p className="mt-2 text-sm">Memuat data...</p>
                                </td></tr>
                            ) : list.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500">
                                    <span className="material-icons-outlined text-5xl mb-2 block">person_search</span>
                                    <p className="text-sm">Belum ada data asesor</p>
                                </td></tr>
                            ) : list.map((a, i) => (
                                <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 text-gray-500 font-mono text-sm">
                                        {String((pagination.page - 1) * 15 + i + 1).padStart(2, '0')}
                                    </td>
                                    <td className="px-4 py-3 text-white font-medium text-sm">{a.nama}</td>
                                    <td className="px-4 py-3 text-gray-400 font-mono text-sm">{a.no_registrasi || <span className="text-gray-600">—</span>}</td>
                                    <td className="px-4 py-3 text-gray-300 text-sm">{a.bidang}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                            a.status === 'Aktif'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}>{a.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(a)} title="Edit"
                                                className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors">
                                                <span className="material-icons-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => openDelete(a)} title="Hapus"
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <span className="material-icons-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                        <p className="text-xs text-gray-400">Halaman {pagination.page} dari {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <button disabled={pagination.page <= 1} onClick={() => fetchList(pagination.page - 1, search, filterStatus)}
                                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700">← Prev</button>
                            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchList(pagination.page + 1, search, filterStatus)}
                                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create / Edit */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-800">
                            <h2 className="text-lg font-bold text-white">{modal === 'create' ? 'Tambah Asesor' : 'Edit Asesor'}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
                            {F('Nama Asesor', 'nama', { required: true, placeholder: 'Nama lengkap asesor' })}
                            {F('No. Registrasi (MET)', 'no_registrasi', { placeholder: 'MET.000.000000 0000' })}
                            {F('Bidang / Sektor', 'bidang', { placeholder: 'Alat Angkat dan Angkut' })}
                            {F('Status', 'status', { select: true, options: STATUS_LIST })}
                        </div>
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800">
                            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Batal</button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="material-icons-outlined animate-spin text-sm">refresh</span>}
                                {modal === 'create' ? 'Tambah' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {modal === 'delete' && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <span className="material-icons-outlined text-red-400 text-3xl">person_remove</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Hapus Asesor</h3>
                                <p className="text-gray-400 text-sm mt-1">Hapus <span className="text-white font-medium">{selected.nama}</span> dari daftar asesor?</p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={closeModal} className="flex-1 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:text-white">Batal</button>
                                <button onClick={handleDelete} disabled={saving}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                                    {saving ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
