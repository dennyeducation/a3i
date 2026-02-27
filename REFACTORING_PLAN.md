# 📋 Rencana Refactoring: Pemisahan Landing Page

Dokumen ini berisi rencana lengkap untuk memisahkan Landing Page dari halaman-halaman lainnya agar struktur lebih modular dan maintainable.

---

## 🎯 Tujuan Refactoring

1. **Modularitas** - Setiap section menjadi component terpisah
2. **Reusability** - Component dapat digunakan kembali
3. **Maintainability** - Mudah maintain dan update
4. **Performance** - Lazy loading untuk section yang tidak terlihat
5. **Scalability** - Mudah menambah/menghapus section

---

## 📊 Analisis Struktur Saat Ini

### Current Structure (`app/page.jsx`)

File `page.jsx` saat ini berisi SEMUA section dalam satu file (185 baris):

```
app/page.jsx (185 lines)
├── Hero Section (baris 7-55)
├── About Section (baris 58-116)
├── Purpose Section (baris 119-164)
└── Partners Section (baris 167-180)
```

### Existing Pages

```
app/
├── page.jsx                    # Landing Page (MONOLITH)
├── profil/page.jsx            # Halaman Profil
├── kebijakan/page.jsx         # Halaman Kebijakan
├── sertifikasi/page.jsx       # Halaman Sertifikasi
├── asesor/page.jsx            # Halaman Asesor
├── tuk/page.jsx               # Halaman TUK
├── dokumentasi/page.jsx       # Halaman Dokumentasi
├── kontak/page.jsx            # Halaman Kontak
├── cek-sertifikat/page.jsx    # Halaman Cek Sertifikat
├── login/page.jsx             # Halaman Login
├── register/page.jsx          # Halaman Register
├── dashboard/page.jsx         # User Dashboard
└── admin/                     # Admin Panel
    ├── page.jsx
    ├── users/page.jsx
    └── certificates/page.jsx
```

---

## 🎨 Struktur Baru yang Diusulkan

### 1. Component-Based Architecture

```
app/
├── page.jsx                          # Landing Page (ORCHESTRATOR)
│   └── Import & compose components
│
├── (landing)/                        # Route group untuk landing sections
│   ├── components/                   # Landing-specific components
│   │   ├── HeroSection.jsx
│   │   ├── AboutSection.jsx
│   │   ├── PurposeSection.jsx
│   │   ├── PartnersSection.jsx
│   │   ├── StatsBar.jsx
│   │   └── CTASection.jsx (optional)
│   │
│   └── layout.jsx (optional)         # Layout khusus landing
│
├── components/                       # Shared components
│   ├── Navbar.jsx                    # Already exists
│   ├── Footer.jsx                    # Already exists
│   └── ui/                           # Reusable UI components
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       └── Section.jsx
│
├── profil/page.jsx                   # Separate page
├── kebijakan/page.jsx                # Separate page
├── sertifikasi/page.jsx              # Separate page
├── asesor/page.jsx                   # Separate page
├── tuk/page.jsx                      # Separate page
├── dokumentasi/page.jsx              # Separate page
├── kontak/page.jsx                   # Separate page
├── cek-sertifikat/page.jsx           # Separate page
│
├── (auth)/                           # Route group untuk auth
│   ├── login/page.jsx
│   └── register/page.jsx
│
├── (dashboard)/                      # Route group untuk dashboard
│   ├── dashboard/page.jsx
│   └── profile/
│       ├── edit/page.jsx
│       └── settings/page.jsx
│
└── admin/                            # Admin panel (already separated)
    ├── page.jsx
    ├── users/
    └── certificates/
```

---

## 📝 Detailed Implementation Plan

### Phase 1: Create Component Structure

#### Step 1.1: Create UI Components Library

**File:** `components/ui/Button.jsx`
```jsx
'use client';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    href,
    onClick,
    className = '',
    ...props
}) {
    // Reusable button component with variants
}
```

**File:** `components/ui/Card.jsx`
```jsx
'use client';

export default function Card({
    children,
    className = '',
    hover = false,
    ...props
}) {
    // Reusable card component
}
```

**File:** `components/ui/Section.jsx`
```jsx
'use client';

export default function Section({
    children,
    className = '',
    padding = 'default',
    ...props
}) {
    // Reusable section wrapper
}
```

#### Step 1.2: Extract Landing Sections

**File:** `app/(landing)/components/HeroSection.jsx`
```jsx
'use client';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center hero-gradient border-b border-white/5">
            {/* Hero content */}
        </section>
    );
}
```

**File:** `app/(landing)/components/StatsBar.jsx`
```jsx
'use client';

export default function StatsBar() {
    const stats = [
        { value: '5000+', label: 'Tenaga Kerja Tersertifikasi' },
        { value: '12+', label: 'Skema Kompetensi' },
        { value: '45+', label: 'Asesor Berpengalaman' },
        { value: '100%', label: 'Standar BNSP' }
    ];

    return (
        <div className="absolute bottom-0 w-full hidden lg:block translate-y-1/2 z-20">
            {/* Stats bar content */}
        </div>
    );
}
```

