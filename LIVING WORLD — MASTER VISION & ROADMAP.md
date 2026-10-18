# LIVING WORLD — MASTER VISION & ROADMAP

Version: 1.0
Date: 2026-10-18
Status: Active Design Document

---

## 1. PROJECT IDENTITY

Living World adalah simulasi dunia fantasi sandbox yang menggabungkan:

- WorldBox: world creation, god tools, environmental simulation, dan kebebasan intervensi pemain.
- Crusader Kings III: individu, keluarga, dinasti, hubungan, trait, kepemimpinan, politik, dan sejarah.
- Original Fantasy Systems: gigantisme, mutasi, beragam ras, witch, sihir, monster, dan fenomena supernatural.

### Core Vision

Menciptakan dunia fantasi yang dapat berjalan secara mandiri, dihuni individu dengan kehidupan dan karakteristik berbeda, serta berkembang dari generasi ke generasi.

Pemain menciptakan kondisi awal, mengamati simulasi, dan mengintervensi dunia. Dunia kemudian merespons melalui aturan simulasi yang konsisten.

### Design Philosophy

1. Dunia harus berfungsi sebagai sistem, bukan sekadar dekorasi.
2. Makhluk harus bereaksi terhadap kondisi lingkungan.
3. Setiap fitur penting harus memiliki konsekuensi terhadap sistem lain.
4. Sejarah harus muncul dari kejadian yang benar-benar terjadi dalam simulasi.
5. Sistem biologis, sosial, ekonomi, dan supernatural harus dapat diperluas.
6. Hindari fake data, dummy state, dan UI yang menampilkan kemampuan yang sebenarnya belum berjalan.
7. Jangan mengimplementasikan ulang sistem yang sudah berfungsi tanpa alasan teknis yang jelas.
8. Setiap milestone harus dapat diuji dan mempunyai definisi selesai yang objektif.

---

## 2. PROJECT STATUS & ASSUMPTIONS

### Existing MVP1 Baseline

Berdasarkan status proyek yang dilaporkan, MVP1 dan tools/inspector dianggap telah diselesaikan.

Cakupan baseline MVP1:

- World grid dan resource dasar.
- Individu, identitas, kebutuhan, dan pergerakan.
- Genetik, trait, dan pewarisan.
- Keluarga dan reproduksi.
- Kelompok sosial.
- Settlement, rumah, gudang, dan migrasi.
- Toolbar, inspector, observability, atau tools yang sudah diimplementasikan sesuai hasil proyek.

PENTING:
Daftar di atas adalah baseline kerja berdasarkan status yang dilaporkan, bukan hasil audit independen terhadap seluruh kode repository.

Sebelum mengembangkan fitur berikutnya, lakukan audit untuk menentukan status setiap kemampuan:

- DONE: implementasi ada dan pengujian membuktikan perilakunya.
- PARTIAL: sebagian mekanik berjalan, tetapi ada gap.
- MISSING: belum diimplementasikan.
- UNVERIFIED: belum cukup bukti untuk menyatakan selesai.

Jangan mengulang pekerjaan DONE. Prioritaskan gap yang menghalangi milestone berikutnya.

---

## 3. ROADMAP LEVEL TINGGI

### Pilar A — World & Environment

A1. World Foundation & Generation
A2. Biomes, Resources & World Interaction
A3. Climate, Weather & Seasons
A4. Ecology & Natural Events
A5. God Tools, World Control & Observability

### Pilar B — Creatures & Biology

B1. Individual Life Simulation
B2. Genetics, Traits & Inheritance
B3. Species & Racial Differences
B4. Advanced Biology & Gigantism
B5. Life Cycles, Evolution & Population Dynamics

TOTAL ROADMAP AWAL: 10 milestone konseptual.

Milestone dapat dipecah atau digabung setelah audit repository. Penamaan A1–B5 adalah identitas roadmap, bukan kewajiban untuk membuat sepuluh proyek terpisah.

---

# PILAR A — WORLD & ENVIRONMENT

## A1. WORLD FOUNDATION & GENERATION

### Objective

Membuat dunia yang dapat dibuat, ditampilkan, dijelajahi, dan direproduksi secara konsisten.

### Scope

- World dimensions dan koordinat.
- Grid/tile representation.
- Terrain dasar.
- Daratan, lautan, pantai, gunung, dan sungai dasar sesuai representasi yang dipilih.
- World generation.
- Random seed.
- Kamera dan navigasi map.
- Pemisahan state dunia dan representasi visual.
- World initialization dan reset.
- Validasi koordinat serta batas map.

