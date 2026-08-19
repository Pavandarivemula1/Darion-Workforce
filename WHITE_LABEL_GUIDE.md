# Enterprise White-Label & Multi-Tenancy Architecture Guide

This guide details the complete White-Label & Multi-Tenancy capabilities of the Workforce Management System.

---

## 1. Overview

The application is built to support full multi-tenant enterprise white-labeling. Any company or organization can run their own custom-branded instance featuring:
- **Custom Visual Identity**: Light/Dark logos, square monogram/app icons, dynamic favicons, and browser tab titles.
- **Dynamic Material Design 3 Palette Engine**: Supply any single brand primary hex code (e.g. `#059669` Emerald or `#7C3AED` Purple), and the system dynamically computes harmonious light and dark mode tokens with zero-flicker CSS variable injection.
- **Custom 2FA / TOTP Authentication**: Google Authenticator, Apple Passwords, and 1Password display the company's own custom issuer name when candidates scan their enrollment QR code.
- **Official Payslip & Document Customization**: Automatically generates official candidate salary slips with the company's legal name, Corporate Identity Number (CIN/Registration No.), GSTIN/Tax ID, registered corporate address, authorized digital signature, and official seal/stamp.
- **Custom Domains & Subdomains**: Edge host inspection automatically resolves branding based on custom domain (`attendance.yourcompany.com`) or subdomain (`yourcompany.workforce.app`).
- **Interactive Admin Branding Studio**: Built-in visual studio at `/admin/settings/branding` with real-time live mockup preview across candidate views, login screens, and PDF payslips.

---

## 2. Architecture & Data Model

### 2.1 Database Tables

#### `public.organizations`
Manages tenants and custom domain routing:
- `id` (UUID): Primary key.
- `name` (TEXT): Display name (e.g. `Acme Corp`).
- `legal_name` (TEXT): Registered legal entity name (e.g. `Acme Technologies Private Limited`).
- `slug` (TEXT): Unique tenant slug (e.g. `acme`).
- `custom_domain` (TEXT): Custom domain hostname (e.g. `attendance.acme.com`).
- `is_active` (BOOLEAN): Status flag.

#### `public.organization_branding`
Stores visual and styling tokens:
- `organization_id` (UUID): Foreign key referencing `organizations(id)`.
- `app_title` (TEXT): Workspace title (e.g. `Acme Workforce`).
- `tagline` (TEXT): Header subtitle / motto.
- `logo_light_url` (TEXT): Light canvas logo URL.
- `logo_dark_url` (TEXT): Dark canvas logo URL.
- `icon_url` (TEXT): 1:1 App Monogram / Favicon URL.
- `primary_color` (TEXT): Primary brand hex code (e.g. `#0B57D0`).
- `secondary_color` (TEXT): Secondary brand hex code.
- `accent_color` (TEXT): Tertiary brand hex code.
- `font_family` (TEXT): Typography selection (`Google Sans`, `Inter`, `Outfit`, `Plus Jakarta Sans`, etc.).
- `border_radius_style` (TEXT): Corner curvature (`sharp`, `compact`, `medium`, `modern`, `pill`).
- `tax_id` (TEXT): GSTIN / VAT / EIN.
- `cin_number` (TEXT): Corporate Registration Number.
- `address_line1`, `address_line2` (TEXT): Official corporate address.
- `signatory_name`, `signatory_title` (TEXT): Authorized payroll officer.
- `signature_url` (TEXT): Digital signature image.
- `stamp_url` (TEXT): Official company seal/stamp image.
- `mfa_issuer_name` (TEXT): TOTP Authenticator issuer name.

---

## 3. Dynamic Material Design 3 Theming Engine

The theme engine (`src/lib/branding/palette.ts`) calculates light and dark mode CSS variables from the primary hex:

| CSS Variable | Role |
| :--- | :--- |
| `--md-sys-color-primary` | Main buttons, active sidebar pills, status highlights |
| `--md-sys-color-on-primary` | High-contrast text on primary elements (Auto-calculated WCAG AAA) |
| `--md-sys-color-primary-container` | Selected table rows, badges, active tab backgrounds |
| `--md-sys-color-on-primary-container` | Text inside primary containers |
| `--md-sys-color-secondary` | Secondary badges and helper buttons |
| `--md-sys-color-tertiary` | Accent highlights and notifications |
| `--md-sys-shape-corner-medium` | Card and button border radius |

Styles are injected server-side into `<head>` in `src/app/layout.tsx` before hydration, eliminating any color flashing.

---

## 4. Custom Domain & DNS Configuration

To configure a custom domain (e.g. `attendance.yourcompany.com`):

1. **Add CNAME Record in DNS Provider** (Cloudflare, GoDaddy, AWS Route53, Namecheap):
   ```
   Type:  CNAME
   Host:  attendance (or @ for apex domain)
   Value: cname.workforce.app
   TTL:   Auto / 300
   ```
2. **Configure in Admin Studio**:
   - Navigate to `/admin/settings/branding` &rarr; **Domain & 2FA** tab.
   - Enter your hostname in **Custom Domain Hostname**.
   - Click **Save & Publish Changes**.
3. **Automatic Routing**:
   - The edge middleware detects the incoming `Host` / `x-forwarded-host` header and resolves the organization branding automatically.

---

## 5. Official Payslip Customization

The system generates compliant salary slips under the company's legal identity:
- **Header**: Official Legal Entity Name, CIN, Tax ID, Corporate Headquarters.
- **Computation**: Hourly rate calculation, standard hours, overshift pay, and INR amount in words.
- **Verification Footer**: Digital signature of the authorized signatory, company seal/stamp, and compliance disclaimer.
- **Print / PDF**: One-click browser print formatted cleanly for A4 export.

---

## 6. Accessing the Branding Studio

1. Sign in as an **Admin** user.
2. In the desktop sidebar or mobile more menu, click **Branding Studio** (`/admin/settings/branding`).
3. Select colors, upload logos, customize payslip credentials, and view instant live changes in the real-time device mockup.
4. Click **Save & Publish Changes**.
