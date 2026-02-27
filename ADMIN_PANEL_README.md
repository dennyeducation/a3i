# 🔐 Admin Panel - LSP A3I

Dokumentasi lengkap untuk Admin Panel yang telah diimplementasikan pada aplikasi LSP A3I.

## 📋 Fitur Admin Panel

✅ **Dashboard Admin** - Overview statistik dan aktivitas sistem
✅ **User Management** - Kelola semua user (Create, Read, Update, Delete)
✅ **Role-Based Access** - Sistem role dengan middleware khusus admin
✅ **Real-time Statistics** - Statistik user dan aktivitas terbaru
✅ **Search & Filter** - Cari dan filter user berdasarkan kriteria
✅ **User Status Toggle** - Aktifkan/nonaktifkan user dengan mudah
✅ **Pagination** - Navigasi data user yang efisien

---

## 🚀 Cara Mengakses Admin Panel

### 1. Login sebagai Admin

Untuk mengakses admin panel, Anda harus login dengan akun yang memiliki role `admin`.

1. Kunjungi `/login`
2. Login dengan kredensial admin
3. Setelah login, Anda akan melihat menu **"Admin"** di Navbar
4. Klik menu Admin atau kunjungi `/admin`

### 2. Membuat User Admin Pertama

Jika belum ada user admin, Anda bisa membuat admin pertama dengan cara:

**Opsi A: Melalui Database**
```sql
-- Update user existing menjadi admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Opsi B: Registrasi kemudian Update**
1. Registrasi user baru melalui `/register`
2. Update role di database menjadi `admin`
3. Login kembali untuk mendapatkan akses admin

---

## 📁 Struktur File Admin Panel

```
a3i/
├── app/
│   ├── admin/                        # Admin pages
│   │   ├── page.jsx                  # Dashboard admin
│   │   └── users/
│   │       ├── page.jsx              # Daftar users
│   │       ├── new/
│   │       │   └── page.jsx          # Tambah user baru
│   │       └── [id]/
│   │           └── page.jsx          # Edit user
│   └── api/
│       └── admin/                    # Admin API endpoints
│           ├── stats/
│           │   └── route.js          # API statistik
│           └── users/
│               ├── route.js          # API CRUD users (GET all, POST)
│               └── [id]/
│                   └── route.js      # API CRUD users (GET, PUT, DELETE)
├── lib/
│   └── adminAuth.js                  # Middleware admin authentication
└── components/
    └── Navbar.jsx                    # Updated dengan link admin
```

---

## 🎯 Fitur-Fitur Admin Panel

### 1. Dashboard Admin (`/admin`)

Dashboard memberikan overview lengkap tentang sistem:

**Statistik Overview:**
- Total Users
- Active Users
- New Users This Month
- New Users Today

**Users by Role:**
- Breakdown jumlah user per role (admin, asesor, user)

**Quick Actions:**
- Manage Users
- Add New User
- Settings (placeholder)

**Recent Activity:**
- 10 user terbaru yang mendaftar
- Informasi lengkap: username, email, role, tanggal join

### 2. User Management (`/admin/users`)

Halaman untuk mengelola semua user dalam sistem:

**Fitur:**
- **Search**: Cari user berdasarkan username, email, atau nama lengkap
- **Filter by Role**: Filter user berdasarkan role (user, admin, asesor)
- **Pagination**: Navigasi halaman (10 users per halaman)
- **Toggle Status**: Aktifkan/nonaktifkan user dengan satu klik
- **Edit User**: Edit informasi user
- **Delete User**: Hapus user (dengan konfirmasi)

**Kolom Tabel:**
- User (nama lengkap & username)
- Email
- Role (dengan badge berwarna)
- Status (Active/Inactive)
- Joined (tanggal registrasi)
- Actions (Edit & Delete)

### 3. Add New User (`/admin/users/new`)

Form untuk menambah user baru:

**Fields:**
- Username* (required, unique)
- Email* (required, unique)
- Full Name
- Password* (required, min 6 karakter)
- Role* (user, asesor, admin)

**Validasi:**
- Username dan email harus unik
- Password minimal 6 karakter
- Semua field required divalidasi

### 4. Edit User (`/admin/users/[id]`)

Form untuk edit user existing:

**Fields:**
- Username
- Email
- Full Name
- Password (kosongkan jika tidak ingin mengubah)
- Role
- Active Status (checkbox)

**Fitur:**
- Password opsional (jika dikosongkan, password tidak berubah)
- Toggle active status
- Validasi sama seperti add user

---

## 🔧 API Endpoints Admin

### Authentication

Semua endpoint admin memerlukan:
- Bearer token di header `Authorization`
- User harus memiliki role `admin`

**Header Format:**
```
Authorization: Bearer <token>
```

### GET `/api/admin/stats`

Mendapatkan statistik dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 100,
      "activeUsers": 95,
      "inactiveUsers": 5,
      "newUsersThisMonth": 10,
      "newUsersToday": 2
    },
    "usersByRole": {
      "user": 90,
      "asesor": 8,
      "admin": 2
    },
    "recentUsers": [
      { "date": "2024-01-01", "count": 5 }
    ],
    "recentActivity": [...]
  }
}
```

### GET `/api/admin/users`

Mendapatkan daftar users dengan pagination dan filter.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (opsional): cari username/email/nama
- `role` (opsional): filter by role

**Response:**
```json
{
  "success": true,
  "data": [...users],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalUsers": 100,
    "totalPages": 10
  }
}
```

