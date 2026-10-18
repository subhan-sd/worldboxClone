# Living World — Local Asset Audit & Gap Analysis Report

Tanggal Audit: 19 Oktober 2026  
Status: Selesai (Read-only, tidak ada source code yang diubah)  
Target Audit: Folder local `C:\Users\IFG Life\Downloads\assets NPC` & Workspace `src/assets`

---

## 1. Ringkasan Folder yang Diperiksa

| Path Lokasi | Status Akses | Jumlah File Relevan | Catatan Pemeriksaan |
|---|---|---|---|
| `/mnt/c/Users/IFG Life/Downloads/assets NPC` | Berhasil diperiksa | 955 gambar, 9 dokumen, 21 aseprite | Folder download lokal user; memuat 11 paket asset & 6 file lepas. |
| `/mnt/c/Users/IFG Life/Downloads/assets NPC/__MACOSX` | Diabaikan (Metadata) | 1 file AppleDouble (`._FreePack.png`) | Bukan asset valid, diabaikan dari inventarisasi. |
| `/home/subhan/Project/worldboxClone/src/assets` | Berhasil diperiksa | 15 gambar aktif/arsip + folder demo | Folder asset internal repository game. |
| `/home/subhan/Project/worldboxClone/public` | Tidak tersedia di repo | 0 file | `angular.json` hanya memetakan target `"src/assets"`. |

---

## 2. Inventory Asset Lengkap

> **Catatan Status Penggunaan Aktual:**  
> Saat ini **hanya** sprite NPC di `src/assets/characters/npcs/` yang dimuat oleh renderer (`NpcService`). Seluruh terrain, resource, dan building saat ini dirender via **prosedural Canvas 2D fallback** (`TilesetService`).

