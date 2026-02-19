const ProfilLembaga = () => {
    return (
        <>
            <section className="relative pt-24 pb-20 border-b border-white/5">
                <div className="container-standard relative">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-[1px] w-12 bg-primary"></div>
                            <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Profil Lembaga</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                            Membangun Standar <br />
                            <span className="text-primary italic">Profesionalisme</span> Indonesia.
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl font-light">
                            Lembaga Sertifikasi Profesi A3I adalah institusi independen yang berkomitmen untuk meningkatkan daya saing tenaga kerja melalui sistem sertifikasi kompetensi yang kredibel dan diakui secara nasional.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24 border-b border-white/5">
                <div className="container-standard">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h3 className="text-3xl font-bold text-white tracking-tight">Sejarah & Filosofi</h3>
                            <div className="space-y-6">
                                <p className="text-slate-400 leading-loose text-base">
                                    Lembaga Sertifikasi Profesi A3I didirikan atas inisiasi para pakar industri di Bekasi dengan tujuan menjawab tantangan globalisasi ekonomi. Sebagai lembaga yang telah memperoleh lisensi resmi dari <span className="text-white font-semibold">Badan Nasional Sertifikasi Profesi (BNSP)</span>, kami menjalankan tugas utama melaksanakan sertifikasi kompetensi kerja di berbagai sektor strategis.
                                </p>
                                <p className="text-slate-400 leading-loose text-base">
                                    Berlokasi strategis di pusat industri Bekasi, LSP A3I hadir sebagai jembatan antara kebutuhan industri dengan ketersediaan sumber daya manusia yang kompeten. Kami percaya bahwa pengakuan formal atas keahlian seseorang adalah kunci pembuka pintu kesempatan karir yang lebih luas.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-6">
                                <div>
                                    <p className="text-4xl font-extrabold text-white mb-1">BNSP</p>
                                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Lisensi Resmi</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold text-white mb-1">1000+</p>
                                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Sertifikat Terbit</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 border border-primary/20 translate-x-4 translate-y-4 -z-10"></div>
                            <div className="bg-zinc-900 overflow-hidden">
                                <img
                                    alt="LSP A3I Office"
                                    className="w-full aspect-[4/3] object-cover"
                                    src="/assets/profila3i.jpg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-zinc-950/50 border-b border-white/5">
                <div className="container-standard">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Visi & Misi</h3>
                            <p className="text-slate-400">Komitmen kami dalam menjaga kualitas dan integritas sertifikasi profesi di Indonesia.</p>
                        </div>
                        <div className="h-[1px] flex-grow bg-white/10 ml-8 hidden md:block"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-1">
                        <div className="md:col-span-1 p-12 bg-zinc-900 border border-white/5">
                            <div className="mb-10 text-primary">
                                <span className="material-symbols-outlined text-5xl">visibility</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Visi Utama</h4>
                            <p className="text-slate-400 leading-loose italic">
                                &quot;Menjadi Lembaga Sertifikasi Profesi yang unggul, terpercaya, dan menjadi rujukan utama dalam penjaminan kompetensi tenaga kerja berstandar global.&quot;
                            </p>
                        </div>
                        <div className="md:col-span-2 grid sm:grid-cols-2 gap-1">
                            {[
                                { no: '01', title: 'Penjaminan Mutu', desc: 'Melaksanakan uji kompetensi yang fair, transparan, dan akuntabel sesuai dengan standar operasional prosedur BNSP.' },
                                { no: '02', title: 'Sinergi Industri', desc: 'Membangun kemitraan strategis dengan dunia usaha dan industri (DUDI) untuk memastikan relevansi skema sertifikasi.' },
                                { no: '03', title: 'Inovasi Berkelanjutan', desc: 'Terus melakukan inovasi dan peningkatan kapasitas infrastruktur sertifikasi serta pengembangan SDM pengelola.' },
                                { no: '04', title: 'Etika Profesi', desc: 'Menjunjung tinggi integritas dalam seluruh proses bisnis untuk menjaga kepercayaan seluruh pemangku kepentingan.' }
                            ].map((item) => (
                                <div key={item.no} className="p-10 bg-zinc-900/40 border border-white/5">
                                    <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary mb-6">
                                        <span className="text-xs font-bold">{item.no}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-4">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Organization Structure */}
            <section className="py-24 border-b border-white/5">
                <div className="container-standard">
                    <div className="text-center mb-20">
                        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Governance</p>
                        <h3 className="text-4xl font-extrabold text-white tracking-tight">Struktur Organisasi</h3>
                        <div className="w-16 h-[2px] bg-primary mx-auto mt-6"></div>
                    </div>
                    <div className="max-w-4xl mx-auto overflow-x-auto pb-10">
                        <div className="min-w-[700px] flex flex-col items-center">
                            <div className="flex flex-col items-center">
                                <div className="p-5 border border-primary bg-primary/5 min-w-[240px] text-center">
                                    <p className="text-primary text-[9px] font-bold uppercase tracking-widest mb-1">Dewan Pengarah</p>
                                    <h5 className="text-base font-bold text-white">Priyono</h5>
                                </div>
                                <div className="w-[1px] bg-primary/40 h-8 mx-auto"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="p-5 border border-primary bg-primary/5 min-w-[240px] text-center">
                                    <p className="text-primary text-[9px] font-bold uppercase tracking-widest mb-1">Ketua LSP</p>
                                    <h5 className="text-base font-bold text-white">I Made Karmayoga</h5>
                                </div>
                                <div className="w-[1px] bg-primary/40 h-10 mx-auto"></div>
                            </div>
                            <div className="w-full relative px-10">
                                <div className="h-[1px] bg-primary/40 absolute top-0 left-[12.5%] right-[12.5%]"></div>
                                <div className="grid grid-cols-4 gap-4 pt-8">
                                    {[
                                        { role: 'Manajer Sertifikasi', name: 'Dewi Lestari' },
                                        { role: 'Manajer Mutu', name: 'Bambang S.' },
                                        { role: 'Manajer Adm & Keu', name: 'Siti Aminah' },
                                        { role: 'Komite Teknis', name: 'Agus Wahyudi' },
                                    ].map((person) => (
                                        <div key={person.role} className="flex flex-col items-center relative">
                                            <div className="w-[1px] bg-primary/40 h-8 absolute -top-8"></div>
                                            <div className="p-4 border border-white/10 bg-zinc-900 w-full text-center">
                                                <p className="text-slate-500 text-[8px] font-bold uppercase tracking-widest mb-1">{person.role}</p>
                                                <h5 className="text-xs font-bold text-white">{person.name}</h5>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-16 text-center">
                            <p className="text-slate-500 text-sm italic font-light max-w-xl mx-auto">
                                &quot;LSP A3I didukung oleh tim ahli yang berdedikasi tinggi dan memiliki sertifikasi sebagai Asesor Kompetensi yang kredibel di bidangnya masing-masing.&quot;
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="container-standard">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-white mb-8">Hubungi Kantor Pusat</h3>
                            <div className="space-y-6">
                                {[
                                    { icon: 'location_on', title: 'Alamat', desc: 'Jl. Jenderal Sudirman No. 123, Bekasi Selatan, Jawa Barat 17148' },
                                    { icon: 'phone', title: 'Telepon', desc: '+62 21 8888 9999' },
                                    { icon: 'email', title: 'Email', desc: 'info@lsp-a3i.or.id' },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-5">
                                        <span className="material-icons text-primary text-xl">{item.icon}</span>
                                        <div>
                                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">{item.title}</h4>
                                            <p className="text-slate-400 text-base">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-zinc-900 p-2 border border-white/5">
                            <img
                                alt="Map Location"
                                className="w-full h-[350px] object-cover grayscale opacity-60"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwD_mDkRCSE8txyIalZbqAClYeBt2hxzmmcEdrgu4nMv050qexhitVxlzxQo-I8FeWSiFJrcOUE_ITf9QAesp4HoKRbbDCtjLSAmeQwW7T-1jX_Pe6kykSRRpKYF8RzoY4834qMD9VgdhIcC2ilzXBRaszZbXRbl797O9mXzv0nMpp-VV_m4Por6dhmzt2IF-gaE8_Zt3oFzY-1rofKtOLrT52jaiZposE4C-zV4V8NiMSycqvOscXkWVyqorzrf3hdOfZ2JxKkWwY"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProfilLembaga;
