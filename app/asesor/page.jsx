'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

const AsesorTuk = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBidang, setFilterBidang] = useState('Semua Bidang');
    const [currentPage, setCurrentPage] = useState(1);

    const assessors = [
        { no: '01', name: 'Kusnanto', reg: 'MET.000.000008 2006', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '02', name: 'Ahmat Asrul Darus', reg: 'MET.000.002091 2017', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '03', name: 'Junaidi', reg: 'MET.000.003026 2021', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '04', name: 'Maryanto', reg: 'MET.000.004764 2017', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '05', name: 'Adhy Kusumo Prabowo', reg: 'MET.000.000086 2021', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '06', name: 'Afrida Fadillah Junaedi', reg: 'MET.000.003007 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '07', name: 'Akmal Ahmad', reg: 'MET.000.003016 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '08', name: 'Aziz Asmauna', reg: 'MET.000.003004 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '09', name: 'Bayu Baroto Yuwono', reg: 'MET.000.003012 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '10', name: 'Boy Putra Anggara Prasetyo', reg: 'MET.000.003009 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '11', name: 'Budiarto', reg: 'MET.000.000968 2021', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '12', name: 'Chandra Yuliadi Hatmoko', reg: 'MET.000.003003 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '13', name: 'Djoko Laras', reg: 'MET.000.003020 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '14', name: 'Haris Wafi Auzan', reg: 'MET.000.003006 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '15', name: 'Ia Kurniawan', reg: 'MET.000.003014 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '16', name: 'Irsad', reg: 'MET.000.003005 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '17', name: 'Lukman Hakim', reg: 'MET.000.003015 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '18', name: 'Muhammad Ichsan', reg: 'MET.000.003011 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '19', name: 'Muhammad Kasiyyanto Assahid', reg: 'MET.000.003013 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '20', name: 'Musryanto', reg: 'MET.000.003018 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '21', name: 'Nasaruddin', reg: 'MET.000.003017 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '22', name: 'Nindya Bayu Narotama', reg: 'MET.000.003008 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '23', name: 'Salamuddin', reg: 'MET.000.003010 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '24', name: 'Solikin', reg: 'MET.000.000802 2009', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '25', name: 'Supahing', reg: 'MET.000.003021 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
        { no: '26', name: 'Wiji Lestari', reg: 'MET.000.003019 2024', field: 'Alat Angkat dan Angkut', status: 'Aktif' },
    ];

    const bidangOptions = ['Semua Bidang', ...Array.from(new Set(assessors.map((a) => a.field)))];

    const filteredAssessors = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return assessors.filter((a) => {
            const matchesSearch = !term || a.name.toLowerCase().includes(term) || a.reg.toLowerCase().includes(term);
            const matchesBidang = filterBidang === 'Semua Bidang' || a.field === filterBidang;
            return matchesSearch && matchesBidang;
        });
    }, [searchTerm, filterBidang]);

    const totalPages = Math.ceil(filteredAssessors.length / ITEMS_PER_PAGE);
    const paginatedAssessors = filteredAssessors.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterBidang = (e) => {
        setFilterBidang(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
            <section className="relative h-[55vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Tim Asesor LSP A3I"
                        className="w-full h-full object-cover opacity-20 grayscale"
                        src="/assets/asesora3i.jpg"
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

            {/* Team Photo Section */}
            <section className="max-w-7xl mx-auto px-6 pt-16 pb-4">
                <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-2xl">
                    {/* Info bar above the photo */}
                    <div className="bg-[#111] px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/20">
                        <div>
                            <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Foto Bersama</p>
                            <h2 className="text-white text-xl md:text-2xl font-extrabold leading-tight">Tim Asesor <span className="text-primary">LSP A3I</span></h2>
                            <p className="text-zinc-500 text-xs mt-1">Tenaga penguji kompeten bersertifikat BNSP yang berdedikasi tinggi.</p>
                        </div>
                        <div className="flex gap-8 text-center flex-shrink-0">
                            <div>
                                <span className="text-primary text-3xl font-black block">26</span>
                                <span className="text-zinc-400 text-xs uppercase tracking-widest">Asesor Aktif</span>
                            </div>
                            <div className="w-px bg-primary/20"></div>
                            <div>
                                <span className="text-primary text-3xl font-black block">BNSP</span>
                                <span className="text-zinc-400 text-xs uppercase tracking-widest">Tersertifikasi</span>
                            </div>
                        </div>
                    </div>
                    {/* Full photo — no overlay so people are clearly visible */}
                    <img
                        alt="Tim Asesor LSP A3I"
                        className="w-full max-h-[520px] object-cover object-center"
                        src="/assets/asesora3i.jpg"
                    />
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
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <select
                                className="bg-deep-black border border-neutral-gold/50 text-white px-4 py-3.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-w-[180px] text-sm appearance-none cursor-pointer"
                                value={filterBidang}
                                onChange={handleFilterBidang}
                            >
                                {bidangOptions.map((opt) => (
                                    <option key={opt}>{opt}</option>
                                ))}
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
                                    {paginatedAssessors.length > 0 ? paginatedAssessors.map((asesor) => (
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
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-zinc-500 text-sm">
                                                Tidak ada asesor yang sesuai dengan pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-sm text-zinc-500">
                            Menampilkan <span className="text-white font-medium">{paginatedAssessors.length}</span> dari <span className="text-white font-medium">{filteredAssessors.length}</span> Asesor
                        </p>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >Sebelumnya</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`px-4 py-2 text-sm rounded-lg font-bold transition-colors ${currentPage === page ? 'bg-primary border border-primary text-deep-black' : 'border border-primary/20 hover:bg-primary/10 text-zinc-400'}`}
                                        onClick={() => setCurrentPage(page)}
                                    >{page}</button>
                                ))}
                                <button
                                    className="px-4 py-2 text-sm border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >Berikutnya</button>
                            </div>
                        )}
                    </div>
                </section>

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
