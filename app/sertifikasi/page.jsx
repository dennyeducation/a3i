const SkemaSertifikasi = () => {
    const schemes = [
        {
            title: 'Mobile Crane',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU64bJMtRJqlGTc286nnLl6NSF3VsPFv_h13Ogb_3F7JhBXdo6JlbeevdcfFyWX1CrUrOKfpFJCPDTn0cHfYajwRePZC9iEdSBf24-30oX36hIZmnXs23iNJ2hzinddT5k3j4cFLyKHfVQH9pQZDOWQNdiv1wjHLy32Np0yr0D0Suv2T5PmFX5XdrzytttVyaZP7WpLQczsk180xMmMmC0APAVrN5BW-MSSgGzgyF7ajARaWrN_JYQPQ-q-MfAlo9fftw-v3XUmSnV",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'SKKNI Sektor Alat Berat',
            ref: 'Kepmenaker No. 135 Tahun 2015'
        },
        {
            title: 'Forklift',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGldJeqr3dqPqiqSSgF-UK6ioTUhCSXKRBIw6yacnGDnJ08SeVCB8ema8HIe3jfWNquXmpVHE20UStGkqv4midDJUasWJreaTTtHT4ehHuhFjx28eQNaDwDlJDpRrf1fLhH1TPxt5jUEDZvH9-vWLtpd_j5CnbvB7GZwRALEojsCIHcxWKDMANpwdxjo9k89bxQ0XU_LxJarQh6s-mJgYpCX34LZs2CbdwhslC9bA8CWWY-xfJeZ-12-xtz6Su6WmYUZ0-PLaiwSuC",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'SKKNI Logistik & Pergudangan',
            ref: 'Kepmenaker No. 202 Tahun 2014'
        },
        {
            title: 'Excavator',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2UqhMw3n1qU9ktbY2ORMnU9AZOYhR1pML4hBuGB6q0ZhcI5UTxa415_IAOH6Q01sewMGAiGnT1B5xaz4x4ldypYZzxA0Et2aqU3Ex8A42oLEs9_XOjMzEeLu4b2DsMm3NLlTO22c4VB6rFJskvmEeZiRZXCCd4jZzIDCoYPXWo1mgMVU8o3P_O3A4MZgcZzLRj23PYIHyr65DM3qIDzw0HgcURfVT2wpNpv7QmVgWX8gii4ECTbw3QiP0PYDjsVyrTrO6huTdavzf",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'Operator Alat Berat',
            ref: 'SKKNI Kepmenaker 147/2012'
        },
        {
            title: 'Bulldozer',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxmSoF7Ri2A0jutNvt2_FsO-Pc2UeS8qFUNX0QQ1dRsolin_NBqu7iVBfFYHlcF7JLLvIES2K380aJRSdEuREhLdb-Xf0NNlxZe7b5llnHvbPgIZGridv9KSsN8jeuHpJgUgX9WB9zkblWftPAb9ZvhLP5YndYYrKl-w1e9yiAcxTXoF5KvqOAPIXYFz8bSfYDAMSKl04PQhLF-i8l2ROtDgim8QJOIkDn8x8BzuK1l7qv8qQ7mfpfD7ri7kkdb5jCcVyvhKkbjVS1",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'SKKNI Alat Berat Konstruksi',
            ref: 'Kepmenaker No. 135 Tahun 2015'
        },
        {
            title: 'Tower Crane',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJmDR7qSfm_lzcH9CrGY1rOcPfjKJUgexyRv2zgwKQmZCNu4kGGteE7_4wVtbI9tU9XpSzPkL9hLWiwCUbOhEdY6x8yF7Xx8A1qYD5llszv6y63N2jOI_WXjVVJ7VSVVZwyipi1bwuzP7jSD0mw5LpQ-L8De0xDsjWpcXd3FtVensE0MoJH-aafP4nONYoIU2Ozn-TQ2tqSQZdaJipRJXVJB2dMYqs4u-_V-n9sZwutSH9TijATaDH05ZnK65tYq3koOzOs64uLuin",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'Operator Alat Angkat',
            ref: 'Kepmen No. 135/2015'
        },
        {
            title: 'Scaffolding',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgW9TXz3FTlo56ik6cGuU489c9-i9kWHaJuhqDGYXCZp7O4Cv-YLc6zbNqkhTF1qXs-o8mcTLYjks91Lf57Le6-_aEUhmExChET9jYCGBfWC3u5UG_dwUbYRs09NNpdNOUjpaVC8L2duugFi8MkhdS6jua2uEYgLqnzmDcAO7uOaQHiJDR2IGD6pnW_ucPFgJ1DfzRjWQpQjRufPo-c1G0NajNFixjuffFYnf5Ai5fqePtU0wtWsNIt4usrj4VP-LqlZnu1hqX7IEC",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'Teknisi Scaffolder',
            ref: 'SKKNI Konstruksi No. 042/2008'
        },
        {
            title: 'Wheel Loader',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgAjEfzpMW7s1uvxZE2wKCxF88KTnTIM_4ruh8T4eG8dmdEpsqbj9p6mZc6_3aYk7OKjM7QYY9gB98sub-Jhy0w3wwINHIlVDP2G0q2SaYgFppf89sIJfzItR-elMAEBEXztCttK2_ceR9ocdEP_Ei34JamFyxCuj4SZprU4lWFd0cHPaWwS8gGXWCDEV6__oSsF6_HmCL9x_Q8jfJFG3KdRIeZQdd3roH9t6WBAyWFhPf5JFad3jMAhoHN5s2TQydSiQrogOOs0GP",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'SKKNI Sektor Alat Berat',
            ref: 'Kepmenaker No. 135 Tahun 2015'
        },
        {
            title: 'Motor Grader',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAn6jzIwaH5EgyWLAU9O4clg64bsM_Jn_oLVefQpxg4ASuokPnDjvC5YswTXvXB0GWvqfTwh6TJsi3u0Ti59YO4dxmgCO1kkDhQgVX53qmHVZcRZIyQovsPs8-uyJpgd7tD8TVEpsKjuffIlx82adU3qilw5uw3ipUOxecoR_WL3mZzeY4o9_RrA9_p0Z3XaaIvqOucSoP1vSRdepC0EAHYCrrEEZaPplvYZYiA97gx4lgmcKrEt2jbLIBwTHXwjtuFcViAMxcsTODU",
            category: 'Skema Klaster/Okupasi',
            schemeName: 'Operator Pemindahan Tanah',
            ref: 'SKKNI No. 147 Tahun 2012'
        }
    ];

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-20 gap-x-12">
                    {schemes.map((scheme, index) => (
                        <div key={index} className="flex flex-col items-center group">
                            <div className="w-56 h-56 rounded-full border-[6px] border-primary/30 p-2 mb-8 group-hover:border-primary transition-all duration-400 aspect-square group-hover:shadow-[0_0_25px_rgba(242,185,13,0.4)]">
                                <div className="w-full h-full rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                                    <img
                                        alt={scheme.title}
                                        className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                                        src={scheme.image}
                                    />
                                </div>
                            </div>
                            <h3 className="text-white font-black text-2xl uppercase text-center mb-2 tracking-tight group-hover:text-primary transition-colors">{scheme.title}</h3>
                            <p className="text-primary/60 text-[11px] font-black tracking-[0.2em] uppercase mb-6">{scheme.category}</p>
                            <div className="bg-white/5 border border-white/10 group-hover:border-primary/40 rounded-xl p-5 text-center w-full transition-all">
                                <p className="text-white text-[13px] leading-relaxed uppercase font-bold mb-1">{scheme.schemeName}</p>
                                <p className="text-primary text-xs font-medium italic">{scheme.ref}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