### Acceptance Criteria

- Dunia dapat dibuat dengan ukuran yang didukung.
- Seed yang sama menghasilkan dunia yang konsisten menurut kontrak generator.
- Seed berbeda dapat menghasilkan variasi yang bermakna.
- Setiap tile memiliki state yang valid.
- Renderer menampilkan state dunia yang sebenarnya.
- Perubahan state tidak menghasilkan tile duplikat atau koordinat tidak valid.
- World generation tidak merusak state individu jika fitur tersebut sudah terintegrasi.
- Unit test untuk koordinat, batas map, seed, dan generator dasar tersedia.

### Out of Scope

- Simulasi cuaca kompleks.
- Evolusi ekosistem.
- Politik dan dinasti.
- Sistem sihir lengkap.

### Definition of Done

Pemain dapat membuat dunia baru, menjelajahinya, mengulang generasi berdasarkan seed, dan melihat hasil yang konsisten tanpa state korup.

---

## A2. BIOMES, RESOURCES & WORLD INTERACTION

### Objective

Memberi dunia variasi lingkungan dan sumber daya yang dapat memengaruhi kehidupan makhluk.

### Scope

- Biome definitions.
- Grassland, forest, desert, swamp, tundra, dan tipe lain sesuai prioritas.
- Pohon, tanaman, buah, air, batu, dan resource material.
- Resource distribution.
- Resource availability dan depletion.
- Regenerasi resource.
- Interaksi terrain-resource.
- Tool untuk menempatkan atau menghapus resource.
- Aturan dasar habitat dan kesesuaian lingkungan.

### Acceptance Criteria

- Setiap biome mempunyai definisi yang jelas.
- Distribusi resource mengikuti aturan biome atau generator.
- Resource dapat dikonsumsi, habis, tumbuh, atau beregenerasi sesuai jenisnya.
- Perubahan resource tercermin di renderer dan inspector.
- Individu dapat mengakses resource yang benar-benar tersedia.
- Resource tidak muncul secara instan tanpa aturan yang terdefinisi.
- Interaksi pemain menghasilkan perubahan state yang dapat diamati.
- Pengujian mencakup resource depletion, regeneration, dan boundary conditions.

### Definition of Done

Dunia tidak hanya terlihat berbeda; setiap lingkungan mempunyai karakteristik resource dan konsekuensi gameplay.

---

## A3. CLIMATE, WEATHER & SEASONS

### Objective

Membuat kondisi lingkungan berubah dari waktu ke waktu dan berdampak pada dunia.

### Scope

- Temperature model.
- Rainfall dan kondisi kelembapan jika relevan.
- Weather states.
- Drought dan perubahan curah hujan.
- Seasonal calendar jika musim termasuk desain final.
- Dampak cuaca terhadap pertumbuhan tanaman, air, dan resource.
- Dampak suhu terhadap kelayakan habitat.
- Integrasi dengan simulation tick dan kalender dunia.
- Visualisasi cuaca di map dan inspector.

### Acceptance Criteria

- Perubahan cuaca mengikuti aturan yang terdefinisi.
- Cuaca menggunakan waktu simulasi, bukan jam komputer.
- Kondisi cuaca berdampak pada setidaknya satu sistem dunia yang benar-benar berjalan.
- Data cuaca tidak berbeda antara simulation state dan inspector.
- Save/load mempertahankan kondisi cuaca dan progres transisi yang diperlukan.
- Pengujian dapat memverifikasi transisi cuaca tanpa menunggu waktu nyata.

### Definition of Done

Cuaca menjadi bagian dari simulasi yang memengaruhi lingkungan, bukan sekadar efek visual.

---

## A4. ECOLOGY & NATURAL EVENTS

### Objective

Membuat lingkungan dan kejadian alam menghasilkan perubahan dunia yang dapat diamati.

### Scope

- Pertumbuhan dan penyebaran vegetasi.
- Interaksi dasar antara sumber makanan, makhluk, dan lingkungan.
- Hubungan sederhana predator-prey jika diperlukan.
- Kebakaran hutan.
- Banjir, badai, atau bencana lain sesuai prioritas.
- Kerusakan dan pemulihan lingkungan.
- Resource loss akibat kejadian alam.
- Dampak bencana terhadap habitat dan kelangsungan hidup.
- Event log untuk kejadian alam.

### Acceptance Criteria

