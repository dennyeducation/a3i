# 📜 Certificate Management - Admin Panel

Dokumentasi lengkap untuk fitur Certificate Management di Admin Panel LSP A3I.

## 📋 Fitur Certificate Management

✅ **View All Certificates** - Lihat semua sertifikat yang telah diterbitkan
✅ **Search & Filter** - Cari dan filter sertifikat berdasarkan berbagai kriteria
✅ **Edit Certificate** - Update informasi sertifikat
✅ **Delete Certificate** - Hapus sertifikat dari sistem
✅ **Status Management** - Ubah status sertifikat (active, pending, expired, revoked)
✅ **Statistics Dashboard** - Lihat statistik sertifikat secara real-time
✅ **Pagination** - Navigasi data sertifikat yang efisien

---

## 🚀 Cara Mengakses Certificate Management

### 1. Login sebagai Admin/SuperAdmin

Untuk mengakses certificate management, Anda harus login dengan akun yang memiliki role `ADMIN` atau `SUPERADMIN`.

**User Dummy untuk Testing:**
- **Email**: `admin1@lsp-a3i.com`
- **Password**: `Admin@2024`

atau

- **Email**: `superadmin@lsp-a3i.com`
- **Password**: `Super@2024`

### 2. Akses Menu Certificate Management

Setelah login:
1. Klik menu **"Admin"** di Navbar
2. Di Admin Dashboard, klik **"Manage Certificates"**
3. Atau langsung akses `/admin/certificates`

---

## 📁 Struktur File Certificate Management

```
a3i/
├── app/
│   ├── admin/
│   │   └── certificates/
│   │       ├── page.jsx              # Daftar semua sertifikat
│   │       └── [id]/
│   │           └── page.jsx          # Edit sertifikat
│   └── api/
│       └── admin/
│           └── certificates/
│               ├── route.js          # API GET all & POST create
│               └── [id]/
│                   └── route.js      # API GET, PUT, DELETE by ID
```

---

## 🎯 Fitur-Fitur Certificate Management

### 1. Dashboard Certificates (`/admin/certificates`)

Halaman utama untuk mengelola semua sertifikat dalam sistem:

**Statistik Cards:**
- **Total Sertifikat** - Jumlah total semua sertifikat
- **Active** - Sertifikat yang sedang aktif
- **Pending** - Sertifikat yang menunggu persetujuan
- **Expired** - Sertifikat yang sudah kadaluarsa

**Fitur Pencarian & Filter:**
- **Search Bar**: Cari berdasarkan:
  - Nama sertifikat
  - Nomor sertifikat
  - Nama pemegang sertifikat (username, full name)
  - Email pemegang
- **Status Filter**: Filter berdasarkan status
  - Semua Status
  - Active
  - Expired
  - Pending
  - Revoked

**Tabel Certificates:**
Kolom yang ditampilkan:
- **Pemegang Sertifikat** - Nama lengkap dan username
- **Sertifikat** - Nama dan jenis sertifikat
- **Nomor** - Nomor sertifikat (format: CERT-XXX-YYYY-NNN)
- **Tanggal** - Tanggal terbit dan kadaluarsa
- **Status** - Status dengan dropdown untuk quick edit
- **Skor** - Nilai/skor yang didapat
- **Aksi** - Edit dan Delete buttons

**Fitur Quick Status Change:**
- Dropdown status di setiap row untuk mengubah status langsung
- Status options: Active, Pending, Expired, Revoked
- Update real-time tanpa reload page

**Pagination:**
- 10 sertifikat per halaman
- Navigasi halaman dengan tombol Previous/Next
- Info jumlah data yang ditampilkan

### 2. Edit Certificate (`/admin/certificates/[id]`)

Halaman untuk mengedit informasi sertifikat:

**Informasi Pemegang:**
- Display card dengan info pemegang sertifikat (read-only)
- Menampilkan nama lengkap dan email

**Form Fields:**
- **Nama Sertifikat*** (required)
- **Jenis Sertifikat*** (required)
- **Nomor Sertifikat** (optional, harus unik)
- **Status*** (dropdown: pending, active, expired, revoked)
- **Tanggal Terbit** (date picker)
- **Tanggal Kadaluarsa** (date picker)
- **Skor** (number, 0-100)

**Validasi:**
- Nama dan jenis sertifikat wajib diisi
- Nomor sertifikat harus unik (jika diisi)
- Skor harus antara 0-100
- Format tanggal otomatis tervalidasi

---

## 🔧 API Endpoints

### Authentication
Semua endpoint memerlukan:
- Bearer token di header `Authorization`
- User harus memiliki role `ADMIN` atau `SUPERADMIN`

**Header Format:**
```
Authorization: Bearer <token>
```

### GET `/api/admin/certificates`

Mendapatkan daftar certificates dengan pagination dan filter.