| Asset / Paket | Path Aktual | Kategori Visual | Dimensi File / Frame | Animasi / Frame | Transparansi (Alpha) | Sumber / Creator | Lisensi | Status Penggunaan | Visual Suitability | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| **NPC Active Roster** (10 file: `adam`, `hawa`, `male_1-4`, `female_1-4`) | `src/assets/characters/npcs/*.png` | Characters (Top-down) | 512×512 (Frame 64×64, siluet 14×32) | Walk 4 arah (baris 4–7, 6 frame/arah) | Ya (RGBA, binary edge) | Mana Seed / Seliel the Shaper | Free Demo / Commercial OK | **ACTIVE IN RENDERER** | **SUITABLE** (Base standard visual) | High |
| **Mana Seed Summer Forest** | `.../assets NPC/mana seed seasonal forest sample (summer)/seasonal sample (summer).png` | Terrain, Foliage, Cliffs | 256×256 (Grid 16×16, 16×16 tiles) | Statis | Ya (RGBA, 83.6% solid) | Seliel the Shaper | Sample Free / Commercial OK | Belum terintegrasi | **AVAILABLE & SUITABLE** | High |
| **Mana Seed Water Sparkles** | `.../assets NPC/mana seed seasonal forest sample (summer)/seasonal water animations/summer water sparkles B 16x16.png` | Water FX / Polish | 64×48 (Frame 16×16) | 4 frame animasi air (3 baris variasi) | Ya (RGBA) | Seliel the Shaper | Sample Free / Commercial OK | Belum terintegrasi | **AVAILABLE & SUITABLE** | High |
| **Mana Seed Waterfall** | `.../assets NPC/mana seed seasonal forest sample (summer)/seasonal water animations/summer waterfall B 16x16.png` | Water Polish | 128×160 (Frame 16×16) | Frame air terjun vertikal | Ya (RGBA) | Seliel the Shaper | Sample Free / Commercial OK | Belum terintegrasi | **AVAILABLE BUT NEEDS INTEGRATION** | High |
| **Mana Seed Base Demo 2.0** | `.../assets NPC/FREE Mana Seed Character Base Demo 2.0/` (361 sheets) | Character Parts & Weapons | 512×512 per layer | Stand, Walk, Run, Push, Pull, Jump | Ya (RGBA) | Seliel the Shaper | Demo Commercial OK | Belum terintegrasi | **AVAILABLE & SUITABLE** (Modular NPC) | High |
| **Mana Seed Farmer Sprite** | `.../assets NPC/Mana Seed Farmer Sprite Free Sample/farmer base sheets/*.png` (8 sheets) | Character Clothing | 1024×1024 (Frame 64×64) | Walk & Jump | Ya (RGBA) | Seliel the Shaper | Sample Commercial OK | Belum terintegrasi | **AVAILABLE & SUITABLE** | High |
| **Pixel 16 Woods v2** | `.../assets NPC/pixel_16_woods v2 free/pixel_16_woods v2 free/free_pixel_16_woods.png` | Vegetation & Resources | 352×192 (Grid 16×16, 22×12 tiles) | Statis | Ya (RGBA) | Pixel 16 Free Series | Free asset (itch.io) | Belum terintegrasi | **AVAILABLE & SUITABLE** | High |
| **Pixel 16 Village** | `.../assets NPC/Pixel 16 v2 village free/Pixel 16 v2 village free/Pixel 16 v2 village free.png` | Buildings & Props | 282×276 (Offset padding 16px, grid 16×16) | Statis | Ya (RGBA) | Pixel 16 Free Series | Free asset (itch.io) | Belum terintegrasi | **AVAILABLE & SUITABLE** (Solusi Rumah/Gudang) | High |
| **Pixel 16 Halloween** | `.../assets NPC/Free halloween stuff/.../free_pixel_16_woods.png` | Props (Themed) | 448×192 (Offset padding 16px, grid 16×16) | Statis | Ya (RGBA) | Pixel 16 Free Series | Free asset (itch.io) | Belum terintegrasi | **DUPLICATE / REDUNDANT** (Spooky theme) | Medium |
| **Pixel 16 Christmas** | `.../assets NPC/Christmas_free_stuff/.../Christmas_Free_stuff.png` | Props (Themed) | 282×160 (Offset padding 16px, grid 16×16) | Statis | Ya (RGBA) | Pixel 16 Free Series | Free asset (itch.io) | Belum terintegrasi | **DUPLICATE / REDUNDANT** (Snow theme) | Medium |
| **FreeEnvironment FreePack** | `.../assets NPC/FreeEnvironment/FreeEnvironment/FreePack.png` | Terrain & Trees | 512×384 (Grid 16×16) | Statis | Ya (RGBA) | FreeEnvironment Pack | Perlu verifikasi | Belum terintegrasi | **STYLE MISMATCH** (Desaturated/muddy) | High |
| **Pipoya RPG Characters** | `.../assets NPC/PIPOYA FREE RPG Character Sprites 32x32/` (386 files) | Characters | 96×128 (Frame 32×32) & 288×384 | 3 frame × 4 arah | Ya (RGBA) | Pipoya (`pipoya.net`) | Free / CC0 | Belum terintegrasi | **STYLE MISMATCH** (Chibi proportion) | High |
| **Tiny RPG Soldier & Orc** | `.../assets NPC/Tiny RPG Character Asset Pack ...` (133 files) | Characters / Combat | 100×100 per frame split & sheets | Side-view action / combat | Ya (RGBA) | Sven Thole / sagethe13th | Free Demo | Belum terintegrasi | **STYLE MISMATCH** (Side-view perspective) | High |
| **Basic Asset Pack (Animals)** | `.../assets NPC/Basic Asset Pack/Basic Animal Animations/` (33 files) | Fauna (Animals) | 64×16 (Frame 16×16, 4 frame) | 4-frame idle/walk | Ya (RGBA) | Basic Asset Pack | Perlu verifikasi | Belum terintegrasi | **NOT CURRENTLY SUPPORTED BY SIMULATION** | High |
| **UI Selection Cursor** | `src/assets/img/chosen.png` | UI Selection Cursor | 96×12 (Frame 12×12) | 8 frame cursor pulse | Ya (RGBA) | Pixel art internal | Domain project | Belum terintegrasi | **AVAILABLE & SUITABLE** | High |
| **Legacy Mini Sprite** | `src/assets/img/pixilart-drawing.png` | Character / Test | 48×12 (Frame 12×12) | 4 frame walk | Ya (RGBA) | Internal | Domain project | Belum terintegrasi | **DUPLICATE / REDUNDANT** | High |
| **Legacy Adam Sheet** | `src/assets/img/npcAdam_old.png` | Legacy NPC | 96×24 (Frame 24×24) | 4 frame walk | Ya (RGBA) | Internal | Domain project | Tidak digunakan | **DUPLICATE / REDUNDANT** | High |
| **IMG_6232 Sheet** | `.../assets NPC/IMG_6232.png` | Mini Combat Sprites | 192×160 (30 sprite 32×32) | Statis poses | Ya (RGBA) | Tidak diketahui | Perlu verifikasi | Belum terintegrasi | **STYLE MISMATCH** (Dark fantasy action) | High |
| **AI Concept Mockups** (`hawa.png`, `npcAdam2.png`, `npcAdam3.png`, `npcHawa2.png`, `npcKids.png`) | `.../assets NPC/*.png` (Loose files) | Concept Art / AI Render | 2172×724 & 1312×1199 | Tidak ada (statis) | **TIDAK ADA** (Mode RGB, >100k warna) | Generator AI (Midjourney/DALL-E) | Tidak berlisensi game | Tidak digunakan | **STYLE MISMATCH / UNUSABLE** | High |

