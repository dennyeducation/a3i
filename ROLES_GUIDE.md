# 🔐 Panduan User Roles - LSP A3I

Dokumentasi lengkap tentang sistem role-based access control (RBAC) di aplikasi LSP A3I.

---

## 📊 Role Hierarchy

Sistem menggunakan 4 tingkat role dengan hierarki berikut:

```
SUPERADMIN (Level 4) - Highest
    ↓
ADMIN (Level 3)
    ↓
ASESOR (Level 2)
    ↓
ASESI (Level 1) - Default untuk registrasi publik
```

### Prinsip Hierarki

- **Role yang lebih tinggi** memiliki semua permission dari role di bawahnya
- **SUPERADMIN** dapat mengakses semua fitur
- **ADMIN** dapat mengakses fitur ASESOR dan ASESI
- **ASESOR** dapat mengakses fitur ASESI
- **ASESI** hanya dapat mengakses fitur dasar

---

## 👥 Detail Role

### 1. SUPERADMIN - Full Access

**Permission:**
- ✅ Full access ke seluruh sistem
- ✅ Mengelola semua user (create, update, delete)
- ✅ Mengubah role semua user (termasuk ADMIN)
- ✅ Akses ke semua dashboard (Super Admin, Admin, Asesor, User)
- ✅ Konfigurasi sistem global
- ✅ Melihat semua logs dan audit trail
- ✅ Backup dan restore data

**Use Cases:**
- Pemilik/Founder aplikasi
- Technical administrator
- System administrator

**Cara Membuat:**
- Hanya bisa dibuat melalui database manual atau migration script
- Tidak bisa dibuat melalui registrasi publik
- Limited number (biasanya 1-2 orang)

---

### 2. ADMIN - Administrative Access

**Permission:**
- ✅ Mengelola user dengan role ASESOR dan ASESI
- ✅ Akses dashboard admin
- ✅ Approve/reject pendaftaran sertifikasi
- ✅ Mengelola data master (skema, TUK, dll)
- ✅ Generate reports
- ✅ Melihat statistik sistem
- ❌ Tidak dapat mengubah SUPERADMIN
- ❌ Tidak dapat mengubah konfigurasi sistem global

**Use Cases:**
- Staff administratif LSP
- Manager LSP
- Koordinator program

**Cara Membuat:**
- Hanya SUPERADMIN yang dapat membuat user ADMIN
- Upgrade dari role lain oleh SUPERADMIN

---

### 3. ASESOR - Assessor Access

**Permission:**
- ✅ Akses dashboard asesor
- ✅ Melakukan asesmen peserta
- ✅ Input nilai dan penilaian
- ✅ Upload bukti asesmen
- ✅ Generate sertifikat untuk peserta yang lulus
- ✅ Melihat jadwal asesmen
- ✅ Mengelola data asesi yang ditugaskan
- ❌ Tidak dapat mengubah data master
- ❌ Tidak dapat approve pendaftaran

**Use Cases:**
- Asesor kompetensi
- Penilai ujian sertifikasi
- Evaluator

**Cara Membuat:**
- SUPERADMIN atau ADMIN dapat membuat user ASESOR
- Registrasi khusus dengan approval

---

### 4. ASESI - Default Role (Public Registration)

**Permission:**
- ✅ Akses dashboard user
- ✅ Mendaftar program sertifikasi
- ✅ Upload dokumen persyaratan
- ✅ Melihat status pendaftaran
- ✅ Melihat jadwal asesmen
- ✅ Download sertifikat (jika sudah lulus)
- ✅ Update profil sendiri
- ❌ Tidak dapat akses fitur administratif
- ❌ Tidak dapat melakukan asesmen

**Use Cases:**
- Peserta sertifikasi
- Calon peserta
- Public user

**Cara Membuat:**
- Registrasi publik di `/register`
- Otomatis mendapat role ASESI

---

## 💻 Implementasi di Code

### Client Side - React Components

#### Menggunakan useAuth Hook

```jsx
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const { user, hasRole, isSuperAdmin, isAdmin, isAsesor } = useAuth();

    // Conditional rendering based on role
    return (
        <div>
            <h1>Dashboard</h1>

            {/* Show untuk SUPERADMIN only */}
            {isSuperAdmin() && (
                <SuperAdminPanel />
            )}

            {/* Show untuk ADMIN or higher */}
            {isAdmin() && (
                <AdminPanel />
            )}

            {/* Show untuk ASESOR or higher */}
            {isAsesor() && (
                <AsesorPanel />
            )}

            {/* Show untuk semua authenticated user */}
            <UserPanel />
        </div>
    );
}
```

