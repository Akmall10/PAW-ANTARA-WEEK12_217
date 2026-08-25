# Secure Search App — SQL Injection, XSS, Validasi, Sanitasi, Escape HTML

Login + search produk, fokus materi keamanan web dasar. Ada **hub demo (`/demo`)**
isinya 5 kartu, 1 buat tiap topik. 2 topik pertama (Validasi & Sanitasi) selalu
aktif dan aman. 3 topik terakhir (Escape HTML, SQL Injection, XSS) sengaja nunjukin
behavior rentan buat belajar, jadi **dimatiin secara default** dan cuma bisa
diaktifin manual lewat `.env`.

## Struktur folder

```
secure-search-app/
├── app.js
├── config/database.js
├── models/
│   ├── user.model.js
│   ├── product.model.js
│   └── index.js
├── middlewares/
│   ├── auth.middleware.js
│   └── validators.js               # 🛡️ aturan validasi & sanitasi (topik #1, #2)
├── controllers/
│   ├── auth.controller.js          # register/login
│   ├── search.controller.js        # search produk (AMAN, dipakai beneran)
│   ├── demo.controller.js          # hub + demo validasi & sanitasi (SELALU AKTIF)
│   ├── demo.unsafe.controller.js   # demo escape HTML, SQLi, XSS (DI-GATE)
│   └── page.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── search.routes.js
│   ├── demo.routes.js              # 🛡️ semua 5 route topik keamanan ada di sini
│   └── page.routes.js
├── views/
│   ├── login.ejs / register.ejs / search.ejs
│   └── demo/
│       ├── index.ejs                # hub - 5 kartu menu
│       ├── validasi.ejs             # topik #1
│       ├── sanitasi.ejs             # topik #2
│       ├── escape-html.ejs          # topik #3 (di-gate)
│       ├── sql-injection.ejs        # topik #4 (di-gate)
│       ├── xss.ejs                  # topik #5 (di-gate)
│       └── disabled.ejs             # ditampilin kalo topik #3-5 lagi dimatiin
└── seeders/seed.js                  # 1 produk sengaja isi payload XSS
```

## Cara install & jalanin

1. Bikin database:

```sql
CREATE DATABASE product_db;
```

2. Copy `.env.example` jadi `.env`, sesuaikan kredensial DB.

3. Install & seed:

```bash
npm install
npm run seed
```

4. Jalankan:

```bash
npm run dev
```

5. Buka `http://localhost:3000`, login pake `rizki` / `password123`.

## Endpoint

| Method   | Endpoint                   | Auth  | Keterangan                           |
| -------- | -------------------------- | ----- | ------------------------------------ |
| GET/POST | /register                  | -     | Daftar akun                          |
| GET/POST | /login                     | -     | Login (session)                      |
| POST     | /logout                    | login | Logout                               |
| GET      | /search                    | login | Search produk (AMAN, beneran dipake) |
| GET      | /demo                      | login | **Hub** — 5 kartu menu ke tiap topik |
| GET/POST | /demo/validasi-server-side | login | Topik #1, selalu aktif               |
| GET/POST | /demo/sanitasi             | login | Topik #2, selalu aktif               |
| GET      | /demo/escape-html          | login | Topik #3, **di-gate**                |
| GET      | /demo/sql-injection        | login | Topik #4, **di-gate**                |
| GET      | /demo/xss                  | login | Topik #5, **di-gate**                |

Setelah login, langsung diarahin ke `/demo` — hub berisi 5 kartu menu ke tiap topik.

## 5 Topik Keamanan — Contoh & Di Mana Ditanganinya

### 1️⃣ Validasi Input Server-Side — `/demo/validasi-server-side`

**Selalu aktif**, gak berbahaya. Ditanganin di `middlewares/validators.js` →
`registerValidationRules`, dipasang di `routes/demo.routes.js` sebelum controller.

```js
// middlewares/validators.js
const registerValidationRules = [
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username harus 3-20 karakter")
    .isAlphanumeric()
    .withMessage("Username cuma boleh huruf & angka"),
  body("email").isEmail().withMessage("Format email gak valid"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/\d/)
    .withMessage("Password harus mengandung minimal 1 angka"),
];
```

**Coba di form**: kosongin field, isi username pake simbol (`admin!!!`), atau
password pendek (`123`) — server nolak & kasih pesan spesifik per field. Coba juga
disable JS di browser atau submit lewat Postman langsung ke endpoint — validasi
tetep jalan, karena dicek di server, bukan cuma di HTML `required`/JS client.

### 2️⃣ Sanitasi — `/demo/sanitasi`

**Selalu aktif**, gak berbahaya. Ditanganin di `middlewares/validators.js` →
`sanitasiDemoRules`.

```js
// middlewares/validators.js
const sanitasiDemoRules = [
  body("teks").trim().escape(),
  body("email_input").optional({ checkFalsy: true }).trim().normalizeEmail(),
];
```

