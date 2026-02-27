'use client';

import { useState } from 'react';

const KontakPage = () => {
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

    return (
        <>
            <header className="bg-neutral-dark border-b border-white/5 pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-primary"></div>
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Saluran Komunikasi</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Hubungi <span className="text-primary">Kami</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                        Saluran komunikasi resmi LSP A3I untuk layanan profesional Anda. Kami siap membantu konsultasi sertifikasi dan kebutuhan Anda.
                    </p>
                </div>
            </header>

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
                                            Suncity Square, Ruko, Jl. Mayor Madmuin Hasibuan No.45 Blok A, Bekasi Selatan, Bekasi
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 p-5 rounded-lg bg-neutral-muted/30 border border-white/5">
                                        <span className="material-symbols-outlined text-primary">call</span>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Telepon</p>
                                            <p className="text-white text-sm font-medium">(021) 88869010, 88869021</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 rounded-lg bg-neutral-muted/30 border border-white/5">
                                        <span className="material-symbols-outlined text-primary flex-shrink-0 mt-0.5">mail</span>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Email</p>
                                            <p className="text-white text-sm font-medium break-all">alatangkatangkutindonesia@gmail.com</p>
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

export default KontakPage;
