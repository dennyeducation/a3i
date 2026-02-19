'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

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
        { name: 'Kontak', path: '/kontak' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 glass-nav h-20 transition-all duration-300">
            <div className="container-standard h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded transition-transform group-hover:scale-105">
                            <span className="material-icons-outlined text-background-dark font-bold text-2xl">engineering</span>
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tighter text-primary block leading-none">LSP A3I</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Professional Certification</span>
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
                        <div className="pl-4">
                            <button className="bg-primary text-background-dark px-6 py-2 rounded font-bold hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/10">
                                Login
                            </button>
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
                        <button className="bg-primary text-background-dark px-6 py-3 rounded font-bold w-full uppercase tracking-widest text-sm mt-4 hover:bg-white transition-colors">
                            Login Area
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
