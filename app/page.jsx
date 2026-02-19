import Link from 'next/link';

const Beranda = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center hero-gradient border-b border-white/5">
                <div className="container-standard relative z-10 pt-20">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full mb-8">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">BNSP Terakreditasi</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
                            Lembaga Sertifikasi Profesi <span className="text-primary italic">Alat Angkat dan Angkut</span> <span className="text-red-600">Indonesia</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-12 leading-relaxed border-l-4 border-primary pl-8">
                            Meningkatkan standar keselamatan industri Indonesia melalui sertifikasi kompetensi tenaga kerja yang terpercaya dan diakui secara nasional.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <Link href="/sertifikasi" className="bg-primary text-background-dark px-10 py-4 rounded font-bold text-lg hover:shadow-[0_0_30px_rgba(242,185,13,0.3)] transition-all flex items-center justify-center hover:bg-white">
                                Lihat Skema Sertifikasi
                                <span className="material-icons-outlined ml-2">arrow_forward</span>
                            </Link>
                            <Link href="/profil" className="bg-white/5 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center">
                                Pelajari Profil Kami
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="absolute bottom-0 w-full hidden lg:block translate-y-1/2 z-20">
                    <div className="container-standard">
                        <div className="grid grid-cols-4 gap-0 bg-background-dark/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-8 text-center border-r border-white/10 hover:bg-white/5 transition-colors">
                                <div className="text-4xl font-extrabold text-primary mb-1">5000+</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Tenaga Kerja Tersertifikasi</div>
                            </div>
                            <div className="p-8 text-center border-r border-white/10 hover:bg-white/5 transition-colors">
                                <div className="text-4xl font-extrabold text-primary mb-1">12+</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Skema Kompetensi</div>
                            </div>
                            <div className="p-8 text-center border-r border-white/10 hover:bg-white/5 transition-colors">
                                <div className="text-4xl font-extrabold text-primary mb-1">45+</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Asesor Berpengalaman</div>
                            </div>
                            <div className="p-8 text-center hover:bg-white/5 transition-colors">
                                <div className="text-4xl font-extrabold text-primary mb-1">100%</div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Standar BNSP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section-padding bg-background-dark pt-32 lg:pt-48">
                <div className="container-standard">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <div className="relative group">
                                <div className="absolute -top-6 -left-6 w-32 h-32 border-l-4 border-t-4 border-primary/30 -z-0 transition-all duration-500 group-hover:border-primary/60"></div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 border-r-4 border-b-4 border-primary/30 -z-0 transition-all duration-500 group-hover:border-primary/60"></div>

                                <img
                                    alt="Tentang LSP A3I"
                                    className="relative z-10 rounded shadow-2xl border border-white/10 object-cover h-[550px] w-full"
                                    src="/assets/asesor.jpg"
                                />

                                <div className="absolute -bottom-8 -right-8 bg-primary p-8 rounded shadow-2xl z-20 hidden md:block group-hover:-translate-y-2 transition-transform duration-300">
                                    <span className="text-background-dark font-black text-5xl block leading-none mb-1">20+</span>
                                    <span className="text-background-dark font-bold text-[10px] uppercase tracking-widest">Tahun Pengalaman</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="inline-block text-primary font-bold uppercase tracking-[0.3em] text-sm mb-6 border-b-2 border-primary/30 pb-1">Tentang Kami</div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                                Otoritas Terpercaya Sertifikasi Industri
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                                LSP A3I hadir sebagai pilar pendukung keselamatan kerja nasional yang berfokus pada standarisasi kompetensi personil di bidang alat angkat dan angkut. Melalui proses uji kompetensi yang ketat dan transparan, kami memastikan setiap tenaga profesional memiliki kapabilitas yang diakui secara hukum dan teknis.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons-outlined text-primary">verified</span>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-1">Lisensi Resmi</h5>
                                        <p className="text-sm text-slate-500">Terdaftar dan diawasi langsung oleh BNSP.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons-outlined text-primary">precision_manufacturing</span>
                                    </div>
                                    <div>
                                        <h5 className="text-white font-bold mb-1">Standar Industri</h5>
                                        <p className="text-sm text-slate-500">Materi uji berdasarkan kebutuhan industri terkini.</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/profil" className="inline-flex items-center text-primary font-bold group">
                                <span className="border-b-2 border-primary/30 group-hover:border-primary transition-all pb-1 uppercase tracking-widest text-sm">Selengkapnya Tentang Kami</span>
                                <span className="material-icons-outlined ml-3 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Purpose Section */}
            <section className="section-padding bg-[#0A0A0A] relative overflow-hidden border-y border-white/5">
                <div className="container-standard relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Maksud & Tujuan</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-8"></div>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Visi kami adalah menciptakan ekosistem industri yang aman dan kompetitif melalui empat pilar utama pengembangan kompetensi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: 'workspace_premium',
                                title: 'Standardisasi Kompetensi',
                                desc: 'Menyediakan tolok ukur yang jelas untuk kemampuan operasional di bidang alat angkat angkut.'
                            },
                            {
                                icon: 'health_and_safety',
                                title: 'Keselamatan Kerja',
                                desc: 'Meminimalisir risiko kecelakaan kerja melalui verifikasi keahlian operator yang kompeten.'
                            },
                            {
                                icon: 'public',
                                title: 'Pengakuan Global',
                                desc: 'Menjadikan tenaga kerja Indonesia memiliki daya saing yang tinggi di kancah internasional.'
                            },
                            {
                                icon: 'psychology',
                                title: 'Inovasi Berkelanjutan',
                                desc: 'Terus memperbarui skema sertifikasi seiring dengan perkembangan teknologi alat angkut.'
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-surface-dark p-10 rounded border border-white/5 hover:border-primary/50 transition-all group flex flex-col h-full hover:-translate-y-2 duration-300">
                                <div className="w-16 h-16 bg-primary/5 rounded flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-300">
                                    <span className="material-icons-outlined text-primary group-hover:text-background-dark text-4xl transition-colors duration-300">{item.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed flex-grow">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-20 bg-background-dark">
                <div className="container-standard">
                    <div className="flex flex-col items-center">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-12 font-extrabold">Didukung & Diakreditasi Oleh</p>
                        <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                            {['LOGO BNSP', 'KEMNAKER', 'ASOSIASI A3I', 'ISO 9001'].map((partner) => (
                                <div key={partner} className="h-10 w-32 bg-slate-400 rounded-sm flex items-center justify-center text-[10px] font-black text-black hover:bg-white transition-colors">
                                    {partner}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Beranda;