**File:** `app/(landing)/components/AboutSection.jsx`
```jsx
'use client';
import Link from 'next/link';
import Section from '@/components/ui/Section';

export default function AboutSection() {
    return (
        <Section className="bg-background-dark pt-32 lg:pt-48">
            {/* About content */}
        </Section>
    );
}
```

**File:** `app/(landing)/components/PurposeSection.jsx`
```jsx
'use client';
import Card from '@/components/ui/Card';

export default function PurposeSection() {
    const purposes = [
        {
            icon: 'workspace_premium',
            title: 'Standardisasi Kompetensi',
            desc: 'Menyediakan tolok ukur yang jelas...'
        },
        // ... more items
    ];

    return (
        <section className="section-padding bg-[#0A0A0A] relative overflow-hidden border-y border-white/5">
            {/* Purpose content */}
        </section>
    );
}
```

**File:** `app/(landing)/components/PartnersSection.jsx`
```jsx
'use client';

export default function PartnersSection() {
    const partners = ['LOGO BNSP', 'KEMNAKER', 'ASOSIASI A3I', 'ISO 9001'];

    return (
        <section className="py-20 bg-background-dark">
            {/* Partners content */}
        </section>
    );
}
```

#### Step 1.3: Update Main Landing Page

**File:** `app/page.jsx` (AFTER REFACTOR)
```jsx
import HeroSection from './(landing)/components/HeroSection';
import AboutSection from './(landing)/components/AboutSection';
import PurposeSection from './(landing)/components/PurposeSection';
import PartnersSection from './(landing)/components/PartnersSection';

export default function LandingPage() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <PurposeSection />
            <PartnersSection />
        </>
    );
}
```

---

### Phase 2: Create Separate Pages

#### Step 2.1: Ensure Each Menu Has Its Own Page

**Current pages that need review:**
- ✅ `/profil` - Already separate
- ✅ `/kebijakan` - Already separate
- ✅ `/sertifikasi` - Already separate
- ✅ `/asesor` - Already separate
- ✅ `/tuk` - Already separate
- ✅ `/dokumentasi` - Already separate
- ✅ `/kontak` - Already separate
- ✅ `/cek-sertifikat` - Already separate

**Pages to verify content:**
Check each page to ensure they are NOT referencing landing page content.

#### Step 2.2: Group Related Pages

**Auth Pages Group:** `app/(auth)/`
```
(auth)/
├── layout.jsx              # Optional: Auth-specific layout
├── login/page.jsx
└── register/page.jsx
```

**Dashboard Group:** `app/(dashboard)/`
```
(dashboard)/
├── layout.jsx              # Dashboard layout with sidebar
├── dashboard/page.jsx
└── profile/
    ├── edit/page.jsx
    └── settings/page.jsx
```

---

### Phase 3: Optimize & Enhance

#### Step 3.1: Add Lazy Loading

**File:** `app/page.jsx` (OPTIMIZED)
```jsx
import dynamic from 'next/dynamic';
import HeroSection from './(landing)/components/HeroSection';

// Lazy load sections below the fold
const AboutSection = dynamic(() => import('./(landing)/components/AboutSection'));
const PurposeSection = dynamic(() => import('./(landing)/components/PurposeSection'));
const PartnersSection = dynamic(() => import('./(landing)/components/PartnersSection'));

export default function LandingPage() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <PurposeSection />
            <PartnersSection />
        </>
    );
}
```

#### Step 3.2: Add Animation & Scroll Effects

**File:** `app/(landing)/components/ScrollReveal.jsx`
```jsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, className = '' }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            } ${className}`}
        >
            {children}
        </div>
    );
}
```

---

## 🗂️ File Structure Summary

### Before Refactoring
```
app/
├── page.jsx (185 lines - MONOLITH)
└── [other pages]
```

### After Refactoring
```
app/
├── page.jsx (15 lines - ORCHESTRATOR)
├── (landing)/
│   └── components/
│       ├── HeroSection.jsx (50 lines)
│       ├── AboutSection.jsx (60 lines)
│       ├── PurposeSection.jsx (50 lines)
│       ├── PartnersSection.jsx (25 lines)
│       └── ScrollReveal.jsx (30 lines)
├── components/
│   └── ui/
│       ├── Button.jsx (40 lines)
│       ├── Card.jsx (20 lines)
│       └── Section.jsx (15 lines)
├── (auth)/
│   ├── login/page.jsx
│   └── register/page.jsx
└── (dashboard)/
    ├── dashboard/page.jsx
    └── profile/
        ├── edit/page.jsx
        └── settings/page.jsx
