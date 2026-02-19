'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Demo data (replace with real API call) ──────────────────────────────────
const DEMO_CERTIFICATES = {
    '12345/LSP-A3I/2024': {
        nomor: '12345/LSP-A3I/2024',
        nama: 'Budi Santoso',
        skema: 'Operator Mobile Crane',
        tanggalTerbit: '10 Januari 2024',
        tanggalBerakhir: '10 Januari 2027',
        status: 'AKTIF',
        tuk: 'TUK PT. Maju Konstruksi — Jakarta',
        bnsp: 'BNSP-LSP-A3I-001',
    },
    '67890/LSP-A3I/2023': {
        nomor: '67890/LSP-A3I/2023',
        nama: 'Dewi Rahayu',
        skema: 'Teknisi Scaffolding',
        tanggalTerbit: '5 Maret 2023',
        tanggalBerakhir: '5 Maret 2026',
        status: 'AKTIF',
        tuk: 'TUK CV. Bangun Jaya — Surabaya',
        bnsp: 'BNSP-LSP-A3I-002',
    },
    '11111/LSP-A3I/2021': {
        nomor: '11111/LSP-A3I/2021',
        nama: 'Ahmad Fauzi',
        skema: 'Operator Forklift',
        tanggalTerbit: '20 Juli 2021',
        tanggalBerakhir: '20 Juli 2024',
        status: 'KEDALUWARSA',
        tuk: 'TUK PT. Logistik Nusantara — Bekasi',
        bnsp: 'BNSP-LSP-A3I-003',
    },
};

// ── Status badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    if (status === 'AKTIF') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Aktif
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Kedaluwarsa
        </span>
    );
};

// ── Result Card ─────────────────────────────────────────────────────────────
const ResultCard = ({ cert }) => (
    <div className="border border-primary/30 bg-surface-dark rounded-2xl overflow-hidden animate-fade-in">
        {/* header bar */}
        <div className={`h-1.5 w-full ${cert.status === 'AKTIF' ? 'bg-green-500' : 'bg-red-500'}`} />

        <div className="p-8">
            {/* top row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-primary text-xs uppercase tracking-widest font-black mb-1">Nomor Sertifikat</p>
                    <p className="text-white font-black text-xl tracking-tight">{cert.nomor}</p>
                </div>
                <StatusBadge status={cert.status} />
            </div>

            {/* divider */}
            <div className="border-t border-white/8 mb-6" />

            {/* detail grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Detail label="Nama Pemegang" value={cert.nama} icon="person" />
                <Detail label="Skema Sertifikasi" value={cert.skema} icon="workspace_premium" />
                <Detail label="Tanggal Terbit" value={cert.tanggalTerbit} icon="calendar_today" />
                <Detail label="Berlaku Hingga" value={cert.tanggalBerakhir} icon="event_available" />
                <Detail label="TUK Pelaksana" value={cert.tuk} icon="location_on" />
                <Detail label="Nomor Reg. BNSP" value={cert.bnsp} icon="verified" />
            </div>

            {/* footer note */}
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <span className="material-icons-outlined text-primary text-lg mt-0.5">info</span>
                <p className="text-white/50 text-xs leading-relaxed">
                    Sertifikat ini diterbitkan oleh <strong className="text-white/80">LSP A3I</strong> dan telah terverifikasi oleh{' '}
                    <strong className="text-white/80">Badan Nasional Sertifikasi Profesi (BNSP)</strong>. Data diperbarui secara real-time.
                </p>
            </div>
        </div>
    </div>
);

const Detail = ({ label, value, icon }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-icons-outlined text-primary text-[15px]">{icon}</span>
        </div>
        <div>
            <p className="text-white/40 text-[11px] uppercase tracking-widest font-bold mb-0.5">{label}</p>
            <p className="text-white text-sm font-semibold">{value}</p>
        </div>
    </div>
);

// ── Empty / error states ────────────────────────────────────────────────────
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
            <span className="material-icons-outlined text-white/20 text-4xl">search</span>
        </div>
        <p className="text-white/30 font-bold text-lg mb-1">Masukkan Nomor Sertifikat</p>
        <p className="text-white/20 text-sm">Hasil pencarian akan muncul di sini</p>
    </div>
);

