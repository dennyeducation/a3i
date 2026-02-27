'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const PENDIDIKAN = ['SD','SMP','SMA','SMK','D1','D2','D3','D4','S1','S2','S3'];
const KELAMIN    = [{ value: 'LAKI_LAKI', label: 'Laki-laki' }, { value: 'PEREMPUAN', label: 'Perempuan' }];

const STATUS_COLORS = {
    active:    'bg-green-500/20 text-green-400 border border-green-500/30',
    pending:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    expired:   'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    revoked:   'bg-red-500/20 text-red-400 border border-red-500/30',
    submitted: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    reviewing: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    approved:  'bg-green-500/20 text-green-400 border border-green-500/30',
    rejected:  'bg-red-500/20 text-red-400 border border-red-500/30',
    completed: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
};

const EMPTY_FORM = {
    full_name: '', email: '', username: '', password: '',
    no_identitas: '', jenis_kelamin: '', tanggal_lahir: '',
    tingkat_pendidikan: '', alamat: '', no_whatsapp: '', perusahaan: '', photo: '',
};

export default function AdminAsesiPage() {
    const [asesiList, setAsesiList]   = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [search, setSearch]         = useState('');
    const [loading, setLoading]       = useState(true);
    const [modal, setModal]           = useState(null); // 'create' | 'edit' | 'detail' | 'delete'
    const [selected, setSelected]     = useState(null);
    const [detail, setDetail]         = useState(null);
    const [detailTab, setDetailTab]   = useState('profil');
    const [form, setForm]             = useState(EMPTY_FORM);
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview]     = useState('');
    const fileInputRef = useRef(null);

    const fetchAsesi = useCallback(async (page = 1, s = search) => {
        setLoading(true);
        try {
            const q = new URLSearchParams({ page, limit: 10, search: s }).toString();
            const res = await fetch(`/api/admin/asesi?${q}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setAsesiList(data.data);
                setPagination(data.pagination);
            }
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchAsesi(1, search); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchAsesi(1, search);
    };

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setPhotoPreview('');
        setError('');
        setModal('create');
    };

    const openEdit = (asesi) => {
        setSelected(asesi);
        setForm({
            full_name:          asesi.full_name       || '',
            email:              asesi.email            || '',
            username:           asesi.username         || '',
            password:           '',
            no_identitas:       asesi.no_identitas     || '',
            jenis_kelamin:      asesi.jenis_kelamin    || '',
            tanggal_lahir:      asesi.tanggal_lahir ? asesi.tanggal_lahir.split('T')[0] : '',
            tingkat_pendidikan: asesi.tingkat_pendidikan || '',
            alamat:             asesi.alamat            || '',
            no_whatsapp:        asesi.no_whatsapp       || '',
            perusahaan:         asesi.perusahaan        || '',
            photo:              asesi.photo             || '',
        });
        setPhotoPreview(asesi.photo || '');
        setError('');
        setModal('edit');
    };

    const handlePhotoChange = async (file) => {
        if (!file) return;
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) { setError('Hanya file gambar (JPG, PNG, WEBP, GIF) yang diizinkan'); return; }
        if (file.size > 2 * 1024 * 1024) { setError('Ukuran file maksimal 2MB'); return; }

        // Preview lokal sebelum upload
        const reader = new FileReader();
        reader.onload = e => setPhotoPreview(e.target.result);
        reader.readAsDataURL(file);

        // Upload ke server
        setUploadingPhoto(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res  = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: fd });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Gagal mengupload foto'); return; }
            setForm(f => ({ ...f, photo: data.url }));
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handlePhotoChange(file);
    };

    const openDetail = async (asesi) => {
        setSelected(asesi);
        setDetail(null);
        setDetailTab('profil');
        setModal('detail');
        const res  = await fetch(`/api/admin/asesi/${asesi.id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setDetail(data.data);
    };

    const openDelete = (asesi) => {
        setSelected(asesi);
        setModal('delete');
    };

    const closeModal = () => { setModal(null); setSelected(null); setDetail(null); setError(''); };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const url    = modal === 'create' ? '/api/admin/asesi' : `/api/admin/asesi/${selected.id}`;
            const method = modal === 'create' ? 'POST' : 'PUT';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Terjadi kesalahan'); return; }
            closeModal();
            fetchAsesi(pagination.page, search);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await fetch(`/api/admin/asesi/${selected.id}`, { method: 'DELETE', credentials: 'include' });
            closeModal();
            fetchAsesi(pagination.page, search);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (asesi) => {
        await fetch(`/api/admin/asesi/${asesi.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ is_active: !asesi.is_active }),
        });
        fetchAsesi(pagination.page, search);
    };

    const F = (label, key, type = 'text', opts = {}) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}{opts.required && <span className="text-red-400 ml-1">*</span>}</label>
            {opts.textarea ? (
                <textarea
                    rows={3}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder={opts.placeholder || ''}
                />
            ) : opts.select ? (
                <select
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                    <option value="">-- Pilih --</option>
                    {opts.options.map(o => (
                        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder={opts.placeholder || ''}
                    required={opts.required}
                />
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
                    <h1 className="text-2xl font-bold text-white">Kelola Asesi</h1>
                    <p className="text-gray-400 text-sm">Manajemen peserta sertifikasi LSP A3I</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Cari nama, email, perusahaan, no. identitas..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Cari
                    </button>
                </form>
                <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <span className="material-icons-outlined text-lg">person_add</span>
                    Tambah Asesi
                </button>
            </div>

            {/* Stats */}
            <div className="mb-4 text-sm text-gray-400">
                Total: <span className="text-white font-medium">{pagination.total}</span> asesi
            </div>

            {/* Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-800/50">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Asesi</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Identitas</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Kontak</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Perusahaan</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Sertifikat</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Pendaftaran</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-500">
                                    <span className="material-icons-outlined animate-spin text-3xl">refresh</span>
                                    <p className="mt-2 text-sm">Memuat data...</p>
                                </td></tr>
                            ) : asesiList.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-gray-500">
                                    <span className="material-icons-outlined text-5xl mb-2 block">people_outline</span>
                                    <p className="text-sm">Belum ada asesi terdaftar</p>
                                </td></tr>
                            ) : asesiList.map(a => (
                                <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                    {/* Asesi */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                                                {a.photo
                                                    ? <img src={a.photo} alt="" className="w-full h-full object-cover" />
                                                    : a.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{a.full_name}</p>
                                                <p className="text-gray-400 text-xs">{a.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Identitas */}
                                    <td className="px-4 py-3">
                                        <p className="text-white text-sm">{a.no_identitas || <span className="text-gray-600 text-xs">—</span>}</p>
                                        <p className="text-gray-400 text-xs">
                                            {a.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : a.jenis_kelamin === 'PEREMPUAN' ? 'Perempuan' : '—'}
                                            {a.tingkat_pendidikan ? ` · ${a.tingkat_pendidikan}` : ''}
                                        </p>
                                    </td>
                                    {/* Kontak */}
                                    <td className="px-4 py-3">
                                        <p className="text-white text-sm">{a.no_whatsapp || <span className="text-gray-600 text-xs">—</span>}</p>
                                        <p className="text-gray-400 text-xs">{a.alamat ? a.alamat.substring(0, 30) + (a.alamat.length > 30 ? '…' : '') : '—'}</p>
                                    </td>
                                    {/* Perusahaan */}
                                    <td className="px-4 py-3 text-sm text-gray-300">{a.perusahaan || <span className="text-gray-600 text-xs">—</span>}</td>
                                    {/* Sertifikat aktif */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                                            {a.sertifikat_aktif}
                                        </span>
                                    </td>
                                    {/* Pendaftaran aktif */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30">
                                            {a.pendaftaran_aktif}
                                        </span>
                                    </td>
                                    {/* Status */}
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleToggleActive(a)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${a.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30'}`}>
                                            {a.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    {/* Aksi */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openDetail(a)} title="Detail"
                                                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                                <span className="material-icons-outlined text-lg">visibility</span>
                                            </button>
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
                        <p className="text-xs text-gray-400">
                            Halaman {pagination.page} dari {pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button disabled={pagination.page <= 1}
                                onClick={() => fetchAsesi(pagination.page - 1, search)}
                                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors">
                                ← Prev
                            </button>
                            <button disabled={pagination.page >= pagination.totalPages}
                                onClick={() => fetchAsesi(pagination.page + 1, search)}
                                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors">
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===================== MODAL CREATE / EDIT ===================== */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-800">
                            <h2 className="text-lg font-bold text-white">
                                {modal === 'create' ? 'Tambah Asesi Baru' : 'Edit Data Asesi'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-5 space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
                            )}

                            {/* Seksi akun */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Akun</p>
                            <div className="grid grid-cols-2 gap-4">
                                {F('Nama Lengkap', 'full_name', 'text', { required: true, placeholder: 'Nama lengkap asesi' })}
                                {F('Email', 'email', 'email', { required: true, placeholder: 'email@domain.com' })}
                                {F('Username', 'username', 'text', { placeholder: 'Otomatis dari email jika kosong' })}
                                {F(modal === 'create' ? 'Password' : 'Password Baru (opsional)', 'password', 'password', { placeholder: modal === 'create' ? 'Default: Asesi@123' : 'Kosongkan jika tidak diubah' })}
                            </div>

                            {/* Seksi identitas */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Identitas</p>
                            <div className="grid grid-cols-2 gap-4">
                                {F('No. Identitas (NIK/KTP)', 'no_identitas', 'text', { placeholder: '16 digit NIK' })}
                                {F('Jenis Kelamin', 'jenis_kelamin', 'text', { select: true, options: KELAMIN })}
                                {F('Tanggal Lahir', 'tanggal_lahir', 'date')}
                                {F('Tingkat Pendidikan', 'tingkat_pendidikan', 'text', { select: true, options: PENDIDIKAN })}
                            </div>

                            {/* Seksi kontak & pekerjaan */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Kontak & Pekerjaan</p>
                            <div className="grid grid-cols-2 gap-4">
                                {F('No. WhatsApp', 'no_whatsapp', 'text', { placeholder: '08xxxxxxxxxx' })}
                                {F('Perusahaan / Instansi', 'perusahaan', 'text', { placeholder: 'Nama perusahaan atau instansi' })}
                            </div>
                            {F('Alamat', 'alamat', 'text', { textarea: true, placeholder: 'Alamat lengkap domisili' })}

                            {/* Upload Foto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Foto Profil</label>
                                <div className="flex gap-4 items-start">
                                    {/* Preview */}
                                    <div className="w-20 h-20 rounded-xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-icons-outlined text-gray-600 text-3xl">person</span>
                                        )}
                                    </div>
                                    {/* Drop zone */}
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={e => e.preventDefault()}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 border-2 border-dashed border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all min-h-[80px]"
                                    >
                                        {uploadingPhoto ? (
                                            <>
                                                <span className="material-icons-outlined animate-spin text-blue-400 text-2xl">refresh</span>
                                                <p className="text-xs text-gray-400">Mengupload...</p>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-icons-outlined text-gray-500 text-2xl">cloud_upload</span>
                                                <p className="text-xs text-gray-400 text-center">
                                                    <span className="text-blue-400 font-medium">Klik</span> atau drag &amp; drop foto<br />
                                                    <span className="text-gray-600">JPG, PNG, WEBP, GIF · Maks. 2MB</span>
                                                </p>
                                            </>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={e => handlePhotoChange(e.target.files[0])}
                                        />
                                    </div>
                                    {/* Tombol hapus foto */}
                                    {photoPreview && (
                                        <button type="button"
                                            onClick={() => { setPhotoPreview(''); setForm(f => ({ ...f, photo: '' })); }}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                                            title="Hapus foto">
                                            <span className="material-icons-outlined text-lg">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800">
                            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Batal</button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="material-icons-outlined animate-spin text-sm">refresh</span>}
                                {modal === 'create' ? 'Buat Asesi' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== MODAL DETAIL ===================== */}
            {modal === 'detail' && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                    {detail?.photo
                                        ? <img src={detail.photo} alt="" className="w-full h-full object-cover" />
                                        : selected.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{selected.full_name}</h2>
                                    <p className="text-gray-400 text-xs">{selected.email}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-800">
                            {[
                                { key: 'profil',      label: 'Profil',       icon: 'person' },
                                { key: 'sertifikat',  label: 'Sertifikat',   icon: 'verified' },
                                { key: 'pendaftaran', label: 'Pendaftaran',  icon: 'assignment' },
                            ].map(t => (
                                <button key={t.key} onClick={() => setDetailTab(t.key)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        detailTab === t.key
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-300'
                                    }`}>
                                    <span className="material-icons-outlined text-base">{t.icon}</span>
                                    {t.label}
                                    {t.key === 'sertifikat' && detail && (
                                        <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{detail.sertifikat?.length}</span>
                                    )}
                                    {t.key === 'pendaftaran' && detail && (
                                        <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{detail.pendaftaran?.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="overflow-y-auto p-5 flex-1">
                            {!detail ? (
                                <div className="flex items-center justify-center py-12 text-gray-500">
                                    <span className="material-icons-outlined animate-spin text-3xl">refresh</span>
                                </div>
                            ) : detailTab === 'profil' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoField label="No. Identitas"       value={detail.no_identitas} />
                                        <InfoField label="Jenis Kelamin"       value={detail.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : detail.jenis_kelamin === 'PEREMPUAN' ? 'Perempuan' : null} />
                                        <InfoField label="Tanggal Lahir"       value={detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : null} />
                                        <InfoField label="Tingkat Pendidikan"  value={detail.tingkat_pendidikan} />
                                        <InfoField label="No. WhatsApp"        value={detail.no_whatsapp} />
                                        <InfoField label="Perusahaan"          value={detail.perusahaan} />
                                        <InfoField label="Status Akun"         value={detail.is_active ? 'Aktif' : 'Nonaktif'} valueClass={detail.is_active ? 'text-green-400' : 'text-red-400'} />
                                        <InfoField label="Bergabung"           value={new Date(detail.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })} />
                                    </div>
                                    <InfoField label="Alamat" value={detail.alamat} full />
                                </div>
                            ) : detailTab === 'sertifikat' ? (
                                <div className="space-y-3">
                                    {detail.sertifikat?.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="material-icons-outlined text-4xl block mb-2">verified_outlined</span>
                                            <p className="text-sm">Belum ada sertifikat</p>
                                        </div>
                                    ) : detail.sertifikat?.map(s => (
                                        <div key={s.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-white font-medium text-sm">{s.certification_name}</p>
                                                    {s.scheme_name && <p className="text-gray-400 text-xs mt-0.5">{s.scheme_name}</p>}
                                                    {s.certification_number && (
                                                        <p className="text-gray-500 text-xs mt-1 font-mono">{s.certification_number}</p>
                                                    )}
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[s.status] || STATUS_COLORS.pending}`}>
                                                    {s.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                {s.issued_date && <span>Terbit: {new Date(s.issued_date).toLocaleDateString('id-ID')}</span>}
                                                {s.expiry_date && <span>Berlaku: {new Date(s.expiry_date).toLocaleDateString('id-ID')}</span>}
                                                {s.score !== null && <span>Nilai: {s.score}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {detail.pendaftaran?.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <span className="material-icons-outlined text-4xl block mb-2">assignment_outlined</span>
                                            <p className="text-sm">Belum ada pendaftaran</p>
                                        </div>
                                    ) : detail.pendaftaran?.map(p => (
                                        <div key={p.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-white font-medium text-sm">{p.scheme_name || p.certification_type}</p>
                                                    {p.reviewer_name && <p className="text-gray-400 text-xs mt-0.5">Reviewer: {p.reviewer_name}</p>}
                                                    {p.notes && <p className="text-gray-500 text-xs mt-1 italic">{p.notes}</p>}
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[p.status] || STATUS_COLORS.submitted}`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                <span>Daftar: {new Date(p.application_date).toLocaleDateString('id-ID')}</span>
                                                {p.review_date && <span>Review: {new Date(p.review_date).toLocaleDateString('id-ID')}</span>}
                                            </div>
                                            {p.rejection_reason && (
                                                <p className="text-red-400 text-xs mt-2 bg-red-500/10 rounded-lg px-3 py-2">
                                                    Alasan penolakan: {p.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800">
                            <button onClick={() => { closeModal(); setTimeout(() => openEdit(selected), 10); }}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors">
                                <span className="material-icons-outlined text-base">edit</span>
                                Edit
                            </button>
                            <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== MODAL DELETE ===================== */}
            {modal === 'delete' && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <span className="material-icons-outlined text-red-400 text-3xl">person_remove</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Hapus Asesi</h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Hapus <span className="text-white font-medium">{selected.full_name}</span>?
                                    Semua data terkait (sertifikat, pendaftaran) akan ikut terhapus.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full">
                                <button onClick={closeModal} className="flex-1 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
                                    Batal
                                </button>
                                <button onClick={handleDelete} disabled={saving}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
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

function InfoField({ label, value, full, valueClass }) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-sm ${valueClass || 'text-white'}`}>{value || <span className="text-gray-600">—</span>}</p>
        </div>
    );
}
