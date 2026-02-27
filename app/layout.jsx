import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
    title: 'LSP A3I - Lembaga Sertifikasi Profesi Alat Angkat dan Angkut Indonesia',
    description: 'Lembaga Sertifikasi Profesi yang berfokus pada keunggulan, integritas, dan keselamatan dalam industri alat angkat dan angkut di Indonesia.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-background-dark text-slate-100 font-display flex flex-col">
                <AuthProvider>
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
