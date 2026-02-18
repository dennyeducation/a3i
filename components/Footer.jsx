'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[#080808] border-t border-primary/20 pt-24 pb-12">
            <div className="container-standard">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
                                <span className="material-icons-outlined text-background-dark font-bold text-2xl">engineering</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">LSP A3I</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            Lembaga Sertifikasi Profesi yang berfokus pada keunggulan, integritas, dan keselamatan dalam industri alat angkat dan angkut di Indonesia.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-background-dark transition-all duration-300">
                                <span className="material-icons-outlined text-xl">facebook</span>
                            </a>
                            <a href="#" className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-background-dark transition-all duration-300">
                                <span className="material-icons-outlined text-xl">language</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs">Tautan Cepat</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {[
                                { name: 'Beranda', path: '/' },
                                { name: 'Profil Lembaga', path: '/profil' },
                                { name: 'Skema Sertifikasi', path: '/sertifikasi' },
                                { name: 'Daftar Asesor', path: '/asesor' },
                                { name: 'Pusat Bantuan', path: '/kontak' },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.path} className="text-slate-500 hover:text-primary transition-colors flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs">Kontak & Lokasi</h4>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <span className="material-icons-outlined text-primary mr-4 text-xl mt-0.5">location_on</span>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Jl. Industri Profesional No. 45, Jakarta Selatan, 12345, Indonesia
                                </p>
                            </div>
                            <div className="flex items-center">
                                <span className="material-icons-outlined text-primary mr-4 text-xl">phone</span>
                                <p className="text-slate-500 text-sm font-bold">(021) 555-0123</p>
                            </div>
                            <div className="flex items-center">
                                <span className="material-icons-outlined text-primary mr-4 text-xl">mail</span>
                                <p className="text-slate-500 text-sm">info@lspa3i.or.id</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription */}
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-[0.2em] text-xs">Berlangganan</h4>
                        <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">
                            Dapatkan informasi skema terbaru & jadwal uji kompetensi langsung di email Anda.
                        </p>
                        <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Alamat Email"
                                className="bg-white/5 border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-600 transition-all"
                            />
                            <button className="bg-primary text-background-dark py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg shadow-primary/5">
                                Berlangganan
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-600 text-[11px] font-medium tracking-wide text-center md:text-left">
                        © 2024 LSP A3I - Lembaga Sertifikasi Profesi Alat Angkat dan Angkut Indonesia.
                    </p>
                    <div className="flex space-x-8 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