**Query Parameters:**
- `page` (default: 1) - Nomor halaman
- `limit` (default: 10) - Jumlah data per halaman
- `search` (optional) - Keyword pencarian
- `status` (optional) - Filter status (active, pending, expired, revoked)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "certification_name": "Junior Web Developer",
      "certification_type": "Web Development",
      "certification_number": "CERT-JWD-2024-001",
      "status": "active",
      "issued_date": "2024-01-15",
      "expiry_date": "2027-01-15",
      "score": 85.5,
      "username": "asesi1",
      "email": "asesi1@lsp-a3i.com",
      "user_full_name": "Asesi Pertama",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCertificates": 3,
    "totalPages": 1
  }
}
```

### GET `/api/admin/certificates/[id]`

Mendapatkan detail certificate by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 5,
    "certification_name": "Junior Web Developer",
    "certification_type": "Web Development",
    "certification_number": "CERT-JWD-2024-001",
    "status": "active",
    "issued_date": "2024-01-15",
    "expiry_date": "2027-01-15",
    "score": 85.5,
    "username": "asesi1",
    "email": "asesi1@lsp-a3i.com",
    "user_full_name": "Asesi Pertama",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### POST `/api/admin/certificates`

Membuat certificate baru.

**Request Body:**
```json
{
  "user_id": 5,
  "certification_name": "Senior Web Developer",
  "certification_type": "Web Development",
  "certification_number": "CERT-SWD-2024-001",
  "status": "active",
  "issued_date": "2024-02-01",
  "expiry_date": "2027-02-01",
  "score": 92.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate created successfully",
  "data": {
    "id": 2,
    "user_id": 5,
    "certification_name": "Senior Web Developer",
    "certification_type": "Web Development",
    "certification_number": "CERT-SWD-2024-001",
    "status": "active",
    "issued_date": "2024-02-01",
    "expiry_date": "2027-02-01",
    "score": 92.5,
    "created_at": "2024-02-01T10:00:00.000Z"
  }
}
```

### PUT `/api/admin/certificates/[id]`

Update certificate.

**Request Body (semua field optional):**
```json
{
  "certification_name": "Junior Web Developer - Updated",
  "certification_type": "Web Development",
  "certification_number": "CERT-JWD-2024-001-UPD",
  "status": "expired",
  "issued_date": "2024-01-15",
  "expiry_date": "2024-12-31",
  "score": 88.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate updated successfully",
  "data": {
    "id": 1,
    "user_id": 5,
    "certification_name": "Junior Web Developer - Updated",
    "certification_type": "Web Development",
    "certification_number": "CERT-JWD-2024-001-UPD",
    "status": "expired",
    "issued_date": "2024-01-15",
    "expiry_date": "2024-12-31",
    "score": 88.0,
    "updated_at": "2024-02-25T15:30:00.000Z"
  }
}
```

### DELETE `/api/admin/certificates/[id]`

Hapus certificate.

**Response:**
```json
{
  "success": true,
  "message": "Certificate deleted successfully"
}
```

---

## 🗄️ Database Schema

Certificate Management menggunakan tabel `certifications`:

```sql
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    certification_type VARCHAR(100) NOT NULL,
    certification_number VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    issued_date DATE,
    expiry_date DATE,
    score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'expired', 'revoked'))
);

