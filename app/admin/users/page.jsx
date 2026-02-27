'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const ROLES = ['ASESI', 'ASESOR', 'ADMIN', 'SUPERADMIN'];

const emptyForm = {
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'USER',
    is_active: true,
};

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    // List state
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalUsers: 0 });
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modal state
    const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Auth guard
    useEffect(() => {
        if (!loading && !isAuthenticated()) { router.push('/login'); return; }
        if (!loading && user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            router.push('/'); return;
        }
    }, [loading, isAuthenticated, user, router]);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({ page, limit: 10 });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);

            const res = await fetch(`/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setPagination(data.pagination);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUsers(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => { if (!loading && user) fetchUsers(); }, [loading, user, fetchUsers]);

    // Reset page on filter change
    useEffect(() => { setPage(1); }, [search, roleFilter]);

    // --- CRUD handlers ---
    const openCreate = () => { setForm(emptyForm); setFormError(''); setModal('create'); };

    const openEdit = (u) => {
        setSelectedUser(u);
        setForm({ username: u.username, email: u.email, password: '', full_name: u.full_name || '', role: u.role, is_active: u.is_active });
        setFormError('');
        setModal('edit');
    };

    const openDelete = (u) => { setSelectedUser(u); setModal('delete'); };

    const closeModal = () => { setModal(null); setSelectedUser(null); setFormError(''); };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const token = localStorage.getItem('token');
            const body = { username: form.username, email: form.email, password: form.password, full_name: form.full_name, role: form.role };
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal membuat pengguna'); return; }
            closeModal();
            fetchUsers();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        try {
            const token = localStorage.getItem('token');
            const body = { username: form.username, email: form.email, full_name: form.full_name, role: form.role, is_active: form.is_active };
            if (form.password) body.password = form.password;
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal mengupdate pengguna'); return; }
            closeModal();
            fetchUsers();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.error || 'Gagal menghapus pengguna'); return; }
            closeModal();
            fetchUsers();
        } catch { setFormError('Terjadi kesalahan'); }
        finally { setFormLoading(false); }
    };

    const toggleActive = async (u) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/admin/users/${u.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ is_active: !u.is_active }),
        });
        fetchUsers();
    };

    const roleBadge = (role) => {
        const map = {
            SUPERADMIN: 'bg-red-500/20 text-red-400 border-red-500/40',
            ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
            ASESOR: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
            ASESI: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        };
        return map[role] || map.USER;
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
            <div className="container-standard">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin Panel</Link>
                    <span className="material-icons-outlined text-base">chevron_right</span>
                    <span className="text-white">Kelola Pengguna</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <span className="material-icons-outlined text-primary text-3xl">manage_accounts</span>
                            Kelola Pengguna
                        </h1>
                        <p className="text-slate-400 mt-1">Total {pagination.totalUsers} pengguna terdaftar</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-primary text-background-dark px-5 py-2.5 rounded-lg font-bold hover:bg-white transition-all"
                    >
                        <span className="material-icons-outlined text-lg">person_add</span>
                        Tambah Pengguna
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Cari nama, email, username..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-surface-dark border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="bg-surface-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors min-w-[140px]"
                    >
                        <option value="">Semua Role</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden">
                    {loadingUsers ? (
                        <div className="flex items-center justify-center py-20">
                            <span className="material-icons-outlined text-primary text-5xl animate-spin">refresh</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-icons-outlined text-slate-600 text-6xl mb-3">group_off</span>
                            <p className="text-slate-500 text-lg">Tidak ada pengguna ditemukan</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Pengguna</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Username</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Role</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Status</th>
                                            <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm">Terdaftar</th>
                                            <th className="text-right px-6 py-4 text-slate-400 font-semibold text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-white/3 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="material-icons-outlined text-primary text-base">person</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{u.full_name || '—'}</p>
                                                            <p className="text-slate-400 text-xs">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300 text-sm">{u.username}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleBadge(u.role)}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleActive(u)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                                            u.is_active
                                                                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                                                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-sm">
                                                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEdit(u)}
                                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title="Edit"
                                                        >
                                                            <span className="material-icons-outlined text-base">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => openDelete(u)}
                                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                            title="Hapus"
                                                        >
                                                            <span className="material-icons-outlined text-base">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-white/5">
                                {users.map(u => (
                                    <div key={u.id} className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                    <span className="material-icons-outlined text-primary">person</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{u.full_name || u.username}</p>
                                                    <p className="text-slate-400 text-xs">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                                    <span className="material-icons-outlined text-base">edit</span>
                                                </button>
                                                <button onClick={() => openDelete(u)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                    <span className="material-icons-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${roleBadge(u.role)}`}>{u.role}</span>
                                            <button
                                                onClick={() => toggleActive(u)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                                    u.is_active ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                {u.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                            <span className="text-slate-500 text-xs">
                                                {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-slate-400 text-sm">
                            Halaman {pagination.page} dari {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-surface-dark border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-icons-outlined text-base">chevron_left</span>
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                                .map((p, idx, arr) => (
                                    <>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                                            <span key={`dots-${p}`} className="text-slate-500 px-1">…</span>
                                        )}
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                                p === page
                                                    ? 'bg-primary text-background-dark font-bold'
                                                    : 'bg-surface-dark border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    </>
                                ))
                            }
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="p-2 bg-surface-dark border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="material-icons-outlined text-base">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Modal Create/Edit ─── */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-lg shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">
                                    {modal === 'create' ? 'person_add' : 'edit'}
                                </span>
                                {modal === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={modal === 'create' ? handleCreate : handleEdit} className="p-6 space-y-4">
                            {formError && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                                    <span className="material-icons-outlined text-base">error</span>
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleFormChange}
                                        placeholder="Nama lengkap"
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Username <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleFormChange}
                                        placeholder="username"
                                        required
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">Email <span className="text-red-400">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleFormChange}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm mb-1.5">
                                    Password {modal === 'edit' && <span className="text-slate-500">(kosongkan jika tidak diubah)</span>}
                                    {modal === 'create' && <span className="text-red-400"> *</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleFormChange}
                                    placeholder={modal === 'edit' ? '••••••••' : 'Password baru'}
                                    required={modal === 'create'}
                                    className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Role</label>
                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleFormChange}
                                        className="w-full bg-background-dark border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                {modal === 'edit' && (
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-1.5">Status</label>
                                        <label className="flex items-center gap-3 cursor-pointer mt-3">
                                            <div
                                                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-white/10'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                            </div>
                                            <span className={`text-sm font-medium ${form.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                                {form.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </label>
                                    </div>
                                )}
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
                                    {modal === 'create' ? 'Buat Pengguna' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Modal Delete ─── */}
            {modal === 'delete' && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-dark border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-outlined text-red-400 text-3xl">delete_forever</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Hapus Pengguna</h2>
                            <p className="text-slate-400 mb-1">Yakin ingin menghapus pengguna ini?</p>
                            <p className="text-white font-bold">{selectedUser.full_name || selectedUser.username}</p>
                            <p className="text-slate-400 text-sm mb-6">{selectedUser.email}</p>

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