**Coba di form**: ketik `  <b>tes</b>  ` (ada spasi nempel) di field teks — hasilnya
jadi `&lt;b&gt;tes&lt;&#x2F;b&gt;` (spasi ilang, `<`/`>` diubah jadi entity aman).
Ketik `Budi.Santoso+promo@GMAIL.com` di field email — hasilnya dinormalisasi jadi
`budisantoso@gmail.com` (lowercase, alias Gmail dibuang).

### 3️⃣ Escape HTML — `/demo/escape-html` (di-gate)

Ditanganin di `views/demo/escape-html.ejs`, bandingin langsung 2 cara EJS nge-print
variabel:

```ejs
<!-- AMAN: auto-escape -->
<div><%= input %></div>

<!-- RENTAN: raw, gak di-escape -->
<div><%- input %></div>
```

**Coba payload**: `<img src=x onerror=alert(1)>` — kotak pertama nampilin teksnya
apa adanya, kotak kedua BENERAN motret gambar gagal & jalanin `alert(1)`.

### 4️⃣ SQL Injection — `/demo/sql-injection` (di-gate)

Ditanganin di `controllers/demo.unsafe.controller.js` → `sqlInjectionDemo`,
nunjukin 2 cara query berdampingan:

```js
// AMAN: parameterized query, Sequelize kirim query & value terpisah
const safeResults = await Product.findAll({
  where: { name: { [Op.iLike]: `%${q}%` } },
});

// ⚠️ RENTAN: string SQL disambung manual
const rawQuery = `SELECT * FROM products WHERE name ILIKE '%${q}%'`;
const [unsafeResults] = await sequelize.query(rawQuery);
```

**Coba payload**: `' OR '1'='1` — kolom AMAN gak nemu produk apapun (diperlakukan
sebagai teks pencarian literal). Kolom RENTAN malah nampilin SEMUA produk, karena
query-nya jadi `WHERE name ILIKE '%%' OR '1'='1%'` — kondisi `'1'='1'` selalu benar.

### 5️⃣ XSS (Cross-Site Scripting) — `/demo/xss` (di-gate)

Ditanganin di `controllers/demo.unsafe.controller.js` → `xssDemo` (reflected) +
`seeders/seed.js` (stored, 1 produk sengaja isi payload).

**Reflected XSS** — coba payload:

```
<script>alert('XSS dari ' + document.cookie)</script>
```

Kalo nge-alert, artinya script asing berhasil baca `document.cookie` milik user —
di dunia nyata dipake buat nyolong session/cookie login orang lain.

**Stored XSS** — buka `/search-unsafe-demo`, search apa aja biar semua produk
kekumpul. Ada 1 produk dari seeder yang NAMANYA sendiri berisi
`<script>alert("Stored XSS dari nama produk")</script>` — bedanya sama reflected:
payload ini udah "nempel" permanen di database, jadi ke-trigger ke SEMUA orang
yang buka halaman itu, bukan cuma yang pas ngetik payloadnya.

## Cara aktifin/matiin demo yang rentan (topik #3, #4, #5)

Default-nya **mati**. Buat aktifin (cuma di laptop lokal buat belajar):

```env
# di .env
ENABLE_VULN_DEMO=true
```

Restart server (`npm run dev`), bakal muncul warning di console. Sebaliknya, buat
mastiin aman di production: **jangan set** `ENABLE_VULN_DEMO=true` di `.env`
production (atau hapus/`false`-in barisnya). Efeknya bukan cuma nyembunyiin
tombolnya doang — `controllers/demo.unsafe.controller.js` (file yang isinya query
SQL rentan & output gak di-escape) **gak pernah ke-`require()` sama sekali** kalo
flag mati, jadi kodenya beneran gak pernah jalan di server (udah dites manual lewat
`require.cache`, konfirmed gak ke-load).

Kalo flag mati, buka `/demo/escape-html`, `/demo/sql-injection`, atau `/demo/xss`
bakal nampilin halaman `views/demo/disabled.ejs` yang jelasin cara aktifinnya,
bukan error/404 yang bikin bingung.

Endpoint lama `/search-unsafe-demo` (dari materi sebelumnya) masih ada juga, dipake
khusus buat demo Stored XSS, dan ikut aturan flag yang sama.

**⚠️ JANGAN PERNAH set `ENABLE_VULN_DEMO=true` di server manapun yang bisa diakses
orang lain** (termasuk WiFi kampus kalo laptop lu network-nya kebuka).

## Ide pengembangan / diskusi lanjutan

- Kenapa `UNION SELECT` di SQL Injection bisa dipake buat nyolong data dari
  tabel lain (`users`)? Coba bandingin struktur tabel `products` vs `users`.
- Content Security Policy (CSP) header sebagai lapisan pertahanan TAMBAHAN
  buat XSS (selain escape output) — kalo mau eksplorasi lebih lanjut pake
  `helmet` npm package.
- Rate limiting di endpoint login, biar gak kena brute-force password.
