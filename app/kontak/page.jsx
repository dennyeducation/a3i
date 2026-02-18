'use client';

import { useState } from 'react';

const DokumentasiKontak = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const galleryImages = [
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDT3j9jCbdA7wmWiG1FfkLi8ho2Gjk007Pgsz-5vi3kiUoZ11lrdptCzX6m0k-3NQGJd3rtRwrJWoIXXMkco_CFEYCG0furY7CcwWLyACwXpnF6lI26ZgasfOTtXw3kVAqxaBO4mJM7h34SqAW0YMtbdjHCbEugLa9p8q5MWvr8hQ01mBbQtmvgr3KJztPYVp4cMPlfXms3Q_8ZTuHf-imQ-AirUSjYDFVAwFHNVipK7EmBKEIUpxtpiZMDkivXhHEx7sFQOE_DDJlY", label: "Sesi Teori - Bekasi 2023" },
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_svh_JAwnf6K07dYp0woXGWIZ2ZcjksXSiQ-m-ZbqGlh7MNcPHC5gliBMa0xZ_WqvxV-CY-P8rXmHpL9A4p_Qznizph4EuRUvzHctFZwSai9MjcyoJWms8KVL06QEdMvJk0bUFqOfHkUcDTWcrrzwGmd0D1ksdZCVrzKEKAISpYTyvWu0Ecgi8DnwR_-Ydg1JxU-vc6i76WjXgNVCZA4tH2nP50bVsnNIEUvKn5stmfs2pchmHOvsJOTni1veWTZRNokqnd-mtG0d", label: "Evaluasi Kinerja Praktik" },
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCskSi7xREx7e24b4NdEmHJNlMnXUoSbbmGDFKn4883uvlT6Wz6IenpzZelkZGJ-xltLsBNUe944Mnz6RqgKJEMJDQnoGA8D8nxhYJ6-mOba7wgsVzwXmqFhcDAA3LFrsRp9sJWwnqBQFVPt9DA5s6ucc00PRnmfdmTmcsQAeiX_5b5Md9liN1vRdDJLaZELJOIcDAc6kAlkGnVRh0Wm5rhmX2yqdBD2B8jV3fw3_9JeH31NyJpNrGv0QIjShJ58_uGTY4SSM0tU5qT", label: "Observasi Lapangan" },
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwjECKLlXHQW19YWhDeX_8FtVvYRjGgpmHaTn_HHWZzutbN6ZJmcNEKzXUTVLyY8jnDf6_qGPhGvRSxCtkh0-rUVLgwNQITFOLlTJqf6hGjVluOC8IF7HFu8xIF6YkNLLhPYprFgidkNUGSHtJB2hgp1V066SVIDpHTClY0epypFV1iT9lMnPlUjQGRTadK-7Fq_rwKniq9ut1jLbHMSRKlpSK1aQTl_9t01RGDYizRkj4RZx7PvoJ9v8ucSIdwoXCsN_qKC9KN_rq", label: "Penutupan Sesi Ujian" }
    ];

    const auditImages = [
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOfteReNYt4mdyQHx36gdAnj5YgUGzYfx4crqZE9DpGavwxVuEe_HMiWvatkX9AsQIz55sZ0OJkSOIH5q0JzSfqbdkaT5U2e4sYHGyYoVx3gKde4CoeUOn2keVzL-9DLbH016BgrLi15B1dgZAl-p_9_ZNkPxqepXkVX9tCROjq3fPOUQU21cAtFZsz-cWmn9l9oPZzahcEDdIkotTfRwddL1kB7m2APnbBV90veiy9vo1HvWane7EQIwEG1kSHHHeFJJ5ELPp3KwG", label: "Audit Dokumen Mutu" },
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEake3ceLBGL4c0oTssImOg_4fGgC4a7ZWXWScOXFTcV3ZW-TTe68LYL0E6oERgNWzxAHavViuoJh5m7RAAA6UacI2jMApxF3KcQ5TTAYF8L82B6JVztgHkUP_Z5e3mMduCToRyzOHoxXsh-nzPwp3PeGTINSGfoKy-csUKmGHsS4r7WqwivTe9qRv4c3EqMd79FwNwXnBtnaBuxw98Bh34xu2KLKnTax3UmFh0vgHdq4EqaMIc3znxzygg6xYgVvVSmuh5SD6aRvo", label: "Sistem Manajemen" },
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoejoRTcdcKNAdSV1GirDl26RhDsRvnPyqYHDleLR2HLg4kFOq1buE_ADRrzjQXGPlbkT8unDwDmJ7z6K52679Ox1IGAE4OWpDlCWD2Mt8zsSDc7grMEvZhB-4fnjZnbyBOEj0fzgkFXPTynXfZWmoDZHsa49PHSfVgiOXNlN-Owh3lrDYdJaqXpY_9w9cOvQsOddpcN7sroP_m-pjDlb6_SaQv-c7YFYed55l7QlufnDXZeKJS81ziP6m1bNLOUmC86aMNc27DmbV", label: "Verifikasi TUK" },
        { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNOzL_Px1u3YmHFBz4A1UDYw5NMKyJJW7yX_gs3pg1RHXlPTjNg-Spy5oEOeYbRlCcqF9WPv_S0ENoUy_0HzD58DcmcpYqx3EemH2TtC60_KTmcbz-Q8xWbOIjgoBClhBliY56mKKrOveMGw9QwXKfjhEJfG1CZUq-bHMmtXr-5Zu8tlLnP9_zYfhv3m0BoNaCL3Eq1xYC3t_l4hAJIBNd4OdcbyY0zLVB2bv8Qhm5HfnA6rv1FlSScpdR92mDOikfiS2-AhRdcLhP", label: "Dokumentasi Akhir Audit" }
    ];

    return (
        <>
            <header className="bg-neutral-dark border-b border-white/5 pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-primary"></div>
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Arsip & Komunikasi</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Dokumentasi <span className="text-primary">&amp;</span> Kontak
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                        Jejak rekam kegiatan sertifikasi dan saluran komunikasi resmi LSP A3I untuk layanan profesional Anda.
                    </p>
                </div>
            </header>

            <section className="section-container">
                <div className="grid grid-cols-1 gap-24">
                    <div>
                        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-4xl">verified</span>
                                <h2 className="text-3xl font-bold text-white">Uji Kompetensi</h2>
                            </div>
                            <span className="text-slate-500 text-sm hidden md:block">Album Sertifikasi Profesi</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {galleryImages.map((img, index) => (
                                <div key={index} className="polaroid-frame group">
                                    <div className="overflow-hidden mb-4">
                                        <img className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" src={img.src} alt={img.label} />
                                    </div>
                                    <p className="text-black font-bold text-[10px] text-center uppercase tracking-widest border-t border-black/5 pt-2">{img.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary text-4xl">security</span>
                                <h2 className="text-3xl font-bold text-white">Surveilans BNSP</h2>
                            </div>
                            <span className="text-slate-500 text-sm hidden md:block">Audit Mutu & Kepatuhan</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {auditImages.map((img, index) => (
                                <div key={index} className="polaroid-frame group">
                                    <div className="overflow-hidden mb-4">
                                        <img className="w-full aspect-square object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" src={img.src} alt={img.label} />
                                    </div>
                                    <p className="text-black font-bold text-[10px] text-center uppercase tracking-widest border-t border-black/5 pt-2">{img.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-dark/50 border-y border-white/5">
                <div className="section-container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-12">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-8 h-px bg-primary"></span>
                                    <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Saluran Komunikasi</span>
                                </div>
                                <h2 className="text-4xl font-bold text-white mb-6">Hubungi Kantor Pusat Kami</h2>
                                <p className="text-slate-400 leading-relaxed">
                                    Silakan hubungi tim kami untuk konsultasi sertifikasi, pendaftaran uji kompetensi, atau pertanyaan terkait LSP A3I.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-6 p-6 rounded-lg bg-neutral-muted/30 border border-white/5 group hover:border-primary/30 transition-all">
                                    <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                                        <span className="material-symbols-outlined text-primary group-hover:text-black">location_on</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-2 uppercase tracking-wide">Lokasi Kantor</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">
                                            Sun City Square Blok A-32, Jl. Hasibuan No.1, Bekasi Selatan, Bekasi, Jawa Barat 17141
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 p-5 rounded-lg bg-neutral-muted/30 border border-white/5">
                                        <span className="material-symbols-outlined text-primary">call</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Telepon</p>
                                            <p className="text-white text-sm font-medium">(021) 8896 1234</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-5 rounded-lg bg-neutral-muted/30 border border-white/5">
                                        <span className="material-symbols-outlined text-primary">mail</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Email</p>
                                            <p className="text-white text-sm font-medium">info@lspa3i.or.id</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-white/10 h-40">
                                <img className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRu8Zey9660m4uQj8c1_u4F404TSP7-tc9z9Xzpk2yQwfXjgjO5EveJLV6rQ5CNhkVcLGN6UwAfT_3uTOJiDYe8m1thN6I_tn0HMETWm8d41b9CSPgaXgb94zMptNtWrIRQ7JNllrceDD3BVOfWKFGyVcQPe7ybJGO47GN9mhu5EUZHn1k9JgPyZaDJqQ3GKH4NvEzC1nFZUTD0Kb_MD_4ifzZV2c09evkFvvZxJ3y5Rqly1TRdXFOwLe0gDdHNkuSwREq3dQsrRgV" alt="Office Map" />
                            </div>
                        </div>

                        <div className="lg:col-span-7 glass-panel p-10 md:p-14 rounded shadow-2xl relative">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Nama Lengkap</label>
                                        <input
                                            name="name"
                                            type="text"
                                            placeholder="Contoh: Budi Santoso"
                                            className="w-full bg-black/50 border border-white/10 rounded py-4 px-6 text-white focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Alamat Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="budi@email.com"
                                            className="w-full bg-black/50 border border-white/10 rounded py-4 px-6 text-white focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Subjek Kepentingan</label>
                                    <input
                                        name="subject"
                                        type="text"
                                        placeholder="Contoh: Permohonan Sertifikasi"
                                        className="w-full bg-black/50 border border-white/10 rounded py-4 px-6 text-white focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Pesan Detail</label>
                                    <textarea
                                        name="message"
                                        rows="5"
                                        placeholder="Tuliskan pertanyaan atau kebutuhan Anda secara detail..."
                                        className="w-full bg-black/50 border border-white/10 rounded py-4 px-6 text-white focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-700 resize-none"
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-5 bg-primary hover:bg-white text-black font-bold rounded transition-all duration-300 shadow-lg uppercase tracking-widest text-sm">
                                    Kirim Pesan Sekarang
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-32 text-center bg-black">
                <div className="max-w-3xl mx-auto px-6">
                    <h3 className="text-4xl md:text-6xl font-display italic text-primary/70 mb-10 leading-tight">Sekian &amp; Terimakasih</h3>
                    <div className="w-16 h-1 bg-primary/30 mx-auto mb-10 rounded-full"></div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-12 max-w-lg mx-auto">
                        Lembaga Sertifikasi Profesi A3I berkomitmen penuh untuk menjaga standar kompetensi profesional akuntansi di Indonesia.
                    </p>
                    <div className="flex justify-center gap-8">
                        <a href="#" className="w-12 h-12 border border-white/10 rounded flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
                            <span className="material-icons-outlined">facebook</span>
                        </a>
                        <a href="#" className="w-12 h-12 border border-white/10 rounded flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
                            <span className="material-icons-outlined">language</span>
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default DokumentasiKontak;