- Kejadian alam mempunyai pemicu dan aturan yang terdefinisi.
- Kejadian menghasilkan perubahan state nyata.
- Dampak terhadap resource atau habitat dapat diukur.
- Kejadian dapat dicatat dan ditelusuri.
- Sistem tidak menghasilkan event berulang tanpa kontrol.
- Performa tetap memadai pada ukuran dunia yang ditargetkan.
- Pengujian mencakup dampak kejadian dan pemulihan lingkungan jika tersedia.

### Definition of Done

Dunia mempunyai dinamika ekologis dasar dan kejadian alam yang benar-benar mengubah kondisi dunia.

---

## A5. GOD TOOLS, WORLD CONTROL & OBSERVABILITY

### Objective

Menyelesaikan pengalaman sandbox agar pemain dapat mengontrol, mengamati, dan memahami dunia.

### Scope

- Tool untuk mengubah dunia.
- Penempatan dan penghapusan terrain/resource.
- Pause, resume, dan simulation speed.
- World clock dan kalender.
- Inspector untuk tile, biome, resource, dan lingkungan.
- World statistics.
- Event history.
- Seed display.
- Save/load.
- Error handling dan validasi interaksi.
- Testing dan observability.

### Acceptance Criteria

- Setiap tool mempunyai efek yang terdefinisi.
- UI menampilkan state yang bersumber dari simulasi.
- Pause menghentikan progres simulasi.
- Speed mengatur laju simulasi, bukan mengubah rasio kalender.
- Statistik berasal dari state dunia yang sebenarnya.
- Event history tidak membuat kejadian palsu.
- Save/load mempertahankan state dunia sesuai kontrak penyimpanan.
- Pengujian memastikan UI dan simulation state tetap sinkron.

### Definition of Done

Pemain dapat menjalankan, menghentikan, mempercepat, mengubah, menyimpan, dan mengamati dunia dengan konsisten.

---

# PILAR B — CREATURES & BIOLOGY

## B1. INDIVIDUAL LIFE SIMULATION

### Objective

Memastikan setiap makhluk memiliki kehidupan yang berjalan mandiri dan bereaksi terhadap lingkungan.

### Scope

- Stable individual ID.
- Posisi dan pergerakan.
- Health dan survival state.
- Hunger, energy, dan kebutuhan dasar.
- Pencarian makanan.
- Respons terhadap resource yang tersedia.
- Umur dan life stage.
- Kematian dan pembersihan state.
- Waktu hidup berbasis simulation tick.
- Profil individu di inspector.

### Acceptance Criteria

- Individu memiliki identitas yang stabil.
- Individu merespons kondisi lingkungan.
- Individu tidak menggunakan resource yang sebenarnya tidak tersedia.
- Kematian memperbarui population count dan referensi terkait.
- Umur berasal dari simulation time.
- Tidak ada individu mati yang tetap bertindak.
- Save/load mempertahankan identitas dan state sesuai kontrak.
- Pengujian survival menggunakan seed dan kondisi awal yang terkontrol.

### Definition of Done

Makhluk dapat hidup, mencari kebutuhan, menua, dan mati melalui simulasi yang dapat diuji.

---

## B2. GENETICS, TRAITS & INHERITANCE

### Objective

Membangun sistem biologis yang mendukung variasi antarindividu dan pewarisan antargenerasi.

### Scope

- Genetic data model.
- Trait definitions.
- Pewarisan dari kedua induk.
- Mutation rules.
- Trait probability dan expression.
- Pemisahan genetic traits, personality traits, dan acquired traits.
- Dampak trait terhadap atribut atau perilaku.
- Data ancestry yang relevan.
- Inspector untuk karakteristik biologis.

### Acceptance Criteria

- Pewarisan mengikuti aturan yang dapat diuji.
- Trait tidak diwariskan secara otomatis jika aturan tidak mengizinkannya.
- Mutasi mengikuti probabilitas dan kondisi yang terdefinisi.
- Trait mempunyai dampak yang nyata jika dinyatakan gameplay-affecting.
- Seed memungkinkan skenario pengujian reproduktif.
- Genetic data tetap valid ketika individu mati atau disimpan.
- Pengujian mencakup pewarisan, mutasi, dan edge cases.

### Definition of Done

Keturunan menunjukkan variasi biologis yang konsisten berdasarkan sistem pewarisan, bukan atribut acak yang tidak memiliki aturan.

---

## B3. SPECIES & RACIAL DIFFERENCES

### Objective

Memungkinkan beberapa spesies atau ras memiliki karakteristik biologis dan kebutuhan yang berbeda.

