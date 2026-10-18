# 🌍 WorldboxClone — Living World Simulation

Sebuah simulasi dunia hidup (*living world simulation*) deterministik terinspirasi dari game **WorldBox**. Proyek ini dibangun menggunakan **Angular 17 Standalone Components**, **HTML5 Canvas 2D Engine**, dan **Headless Deterministic Simulation Core** dengan pemisahan tegas antara logika simulasi dan lapisan visual.

Dukung game aslinya di 👉 [Super WorldBox Official](https://www.superworldbox.com/)

---

## 📑 Daftar Isi
- [Ikhtisar Proyek](#-ikhtisar-proyek)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Fitur Utama Terkini](#-fitur-utama-terkini)
  - [1. Headless Deterministic Simulation Core](#1-headless-deterministic-simulation-core)
  - [2. Sistem Kebutuhan, AI & Perilaku Entitas](#2-sistem-kebutuhan-ai--perilaku-entitas)
  - [3. Genetika, Silsilah & Tahap Usia](#3-genetika-silsilah--tahap-usia)
  - [4. Kelompok Sosial & Pemukiman (Clans & Settlements)](#4-kelompok-sosial--pemukiman-clans--settlements)
  - [5. Visualisasi Grafis & Smooth Movement](#5-visualisasi-grafis--smooth-movement)
  - [6. Layer Objek & Sumber Daya Alam (Pixel Art)](#6-layer-objek--sumber-daya-alam-pixel-art)
  - [7. Living World Inspector UI (Toolbar Atas)](#7-living-world-inspector-ui-toolbar-atas)
  - [8. World Time & Navigasi Kamera](#8-world-time--navigasi-kamera)
- [Spesifikasi Teknis](#-spesifikasi-teknis)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 🔭 Ikhtisar Proyek

WorldboxClone mensimulasikan ekosistem dunia mikrokosmos di atas grid 64×64 tile (640×640 piksel) yang dihuni oleh entitas otonom (dimulai dari Adam & Hawa). Setiap individu memiliki genom unik, kebutuhan fisik nyata (lapar, lelah, kesehatan), siklus penuaan, serta dorongan untuk berkeluarga, membentuk klan nomad, mengumpulkan sumber daya, dan membangun desa peradaban.

---

## 🏛️ Arsitektur Sistem

Sistem dirancang dengan arsitektur **decoupled & deterministic**:

```text
┌─────────────────────────────────────────────────────────────────┐
│                   Simulation Engine (Headless)                  │
│  - Mulberry32 PRNG (Deterministic Seeded Random)                │
│  - Discrete Tick Loop (Needs, Goals, Navigation, Settlements)   │
│  - Event Logger & World State Serializer                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Sync State (600ms tick)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SimulationBridgeService                       │
│  - State Adapter & Read-only Query Selectors                    │
│  - Entity Lifecycle & Position Interpolation Tracker            │
│  - Reactive Dirty Tiles Diffing                                 │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
                 ▼                               ▼
┌────────────────────────────────┐ ┌──────────────────────────────┐
│     Canvas 2D Rendering        │ │     Inspector & Toolbar      │
│ - Base Terrain (Autotiling)    │ │ - World Time indicator       │
│ - Water wave frames animation  │ │ - 6-Tab Living Inspector     │
│ - Procedural Resource Overlays │ │ - Search, Filters & Lineage  │
│ - 60 FPS Lerp NPC Sprites      │ │ - Camera Locator Viewport    │
└────────────────────────────────┘ └──────────────────────────────┘
```

---

## 🚀 Fitur Utama Terkini

### 1. Headless Deterministic Simulation Core
- **Mulberry32 PRNG**: Seluruh keputusan acak (mutasi genetika, jalur eksplorasi, pilihan pasangan) dikendalikan oleh seeded RNG deterministik. Dunia dengan seed yang sama menghasilkan riwayat simulasi yang identik.
- **Tick Diskrit**: Waktu berjalan per *tick* (default: 600 ms). Semua sistem berjalan pada fase urutan teratur (Kebutuhan $\rightarrow$ Keputusan AI $\rightarrow$ Navigasi $\rightarrow$ Pengumpulan $\rightarrow$ Pembentukan Klan $\rightarrow$ Reproduksi $\rightarrow$ Konstruksi Desa).
- **Save/Load State**: Serialisasi dan deserialisasi state simulasi lengkap dalam format JSON yang valid dan deterministik.

### 2. Sistem Kebutuhan, AI & Perilaku Entitas
- **Kebutuhan Fisik Nyata**:
  - **Lapar (`hunger`)**: Bertambah setiap tick. Saat lapar ($\ge 45$), NPC otomatis mencari dan memakan sumber pangan terdekat. Jika kelaparan kritis ($\ge 75$), kesehatan berkurang hingga risiko kematian.
  - **Energi (`energy`)**: Terkuras saat bergerak dan bekerja. Saat lelah ($\le 20$), NPC berhenti untuk istirahat dan memulihkan stamina.
  - **Kesehatan (`health`)**: Berkurang akibat kelaparan/usia tua, regenerasi perlahan saat kenyang dan istirahat.
- **Pengambilan Keputusan Otonom (Goal-Driven AI)**:
  Hierarki kebutuhan terstruktur:
  `Kritis/Kelaparan` $\rightarrow$ `Makan` $\rightarrow$ `Istirahat` $\rightarrow$ `Mencari Pasangan` $\rightarrow$ `Kerja Kelompok/Klan` $\rightarrow$ `Eksplorasi Multitep` $\rightarrow$ `Idle`.
- **Eksplorasi Berkelanjutan (Multi-Tile Exploration)**:
  NPC dewasa tidak lagi bergetar acak di 1 tile, melainkan memilih destinasi penjelajahan berjarak **3 hingga 6 tile** dan mempertahankan arah perjalanan hingga sampai tujuan.

### 3. Genetika, Silsilah & Tahap Usia
- **Sistem Genom Pewarisan**:
  Setiap individu membawa genom 4 alel:
  - `strength`: Mempengaruhi ketahanan fisik dan kecepatan kerja.
  - `sociability`: Mempengaruhi kecenderungan membentuk klan dan mencari pasangan.
  - `exploration`: Mempengaruhi jangkauan penjelajahan wilayah.
  - `fertility`: Mempengaruhi peluang kelahiran anak.
  Reproduksi menggabungkan alel kedua orang tua (*crossover*) dengan mutasi probabilistik berbatas $[0.0, 1.0]$.
- **Tiga Tahap Usia (Life Stages)**:
  - **Anak (`child`, 0–20 tick)**: Belum bisa bereproduksi; memiliki perilaku mengikuti orang tua (`follow_parent`).
  - **Dewasa (`adult`, 21–100 tick)**: Mandiri, bekerja, menjelajah, dan dapat bereproduksi jika kebutuhan terpenuhi (`cooldown: 30 tick`).
  - **Lansia (`elder`, 101+ tick)**: Mengalami peluang kematian alami bertahap sesuai usia.

### 4. Kelompok Sosial & Pemukiman (Clans & Settlements)
- **Klan / Kelompok Sosial (Clans)**:
  - Individu dewasa yang berdekatan secara otomatis membentuk klan/suku nomad.
  - Memiliki inventori bersama (*shared inventory*) untuk menampung cadangan makanan, kayu, dan batu.
  - Anggota klan bekerja sama mengumpulkan material untuk kepentingan kelompok.
- **Pendirian Pemukiman (Settlements)**:
  - Penilaian kelayakan lokasi (*site scoring*) berbasis ketersediaan air tawar dan tanah subur.
  - Klan nomad yang menempati lokasi subur otomatis mendirikan desa pemukiman (*settled*).
  - Pembangunan otomatis gubuk tempat tinggal (*Houses*, menambah kapasitas warga) dan gudang bersama (*Storage Huts*, memperluas kapasitas stok barang).

### 5. Visualisasi Grafis & Smooth Movement
- **Spawn Tepat di Tengah Peta**: Adam & Hawa secara otomatis ditempatkan di tanah subur terdekat dari pusat dunia `(32, 32)` pada awal simulasi.
- **Interpolasi Gerak 60 FPS (Lerp Movement)**:
  - Posisi visual NPC diinterpolasikan secara halus antar-tick (600 ms) di canvas 60 FPS.
  - Arah hadap sprite (`left`, `right`, `up`, `down`) dan animasi langkah kaki mengikuti arah perjalanan sebenarnya secara otomatis.
- **Skala & Offset Visual Anak**:
  - Sprite anak dirender proporsional dengan skala **55%** dari ukuran dewasa.
  - Offset visual khusus memastikan anak berdiri berdampingan dengan ibunya dan tidak tertindih.
  - Depth-sorting (pengurutan sumbu Y) memastikan karakter di posisi bawah layar tampil di depan karakter yang berada di atas.

### 6. Layer Objek & Sumber Daya Alam (Pixel Art)
Renderer prosedural khusus di atas tile tanpa ketergantungan aset gambar luar:
- 🌲 **Pohon / Kayu (`tree`)**: Batang kayu berpiksel dengan kanopi daun rindang bertingkat pada tile berkayu.
- 🍓 **Semak Pangan (`food`)**: Semak hijau dengan buah beri merah/oranye pada tile bertanaman pangan.
- 🪨 **Bongkahan Batu (`rock`)**: Bebatuan abu-abu dengan bayangan dan highlight pada tile deposit batu.
- 🏠 **Gubuk Pemukiman (`house`)**: Rumah kayu beratap genteng merah bata di pemukiman warga.
- 📦 **Gudang Bersama (`storage`)**: Bangunan peti/lumbung penyimpanan clan berornamen emas.
- **Sinkronisasi Reaktif**: Tile yang ditebang, dipanen, atau dibangun langsung ter-update secara otomatis di layar.

### 7. Living World Inspector UI (Toolbar Atas)
Panel observer interaktif *read-only* dengan 6 tab utama:
1. 👤 **People**: Daftar warga, pencarian ID/Nama, filter status (Hidup/Meninggal), filter usia (Semua/Anak/Dewasa/Lansia), indikator status meter (Lapar, Energi, Kesehatan), rincian genom, tombol cepat ke keluarga, dan tombol pelacak kamera.
2. 👨‍👩‍👧‍👦 **Families**: Diagram silsilah 3 generasi (Orang tua, Pasangan, Anak-anak, Saudara kandung) yang aman dari siklus kekerabatan dan entitas hilang.
3. 🏕️ **Clans**: Pemantauan suku (Nomad / Settled), inventori bersama, nama pemimpin, dan daftar anggota hidup.
4. 🏛️ **Settlements**: Daftar desa pemukiman, koordinat tile, kapasitas hunian/penyimpanan, daftar bangunan, dan sensus penduduk.
5. 📜 **History**: Feed kronologis peristiwa dunia (kelahiran, kematian, konsumsi sumber daya, pembentukan klan, pendirian desa, pembangunan) dengan filter kategori event.
6. 📊 **World Stats**: Ringkasan populasi hidup, total kelahiran & kematian, demografi umur, rata-rata kebutuhan hidup (aman dari NaN saat populasi kosong), dan total stok sumber daya dunia.

### 8. World Time & Navigasi Kamera
- **World Time Badge**: Menampilkan tick simulasi yang sedang berjalan (`Tick X · Running / Paused`).
- **Kontrol Simulasi**: Tombol Play/Pause untuk membekukan simulasi, dan Step (+1 Tick) untuk analisis langkah per langkah.
- **Brush & Eraser Tool**: Menggambar langsung medan (*Soil, Grass, Sand, Water*) dengan autotiling pantai dan air bergelombang dinamis.
- **Kontrol Kamera**:
  - Zoom in/out via tombol toolbar atau pinch/wheel mouse.
  - Pan drag canvas.
  - **Tombol Cari di Peta (Locate)**: Klik ikon 📍 pada profil warga atau desa untuk memusatkan kamera tepat ke koordinat target.

---

## 🛠️ Spesifikasi Teknis

| Komponen | Teknologi / Keterangan |
| :--- | :--- |
| **Framework** | Angular 17.2 (Standalone Components) |
| **Platform** | Web (HTML5 Canvas 2D, SSR Prerender capable) |
| **Simulasi** | Pure TypeScript Headless Engine |
| **Ukuran Grid** | 64 × 64 tile (Tile Size: 10×10 px, Canvas: 640×640 px) |
| **RNG Engine** | Mulberry32 Seeded PRNG |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`, `tsx`) |
| **Styling** | Clean Dark-Mode Glassmorphism UI (CSS3) |

---

## 💻 Panduan Instalasi & Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih tinggi
- npm versi 9 atau lebih tinggi

### Langkah-langkah
1. **Clone repositori**:
   ```bash
   git clone https://github.com/subhan-sd/worldboxClone.git
   cd worldboxClone
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm start
   # atau
   ng serve
   ```

4. **Buka di browser**:
   Akses `http://localhost:4200/` di peramban Anda.

---

## 🧪 Testing & Quality Assurance

Proyek ini dilengkapi dengan suite pengujian otomatis komprehensif untuk memastikan determinisme, integritas state, kestabilan jangka panjang, dan fungsi query UI:

```bash
# Menjalankan seluruh test suite simulasi & inspector (45 test cases)
npm run test:sim

# Memeriksa static type checker TypeScript
npx tsc --noEmit

# Membangun build produksi Angular
npm run build
```

### Cakupan Pengujian:
- ✅ **Milestone B**: Pembangkitan grid deterministik, batas panen sumber daya, regenerasi kapasitas, deteksi tile non-traversable.
- ✅ **Milestone C**: Navigasi BFS di sekitar rintangan, pencarian makanan saat lapar, kematian akibat kelaparan, transisi tahap usia.
- ✅ **Milestone D**: Mutasi & crossover genom berbatas $[0.0, 1.0]$, integritas 2 orang tua, cooldown reproduksi, restriksi usia anak.
- ✅ **Milestone E**: Invarian keanggotaan 2 arah klan, pembersihan anggota wafat, scoring lokasi pemukiman, deduksi biaya bangunan.
- ✅ **Milestone F**: Determinisme serialisasi Save/Load JSON, simulasi jangka panjang 1.000 tick tanpa degradasi memori / kebocoran event.
- ✅ **Inspector & Visual**: Sinkronisasi waktu dunia, filter & pencarian warga, pohon keluarga 3 generasi, proteksi relasi siklik, derivasi pixel-art objek tile, dan interpolasi pergerakan halus.
