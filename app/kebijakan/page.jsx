const KebijakanMutu = () => {
    return (
        <>
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                        Kebijakan <span className="text-primary italic">Mutu</span>
                    </h1>
                    <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
                    <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed font-light">
                        Membangun kepercayaan melalui standarisasi kompetensi yang ketat, profesional, dan akuntabel sesuai dengan regulasi nasional BNSP.
                    </p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 space-y-24 pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                Komitmen Integritas
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Standar Operasional Berbasis Keunggulan</h2>
                            <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-light">
                                <p>
                                    Lembaga Sertifikasi Profesi (LSP) A3I berkomitmen penuh untuk menyelenggarakan sertifikasi kompetensi kerja yang independen, objektif, dan kredibel guna mendukung daya saing tenaga kerja nasional.
                                </p>
                                <p>
                                    Kebijakan mutu kami adalah memastikan seluruh personil LSP A3I bekerja secara profesional sesuai dengan sistem manajemen mutu untuk menjamin kepuasan pelanggan dan pemangku kepentingan.
                                </p>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                                <span className="material-symbols-outlined text-primary mb-2">balance</span>
                                <p className="text-sm font-semibold text-white">Ketidakberpihakan</p>
                                <p className="text-xs text-slate-400 mt-1">Menjamin objektivitas penuh dalam proses asesmen.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                                <span className="material-symbols-outlined text-primary mb-2">lock</span>
                                <p className="text-sm font-semibold text-white">Kerahasiaan</p>
                                <p className="text-xs text-slate-400 mt-1">Keamanan data asesi dan dokumen lembaga terjaga.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center py-12">
                        <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                            <div className="absolute inset-0 border border-primary/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute inset-10 border border-white/5 rounded-full"></div>

                            {/* Central Circle */}
                            <div className="z-20 w-32 h-32 md:w-40 md:h-40 bg-background-dark rounded-full border border-primary shadow-[0_0_60px_rgba(242,185,13,0.15)] flex flex-col items-center justify-center p-4 relative">
                                <div className="text-primary font-black text-2xl md:text-3xl tracking-tighter">LSP A3I</div>
                                <div className="text-[8px] md:text-[9px] text-white/40 text-center font-bold mt-1 uppercase tracking-widest">Core Values</div>
                            </div>

                            {/* Orbiting Planets */}
                            <div className="absolute inset-0 w-full h-full">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-black/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center mb-2 shadow-xl">
                                        <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
                                    </div>
                                    <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase">Reliable</span>
                                </div>
                                <div className="absolute top-[15%] right-0 translate-x-1/4 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-black/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center mb-2 shadow-xl">
                                        <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                                    </div>
                                    <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase text-center">Quality</span>
                                </div>
                                <div className="absolute bottom-[15%] right-0 translate-x-1/4 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-black/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center mb-2 shadow-xl">
                                        <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
                                    </div>
                                    <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase text-center">Standard</span>
                                </div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-black/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center mb-2 shadow-xl">
                                        <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
                                    </div>
                                    <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase">Integrity</span>
                                </div>
                                <div className="absolute bottom-[15%] left-0 -translate-x-1/4 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-black/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center mb-2 shadow-xl">
                                        <span className="material-symbols-outlined text-primary text-2xl">badge</span>
                                    </div>
                                    <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase">Pro</span>
                                </div>
                                <div className="absolute top-[15%] left-0 -translate-x-1/4 flex flex-col items-center">
                                    <div className="w-14 h-14 bg-black/80 backdrop-blur-md border border-primary/20 rounded-full flex items-center justify-center mb-2 shadow-xl">
                                        <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                                    </div>
                                    <span className="text-white font-bold text-[10px] md:text-xs tracking-widest uppercase">Accountable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="py-24 border-t border-white/5">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-16">
                        <div className="md:w-1/2 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Standarisasi & Kepatuhan</h3>
                                <p className="text-slate-400 leading-relaxed text-lg font-light">
                                    Seluruh proses sertifikasi LSP A3I mengacu secara ketat pada <span className="text-primary font-medium">Pedoman BNSP 201 dan 202</span> serta standar internasional <span className="text-primary font-medium">ISO/IEC 17024</span> untuk memastikan kompetensi yang diakui secara global.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                <div className="h-10 w-32 bg-slate-400 rounded-sm flex items-center justify-center text-[10px] font-black text-black">LOGO BNSP</div>
                                <div className="h-8 w-18 bg-slate-400 rounded-sm flex items-center justify-center text-[10px] font-black text-black p-2">KAN</div>
                                <div className="h-10 w-24 bg-slate-400 rounded-sm flex items-center justify-center text-[10px] font-black text-black">ISO</div>
                            </div>
                        </div>

                        <div className="md:w-1/3 w-full grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-background-dark p-8 text-center">
                                <div className="text-primary font-bold text-3xl mb-1">100%</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Integritas</div>
                            </div>
                            <div className="bg-background-dark p-8 text-center border-l border-white/5">
                                <div className="text-primary font-bold text-3xl mb-1">24/7</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Dukungan</div>
                            </div>
                            <div className="bg-background-dark p-8 text-center border-t border-white/5">
                                <div className="text-primary font-bold text-3xl mb-1">30+</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Asesor</div>
                            </div>
                            <div className="bg-background-dark p-8 text-center border-t border-l border-white/5">
                                <div className="text-primary font-bold text-3xl mb-1">98%</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Kepuasan</div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col items-center text-center py-12 border border-primary/10 rounded-2xl bg-primary/[0.02]">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4">picture_as_pdf</span>
                    <h4 className="text-white font-semibold text-lg mb-2">Dokumen Resmi Kebijakan Mutu</h4>
                    <p className="text-slate-400 text-sm mb-6 max-w-md">Unduh salinan resmi dokumen kebijakan mutu LSP A3I untuk referensi profesional Anda.</p>
                    <button className="flex items-center gap-3 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Download PDF
                    </button>
                </div>
            </main>
        </>
    );
};

export default KebijakanMutu;