### Scope

- Species definitions.
- Race definitions jika konsep race berbeda dari species.
- Attribute profiles.
- Life expectancy dan growth profile.
- Habitat compatibility.
- Food requirements.
- Movement dan survival capabilities.
- Reproduction compatibility rules.
- Trait inheritance rules per species.
- Extensible configuration untuk spesies baru.

### Acceptance Criteria

- Spesies baru dapat ditambahkan tanpa menulis ulang seluruh simulation core.
- Perbedaan spesies memiliki dampak gameplay yang terdefinisi.
- Kebutuhan dan atribut mengikuti data spesies.
- Reproduksi mengikuti aturan kompatibilitas yang eksplisit.
- UI dapat membedakan spesies dan karakteristiknya.
- Pengujian memastikan spesies tidak menggunakan aturan yang tidak sesuai.

### Definition of Done

Makhluk berbeda bukan sekadar variasi sprite; mereka mempunyai aturan biologis yang memengaruhi kehidupan.

---

## B4. ADVANCED BIOLOGY & GIGANTISM

### Objective

Membuat ukuran tubuh, pertumbuhan ekstrem, dan variasi biologis menjadi sistem yang memiliki konsekuensi.

### Scope

- Body size.
- Height dan mass jika diperlukan.
- Growth curves.
- Gigantism variants.
- Genetic, environmental, atau magical causes sesuai keputusan desain.
- Strength dan mobility scaling.
- Food consumption dan energy cost.
- Health constraints.
- Housing dan habitat requirements.
- Hereditary size traits.
- Mutation-based size variation.

### Acceptance Criteria

- Ukuran tubuh disimpan sebagai data simulasi.
- Perubahan ukuran memengaruhi mekanik yang ditentukan.
- Individu besar mempunyai kelebihan dan konsekuensi yang terukur.
- Ukuran tidak menyebabkan perhitungan atribut menjadi tidak valid.
- Pewarisan ukuran mengikuti aturan genetik yang ditentukan.
- Renderer dan inspector menampilkan ukuran yang sesuai dengan simulation state.
- Pengujian membandingkan individu dengan ukuran berbeda.

### Definition of Done

Gigantisme bukan sekadar perubahan visual, tetapi karakteristik biologis yang memengaruhi survival dan interaksi dengan dunia.

---

## B5. LIFE CYCLES, EVOLUTION & POPULATION DYNAMICS

### Objective

Menghubungkan kehidupan individu dengan perubahan populasi lintas generasi.

### Scope

- Birth-to-death lifecycle.
- Growth dan maturation.
- Reproductive age.
- Mortality.
- Population growth and decline.
- Generational tracking.
- Distribution of traits across generations.
- Natural selection jika mekanik tersebut menjadi bagian desain.
- Adaptation atau evolution jika memang diperlukan.
- Population statistics.
- Regression tests untuk stabilitas populasi.

### Acceptance Criteria

- Life stages mengikuti waktu simulasi.
- Reproduksi mengikuti aturan usia dan kondisi yang ditentukan.
- Kelahiran dan kematian memperbarui populasi secara konsisten.
- Distribusi trait dapat ditelusuri antargenerasi.
- Perubahan populasi dapat dijelaskan melalui kejadian simulasi.
- Sistem tidak mengalami pertumbuhan atau kematian tak terkendali akibat bug.
- Pengujian lintas generasi menggunakan kondisi dan seed terkontrol.

### Definition of Done

Populasi berubah lintas generasi melalui reproduksi, kematian, pewarisan, dan kondisi lingkungan yang konsisten.

---

# 4. WORLD TIME & CALENDAR CONTRACT

Contoh konfigurasi awal:

- 20 simulation ticks = 1 day.
- 30 days = 1 month.
- 12 months = 1 year.
- 7,200 simulation ticks = 1 year.

Contoh tampilan:
Year 1 | Month 1 | Day 1

Rules:

1. Simulation tick adalah sumber kebenaran waktu.
2. Kalender diturunkan dari total tick.
3. Pause menghentikan progres tick.
4. Simulation speed mengatur tick per detik nyata.
5. Umur dan event history memakai sumber waktu yang sama.
6. Save/load mempertahankan tick dan konfigurasi waktu sesuai kontrak.
7. Rasio kalender harus dapat diubah tanpa inkonsistensi.
8. Sistem biologis tidak boleh memakai waktu nyata secara terpisah.

