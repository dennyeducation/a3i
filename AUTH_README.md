# 🔐 Sistem Autentikasi LSP A3I

Dokumentasi lengkap untuk fitur autentikasi yang telah diimplementasikan pada aplikasi LSP A3I.

## 📋 Fitur yang Tersedia

✅ **Registrasi User** - Pendaftaran akun baru dengan validasi
✅ **Login** - Masuk dengan email/username dan password
✅ **Logout** - Keluar dari sistem
✅ **Protected Routes** - Halaman yang memerlukan autentikasi
✅ **JWT Authentication** - Token-based authentication yang aman
✅ **User Dashboard** - Dashboard untuk user yang sudah login
✅ **Auth Context** - State management untuk auth di seluruh aplikasi

---

## 🚀 Cara Memulai

### 1. Setup Database

Jalankan perintah berikut untuk membuat tabel di database:

```bash
npm run db:setup
```

Perintah ini akan membuat tabel:
- **users** - Menyimpan data user (username, email, password, dll)
- **sessions** - Menyimpan token session (opsional)

### 2. Konfigurasi Environment

Pastikan file `.env` sudah memiliki konfigurasi berikut:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT Secret (PENTING: Ganti dengan nilai yang aman di production!)
JWT_SECRET=lsp-a3i-super-secret-key-change-this-in-production-2024
```

### 3. Migrasi Role (Jika Update dari Sistem Lama)

Jika Anda update dari sistem role lama (`user`, `admin`, `asesor`) ke sistem baru (`SUPERADMIN`, `ADMIN`, `ASESOR`, `ASESI`), jalankan migration script:

```bash
node scripts/migrate-roles.js
```

Script ini akan:
- Update semua role lama ke role baru
- Membuat user SUPERADMIN default jika belum ada
- Menampilkan distribusi role setelah migration

**PENTING:** Setelah migration, segera ganti password SUPERADMIN default!

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 📁 Struktur File

```
a3i/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── register/route.js    # API endpoint registrasi
│   │       ├── login/route.js       # API endpoint login
│   │       └── me/route.js          # API endpoint get user profile
│   ├── login/page.jsx               # Halaman login
│   ├── register/page.jsx            # Halaman registrasi
│   ├── dashboard/page.jsx           # Dashboard user (protected)
│   └── layout.jsx                   # Root layout dengan AuthProvider
├── components/
│   └── Navbar.jsx                   # Navbar dengan status login/logout
├── contexts/
│   └── AuthContext.jsx              # Auth context & provider
├── lib/
│   ├── db.js                        # Database connection
│   └── auth.js                      # Auth utilities (JWT, bcrypt)
└── database/
    ├── schema.sql                   # SQL schema untuk tabel
    └── setup.js                     # Script setup database