#### Protected Component

```jsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminOnlyPage() {
    const { hasRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !hasRole('ADMIN')) {
            router.push('/dashboard'); // Redirect jika tidak punya akses
        }
    }, [loading, hasRole, router]);

    if (loading || !hasRole('ADMIN')) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Admin Only Content</h1>
            {/* Content hanya untuk ADMIN or higher */}
        </div>
    );
}
```

---

### Server Side - API Routes

#### Basic Role Protection

```javascript
import { NextResponse } from 'next/server';
import { requireRole, USER_ROLES } from '@/lib/auth';

export async function POST(request) {
    // Require ADMIN or higher
    const auth = await requireRole(request, USER_ROLES.ADMIN);

    if (!auth.authorized) {
        return NextResponse.json(
            {
                error: 'Akses ditolak. Memerlukan role ADMIN atau lebih tinggi.',
                requiredRole: auth.requiredRole,
                userRole: auth.userRole
            },
            { status: 403 }
        );
    }

    // User authorized, proceed
    const user = auth.user;

    // Your logic here...
    return NextResponse.json({ success: true });
}
```

#### Multiple Role Checks

```javascript
import { NextResponse } from 'next/server';
import { requireAuth, hasRole, isSuperAdmin, USER_ROLES } from '@/lib/auth';

export async function DELETE(request) {
    const auth = await requireAuth(request);

    if (!auth.authenticated) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const { user } = auth;

    // Only SUPERADMIN can delete
    if (!isSuperAdmin(user.role)) {
        return NextResponse.json(
            { error: 'Only SUPERADMIN can delete users' },
            { status: 403 }
        );
    }

    // Delete logic...
    return NextResponse.json({ success: true });
}
```

#### Role-Based Logic

```javascript
import { NextResponse } from 'next/server';
import { requireAuth, hasRole, USER_ROLES } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
    const auth = await requireAuth(request);

    if (!auth.authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = auth;

    // Different query based on role
    let dataQuery;

    if (hasRole(user.role, USER_ROLES.ADMIN)) {
        // ADMIN can see all data
        dataQuery = 'SELECT * FROM certifications';
    } else if (hasRole(user.role, USER_ROLES.ASESOR)) {
        // ASESOR can see assigned data
        dataQuery = 'SELECT * FROM certifications WHERE asesor_id = $1';
    } else {
        // ASESI can only see their own data
        dataQuery = 'SELECT * FROM certifications WHERE user_id = $1';
    }

    const result = await query(dataQuery, [user.id]);
    return NextResponse.json({ data: result.rows });
}
```

---

## 🔧 Role Management Functions

### Available Functions

#### Client Side (useAuth hook):

| Function | Description | Return |
|----------|-------------|--------|
| `hasRole(requiredRole)` | Check if user has role or higher | boolean |
| `isSuperAdmin()` | Check if user is SUPERADMIN | boolean |
| `isAdmin()` | Check if user is ADMIN or higher | boolean |
| `isAsesor()` | Check if user is ASESOR or higher | boolean |
| `isAsesi()` | Check if user is ASESI (exact) | boolean |

#### Server Side (@/lib/auth):

| Function | Parameters | Return |
|----------|------------|--------|
| `hasRole(userRole, requiredRole)` | userRole, requiredRole | boolean |
| `hasExactRole(userRole, requiredRole)` | userRole, requiredRole | boolean |
| `isSuperAdmin(userRole)` | userRole | boolean |
| `isAdmin(userRole)` | userRole | boolean |
| `isAsesor(userRole)` | userRole | boolean |
| `requireRole(request, requiredRole)` | request, requiredRole | {authorized, user, error} |
| `isValidRole(role)` | role | boolean |

### Constants

```javascript
import { USER_ROLES } from '@/lib/auth';

// Available roles:
USER_ROLES.SUPERADMIN  // 'SUPERADMIN'
USER_ROLES.ADMIN       // 'ADMIN'
USER_ROLES.ASESOR      // 'ASESOR'
USER_ROLES.ASESI       // 'ASESI'
```

---

## 🔄 Migration dari Sistem Lama

### Jika Update dari Role Lama

Jika sistem Anda sebelumnya menggunakan role:
- `user` → akan menjadi `ASESI`
- `admin` → akan menjadi `ADMIN`
- `asesor` → akan menjadi `ASESOR`

### Menjalankan Migration

```bash
node scripts/migrate-roles.js
```

### Apa yang Dilakukan Script:

