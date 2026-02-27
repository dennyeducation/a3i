'use client';

import { useState, useEffect } from 'react';

const SkemaSertifikasi = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sertifikasi')
            .then(r => r.json())
            .then(d => { if (d.success) setSchemes(d.data); })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <section className="max-w-7xl mx-auto px-6 mb-24 text-center pt-32">
                <div className="inline-flex items-center gap-3 px-5 py-2 border border-primary/30 bg-primary/5 rounded-full text-primary text-[11px] uppercase tracking-[0.4em] font-black mb-8">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Official Certification Schemes
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-tight">
                    Skema Sertifikasi <span className="text-primary">Kompetensi</span>
                </h2>
                <div className="w-32 h-1.5 bg-primary mx-auto mb-10"></div>
                <p className="text-white/60 max-w-3xl mx-auto font-light text-xl leading-relaxed">
                    LSP A3I menyelenggarakan sertifikasi kompetensi kerja di sektor alat berat dan konstruksi sesuai dengan standar nasional yang diakui oleh BNSP dan Kementerian Ketenagakerjaan.
                </p>
            </section>

            <section className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="material-icons-outlined text-primary text-5xl animate-spin">refresh</span>
                        <p className="text-white/40 text-sm">Memuat data skema...</p>
                    </div>
                ) : schemes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="material-icons-outlined text-white/20 text-6xl">schema</span>
                        <p className="text-white/40">Belum ada skema sertifikasi aktif.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-20 gap-x-12">
                        {schemes.map((scheme) => (
                            <div key={scheme.id} className="flex flex-col items-center group">
                                <div className="w-56 h-56 rounded-full border-[6px] border-primary/30 p-2 mb-8 group-hover:border-primary transition-all duration-400 aspect-square group-hover:shadow-[0_0_25px_rgba(242,185,13,0.4)]">
                                    <div className="w-full h-full rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                                        {scheme.image ? (
                                            <img
                                                alt={scheme.name}
                                                className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                                                src={scheme.image}
                                            />
                                        ) : (
                                            <span className="material-icons-outlined text-primary/30 text-6xl group-hover:text-primary/60 transition-colors">construction</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-white font-black text-2xl uppercase text-center mb-2 tracking-tight group-hover:text-primary transition-colors">{scheme.name}</h3>
                                <p className="text-primary/60 text-[11px] font-black tracking-[0.2em] uppercase mb-6">{scheme.category || 'Skema Sertifikasi'}</p>
                                <div className="bg-white/5 border border-white/10 group-hover:border-primary/40 rounded-xl p-5 text-center w-full transition-all">
                                    <p className="text-white text-[13px] leading-relaxed uppercase font-bold mb-1">{scheme.name}</p>
                                    <p className="text-primary text-xs font-medium italic">{scheme.level || scheme.code}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="mt-40 max-w-7xl mx-auto px-6 text-center pb-32">
                <div className="bg-gradient-to-b from-primary/15 to-transparent border border-primary/20 p-16 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    <h3 className="text-3xl font-black text-white uppercase mb-6 tracking-widest">Pendaftaran Sertifikasi</h3>
                    <p className="text-white/50 mb-12 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        Siap meningkatkan standar profesionalisme dan kompetensi Anda? Hubungi tim kami sekarang untuk proses pendaftaran sertifikat BNSP.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <button className="px-10 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-sm hover:bg-white transition-all transform hover:scale-105 shadow-xl shadow-primary/20">
                            Daftar Sekarang
                        </button>
                        <button className="px-10 py-4 border-2 border-primary/40 text-primary font-black uppercase tracking-widest rounded-sm hover:bg-primary/10 hover:border-primary transition-all">
                            Unduh Katalog
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SkemaSertifikasi;