```

---

## 🎯 Cara Menggunakan

### Registrasi User Baru

1. Kunjungi `/register`
2. Isi form:
   - Nama Lengkap
   - Username (unik)
   - Email (unik)
   - Password (minimal 6 karakter)
   - Konfirmasi Password
3. Klik "Daftar Sekarang"
4. Setelah berhasil, akan diarahkan ke halaman login

### Login

1. Kunjungi `/login`
2. Masukkan email/username dan password
3. Klik "Masuk"
4. Setelah berhasil, akan diarahkan ke dashboard

### Mengakses Dashboard

Setelah login, klik nama user di Navbar atau kunjungi `/dashboard` untuk melihat:
- Informasi profil user
- Statistik (sertifikat, pendaftaran, asesmen)
- Aksi cepat
- Aktivitas terbaru

### Logout

Klik tombol "Logout" di Navbar (desktop) atau di menu mobile.

---

## 🔧 API Endpoints

### POST `/api/auth/register`

Registrasi user baru.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registrasi berhasil! Silakan login.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### POST `/api/auth/login`

Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login berhasil!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### GET `/api/auth/me`

Mendapatkan informasi user yang sedang login.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🔒 Keamanan

### Password Hashing
- Password di-hash menggunakan **bcryptjs** dengan salt rounds 10
- Password asli tidak pernah disimpan di database

### JWT Token
- Token expires dalam **7 hari**
- Token disimpan di **localStorage** (bisa dipindah ke httpOnly cookie untuk keamanan lebih)
- Setiap request ke protected endpoint harus menyertakan token di header

### Database
- Koneksi menggunakan SSL untuk Neon Database
- Connection pooling untuk performa optimal
- Prepared statements untuk mencegah SQL injection

---

## 👤 User Roles

Sistem mendukung 4 tingkat role-based access dengan hierarki:

### Role Hierarchy (dari tertinggi ke terendah):

1. **SUPERADMIN** - Full access
   - Akses penuh ke seluruh sistem
   - Dapat mengelola semua user dan role
   - Dapat mengakses semua fitur administratif
   - Highest level permissions

2. **ADMIN** - Administrative access
   - Akses administratif ke sistem
   - Dapat mengelola user biasa
   - Akses ke dashboard admin
   - Tidak dapat mengubah SUPERADMIN

3. **ASESOR** - Assessor access
   - Akses untuk melakukan asesmen
   - Dapat mengelola sertifikat dan penilaian
   - Akses ke halaman asesor
   - Terbatas pada fungsi asesmen

4. **ASESI** - Default role untuk user baru (public registration)
   - Role default untuk registrasi publik
   - Akses dasar ke sistem
   - Dapat mendaftar program sertifikasi
   - Akses ke dashboard user

### Cara Menggunakan Role di Aplikasi

#### Di Client Side (React Components):

```jsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
    const { user, hasRole, isSuperAdmin, isAdmin, isAsesor, isAsesi } = useAuth();

    // Check specific role or higher
    if (hasRole('ADMIN')) {
        return <AdminFeature />;
    }

    // Check exact role
    if (isSuperAdmin()) {
        return <SuperAdminPanel />;
    }

    if (isAdmin()) {
        return <AdminPanel />;
    }

    if (isAsesor()) {
        return <AsesorDashboard />;
    }

    return <DefaultUserView />;
}
```

#### Di Server Side (API Routes):

```javascript
import { NextResponse } from 'next/server';
import { requireRole, USER_ROLES } from '@/lib/auth';

export async function POST(request) {
    // Require ADMIN role or higher
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            { error: auth.error },
            { status: 403 }
        );
    }

    // User has required permissions
    const user = auth.user;
    // ... your logic here
}
```

### Role Permission Helper Functions

**Client Side** (dari useAuth hook):
- `hasRole(requiredRole)` - Check if user has role or higher
- `isSuperAdmin()` - Check if user is SUPERADMIN
- `isAdmin()` - Check if user is ADMIN or higher
- `isAsesor()` - Check if user is ASESOR or higher
- `isAsesi()` - Check if user is ASESI (exact)

**Server Side** (dari @/lib/auth):
- `hasRole(userRole, requiredRole)` - Check role hierarchy
- `hasExactRole(userRole, requiredRole)` - Check exact role
- `isSuperAdmin(userRole)` - Check SUPERADMIN
- `isAdmin(userRole)` - Check ADMIN or higher
- `isAsesor(userRole)` - Check ASESOR or higher
- `requireRole(request, requiredRole)` - Middleware untuk protect API route

---

## 🛠️ Pengembangan Lanjutan

### Menambah Protected Route

```jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated()) {
        return <div>Loading...</div>;
    }

    return <div>Protected Content</div>;
}
```

### Menggunakan Auth di Component

```jsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated()) {
        return <div>Please login</div>;
    }

    return (
        <div>
            <p>Welcome, {user.username}!</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

### Membuat Protected API Route

```javascript
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
    const auth = await requireAuth(request);

    if (!auth.authenticated) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Access user data: auth.user
    return NextResponse.json({ data: 'protected data' });
}
```

---

## 🐛 Troubleshooting

### Error: Database connection failed
- Pastikan `DATABASE_URL` di `.env` sudah benar
- Cek koneksi internet untuk Neon Database

### Error: Invalid token
- Token mungkin sudah expired (7 hari)
- Logout dan login kembali

### Error: User already exists
- Email atau username sudah terdaftar
- Gunakan email/username yang berbeda

---

## 📝 Catatan Penting

1. **JWT_SECRET**: Ganti nilai default di production dengan string yang kuat dan acak
2. **localStorage**: Untuk keamanan lebih baik, pertimbangkan menggunakan httpOnly cookies
3. **HTTPS**: Pastikan aplikasi di-deploy dengan HTTPS di production
4. **Password Policy**: Sesuaikan requirement password sesuai kebutuhan
5. **Email Verification**: Pertimbangkan menambah verifikasi email untuk registrasi

---

## 📞 Support

Jika ada pertanyaan atau masalah, hubungi tim development LSP A3I.

---

**Dibuat dengan ❤️ untuk LSP A3I**