1. ✅ Update semua role lama ke format baru
2. ✅ Validasi data setelah migration
3. ✅ Membuat user SUPERADMIN default (jika belum ada)
4. ✅ Menampilkan distribusi role

### Default SUPERADMIN Credentials:

```
Email: superadmin@lsp-a3i.com
Username: superadmin
Password: Admin@2024
```

**⚠️ PENTING:** Segera ganti password setelah migration!

---

## 🛡️ Best Practices

### 1. Prinsip Least Privilege

- Berikan user role paling rendah yang diperlukan
- Upgrade role hanya jika benar-benar diperlukan
- Review permission secara berkala

### 2. SUPERADMIN

- ⚠️ Batasi jumlah SUPERADMIN (ideal: 1-2 orang)
- ⚠️ Gunakan password yang sangat kuat
- ⚠️ Enable 2FA jika tersedia (future feature)
- ⚠️ Log semua aktivitas SUPERADMIN

### 3. Role Assignment

- SUPERADMIN → Pemilik sistem / Technical lead
- ADMIN → Staff administratif yang dipercaya
- ASESOR → Asesor resmi yang telah diverifikasi
- ASESI → Public user / peserta

### 4. Code Security

```javascript
// ✅ GOOD: Check role on both client and server
// Client (UI protection)
{isAdmin() && <AdminButton />}

// Server (Security enforcement)
export async function POST(request) {
    const auth = await requireRole(request, USER_ROLES.ADMIN);
    if (!auth.authorized) return /* 403 */;
    // ...
}

// ❌ BAD: Only check on client
{isAdmin() && <AdminButton onClick={deleteAllUsers} />}
// Server tidak check role = security hole!
```

### 5. Error Messages

```javascript
// ✅ GOOD: Informative error
return NextResponse.json(
    {
        error: 'Akses ditolak',
        requiredRole: 'ADMIN',
        message: 'Fitur ini hanya untuk Administrator'
    },
    { status: 403 }
);

// ❌ BAD: Generic error
return NextResponse.json({ error: 'Error' }, { status: 500 });
```

---

## 📝 Contoh Use Cases

### Use Case 1: Approve Pendaftaran Sertifikasi

**Flow:**
1. ASESI mendaftar sertifikasi di `/dashboard`
2. ADMIN melihat pendaftaran baru di `/admin/pendaftaran`
3. ADMIN approve/reject pendaftaran
4. ASESI mendapat notifikasi

**Role Required:**
- ASESI: Untuk mendaftar
- ADMIN: Untuk approve

```javascript
// API: /api/admin/approve-registration
export async function POST(request) {
    const auth = await requireRole(request, USER_ROLES.ADMIN);
    if (!auth.authorized) return /* 403 */;

    // Approve logic...
}
```

---

### Use Case 2: Melakukan Asesmen

**Flow:**
1. ADMIN assign ASESOR ke ASESI
2. ASESOR melakukan penilaian di `/asesor/assessment`
3. ASESOR input nilai dan upload bukti
4. Sistem generate sertifikat jika lulus

**Role Required:**
- ADMIN: Untuk assign
- ASESOR: Untuk menilai

```javascript
// API: /api/asesor/submit-assessment
export async function POST(request) {
    const auth = await requireRole(request, USER_ROLES.ASESOR);
    if (!auth.authorized) return /* 403 */;

    // Submit assessment logic...
}
```

---

### Use Case 3: Mengelola Data Master

**Flow:**
1. ADMIN/SUPERADMIN akses `/admin/master-data`
2. CRUD skema sertifikasi
3. CRUD TUK (Tempat Uji Kompetensi)

**Role Required:**
- ADMIN or SUPERADMIN

```javascript
// API: /api/admin/master-data
export async function PUT(request) {
    const auth = await requireRole(request, USER_ROLES.ADMIN);
    if (!auth.authorized) return /* 403 */;

    // Update master data...
}
```

---

## 🐛 Troubleshooting

### Error: "Insufficient permissions"

**Penyebab:**
- User tidak memiliki role yang cukup tinggi
- Token tidak valid

**Solusi:**
1. Check role user di database
2. Verify token masih valid
3. Logout dan login ulang

---

### Error: "Invalid role"

**Penyebab:**
- Role di database tidak sesuai dengan yang allowed
- Typo dalam role name

**Solusi:**
1. Jalankan migration script
2. Check constraint di database
3. Pastikan role adalah: SUPERADMIN, ADMIN, ASESOR, atau ASESI

---

## 📞 Support

Untuk pertanyaan lebih lanjut tentang role management, hubungi tim development LSP A3I.

---

**Dibuat dengan ❤️ untuk LSP A3I**
