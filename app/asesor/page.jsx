'use client';

import { useState } from 'react';

const AsesorTuk = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBidang, setFilterBidang] = useState('Semua Bidang');

    const assessors = [
        { no: '01', name: 'Bambang Wijaya, S.T., M.T.', reg: 'MET.000.001234 2023', field: 'Teknik Alat Berat & Manufaktur', status: 'Aktif' },
        { no: '02', name: 'Ir. H. Sudirman Putra', reg: 'MET.000.005678 2022', field: 'Manajemen Produksi Industri', status: 'Aktif' },
        { no: '03', name: 'Diana Lestari, M.Eng', reg: 'MET.000.009101 2023', field: 'Instrumen dan Kontrol Otomasi', status: 'Aktif' },
        { no: '04', name: 'Ahmad Faisal Rahman', reg: 'MET.000.003456 2021', field: 'Sistem Hidrolik & Pneumatik', status: 'Aktif' },
        { no: '05', name: 'Siti Aminah Zahra', reg: 'MET.000.007890 2024', field: 'Kesehatan & Keselamatan Kerja (K3)', status: 'Aktif' },
    ];

    const tuks = [
        { code: 'DELTA', name: 'PT. Delta Global Industri', type: 'Industrial Solutions', loc: 'Jakarta Utara' },
        { code: 'PROSYD', name: 'PT. Prosyd Synergy Pratama', type: 'Engineering & Training', loc: 'Bekasi, Jawa Barat', italic: true },
        { code: 'AMTA', name: 'Akademi Manufaktur Indonesia', type: 'Technical Academy', loc: 'Tangerang' },
        { code: 'KAI', name: 'PT. Karya Abadi Indonesia', type: 'Construction & Energy', loc: 'Surabaya' },
    ];

    return (
        <>
            <section className="relative h-[55vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Industrial Engineering Team"
                        className="w-full h-full object-cover opacity-20 grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV3lOXK7dFJxlhyhyFyGjBZcMTwyPJ1tpq1QBfWgCsCEiDNdGmNDHZ0OO8LFs7g7QlvgcTy7zrFV03NEm7gMcge0Hh_KvKhvQQ0vBOBzyXvPF9_qgvRCjNCWz8pVsISnhQwajTmtLa3DYLLGul6vY1nIvdfnXWRrSdBlEjjuRKJZZ9O-FZdKBgO7Lhw015MemvqvZZsuJLKwcVMhrJ9BZ0gu0Utt-6HsJ4tnbmsjKnNwEbR1mjiltKY71jtGaAeRoarBLOhFGbxUjj"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/80 to-transparent"></div>
                </div>
                <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
                    <span className="inline-block py-1.5 px-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-8">Direktori Kompetensi</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        26 <span className="gold-gradient-text">Asesor</span> Kompetensi
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        Tenaga ahli profesional yang tersertifikasi oleh BNSP untuk menjamin standar kualitas kompetensi industri Alat-Alat Industri Indonesia secara profesional dan objektif.
                    </p>
                </div>
            </section>

            <main className="relative z-20 pb-24">
                <section className="max-w-7xl mx-auto px-6 -mt-16">
                    <div className="bg-[#111] border border-primary/15 p-6 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center mb-12">
                        <div className="relative flex-grow w-full">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">search</span>
                            <input
                                type="text"
                                placeholder="Cari nama asesor atau nomor registrasi..."
                                className="w-full bg-deep-black border border-neutral-gold/50 text-white pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-zinc-600 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <select
                                className="bg-deep-black border border-neutral-gold/50 text-white px-4 py-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-w-[180px] text-sm appearance-none cursor-pointer"
                                value={filterBidang}
                                onChange={(e) => setFilterBidang(e.target.value)}
                            >
                                <option>Semua Bidang</option>
                                <option>Teknik Mesin</option>
                                <option>Kelistrikan</option>
                                <option>Manajemen</option>
                            </select>
                            <button className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined">filter_list</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-xl border border-primary/20 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-primary/10">
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20 w-20">No</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20">Nama Asesor</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20">No. Registrasi (MET)</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20">Sektor / Bidang</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/10">
                                    {assessors.map((asesor) => (
                                        <tr key={asesor.no} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-8 py-5 text-zinc-500 font-mono text-sm">{asesor.no}</td>
                                            <td className="px-8 py-5 font-semibold group-hover:text-primary transition-colors text-zinc-100 text-sm">{asesor.name}</td>
                                            <td className="px-8 py-5 text-zinc-400 font-mono text-sm">{asesor.reg}</td>
                                            <td className="px-8 py-5 text-zinc-400 text-sm">{asesor.field}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                                                    {asesor.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-sm text-zinc-500">Menampilkan <span className="text-white font-medium">5</span> dari <span className="text-white font-medium">26</span> Asesor</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-zinc-400">Sebelumnya</button>
                            <button className="px-4 py-2 text-sm bg-primary border border-primary text-deep-black font-bold rounded-lg">1</button>
                            <button className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-zinc-400">2</button>
                            <button className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-zinc-400">3</button>
                            <button className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-zinc-400">Berikutnya</button>
                        </div>
                    </div>
                </section>

                <section className="mt-32 pt-24 border-t border-primary/10">
                    <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Tempat Uji <span className="text-primary">Kompetensi (TUK)</span> Sewaktu</h2>
                        <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
                        <p className="text-zinc-400 max-w-3xl mx-auto text-base leading-relaxed">
                            LSP A3I menjalin kemitraan strategis dengan fasilitas industri terkemuka untuk menyelenggarakan sertifikasi di lokasi yang memenuhi standar teknis nasional.
                        </p>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tuks.map((tuk) => (
                            <div key={tuk.code} className="group bg-deep-black border border-primary/20 p-8 rounded-xl hover:border-primary/60 transition-all duration-500 flex flex-col items-center text-center shadow-lg hover:-translate-y-1">
                                <div className="w-full aspect-video mb-8 relative flex items-center justify-center bg-[#111] rounded-lg border border-primary/5 group-hover:border-primary/20 transition-all">
                                    <span className={`text-primary font-black text-3xl tracking-tighter ${tuk.italic ? 'italic' : ''}`}>{tuk.code}</span>
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

                <section className="max-w-7xl mx-auto px-6 mt-32">
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

export default AsesorTuk;
