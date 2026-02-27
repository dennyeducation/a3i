'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

const AsesorTuk = () => {
    const [searchTerm,   setSearchTerm]   = useState('');
    const [filterBidang, setFilterBidang] = useState('Semua Bidang');
    const [currentPage,  setCurrentPage]  = useState(1);
    const [assessors,    setAssessors]    = useState([]);
    const [bidangList,   setBidangList]   = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [total,        setTotal]        = useState(0);

    const fetchAsesor = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                search: searchTerm,
                bidang: filterBidang === 'Semua Bidang' ? '' : filterBidang,
            }).toString();
            const res  = await fetch(`/api/asesor?${q}`);
            const data = await res.json();
            if (data.success) {
                setAssessors(data.data);
                setTotal(data.total);
                if (data.bidangList?.length) setBidangList(data.bidangList);
            }
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterBidang]);

    useEffect(() => {
        fetchAsesor();
        setCurrentPage(1);
    }, [fetchAsesor]);

    const totalPages = Math.ceil(assessors.length / ITEMS_PER_PAGE);
    const paginated  = assessors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            <section className="relative h-[55vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <img alt="Tim Asesor LSP A3I" className="w-full h-full object-cover opacity-20 grayscale" src="/assets/asesora3i.jpg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/80 to-transparent"></div>
                </div>
                <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
                    <span className="inline-block py-1.5 px-4 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-8">Direktori Kompetensi</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        <span className="gold-gradient-text">{total}</span> Asesor Kompetensi
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                        Tenaga ahli profesional yang tersertifikasi oleh BNSP untuk menjamin standar kualitas kompetensi industri Alat-Alat Industri Indonesia secara profesional dan objektif.
                    </p>
                </div>
            </section>

            {/* Team Photo */}
            <section className="max-w-7xl mx-auto px-6 pt-16 pb-4">
                <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
                    <div className="bg-[#111] px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/20">
                        <div>
                            <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Foto Bersama</p>
                            <h2 className="text-white text-xl md:text-2xl font-extrabold leading-tight">Tim Asesor <span className="text-primary">LSP A3I</span></h2>
                            <p className="text-zinc-500 text-xs mt-1">Tenaga penguji kompeten bersertifikat BNSP yang berdedikasi tinggi.</p>
                        </div>
                        <div className="flex gap-8 text-center flex-shrink-0">
                            <div>
                                <span className="text-primary text-3xl font-black block">{total}</span>
                                <span className="text-zinc-400 text-xs uppercase tracking-widest">Asesor Aktif</span>
                            </div>
                            <div className="w-px bg-primary/20"></div>
                            <div>
                                <span className="text-primary text-3xl font-black block">BNSP</span>
                                <span className="text-zinc-400 text-xs uppercase tracking-widest">Tersertifikasi</span>
                            </div>
                        </div>
                    </div>
                    <img alt="Tim Asesor LSP A3I" className="w-full max-h-[520px] object-cover object-center" src="/assets/asesora3i.jpg" />
                </div>
            </section>

            <main className="relative z-20 pb-24">
                <section className="max-w-7xl mx-auto px-6 -mt-16">
                    {/* Search & Filter */}
                    <div className="bg-[#111] border border-primary/15 p-6 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center mb-12">
                        <div className="relative flex-grow w-full">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">search</span>
                            <input
                                type="text"
                                placeholder="Cari nama asesor atau nomor registrasi..."
                                className="w-full bg-deep-black border border-neutral-gold/50 text-white pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-zinc-600 text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-deep-black border border-neutral-gold/50 text-white px-4 py-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px] text-sm appearance-none cursor-pointer"
                            value={filterBidang}
                            onChange={e => setFilterBidang(e.target.value)}
                        >
                            <option>Semua Bidang</option>
                            {bidangList.map(b => <option key={b}>{b}</option>)}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-[#0a0a0a] rounded-xl border border-primary/20 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-primary/10">
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20 w-16">No</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20">Nama Asesor</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20">No. Registrasi (MET)</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20">Sektor / Bidang</th>
                                        <th className="px-8 py-5 text-primary font-bold uppercase text-[11px] tracking-[0.2em] border-b border-primary/20 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/10">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-8 py-12 text-center text-zinc-500 text-sm">
                                            <span className="material-icons-outlined animate-spin text-3xl block mb-2 text-primary/40">refresh</span>
                                            Memuat data...
                                        </td></tr>
                                    ) : paginated.length === 0 ? (
                                        <tr><td colSpan={5} className="px-8 py-12 text-center text-zinc-500 text-sm">
                                            Tidak ada asesor yang sesuai dengan pencarian.
                                        </td></tr>
                                    ) : paginated.map((a, i) => (
                                        <tr key={a.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-8 py-5 text-zinc-500 font-mono text-sm">
                                                {String((currentPage - 1) * ITEMS_PER_PAGE + i + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-8 py-5 font-semibold group-hover:text-primary transition-colors text-zinc-100 text-sm">{a.nama}</td>
                                            <td className="px-8 py-5 text-zinc-400 font-mono text-sm">{a.no_registrasi || '—'}</td>
                                            <td className="px-8 py-5 text-zinc-400 text-sm">{a.bidang}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                    a.status === 'Aktif'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                }`}>{a.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-sm text-zinc-500">
                            Menampilkan <span className="text-white font-medium">{paginated.length}</span> dari <span className="text-white font-medium">{assessors.length}</span> Asesor
                        </p>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                                    className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 text-zinc-400 disabled:opacity-40">Sebelumnya</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 text-sm rounded-lg font-bold transition-colors ${currentPage === page ? 'bg-primary border border-primary text-deep-black' : 'border border-primary/20 hover:bg-primary/10 text-zinc-400'}`}>
                                        {page}
                                    </button>
                                ))}
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                                    className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 text-zinc-400 disabled:opacity-40">Berikutnya</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* TUK CTA */}
                <section className="mt-20 pt-12 border-t border-primary/10">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#111] border border-primary/15 p-8 rounded-xl">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Tempat Uji <span className="text-primary">Kompetensi (TUK)</span></h3>
                            <p className="text-zinc-400 text-sm">Lihat daftar mitra TUK resmi dan sebaran lokasi uji kompetensi LSP A3I.</p>
                        </div>
                        <Link href="/tuk" className="flex-shrink-0 px-6 py-3 bg-primary/10 border border-primary/30 text-primary font-bold text-xs tracking-widest flex items-center gap-3 hover:bg-primary hover:text-deep-black transition-all rounded-lg">
                            LIHAT HALAMAN TUK <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
};

export default AsesorTuk;
