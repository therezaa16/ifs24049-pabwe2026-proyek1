# Disiplin Finansial Mahasiswa — Frontend

Aplikasi Vue 3 untuk mencatat keuangan mahasiswa. Keinginan yang dicatat akan **terkunci** dan baru terbuka setelah
mahasiswa menyelesaikan misi belajar (Pomodoro atau Active Recall).

## Teknologi
Vue 3, Vite, Pinia, Vue Router, Tailwind CSS, Chart.js, Vitest.

## Menjalankan
```bash
cp .env.example .env     # atur VITE_API_BASE_URL bila backend tidak lokal
npm install
npm run dev              # http://localhost:5173
npm run test:coverage    # tes + coverage (ambang 100%)
npm run build
```

## Struktur dan pembagian tanggung jawab
```
src/
  app/        router, layout, gaya global, sesi
  core/       http client, storage, format (tanpa logika bisnis)
  shared/     lintas fitur: components (BaseModal, ConfirmModal, FormField), composables (useToast, useFormSubmit),
              domain (tipe & status transaksi), presentation (label & nada transaksi)
  features/<fitur>/
    domain/          aturan murni (konstanta, validasi, perhitungan) — tanpa Vue, tanpa teks tampilan
    application/     store Pinia dan composable (use-case)
    infrastructure/  pemanggilan API
    presentation/    komponen Vue dan presenter (label, nada warna)
tests/        tes unit dan komponen, dipisah dari kode sumber
```
Aturan dependensi: `presentation → application → infrastructure`, dan semuanya boleh memakai `domain`.
`domain` tidak bergantung pada lapisan lain; label dan nada tampilan berada di `presentation/*.presenter.js`.

## Keputusan keamanan
- Token JWT disimpan di `localStorage` (backend memakai header Bearer). Risiko XSS dikurangi dengan
  Content-Security-Policy di `vercel.json`, tidak memakai `v-html`, dan token dihapus saat server membalas 401.
- Seluruh akses storage dibungkus `try/catch`.
- Pesan error form dihubungkan ke input lewat `aria-describedby` (komponen `FormField`).

## Desain
Semua warna memakai design token di `src/app/styles/tokens.css`; komponen tidak menulis kode warna langsung.

## CI/CD
`Jenkinsfile` menjalankan: install → tes + coverage → SonarQube (quality gate) → Trivy → build → deploy.
Konfigurasi analisis ada di `sonar-project.properties`.