---

## 3. Evaluasi Kompatibilitas Art Style

1. **Perspektif (Top-down vs Side-view):**
   - **Top-Down 3/4 (Cocok):** Mana Seed (Karakter & Forest), Pixel 16 (Woods & Village), Pipoya 32x32.
   - **Side-View (Tidak Cocok):** Tiny RPG Pack (Soldier & Orc menggunakan sudut pandang platformer/side-scroller 2D, bukan top-down).
2. **Dimensi Grid & Skala Karakter:**
   - Grid simulasi saat ini menggunakan skala **10px procedural** dengan karakter Mana Seed (frame 64×64, siluet aktual 14×32px).
   - Skala native Mana Seed dan Pixel 16 adalah **16×16 pixel per tile**. Karakter setinggi 32px merepresentasikan 2 tile tinggi di dunia top-down (proporsi natural RPG).
   - Pipoya berukuran 32×32 dengan kepala besar (proporsi 2 kepala / chibi), kontras dengan karakter dewasa Mana Seed yang lebih ramping (proporsi 3.5–4 kepala).
3. **Ketebalan Outline & Palet Warna:**
   - **Mana Seed:** Palet warm-earthy, shading mikro-dithering, outline berwarna gelap (soft tinted outline, bukan hitam pekat).
   - **Pixel 16:** Palet cerah tersaturasi, outline hitam 1-pixel tegas. Sangat tajam untuk objek lingkungan dan bangunan.
   - **FreeEnvironment:** Warna teredam (desaturated), 1.424 warna gradien halus, terlihat "berlumpur" jika disandingkan dengan karakter Mana Seed.
4. **Kualitas Alpha Edge & Kesiapan Engine:**
   - Mana Seed, Pixel 16, dan Pipoya memiliki transparansi biner bersih (alpha 0 atau 255), bebas artefak halo.
   - File AI (`hawa.png`, dsb.) tidak memiliki channel alpha sama sekali dan memiliki noise interpolasi continuous (>100k warna), tidak dapat diintegrasikan langsung sebagai sprite game.

---

## 4. Gap Analysis Kategori Kebutuhan

