'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuth();

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => {
        return pathname === path ? 'text-primary border-b-2 border-primary' : 'text-slate-300 hover:text-primary';
    };

    const navLinks = [
        { name: 'Beranda', path: '/' },
        { name: 'Profil', path: '/profil' },
        { name: 'Kebijakan', path: '/kebijakan' },
        { name: 'Sertifikasi', path: '/sertifikasi' },
        { name: 'Asesor', path: '/asesor' },
        { name: 'TUK', path: '/tuk' },
        { name: 'Dokumentasi', path: '/dokumentasi' },
        { name: 'Kontak', path: '/kontak' },
    ];

    const isCekSertifikat = pathname === '/cek-sertifikat';

    return (
        <header className="fixed top-0 w-full z-50 glass-nav h-20 transition-all duration-300">
            <div className="container-standard h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="bg-white rounded-md p-1 flex-shrink-0 transition-transform group-hover:scale-105">
                            <Image
                                src="/assets/logoa3i.png"
                                alt="LSP A3I"
                                width={80}
                                height={32}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </div>
                        <div className="leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-white block">A3I</span>
                            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Certification</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center h-full">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                className={`${isActive(link.path)} h-full flex items-center transition-colors duration-200 font-medium text-sm lg:text-base`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {/* Cek Sertifikat CTA + User Profile */}
                        <div className="pl-2 flex items-center gap-3">
                            <Link
                                href="/cek-sertifikat"
                                className={`flex items-center gap-1.5 px-4 py-1.5 border rounded text-sm font-bold transition-all ${
                                    isCekSertifikat
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-primary/40 text-primary hover:bg-primary/10 hover:border-primary'
                                }`}
                            >
                                <span className="material-icons-outlined text-[16px]">verified_user</span>
                                Cek Sertifikat
                            </Link>
                            {isAuthenticated() ? (
                                <div className="relative" ref={profileMenuRef}>
                                    {/* Profile Button */}
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
                                    >
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                            <span className="material-icons-outlined text-primary text-lg">person</span>
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <p className="text-white font-bold text-sm">{user?.full_name || user?.username}</p>
                                            <p className="text-slate-400 text-xs capitalize">{user?.role?.toLowerCase()}</p>
                                        </div>
                                        <span className="material-icons-outlined text-slate-400 text-lg">
                                            {isProfileMenuOpen ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-surface-dark border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 animate-fade-in-down">
                                            {/* User Info */}
                                            <div className="p-4 border-b border-white/10 bg-white/5">
                                                <p className="text-white font-bold">{user?.full_name || user?.username}</p>
                                                <p className="text-slate-400 text-sm">{user?.email}</p>
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                                                        {user?.role}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                                                    <Link
                                                        href="/admin"
                                                        onClick={() => setIsProfileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-purple-400 transition-colors"
                                                    >
                                                        <span className="material-icons-outlined text-lg">admin_panel_settings</span>
                                                        <span className="font-medium">Admin Panel</span>
                                                    </Link>
                                                )}

                                                <Link
                                                    href="/profile/edit"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-icons-outlined text-lg">edit</span>
                                                    <span className="font-medium">Edit Profile</span>
                                                </Link>

                                                <Link
                                                    href="/profile/settings"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-primary transition-colors"
                                                >
                                                    <span className="material-icons-outlined text-lg">settings</span>
                                                    <span className="font-medium">Settings</span>
                                                </Link>
                                            </div>

                                            {/* Logout Button */}
                                            <div className="p-2 border-t border-white/10">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        logout();
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                                                >
                                                    <span className="material-icons-outlined text-lg">logout</span>
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/login" className="bg-primary text-background-dark px-6 py-2 rounded font-bold hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/10">
                                    Login
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            className="text-primary p-2 focus:outline-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="material-icons-outlined text-3xl">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-surface-dark border-b border-white/10 shadow-2xl animate-fade-in-down">
                    <div className="flex flex-col p-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                className="text-slate-300 hover:text-primary py-2 border-b border-white/5 font-medium transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/cek-sertifikat"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2 text-primary py-2 border-b border-white/5 font-bold transition-colors"
                        >
                            <span className="material-icons-outlined text-[18px]">verified_user</span>
                            Cek Sertifikat
                        </Link>
                        {isAuthenticated() ? (
                            <>
                                {/* User Info Card */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 my-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                            <span className="material-icons-outlined text-primary text-xl">person</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{user?.full_name || user?.username}</p>
                                            <p className="text-slate-400 text-sm">{user?.email}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/30">
                                        {user?.role}
                                    </span>
                                </div>

                                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 py-2 border-b border-white/5 font-medium transition-colors"
                                    >
                                        <span className="material-icons-outlined text-[18px]">admin_panel_settings</span>
                                        Admin Panel
                                    </Link>
                                )}

                                <Link
                                    href="/profile/edit"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2 text-slate-300 hover:text-primary py-2 border-b border-white/5 font-medium transition-colors"
                                >
                                    <span className="material-icons-outlined text-[18px]">edit</span>
                                    Edit Profile
                                </Link>

                                <Link
                                    href="/profile/settings"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-2 text-slate-300 hover:text-primary py-2 border-b border-white/5 font-medium transition-colors"
                                >
                                    <span className="material-icons-outlined text-[18px]">settings</span>
                                    Settings
                                </Link>

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/40 text-red-400 px-6 py-3 rounded-lg font-bold w-full mt-4 hover:bg-red-500/20 hover:border-red-500 transition-colors"
                                >
                                    <span className="material-icons-outlined text-[18px]">logout</span>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="bg-primary text-background-dark px-6 py-3 rounded font-bold w-full uppercase tracking-widest text-sm mt-4 hover:bg-white transition-colors text-center block"
                            >
                                Login Area
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