Kalender ini adalah konfigurasi awal yang diusulkan, bukan angka final yang tidak boleh diubah.

---

# 5. ARCHITECTURE RULES

1. Verifikasi arsitektur repository terkini sebelum implementasi.
2. Simulation core menjadi source of truth.
3. Renderer dan UI menampilkan state simulasi, bukan menciptakan state paralel.
4. Gunakan stable IDs untuk individu dan entitas penting.
5. Pisahkan data definitions dari runtime state.
6. Sistem baru harus menggunakan kontrak yang konsisten dengan sistem lama.
7. Hindari duplikasi logic antarfitur.
8. Gunakan seed dan deterministic tests jika memungkinkan.
9. Save/load harus mempertahankan invariant yang telah ditentukan.
10. Setiap perubahan harus mempunyai test plan dan acceptance criteria.
11. Jangan menyatakan fitur selesai hanya karena UI atau sprite sudah terlihat.
12. Jangan mengubah scope besar tanpa memperbarui roadmap.

---

# 6. IMPLEMENTATION WORKFLOW

Untuk setiap milestone:

STEP 1 — AUDIT

- Baca struktur repository.
- Identifikasi sistem dan file yang relevan.
- Jalankan build serta test yang tersedia.
- Tandai fitur DONE, PARTIAL, MISSING, atau UNVERIFIED.

STEP 2 — GAP ANALYSIS

- Bandingkan kode aktual dengan scope milestone.
- Identifikasi dependency.
- Temukan kontrak data yang belum tersedia.
- Hindari duplikasi implementasi.

STEP 3 — DESIGN

- Tentukan data model dan tanggung jawab sistem.
- Tentukan interaksi dengan simulation core.
- Tentukan acceptance criteria.
- Tentukan risiko performa dan migrasi save data.

STEP 4 — IMPLEMENT

- Implementasikan scope terkecil yang menghasilkan perilaku nyata.
- Pertahankan kompatibilitas sistem yang sudah berfungsi.
- Jangan menambahkan fitur di luar scope tanpa alasan kuat.

STEP 5 — VERIFY

- Build.
- Unit tests.
- Integration tests.
- Deterministic scenario tests jika memungkinkan.
- Periksa regresi pada sistem yang sudah selesai.

STEP 6 — REPORT
Laporkan:

- File yang berubah.
- Perilaku yang berhasil dibuat.
- Test yang dijalankan beserta hasilnya.
- Acceptance criteria yang terpenuhi.
- Gap yang tersisa.
- Status milestone.

---

# 7. PRIORITY RULES

Prioritas utama:

1. Menutup gap nyata pada Pilar A.
2. Menjaga lingkungan cukup stabil untuk mendukung makhluk.
3. Mengembangkan Pilar B tanpa merusak sistem yang sudah ada.
4. Memastikan setiap sistem mempunyai efek gameplay dan pengujian.
5. Menghindari kompleksitas yang belum diperlukan.

Jangan mendahulukan:

- Sistem witch kompleks.
- Politik dan diplomasi skala besar.
- Magic research tree yang luas.
- Perang antarkerajaan yang kompleks.
- Fitur visual yang tidak didukung simulation state.

Fitur-fitur tersebut tetap menjadi bagian dari visi jangka panjang, tetapi bukan prioritas roadmap A–B.

---

# 8. SUCCESS CRITERIA — PILAR A & B

Pilar A dianggap selesai ketika:

- Dunia dapat dibuat dan diuji secara konsisten.
- Biome dan resource mempunyai aturan nyata.
- Lingkungan berubah seiring waktu.
- Kejadian alam berdampak pada world state.
- Pemain dapat mengontrol dan mengamati dunia.
- Save/load dan testing memenuhi kontrak yang disepakati.

Pilar B dianggap selesai ketika:

- Individu hidup mandiri.
- Kebutuhan dan siklus hidup konsisten dengan waktu simulasi.
- Trait dan genetik diwariskan melalui aturan yang dapat diuji.
- Spesies mempunyai perbedaan biologis yang bermakna.
- Gigantisme dan variasi biologis mempunyai konsekuensi nyata.
- Populasi berkembang lintas generasi tanpa inkonsistensi.

FINAL PRINCIPLE:

Living World tidak dibangun dengan menumpuk fitur sebanyak mungkin.

Living World dibangun dengan sistem yang saling terhubung, memiliki aturan jelas, menghasilkan konsekuensi nyata, dan menciptakan sejarah yang tidak sepenuhnya ditulis oleh developer.