| Kategori Target | Item Target | Status Klasifikasi | Keterangan & Tindakan yang Diperlukan |
|---|---|---|---|
| **A. Terrain** | Grass | **AVAILABLE & SUITABLE** | Tersedia di `seasonal sample (summer).png` & `free_pixel_16_woods.png`. |
| | Soil / Dirt | **AVAILABLE & SUITABLE** | Tersedia di `seasonal sample (summer).png` (jalan setapak & tebing tanah). |
| | Sand | **MISSING** | Tidak ada tile pasir pantai khusus di paket yang ada. Perlu ditarik dari tile tanah terang atau dicari pack pantai 16×16. |
| | Water | **AVAILABLE & SUITABLE** | Tersedia di `seasonal sample (summer).png` dan `free_pixel_16_woods.png`. |
| | Rock Terrain | **AVAILABLE & SUITABLE** | Tersedia tekstur tebing/batu di `seasonal sample (summer).png`. |
| | Autotiling / Transition | **AVAILABLE BUT NEEDS INTEGRATION** | Autotile grass-to-cliff & grass-to-water tersedia di sheet, namun engine renderer saat ini masih menggunakan `drawShoreEdge()` prosedural gradient. |
| | Detail / Variasi Tile | **AVAILABLE & SUITABLE** | Bunga liar, rumput bertunas kecil di `free_pixel_16_woods.png` & Mana Seed. |
| **B. Vegetation** | Trees (Oak/Deciduous) | **AVAILABLE & SUITABLE** | 2 pohon besar kanopi rimbun di `free_pixel_16_woods.png` dan 1 pohon raksasa di Mana Seed. |
| | Tree Variants (Pine/Tall) | **AVAILABLE & SUITABLE** | Pohon cemara/pinus tersedia di `free_pixel_16_woods.png` (kolom kanan). |
| | Bushes | **AVAILABLE & SUITABLE** | Semak lebat 16×16 & 32×32 di `free_pixel_16_woods.png`. |
| | Grass Tufts / Small Plants | **AVAILABLE & SUITABLE** | Tersedia di `free_pixel_16_woods.png` (bunga, jamur, rumput kecil). |
| | Harvestable Plants | **AVAILABLE BUT NEEDS INTEGRATION** | Semak berry merah/kuning perlu dipotong dari semak `Pixel 16 Woods` atau disatukan dengan palet buah. |
| **C. Natural Resources** | Rocks / Stone Deposit | **AVAILABLE & SUITABLE** | Batu deposit tambang 16×16 dan 32×16 tersedia di `free_pixel_16_woods.png`. |
| | Sticks / Branches | **NOT CURRENTLY SUPPORTED BY SIMULATION** | Engine mengabstraksikan kayu sebagai `ResourceStock.wood` pada tile/inventori, bukan item ranting jatuh terpisah. |
| | Wood / Logs | **AVAILABLE & SUITABLE** | Gelondongan kayu potong (*fallen logs*) tersedia di `free_pixel_16_woods.png`. |
| | Food Resources | **AVAILABLE BUT NEEDS INTEGRATION** | Semak buah beri dan jamur hutan tersedia di `free_pixel_16_woods.png`. |
| **D. World Objects** | Stumps / Fallen Trees | **AVAILABLE BUT NOT SUPPORTED** | Sprite tunggul pohon tersedia di `free_pixel_16_woods.png`, tetapi simulasi menebang pohon langsung menghapus pohon tanpa state tunggul. |
| | Large Boulders | **AVAILABLE & SUITABLE** | Bongkahan batu besar 32×32 tersedia di `free_pixel_16_woods.png`. |
| | Houses / Buildings (MVP1) | **AVAILABLE & SUITABLE** | Rumah lengkap dengan atap genteng merah, dinding kayu, jendela, dan cerobong tersedia di `Pixel 16 v2 village free.png`. |
| | Storage Building (MVP1) | **AVAILABLE & SUITABLE** | Sprite gudang/peti logistik/barrel cluster tersedia di `Pixel 16 v2 village free.png`. |
| **E. UI** | Tile Selection Highlight | **AVAILABLE & SUITABLE** | File `src/assets/img/chosen.png` (animasi pulse 12×12) siap diintegrasikan menggantikan outline stroke canvas. |
| | Tool Icons (Terrain/Brush) | **MISSING** | Toolbar HTML saat ini menggunakan teks/simbol ASCII. Ikon kuas/sekop pixel art 16×16 belum tersedia. |
| | Object / Resource Icons | **MISSING** | Ikon mini (makanan, kayu, batu) untuk tab Inspector dan floating stats belum tersedia dalam format 12×12 / 16×16 terisolasi. |
| | Brush Preview Cursor | **MISSING** | Belum ada sprite preview kursor area kuas lingkaran/persegi. |
| **F. Optional Polish** | Water Animation | **AVAILABLE & SUITABLE** | `summer water sparkles B 16x16.png` menyediakan 4-frame kilau air tile 16×16. |
| | Waterfalls | **AVAILABLE BUT NEEDS INTEGRATION** | `summer waterfall B 16x16.png` tersedia tetapi map simulasi saat ini berformat flat 2D tanpa elevasi z-axis. |
| | Animal / Fauna | **NOT CURRENTLY SUPPORTED BY SIMULATION** | `Basic Asset Pack` memiliki 15 hewan animasi 16×16 berkualitas tinggi, namun core simulasi belum memiliki sistem fauna. |
| | Weather / Seasons | **NOT CURRENTLY SUPPORTED BY SIMULATION** | Simulasi belum mendukung siklus musim hujan/salju. |

---

## 5. Rekomendasi Art Style Dominan & Smallest Viable Asset Pack