const NotFoundState = ({ query }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <span className="material-icons-outlined text-red-400 text-4xl">search_off</span>
        </div>
        <p className="text-white/60 font-bold text-lg mb-1">Sertifikat Tidak Ditemukan</p>
        <p className="text-white/30 text-sm max-w-xs">
            Nomor sertifikat <span className="text-primary font-mono">&ldquo;{query}&rdquo;</span> tidak terdaftar dalam sistem kami.
            Pastikan nomor yang Anda masukkan benar.
        </p>
    </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────
export default function CekSertifikat() {
    const [input, setInput] = useState('');
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);   // null=idle | false=not-found | object=found
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e?.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        setLoading(true);
        setQuery(trimmed);

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 700));

        const found = DEMO_CERTIFICATES[trimmed] ?? false;
        setResult(found);
        setLoading(false);
    };

    return (
        <>
            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative pt-40 pb-28 overflow-hidden">
                {/* background glow */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/6 blur-[120px] rounded-full" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/10 blur-[60px] rounded-full" />
                </div>

                <div className="max-w-3xl mx-auto px-6 text-center">
                    {/* pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/30 bg-primary/5 rounded-full text-primary text-[11px] uppercase tracking-[0.35em] font-black mb-8">
                        <span className="material-icons-outlined text-[14px]">verified_user</span>
                        Sistem Verifikasi Resmi
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
                        Validasi{' '}
                        <span className="text-primary">Sertifikat</span>
                    </h1>
                    <div className="w-24 h-1 bg-primary mx-auto mb-8" />
                    <p className="text-white/50 text-lg leading-relaxed mb-12 max-w-xl mx-auto font-light">
                        Pastikan keaslian sertifikat kompetensi yang diterbitkan oleh{' '}
                        <span className="text-white/80 font-semibold">LSP A3I</span> — Lembaga Sertifikasi Profesi Alat Angkat &amp; Angkut Indonesia.
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                        <div className="relative flex-1">
                            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl pointer-events-none">
                                badge
                            </span>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Masukkan Nomor Sertifikat (contoh: 12345/LSP-A3I/2024)"
                                className="w-full pl-12 pr-4 py-4 bg-surface-dark border border-white/15 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg text-white placeholder-white/25 text-sm outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="flex items-center justify-center gap-2 px-7 py-4 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 shrink-0"
                        >
                            {loading ? (
                                <span className="material-icons-outlined text-xl animate-spin">autorenew</span>
                            ) : (
                                <span className="material-icons-outlined text-xl">search</span>
                            )}
                            {loading ? 'Memeriksa...' : 'Cek Sekarang'}
                        </button>
                    </form>

                    {/* trust badges */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/30 text-xs font-semibold uppercase tracking-widest">
                        {[
                            { icon: 'verified_user', label: 'Terverifikasi BNSP' },
                            { icon: 'workspace_premium', label: 'Sertifikat Resmi' },
                            { icon: 'bolt', label: 'Validasi Real-time' },
                        ].map(({ icon, label }) => (
                            <span key={label} className="flex items-center gap-1.5">
                                <span className="material-icons-outlined text-primary/60 text-base">{icon}</span>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── RESULT PANEL ─────────────────────────────────────────────── */}
            <section className="max-w-3xl mx-auto px-6 pb-24">
                {result === null && !loading && <EmptyState />}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <span className="material-icons-outlined text-primary text-5xl animate-spin">autorenew</span>
                        <p className="text-white/40 text-sm">Memeriksa sertifikat...</p>
                    </div>
                )}
                {result === false && !loading && <NotFoundState query={query} />}
                {result && !loading && <ResultCard cert={result} />}
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
            <section className="border-t border-white/8 py-24 bg-surface-dark/50">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-white/10 rounded-full text-white/40 text-[11px] uppercase tracking-[0.35em] font-black mb-6">
                        <span className="material-icons-outlined text-[14px]">help_outline</span>
                        Panduan
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        Cara Validasi <span className="text-primary">Sertifikat</span>
                    </h2>
                    <div className="w-16 h-1 bg-primary mx-auto mb-4" />
                    <p className="text-white/40 mb-16 text-sm max-w-lg mx-auto">
                        Ikuti langkah-langkah berikut untuk memverifikasi keaslian sertifikat
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                icon: 'find_in_page',
                                title: 'Temukan Nomor',
                                desc: 'Lihat nomor sertifikat yang tertera pada dokumen fisik atau digital sertifikat Anda.',
                            },
                            {
                                step: '02',
                                icon: 'keyboard',
                                title: 'Masukkan Nomor',
                                desc: 'Ketik nomor sertifikat pada kolom pencarian di atas lalu tekan tombol "Cek Sekarang".',
                            },
                            {
                                step: '03',
                                icon: 'task_alt',
                                title: 'Lihat Hasil',
                                desc: 'Sistem akan menampilkan informasi detail dan status keabsahan sertifikat secara real-time.',
                            },
                        ].map(({ step, icon, title, desc }) => (
                            <div
                                key={step}
                                className="group flex flex-col items-center p-8 rounded-2xl border border-white/8 bg-background-dark hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 group-hover:bg-primary/20 flex items-center justify-center transition-all">
                                        <span className="material-icons-outlined text-primary text-2xl">{icon}</span>
                                    </div>
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">
                                        {step}
                                    </span>
                                </div>
                                <h3 className="text-white font-black text-lg uppercase tracking-tight mb-3">{title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed text-center">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DEMO HINT ────────────────────────────────────────────────── */}
            <section className="py-12 max-w-3xl mx-auto px-6">
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <span className="material-icons-outlined text-primary text-2xl shrink-0">lightbulb</span>
                    <div>
                        <p className="text-white font-bold text-sm mb-1">Coba nomor demo</p>
                        <p className="text-white/40 text-xs leading-relaxed">
                            Gunakan nomor berikut untuk mencoba sistem:{' '}
                            {Object.keys(DEMO_CERTIFICATES).map((n, i) => (
                                <span key={n}>
                                    <button
                                        onClick={() => { setInput(n); }}
                                        className="text-primary font-mono hover:underline focus:outline-none"
                                    >
                                        {n}
                                    </button>
                                    {i < Object.keys(DEMO_CERTIFICATES).length - 1 && <span className="text-white/20"> &bull; </span>}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <section className="pb-32 max-w-3xl mx-auto px-6">
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-12 text-center">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <span className="material-icons-outlined text-primary/40 text-5xl mb-4 block">support_agent</span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Butuh Bantuan?</h3>
                    <p className="text-white/40 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                        Jika Anda mengalami kesulitan atau memiliki pertanyaan tentang validasi sertifikat, tim kami siap membantu.
                    </p>
                    <Link
                        href="/kontak"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-lg hover:bg-white transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary/20"
                    >
                        <span className="material-icons-outlined text-lg">mail_outline</span>
                        Hubungi Kami
                    </Link>
                </div>
            </section>
        </>
    );
}
