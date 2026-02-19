const TukPage = () => {
    const tuks = [
        { code: 'DELTA', logo: '/assets/logodelta.png', name: 'PT. Delta Indonesia Pranenggar', type: 'Consultant & Training Provider', loc: 'Indonesia' },
        { code: 'PROSYD', logo: '/assets/logoprosys.png', name: 'PT. Prosyd Bina Solusindo', type: 'Training & Certification', loc: 'Indonesia' },
        { code: 'FSI', logo: '/assets/logofire.png', name: 'PT. Fire Safety Indonesia', type: 'Safety Training', loc: 'Indonesia' },
        { code: 'GLOBAL', logo: '/assets/logoglobal.png', name: 'PT. Global Safety', type: 'Safety Solutions', loc: 'Indonesia' },
        { code: 'STS', logo: '/assets/logosafety.png', name: 'PT. Safety Training Solusindo', type: 'Safety Training', loc: 'Indonesia' },
    ];

    return (
        <>
            {/* Hero */}
            <section className="relative h-[55vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/80 to-deep-black/50"></div>
                </div>
                <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
                    <span className="inline-block py-1.5 px-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-8">Mitra Resmi LSP A3I</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Tempat Uji <span className="text-primary">Kompetensi</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        LSP A3I menjalin kemitraan strategis dengan fasilitas industri terkemuka untuk menyelenggarakan sertifikasi di lokasi yang memenuhi standar teknis nasional.
                    </p>
                </div>
            </section>

            <main className="relative z-20 pb-24">
                {/* TUK Cards */}
                <section className="max-w-7xl mx-auto px-6 -mt-8 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {tuks.map((tuk) => (
                            <div key={tuk.code} className="group bg-deep-black border border-primary/20 p-8 rounded-xl hover:border-primary/60 transition-all duration-500 flex flex-col items-center text-center shadow-lg hover:-translate-y-1">
                                <div className="w-full aspect-video mb-8 relative flex items-center justify-center bg-white rounded-lg border border-primary/5 group-hover:border-primary/20 transition-all overflow-hidden p-4">
                                    <img
                                        src={tuk.logo}
                                        alt={`Logo ${tuk.name}`}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{tuk.name}</h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-6">{tuk.type}</p>
                                <div className="mt-auto pt-6 border-t border-primary/10 w-full flex items-center justify-center gap-2 text-zinc-400 text-xs">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {tuk.loc}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Peta Sebaran */}
                <section className="max-w-7xl mx-auto px-6">
                    <div className="h-[450px] rounded-2xl overflow-hidden border border-primary/20 relative group shadow-2xl">
                        <div className="absolute inset-0 bg-deep-black/40 group-hover:bg-deep-black/20 transition-all z-10"></div>
                        <img
                            alt="Map of Indonesia"
                            className="w-full h-full object-cover grayscale brightness-[0.3]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyzaMtdlpUnQO3gjOUpQ-7IRjL2e7bTnToLRlSQGOmxqVNjuzfDkT-emryctKQRz0cE0hu-sreJzkO49Ej0DCxkq3WeMH4uyFHle9frBYBXjSu6ubD7AEnYgoJv9xeMBV5iHFStuE4g1iwptn2_V4Yl5BRFP6betH5tPyE16FQ9WgvdIk4nCHXzlYA2XHoI0RgG_OChsgO4FAnRsf001zO12XF40RPLjlDqOPuM1Zm5lCz1J_vi6V0yTWTzim_1MkN8h9jTLsEcUJc"
                        />
                        <div className="absolute bottom-8 left-8 right-8 md:right-auto z-20 bg-deep-black/90 p-8 rounded-xl border border-primary/20 backdrop-blur-md max-w-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">distance</span>
                                <h4 className="text-xl font-bold">Jangkauan Nasional</h4>
                            </div>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                Kami hadir di lebih dari 12 kota besar di seluruh wilayah Indonesia untuk mempermudah akses sertifikasi bagi tenaga kerja industri nasional.
                            </p>
                            <button className="w-full md:w-auto px-6 py-3 bg-primary/10 border border-primary/30 text-primary font-bold text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-deep-black transition-all">
                                LIHAT PETA SEBARAN <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default TukPage;