```

---

## ✅ Benefits of This Refactoring

### 1. **Maintainability**
- ✅ Each section in its own file
- ✅ Easy to locate and update specific sections
- ✅ Reduced file size (15 lines vs 185 lines)

### 2. **Reusability**
- ✅ UI components can be reused across pages
- ✅ Consistent design language
- ✅ Less code duplication

### 3. **Performance**
- ✅ Lazy loading below-the-fold content
- ✅ Smaller bundle size per chunk
- ✅ Faster initial page load

### 4. **Scalability**
- ✅ Easy to add new sections
- ✅ Easy to remove sections
- ✅ Easy to reorder sections

### 5. **Developer Experience**
- ✅ Clear file organization
- ✅ Better code navigation
- ✅ Easier collaboration

### 6. **SEO**
- ✅ Each page has its own metadata
- ✅ Better URL structure
- ✅ Proper page hierarchy

---

## 📋 Implementation Checklist

### Phase 1: Component Extraction
- [ ] Create `components/ui/` directory
- [ ] Create `Button.jsx` component
- [ ] Create `Card.jsx` component
- [ ] Create `Section.jsx` component
- [ ] Create `app/(landing)/components/` directory
- [ ] Extract `HeroSection.jsx`
- [ ] Extract `StatsBar.jsx`
- [ ] Extract `AboutSection.jsx`
- [ ] Extract `PurposeSection.jsx`
- [ ] Extract `PartnersSection.jsx`
- [ ] Update `app/page.jsx` to import components

### Phase 2: Page Separation
- [ ] Verify all menu pages are separate
- [ ] Create `(auth)` route group
- [ ] Move login/register to `(auth)` group
- [ ] Create `(dashboard)` route group (optional)
- [ ] Create profile pages (`/profile/edit`, `/profile/settings`)

### Phase 3: Optimization
- [ ] Add dynamic imports for lazy loading
- [ ] Create `ScrollReveal` component
- [ ] Add scroll animations to sections
- [ ] Optimize images
- [ ] Add loading states

### Phase 4: Testing
- [ ] Test all landing sections render correctly
- [ ] Test navigation between pages
- [ ] Test responsive design
- [ ] Test performance (Lighthouse)
- [ ] Test SEO (meta tags, sitemap)

### Phase 5: Documentation
- [ ] Update README with new structure
- [ ] Document component props
- [ ] Create component usage examples
- [ ] Update deployment docs

---

## 🎯 Priority & Timeline

### Priority 1 (High) - Week 1
- Extract landing sections into components
- Create reusable UI components
- Update main page.jsx

### Priority 2 (Medium) - Week 2
- Group auth pages
- Create profile pages
- Add lazy loading

### Priority 3 (Low) - Week 3
- Add animations
- Optimize performance
- Complete documentation

---

## 🔄 Migration Strategy

### Step-by-Step Migration

1. **Backup Current Code**
   ```bash
   git add .
   git commit -m "Backup before refactoring"
   git branch backup-before-refactor
   ```

2. **Create New Structure**
   - Create directories first
   - Move components one by one
   - Test after each move

3. **Update Imports**
   - Update import paths
   - Verify no broken imports
   - Fix any TypeScript errors

4. **Test Thoroughly**
   - Test each page individually
   - Test navigation flow
   - Test responsive design

5. **Deploy**
   - Deploy to staging first
   - Run full QA
   - Deploy to production

---

## 📞 Questions & Decisions

### Route Groups vs Regular Folders?

**Route Groups `(name)`:**
- ✅ Don't affect URL structure
- ✅ Good for organization
- ✅ Can have separate layouts
- ❌ More complex structure

**Regular Folders:**
- ✅ Simple structure
- ✅ Part of URL
- ❌ Less flexible

**Recommendation:** Use route groups for logical grouping (auth, dashboard) but not for public pages.

### Server vs Client Components?

**Landing Page Sections:**
- Most sections can be **Server Components** (better performance)
- Only use Client Components when needed:
  - Interactive elements (buttons with onClick)
  - Animations
  - User input

**Current Status:**
- Hero: Client (has interactions)
- About: Can be Server
- Purpose: Can be Server
- Partners: Can be Server

---

## 🎨 Design Tokens (Optional Enhancement)

Consider creating a design system:

```
styles/
├── tokens.css
│   ├── Colors
│   ├── Spacing
│   ├── Typography
│   └── Shadows
└── components.css
```

---

## 📝 Notes

- All existing functionality must remain unchanged
- No breaking changes to URLs
- Maintain SEO rankings
- Keep deployment process simple
- Ensure backward compatibility

---

## 🚀 Next Steps

After completing this refactoring:

1. **Component Library**: Build out more reusable components
2. **Storybook**: Add component documentation
3. **Testing**: Add unit tests for components
4. **Performance**: Measure and optimize Core Web Vitals
5. **Accessibility**: Audit and fix a11y issues

---

**Prepared by:** Claude AI Assistant
**Date:** 2024
**Version:** 1.0

---

**Ready to implement? Let's start with Phase 1! 🚀**