-- Indexes for performance
CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_certifications_status ON certifications(status);
CREATE INDEX idx_certifications_number ON certifications(certification_number);
```

**Status Options:**
- `pending` - Sertifikat sedang diproses/menunggu persetujuan
- `active` - Sertifikat aktif dan valid
- `expired` - Sertifikat sudah kadaluarsa
- `revoked` - Sertifikat dicabut/dibatalkan

---

## 🎨 UI/UX Features

### Design System

**Color Coding by Status:**
- **Active** - Green (bg-green-500/10, text-green-400)
- **Pending** - Yellow (bg-yellow-500/10, text-yellow-400)
- **Expired** - Red (bg-red-500/10, text-red-400)
- **Revoked** - Gray (bg-slate-500/10, text-slate-400)

**Interactive Elements:**
- Hover effects pada table rows
- Loading states dengan spinner animation
- Success/Error messages dengan auto-dismiss
- Confirmation dialog untuk delete action
- Real-time status update dengan dropdown

**Responsive Design:**
- Mobile-friendly layout
- Horizontal scrolling untuk tabel di mobile
- Touch-optimized buttons
- Adaptive pagination controls

---

## 🔒 Keamanan & Validasi

### Backend Security

**Authentication & Authorization:**
- JWT token verification
- Role-based access control (ADMIN/SUPERADMIN only)
- Token expiration handling

**Data Validation:**
- Required fields validation
- Unique constraint pada certification_number
- Status enum validation
- Foreign key constraint (user_id must exist)
- SQL injection prevention dengan parameterized queries

**Error Handling:**
- Proper HTTP status codes
- Descriptive error messages
- Graceful error recovery

### Frontend Validation

**Form Validation:**
- HTML5 required attributes
- Client-side format validation
- Real-time error feedback
- Disabled submit during processing

**User Experience:**
- Confirmation before delete
- Loading indicators
- Success/error notifications
- Automatic redirect after success

---

## 📊 Sample Data

Jika Anda sudah menjalankan seed script (`node scripts/seed-sample-data.js`), akan ada 3 sample certificates:

1. **Junior Web Developer**
   - Type: Web Development
   - Number: CERT-JWD-2024-001
   - Status: Active
   - Score: 85.5

2. **Graphic Designer**
   - Type: Design
   - Number: CERT-GD-2023-042
   - Status: Active
   - Score: 92.0

3. **Data Analyst**
   - Type: Data Science
   - Number: CERT-DA-2024-015
   - Status: Pending

---

## 🧪 Testing Guide

### 1. Test View Certificates

1. Login sebagai admin (`admin1@lsp-a3i.com` / `Admin@2024`)
2. Navigate ke `/admin/certificates`
3. Verify bahwa semua sertifikat ditampilkan
4. Check statistics cards menampilkan angka yang benar

### 2. Test Search Function

1. Di halaman certificates, masukkan keyword di search bar
2. Test search dengan:
   - Nama sertifikat: "Junior Web"
   - Nomor sertifikat: "CERT-JWD"
   - Username: "asesi1"
   - Email: "asesi1@lsp"
3. Verify hasil search akurat

### 3. Test Filter by Status

1. Pilih status dari dropdown filter
2. Test setiap status:
   - Active
   - Pending
   - Expired
   - Revoked
3. Verify hanya sertifikat dengan status tersebut yang muncul

### 4. Test Quick Status Change

1. Pada tabel, klik dropdown status di salah satu row
2. Pilih status baru
3. Verify:
   - Success message muncul
   - Status berubah di tabel
   - Statistics cards ter-update

### 5. Test Edit Certificate

1. Klik icon Edit (pencil) pada salah satu certificate
2. Update beberapa field
3. Klik "Simpan Perubahan"
4. Verify:
   - Success message muncul
   - Redirect ke list certificates
   - Data ter-update di tabel

### 6. Test Delete Certificate

1. Klik icon Delete (trash) pada salah satu certificate
2. Confirm deletion di dialog
3. Verify:
   - Success message muncul
   - Certificate hilang dari list
   - Statistics ter-update

### 7. Test Pagination

1. Jika ada lebih dari 10 certificates:
2. Test tombol "Selanjutnya" dan "Sebelumnya"
3. Verify navigation bekerja dengan baik

---

## 🐛 Troubleshooting

### Certificate tidak muncul

**Problem:** Tabel kosong atau loading terus
**Solution:**
- Cek console browser untuk error
- Verify database connection
- Cek apakah ada data di tabel `certifications`
- Run seed script jika belum ada data

### Error 403 Forbidden

**Problem:** API return 403 saat akses certificates
**Solution:**
- Pastikan user login dengan role ADMIN atau SUPERADMIN
- Check token masih valid (belum expired)
- Logout dan login kembali

### Status change tidak work

**Problem:** Status tidak berubah saat klik dropdown
**Solution:**
- Check console untuk error messages
- Verify API endpoint accessible
- Check authorization token valid

### Cannot delete certificate

**Problem:** Error saat delete certificate
**Solution:**
- Check foreign key constraints
- Verify certificate ID valid
- Check user permissions

---

## 🚀 Pengembangan Lanjutan

### Fitur yang Bisa Ditambahkan

1. **Bulk Actions**
   - Select multiple certificates
   - Bulk status update
   - Bulk delete with confirmation

2. **Certificate PDF Generation**
   - Generate PDF certificate
   - Download certificate
   - Email certificate to user

3. **Certificate Verification**
   - Public verification page
   - QR code for certificate
   - Verification API endpoint

4. **Advanced Filters**
   - Filter by date range
   - Filter by certification type
   - Filter by user role

5. **Export Features**
   - Export to CSV
   - Export to Excel
   - Custom report generation

6. **Certificate Templates**
   - Manage certificate templates
   - Customizable design
   - Multiple template options

7. **Notifications**
   - Email notification when certificate issued
   - Reminder before expiry
   - Notification when status changes

8. **Audit Log**
   - Track certificate changes
   - Who made the changes
   - Change history

---

## 📝 Best Practices

### Data Management

1. **Regular Backups** - Backup tabel certifications secara rutin
2. **Data Validation** - Selalu validate input di frontend dan backend
3. **Unique Numbers** - Pastikan nomor sertifikat unik
4. **Status Tracking** - Update status secara berkala (expired check)

### Security

1. **Access Control** - Hanya admin yang bisa manage certificates
2. **Token Security** - Simpan token dengan aman
3. **Input Sanitization** - Prevent XSS dan SQL injection
4. **Audit Trail** - Log semua perubahan certificate

### Performance

1. **Pagination** - Gunakan pagination untuk large datasets
2. **Indexing** - Database indexes untuk field yang sering di-query
3. **Caching** - Cache statistics jika tidak perlu real-time
4. **Lazy Loading** - Load data on-demand

---

## 📞 Support

Untuk pertanyaan atau masalah terkait Certificate Management:
1. Check error messages di console
2. Verify database connection dan structure
3. Check API endpoint accessibility
4. Review authentication dan authorization

---

**Dibuat dengan ❤️ untuk LSP A3I**

Dokumentasi ini mencakup semua aspek dari Certificate Management system yang telah diimplementasikan.