### POST `/api/admin/users`

Membuat user baru.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
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

### GET `/api/admin/users/[id]`

Mendapatkan detail user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT `/api/admin/users/[id]`

Update user.

**Request Body (semua field opsional):**
```json
{
  "username": "johndoe2",
  "email": "john2@example.com",
  "password": "newpassword",
  "full_name": "John Doe Jr",
  "role": "asesor",
  "is_active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {...updated user}
}
```

### DELETE `/api/admin/users/[id]`

Hapus user.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** Admin tidak bisa menghapus dirinya sendiri.

---

## 🔒 Keamanan

### Role-Based Access Control

**Middleware `requireAdmin`** (`lib/adminAuth.js`):
- Verifikasi JWT token
- Cek apakah user memiliki role `admin`
- Return error jika unauthorized atau forbidden

**Protected Routes:**
- Semua halaman di `/admin/*` protected
- Redirect ke `/login` jika tidak authenticated
- Redirect ke `/dashboard` jika authenticated tapi bukan admin

**API Protection:**
- Semua endpoint `/api/admin/*` protected dengan `requireAdmin`
- Return 401 jika tidak authenticated
- Return 403 jika authenticated tapi bukan admin

### Validasi Data

**Frontend:**
- Form validation dengan HTML5
- Client-side validation untuk better UX

**Backend:**
- Server-side validation untuk semua input
- SQL injection prevention dengan parameterized queries
- Password hashing dengan bcryptjs

---

## 🎨 UI/UX Features

### Design System

**Color Scheme:**
- Blue: Primary actions (manage, edit)
- Green: Success states (active users)
- Red: Danger actions (delete, inactive)
- Purple: Admin-specific elements
- Orange: Highlights (new users)

**Components:**
- Responsive design (mobile & desktop)
- Loading states dengan skeleton screens
- Error & success messages
- Confirmation modals untuk delete
- Hover effects & transitions

### Navigation

**Desktop:**
- Admin link di navbar (hanya untuk admin)
- Material icons untuk visual clarity

**Mobile:**
- Collapsible menu
- Touch-friendly buttons
- Optimized layout

---

## 📊 Database Schema

Sistem admin menggunakan tabel `users` yang sudah ada:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles Available:**
- `user` - User biasa (default)
- `asesor` - Asesor
- `admin` - Administrator

---

## 🛠️ Pengembangan Lanjutan

### Fitur yang Bisa Ditambahkan

1. **Content Management**
   - Manage halaman-halaman website
   - Upload dan manage media files
   - Edit konten dinamis

2. **Certification Management**
   - Manage data sertifikasi
   - Approve/reject pendaftaran
   - Generate sertifikat

3. **Asesor Management**
   - Assign asesor ke sertifikasi
   - Schedule management
   - Performance tracking

4. **Analytics & Reports**
   - User growth charts
   - Activity logs
   - Export reports (CSV, PDF)

5. **Settings**
   - System configuration
   - Email templates
   - Notification settings

6. **Audit Log**
   - Track all admin actions
   - Security monitoring
   - Change history

### Menambah Tabel Database

Untuk fitur-fitur baru, Anda mungkin perlu menambah tabel:

```sql
-- Audit log
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50),
    entity VARCHAR(50),
    entity_id INTEGER,
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certifications
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    certification_type VARCHAR(100),
    status VARCHAR(20),
    issued_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Tidak bisa akses Admin Panel

**Problem:** Setelah login, tidak ada menu Admin
**Solution:**
- Pastikan user memiliki role `admin` di database
- Logout dan login kembali
- Clear localStorage dan cookies

### Error 403 Forbidden

**Problem:** API return 403 Forbidden
**Solution:**
- Pastikan role di database adalah `admin`
- Cek token masih valid
- Logout dan login kembali

### Users tidak muncul di tabel

**Problem:** Tabel kosong atau loading terus
**Solution:**
- Cek console untuk error messages
- Pastikan database connection berhasil
- Cek API endpoint accessible

### Tidak bisa delete user

**Problem:** Error saat delete user
**Solution:**
- Admin tidak bisa delete dirinya sendiri
- Cek foreign key constraints di database
- Pastikan user_id valid

---

## 📝 Best Practices

### Security

1. **Jangan expose JWT_SECRET** - Simpan di environment variables
2. **Use HTTPS** di production
3. **Rate limiting** untuk API endpoints
4. **Input sanitization** untuk mencegah XSS
5. **Regular security audits**

### Performance

1. **Use pagination** untuk large datasets
2. **Cache statistics** jika tidak real-time critical
3. **Optimize database queries** dengan indexing
4. **Lazy load components** untuk faster initial load

### Code Quality

1. **Consistent error handling**
2. **Proper logging** untuk debugging
3. **Code comments** untuk complex logic
4. **Type checking** dengan TypeScript (opsional)

---

## 📞 Support & Maintenance

### Monitoring

Pantau hal-hal berikut secara berkala:
- Database performance
- API response times
- Error rates
- User activity patterns

### Backup

Lakukan backup database secara rutin:
```bash
# Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore dari backup
psql $DATABASE_URL < backup_20240101.sql
```

### Updates

Update dependencies secara berkala:
```bash
npm outdated
npm update
```

---

## 🎓 Credits

Admin Panel ini dibuat dengan:
- **Next.js 16** - React Framework
- **Tailwind CSS** - Styling
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

**Dibuat dengan ❤️ untuk LSP A3I**

Untuk pertanyaan atau masalah, silakan hubungi tim development.
