# Contributing to Darion Workforce System

Thank you for your interest in contributing to the **Darion Workforce Time Tracking & Attendance System**! We welcome bug reports, feature suggestions, documentation improvements, and pull requests from the community.

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors regardless of background or identity. Please be respectful and constructive in all discussions and code reviews.

---

## 🛠️ Getting Started

### 1. Fork & Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/darion-workforce-app.git
   cd darion-workforce-app
   ```

### 2. Install Dependencies
Ensure you have **Node.js 20+** and **npm** installed:
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local` and fill in your local or staging Supabase credentials:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💻 Development Guidelines

- **TypeScript**: Ensure all new code is strongly typed without `any` overrides where possible.
- **Next.js App Router**: Adhere to Next.js 16 App Router server vs client component conventions.
- **Supabase Policies**: All database queries must respect Row Level Security (RLS) policies.
- **Styling**: Use Tailwind CSS 4 with existing design system tokens and components.
- **Type Checking & Linting**:
  ```bash
  npm run type-check
  npm run lint
  ```

---

## 📬 Submitting a Pull Request

1. Create a feature branch with a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit your changes with clear, concise commit messages:
   ```bash
   git commit -m "feat(attendance): add export to excel filter"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request on GitHub describing your changes, motivation, and any testing performed.

---

## ⚖️ License Agreement

By contributing to this repository, you agree that your contributions will be licensed under the project's **GNU Affero General Public License v3.0 (AGPL-3.0)**.