### Art Style Pilihan: **Mana Seed Standard + Pixel 16 Hybrid** (16×16 Grid System)
- **Rasional:** Seluruh karakter visual game saat ini (`adam.png`, `hawa.png`, `male_*.png`, `female_*.png`) adalah output langsung dari **Mana Seed Character Base**. Mengubah karakter akan merusak konsistensi interpolasi 64-frame yang sudah berjalan.
- **Kombinasi Terbaik:**
  1. **Karakter & Aktor:** Menggunakan **Mana Seed Character Demo** (sudah aktif di `src/assets/characters/npcs/`).
  2. **Terrain Dasar & Polish Air:** Menggunakan **Mana Seed Seasonal Forest (Summer)** (`seasonal sample (summer).png` & `summer water sparkles`).
  3. **Vegetasi, Sumber Daya & Bangunan:** Menggunakan **Pixel 16 Series** (`free_pixel_16_woods.png` untuk pohon, batu, semak berry; `Pixel 16 v2 village free.png` untuk rumah dan gudang).
  4. **UI Highlight:** Menggunakan `src/assets/img/chosen.png` (8-frame selection box).

### Ringkasan Ekstraksi Smallest Viable Pack:
1. **Terrain:** 4 tile dasar (Rumput, Tanah, Air, Batu Tebing) diambil dari `seasonal sample (summer).png`.
2. **Pohon (Wood):** 1 pohon rindang (Oak, 48×64px) dari `free_pixel_16_woods.png`.
3. **Batu (Stone):** 1 batu tambang (Rock deposit, 16×16px) dari `free_pixel_16_woods.png`.
4. **Semak Buah (Food):** 1 semak berry (16×16px) dari `free_pixel_16_woods.png`.
5. **Rumah (House):** 1 bangunan gubuk pemukiman (32×32px atau 48×48px) dari `Pixel 16 v2 village free.png`.
6. **Gudang (Storage):** 1 bangunan gudang/peti logistik (32×32px) dari `Pixel 16 v2 village free.png`.
7. **Kursor Seleksi:** `src/assets/img/chosen.png`.

---

## 6. Spesifikasi Kebutuhan yang MISSING (Belum Tersedia)

Untuk kebutuhan yang teridentifikasi **MISSING**, berikut spesifikasi dimensi dan format yang perlu dicari:
1. **Sand Terrain Tile:**
   - Format: PNG 16×16 pixel transparan/solid.
   - Style: Warna kuning pastel hangat `#e6d29a`, konsisten dengan palet pantai Mana Seed.
2. **UI Resource Icons (Food, Wood, Stone, Population):**
   - Dimensi: 12×12 pixel atau 16×16 pixel, latar transparan (RGBA).
   - Style: Pixel art bersih dengan outline gelap tipis 1px agar mudah terbaca pada Inspector toolbar.
3. **Terrain Tool Icons (Brush, Inspect, Spawn):**
   - Dimensi: 16×16 pixel, RGBA.

---

## 7. Hal yang Perlu Diverifikasi Sebelum Integrasi

1. **Skala Tile Renderer:**
   - Game saat ini menggunakan konstanta `TILE_SIZE = 10` (`world.config.ts`), sedangkan asset grafis yang cocok berbasis **16×16 pixel**.
   - Sebelum mengintegrasikan tile grafis, perlu keputusan arsitektur: apakah `TILE_SIZE` dinaikkan menjadi `16` (membuat canvas 64×64 tile menjadi 1024×1024px), atau sprite 16×16 diskalakan ke 10px via canvas draw context.
2. **Lisensi Commercial & Attribution:**
   - **Mana Seed:** Lisensi mengizinkan penggunaan komersial dan non-komersial (*"You may use this demo asset commercially or non-commercially"*), atribusi ke Seliel the Shaper sangat dianjurkan.
   - **Pixel 16 & Pipoya:** Gratis untuk game, perlu mencantumkan nama kreator di kredit game/README.
   - **FreeEnvironment & Basic Asset Pack:** File teks lisensi tidak disertakan dalam zip unduhan; disarankan untuk verifikasi halaman unduhan aslinya sebelum perilisan komersial.

---

## 8. Verifikasi Visual (Contact Sheet)

Contact sheet visual perbandingan antar asset telah dibuat di direktori temporary external:
- **Path File Contact Sheet:** `/tmp/opencode/asset_audit_contact_sheet.png`
- **Dimensi:** 1000×750 pixel (RGBA).
