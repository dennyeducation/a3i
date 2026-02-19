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

const DokumentasiPage = () => {
    return (
        <>
            <header className="bg-neutral-dark border-b border-white/5 pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px w-12 bg-primary"></div>
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Arsip Kegiatan</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Dokumentasi <span className="text-primary">Kegiatan</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                        Jejak rekam visual kegiatan sertifikasi dan surveilans LSP A3I sebagai bukti komitmen mutu dan profesionalisme.
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

        </>
    );
};

export default DokumentasiPage;
