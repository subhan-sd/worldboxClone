# Business Requirements Document (BRD)
# Living World — MVP Pilar A: World & Environment

> **Status:** Draft for implementation  
> **Repository:** `subhan-sd/worldboxClone`  
> **Target branch:** `v03-logic-worldbox`  
> **Feature scope:** MVP Pilar A — World & Environment  
> **Dokumen ini adalah sumber kebutuhan produk dan kriteria penerimaan.** Detail implementasi teknis harus mengikuti arsitektur aktual repository, bukan memaksakan desain baru tanpa alasan.

---

## 1. Ringkasan Eksekutif

Living World adalah game sandbox simulasi dunia fantasi yang berfokus pada dunia yang berkembang melalui aturan simulasi dan interaksi yang konsisten. Pilar A menyediakan fondasi dunia: peta, terrain, resource, waktu, lingkungan, ekologi, kontrol pemain, observabilitas, serta penyimpanan state.

Tujuan Pilar A bukan sekadar menampilkan peta yang menarik. Dunia harus memiliki **state yang valid, waktu yang berjalan konsisten, lingkungan yang memengaruhi simulasi, dan perubahan yang tetap benar setelah save/load**. Pilar A menjadi fondasi bagi sistem lanjutan seperti individu, ras, genetika, peradaban, dan fenomena supernatural.

Dokumen ini menetapkan kebutuhan bisnis/produk, ruang lingkup, perilaku sistem, aturan, prioritas, dan kriteria penerimaan untuk menyelesaikan MVP Pilar A.

### 1.1 Pernyataan masalah

Fondasi dunia dapat terlihat berfungsi walaupun beberapa sistem masih terpisah atau belum konsisten. Contoh risiko yang perlu dicegah:

- Tile berubah terrain tetapi atribut turunannya tidak ikut diperbarui.
- Resource melebihi kapasitas, bernilai negatif, atau beregenerasi pada terrain yang tidak sesuai.
- Tanggal kalender hanya berupa tampilan UI dan tidak berasal dari simulation tick.
- Cuaca berubah secara visual tetapi tidak berdampak pada kondisi dunia.
- Natural event hanya berupa notifikasi tanpa efek nyata.
- Save/load menghilangkan atau mereset state lingkungan.
- Hasil world generation berubah ketika seed dan konfigurasi yang sama digunakan.

### 1.2 Hasil bisnis yang diharapkan

Setelah Pilar A selesai, pemain dapat membuat atau memuat dunia, mengamati kondisi dunia, mengubah terrain menggunakan god tools, menjalankan atau menghentikan simulasi, melihat kalender dunia, dan menyaksikan perubahan lingkungan yang memiliki konsekuensi nyata.

---

## 2. Tujuan Produk dan Ukuran Keberhasilan

### 2.1 Tujuan

- **OBJ-01 — Dunia valid:** Setiap tile memiliki state yang konsisten dengan aturan terrain.
- **OBJ-02 — Dunia dapat direproduksi:** Seed dan konfigurasi yang sama menghasilkan world state awal yang ekuivalen.
- **OBJ-03 — Resource masuk akal:** Stock, kapasitas, konsumsi, dan regenerasi mengikuti aturan yang dapat diuji.
- **OBJ-04 — Waktu bermakna:** Kalender dunia berkembang berdasarkan tick simulasi yang benar-benar dieksekusi.
- **OBJ-05 — Lingkungan hidup:** Biome, weather, dan proses ekologi memengaruhi state simulasi.
- **OBJ-06 — Peristiwa nyata:** Minimal satu natural event dapat dipicu oleh aturan, memengaruhi dunia, dan selesai secara terdefinisi.
- **OBJ-07 — Kontrol dapat dipercaya:** Pause, speed, god tools, serta inspeksi menampilkan dan mengubah state yang sebenarnya.
- **OBJ-08 — State dapat dipulihkan:** Save/load mempertahankan state dunia yang termasuk dalam format save.
- **OBJ-09 — Kualitas terverifikasi:** Test, type-check, dan build yang tersedia dijalankan dan hasilnya dilaporkan secara akurat.

### 2.2 Indikator keberhasilan

Pilar A dianggap memenuhi sasaran apabila:

1. Test untuk invariant terrain/resource lulus.
2. Seed dan konfigurasi yang sama menghasilkan hasil generasi yang ekuivalen.
3. Kalender melewati batas hari, bulan, dan tahun secara benar.
4. Pause menghentikan tick dan kalender; speed memengaruhi laju tick tanpa mengubah rasio kalender.
5. Perubahan cuaca atau lingkungan memiliki efek simulasi yang dapat diamati dan diuji.
6. Minimal satu natural event menunjukkan trigger, efek, durasi/resolusi, dan akhir event yang dapat diuji.
7. Save/load round-trip mempertahankan data dunia yang relevan.
8. Pemeriksaan type-check dan production build berhasil, atau setiap kegagalan yang tersisa dijelaskan dengan bukti dan penyebab yang jelas.

Angka performa spesifik tidak ditetapkan sebelum baseline aktual diukur. Hindari membuat klaim FPS, ukuran dunia maksimum, atau latensi tanpa pengukuran.

---

## 3. Pengguna dan Kebutuhan

### 3.1 Persona utama

**Pemain sebagai World Creator / God**

Pemain mengontrol simulasi dari perspektif makro. Ia ingin:

- Membuat dunia dengan seed tertentu.
- Memahami terrain, biome, resource, cuaca, dan tanggal dunia.
- Mempercepat, memperlambat, atau menghentikan simulasi.
- Mengubah terrain dan melihat efeknya terhadap state dunia.
- Mengamati perubahan lingkungan dan natural event.
- Menyimpan dunia lalu melanjutkan dari kondisi yang sama.

### 3.2 Kebutuhan pendukung

**Developer / QA**

Developer dan QA memerlukan aturan yang terpusat, sistem yang deterministik bila sesuai, test otomatis untuk batas-batas penting, dan cara membedakan kegagalan yang sudah ada dari regresi baru.

---

## 4. Ruang Lingkup

### 4.1 Termasuk dalam MVP Pilar A

| ID | Area | Cakupan |
|---|---|---|
| SCOPE-A1 | World foundation | Grid, koordinat, tile lookup, seed, dimensi, world generation, terrain rules |
| SCOPE-A2 | Terrain & resources | Kapasitas, stock, konsumsi/harvesting yang sudah ada, regenerasi, terrain editing |
| SCOPE-A2B | Biome | Sejumlah kecil biome fungsional dengan aturan yang berpengaruh ke simulasi |
| SCOPE-A3 | Time & calendar | Tick-to-day/month/year, kalender toolbar, integrasi pause/speed |
| SCOPE-A4 | Climate & weather | State cuaca minimal, transisi berbasis simulasi, efek terhadap lingkungan |
| SCOPE-A5 | Ecology & events | Pertumbuhan/regenerasi alami dan minimal satu natural event fungsional |
| SCOPE-A6 | God tools & observability | Pause, speed, terrain tools, inspector/status lingkungan |
| SCOPE-A7 | Persistence | Save/load state dunia yang relevan dan tes round-trip |
| SCOPE-A8 | Quality | Regression tests, type-check, build, dan laporan verifikasi |

### 4.2 Tidak termasuk dalam MVP ini

- Simulasi individu, genetika, evolusi, siklus hidup, dan dinamika populasi tingkat lanjut.
- Sistem peradaban, kerajaan, diplomasi, perang, dan ekonomi kompleks.
- Sistem sihir, penyihir, supernatural, atau gigantisme.
- Model meteorologi ilmiah lengkap.
- Puluhan biome dengan perilaku unik.
- Rework besar pada renderer atau migrasi framework.
- Integrasi asset pack skala besar yang tidak diperlukan untuk menyelesaikan fungsi simulasi.
- Fitur multiplayer atau cloud-save, kecuali memang sudah menjadi bagian dari implementasi existing.

Item di atas dapat menjadi pekerjaan fase berikutnya dan tidak boleh menggeser prioritas fondasi Pilar A.

---

## 5. Asumsi, Batasan, dan Prinsip Desain

1. Repository dan arsitektur aktual adalah sumber kebenaran teknis.
2. Simulation core menjadi sumber kebenaran untuk state dunia. Renderer/UI membaca state tersebut dan mengirimkan perintah yang sesuai.
3. Sistem existing harus diperiksa sebelum dibuat ulang. Jangan membuat duplikasi terrain rules, kalender, weather, atau persistence.
4. Seed hanya menjamin hasil yang ekuivalen jika seed, konfigurasi, dan versi aturan generasi yang relevan sama.
5. Randomness pada simulasi harus memakai mekanisme yang konsisten dan dapat diuji bila determinisme menjadi kebutuhan.
6. Seluruh perubahan harus tetap kompatibel dengan pola proyek sejauh memungkinkan.
7. Perubahan format save harus mempertimbangkan save lama jika format tersebut sudah digunakan.
8. Rasio kalender adalah konfigurasi awal yang dapat diubah, bukan angka tersebar di banyak file.
9. Implementasi harus proporsional dengan MVP; sistem sederhana yang benar lebih diutamakan daripada sistem luas yang hanya dekoratif.
10. Jangan menghapus atau mengubah pekerjaan lokal yang tidak berkaitan.

---

## 6. Alur Penggunaan Utama

### FLOW-01 — Membuat dunia

1. Pemain memilih atau menggunakan seed dan konfigurasi dunia.
2. Sistem menghasilkan grid dan terrain.
3. Sistem menginisialisasi atribut tile, kapasitas resource, serta biome.
4. Sistem memastikan state awal memenuhi invariant.
5. Renderer menampilkan dunia berdasarkan hasil generasi.

**Hasil yang diharapkan:** Dunia valid dan dapat direproduksi dengan input generasi yang sama.

### FLOW-02 — Menjalankan simulasi

1. Pemain menekan Play atau memilih speed simulasi.
2. Simulation engine mengeksekusi tick sesuai mekanisme yang sudah ada.
3. Kalender, resource regeneration, weather, ekologi, dan event memperbarui state sesuai jadwal sistem masing-masing.
4. UI membaca state terbaru dan memperbarui tampilan.
5. Saat pause aktif, tidak ada simulation tick yang maju.

**Hasil yang diharapkan:** Semua sistem berbasis tick bergerak konsisten dan tidak maju hanya karena render frame.

### FLOW-03 — Mengubah terrain

1. Pemain memilih terrain tool dan tile target.
2. Perintah diteruskan ke simulation core.
3. Sistem menerapkan aturan terrain baru.
4. Sistem memperbarui atau menghitung ulang atribut turunan yang relevan.
5. Resource stock divalidasi terhadap kapasitas baru sesuai kebijakan yang terdokumentasi.
6. Renderer dan inspector menampilkan state baru.

**Hasil yang diharapkan:** Tidak ada state lama yang tertinggal dan tidak ada perubahan tersembunyi yang bertentangan dengan aturan.

### FLOW-04 — Mengamati perubahan lingkungan

1. Simulasi berjalan dan kalender bertambah.
2. Weather berubah berdasarkan aturan dan state simulasi.
3. Weather/biome memengaruhi mekanik lingkungan yang dipilih.
4. Ekologi memperbarui resource atau vegetasi sesuai suitability dan batas kapasitas.
5. Natural event dapat dimulai, memberikan efek, lalu berakhir berdasarkan aturan.
6. UI menampilkan informasi aktual yang membantu pemain memahami perubahan.

**Hasil yang diharapkan:** Perubahan lingkungan bukan hanya animasi; state dunia benar-benar berubah.

### FLOW-05 — Save dan load

1. Pemain menyimpan dunia.
2. Sistem menyerialisasi state dunia yang termasuk dalam format save.
3. Pemain memuat save.
4. Sistem memvalidasi atau memigrasikan data jika diperlukan.
5. State dunia dipulihkan tanpa regenerasi ulang yang tidak disengaja.
6. Simulasi berlanjut dengan kalender, cuaca, resource, dan event sesuai data tersimpan.

**Hasil yang diharapkan:** Save/load mempertahankan keadaan dunia yang relevan.

---

## 7. Kebutuhan Fungsional

### 7.1 A1 — World Foundation & Generation

#### FR-A1-01 — Grid dan koordinat

Setiap tile harus memiliki identitas/koordinat yang konsisten dengan struktur grid. Operasi lookup harus mengembalikan tile yang benar atau hasil aman untuk koordinat di luar batas.

**Acceptance criteria**
- Koordinat valid menunjuk tile yang benar.
- Koordinat di luar batas tidak menyebabkan crash atau memutasi tile yang salah.
- Dimensi grid konsisten dengan jumlah tile yang tersedia.

#### FR-A1-02 — Aturan terrain kanonis

Terrain harus menggunakan definisi aturan yang konsisten untuk atribut seperti traversability, fertility, dan kapasitas resource. Hindari duplikasi aturan yang dapat berbeda antara generator, tool, dan sistem resource.

**Acceptance criteria**
- Generator dan terrain tool menghasilkan atribut terrain yang sesuai dengan aturan yang sama.
- Tidak ada nilai terrain yang tidak dikenal lolos diam-diam menjadi state yang tidak valid.
- Test mencakup setiap terrain type yang didukung.

#### FR-A1-03 — World generation deterministik

Untuk seed dan konfigurasi yang sama, generasi harus menghasilkan state awal yang ekuivalen.

**Acceptance criteria**
- Test menghasilkan dua dunia dengan seed/configuration sama lalu membandingkan atribut yang relevan.
- Seed berbeda dapat menghasilkan variasi yang bermakna, tanpa mewajibkan setiap seed berbeda pada setiap tile.
- Ketergantungan terhadap waktu sistem atau urutan render tidak mengubah hasil generasi.

#### FR-A1-04 — Inisialisasi tile

Setiap tile baru harus mendapat nilai awal yang valid untuk terrain, resource, kapasitas, fertility, biome (bila sudah tersedia), dan atribut wajib lain.

**Acceptance criteria**
- Tidak ada stock negatif.
- Tidak ada stock di atas kapasitas.
- Atribut derived tidak bertentangan dengan terrain.

### 7.2 A2 — Terrain, Resources & World Interaction

#### FR-A2-01 — Batas resource

Setiap resource memiliki nilai stock yang valid dan batas kapasitas yang sesuai dengan tile dan aturan lingkungan.

**Acceptance criteria**
- Stock selalu berada dalam rentang yang diperbolehkan.
- Harvesting/consumption tidak menghasilkan stock negatif.
- Regenerasi tidak melewati kapasitas.
- Validasi diterapkan di lapisan yang tepat agar semua pemanggil memperoleh hasil konsisten.

#### FR-A2-02 — Regenerasi resource

Resource beregenerasi hanya ketika kondisi terrain dan lingkungan mengizinkan. Aturan harus terpusat atau dapat ditelusuri, bukan bergantung pada efek visual.

**Acceptance criteria**
- Resource yang tidak sesuai tidak beregenerasi pada terrain yang tidak mendukungnya.
- Regenerasi berjalan melalui simulation tick atau mekanisme simulation-time yang jelas.
- Pause menghentikan regenerasi berbasis tick.
- Test mencakup kondisi valid, tidak valid, stock nol, dan stock penuh.

#### FR-A2-03 — Perubahan terrain

Terrain editing menerapkan terrain baru beserta aturan dan efek turunan yang relevan.

**Acceptance criteria**
- Traversability, fertility, kapasitas resource, dan water access atau atribut relevan lainnya diperbarui.
- Stock yang tidak lagi valid ditangani sesuai kebijakan eksplisit, misalnya clamp, konversi, atau aturan lain yang sudah disepakati.
- Tidak ada resource yang diciptakan atau dihapus secara tidak terduga.
- Perubahan langsung terlihat di renderer/inspector karena membaca state yang diperbarui.

#### FR-A2-04 — Biome fungsional

Sistem menyediakan sejumlah kecil biome yang relevan dengan terrain dan kondisi lingkungan yang tersedia.

**Acceptance criteria**
- Biome tersimpan dalam state simulation.
- Assignment deterministik untuk input dunia yang sama.
- Setiap biome memiliki minimal satu konsekuensi mekanis yang dapat diuji.
- Tile inspector dapat menunjukkan biome.
- Biome tidak sekadar label visual dan tidak mengizinkan kombinasi state yang tidak valid.

### 7.3 A3 — Calendar & Simulation Time

#### BR-A3-01 — Konversi kalender awal

Default konfigurasi:

- 20 simulation ticks = 1 in-world day.
- 30 in-world days = 1 in-world month.
- 12 in-world months = 1 in-world year.
- 7.200 simulation ticks = 1 in-world year.

Nilai tersebut harus berada pada satu konfigurasi/model waktu yang terdefinisi.

#### FR-A3-01 — Sumber waktu otoritatif

Kalender maju berdasarkan simulation tick yang benar-benar dieksekusi, bukan timer UI, render frame, atau wall-clock timer terpisah.

**Acceptance criteria**
- Setiap tick yang valid menambah progress kalender sesuai konfigurasi.
- Render tanpa simulation tick tidak mengubah tanggal.
- Tidak ada double advancement akibat UI dan engine sama-sama menambah waktu.

#### FR-A3-02 — Perhitungan tanggal

Sistem menghitung hari, bulan, dan tahun dari satu sumber waktu otoritatif dengan indeks dan initial date yang terdokumentasi.

**Acceptance criteria**
- Hari berubah tepat setelah jumlah tick per hari tercapai.
- Bulan berubah setelah jumlah hari per bulan tercapai.
- Tahun berubah setelah jumlah bulan per tahun tercapai.
- Boundary test menghindari off-by-one error.
- Format tanggal konsisten pada seluruh UI.

#### FR-A3-03 — Integrasi pause dan speed

Pause menghentikan kemajuan waktu dunia. Speed mengubah jumlah/laju tick per waktu nyata sesuai desain engine yang ada, tetapi tidak mengubah rasio kalender.

**Acceptance criteria**
- Selama pause, tanggal tidak berubah.
- Saat speed dinaikkan, kalender bergerak lebih cepat secara real-time karena lebih banyak tick dieksekusi.
- Mengubah speed tidak membuat tanggal melompat karena konversi tick berubah.
- Perilaku tetap konsisten ketika pause dan resume berulang kali.

#### FR-A3-04 — Kalender pada toolbar

Toolbar menampilkan tanggal dunia dari state kalender aktual.

**Acceptance criteria**
- UI diperbarui ketika state kalender berubah.
- UI tidak melakukan perhitungan kalender duplikat yang dapat berbeda dari core.
- Tanggal dapat dipulihkan dari save/load.

### 7.4 A4 — Climate, Weather & Seasons

#### FR-A4-01 — State cuaca

Sistem menyimpan state cuaca aktual pada simulation model. Mulai dari pilihan minimal yang kompatibel dengan game, misalnya clear, rain, dan drought.

**Acceptance criteria**
- Cuaca bukan hanya warna/overlay.
- State cuaca dapat dibaca oleh sistem lingkungan dan UI.
- Nilai cuaca tidak berubah pada setiap render frame.
- Transisi memiliki aturan, interval, atau trigger yang terdefinisi.

#### FR-A4-02 — Efek cuaca

Setiap weather state yang masuk scope harus memiliki efek nyata pada minimal satu variabel simulasi, seperti soil moisture, fertility, atau regeneration rate.

**Acceptance criteria**
- Test menunjukkan nilai/state sebelum dan setelah efek cuaca.
- Efek dibatasi oleh validasi dan tidak menyebabkan resource melewati kapasitas.
- Cuaca yang tidak memengaruhi variabel apa pun tidak boleh diklaim sebagai implementasi selesai.

#### FR-A4-03 — Integrasi kalender

Cuaca dan musim (jika musim diimplementasikan pada MVP) berkembang berdasarkan simulation time, bukan waktu wall-clock.

**Acceptance criteria**
- Pause menghentikan transisi berbasis tick.
- Speed mengubah laju transisi dalam waktu nyata.
- State cuaca/season dapat disimpan dan dipulihkan jika menjadi bagian dari persistence.

#### FR-A4-04 — Visibilitas cuaca

UI menampilkan weather state aktual dan menyediakan informasi yang cukup agar pemain memahami efeknya.

**Acceptance criteria**
- Informasi berasal dari simulation state.
- Tampilan diperbarui setelah transisi.
- Tidak ada klaim efek yang tidak diimplementasikan oleh simulation core.

### 7.5 A5 — Ecology & Natural Events

#### FR-A5-01 — Pertumbuhan ekologis

Minimal satu resource alami/vegetasi dapat tumbuh, menyebar, atau beregenerasi berdasarkan terrain dan kondisi lingkungan.

**Acceptance criteria**
- Pertumbuhan berjalan melalui simulation tick/time.
- Terrain atau biome yang tidak cocok membatasi atau menolak pertumbuhan.
- Pertumbuhan tidak melampaui kapasitas.
- Pertumbuhan berhenti atau melambat ketika kondisi tidak mendukung, sesuai aturan yang didefinisikan.

#### FR-A5-02 — Natural event lifecycle

Minimal satu natural event yang sesuai dengan sistem yang ada harus memiliki lifecycle yang jelas.

Lifecycle minimum:
1. **Idle/eligible:** kondisi trigger dapat dievaluasi.
2. **Triggered/active:** event dimulai dan state event disimpan.
3. **Effect:** event mengubah satu atau lebih variabel dunia.
4. **Resolution:** durasi habis atau kondisi penyelesaian tercapai.
5. **Cooldown/complete:** event berhenti dan tidak langsung memicu ulang tanpa aturan.

**Acceptance criteria**
- Trigger dapat diuji secara deterministik.
- Efek event dapat diukur pada state simulation.
- Event memiliki kondisi akhir.
- Cooldown atau guard mencegah trigger setiap tick.
- Event aktif tetap konsisten setelah save/load jika persistence event termasuk scope.

#### FR-A5-03 — Observabilitas event

Pemain dapat mengetahui event yang aktif melalui UI atau inspector yang sudah ada.

**Acceptance criteria**
- Informasi event berasal dari simulation state.
- Event yang sudah berakhir tidak terus ditampilkan sebagai aktif.
- Visual event tidak menggantikan state atau efek simulasi.

### 7.6 A6 — God Tools, Controls & Inspector

#### FR-A6-01 — Pause/resume

Pemain dapat menghentikan dan melanjutkan simulation tick.

**Acceptance criteria**
- Semua sistem yang bergantung pada tick berhenti ketika pause aktif.
- UI/rendering masih dapat menggambar state yang ada tanpa memajukan simulation state.
- Resume melanjutkan simulasi tanpa reset yang tidak disengaja.

#### FR-A6-02 — Simulation speed

Kontrol speed mengubah laju eksekusi simulasi melalui mekanisme engine yang ada.

**Acceptance criteria**
- Speed tidak hanya mempercepat animasi.
- Tick count dan kalender konsisten dengan jumlah tick yang benar-benar dijalankan.
- Tidak terjadi advancement ganda pada speed tinggi.

#### FR-A6-03 — Terrain tools

Perintah dari god tools harus melalui jalur yang memperbarui simulation core dan seluruh atribut turunan yang relevan.

**Acceptance criteria**
- State core menjadi sumber kebenaran setelah edit.
- UI tidak menyimpan terrain yang berbeda dari simulation model.
- Edit invalid ditolak atau ditangani secara aman.

#### FR-A6-04 — Tile/environment inspector

Inspector menyediakan informasi yang cukup untuk memahami state tile dan lingkungan.

Minimal jika datanya tersedia: koordinat, terrain, biome, resource stock/capacity, fertility, water access, cuaca atau modifier lingkungan.

**Acceptance criteria**
- Informasi berasal dari state aktual.
- Nilai tidak dihitung dengan rumus UI yang terpisah dari aturan core.
- Inspector tidak memodifikasi state kecuali melalui action yang disengaja.

### 7.7 A7 — Save/Load & Persistence

#### FR-A7-01 — Serialisasi state

Save menyimpan seluruh data yang diperlukan untuk melanjutkan dunia sesuai scope implementasi, termasuk terrain/grid, resources, biome, kalender, cuaca, dan natural event aktif jika sistem tersebut sudah masuk scope.

**Acceptance criteria**
- Data yang diperlukan tidak dihilangkan secara diam-diam.
- Data turunan yang bisa dihitung ulang tidak disimpan secara redundant kecuali ada alasan arsitektural yang jelas.
- Versi format save dapat diidentifikasi jika format versioning digunakan atau dibutuhkan.

#### FR-A7-02 — Pemulihan state

Load mengembalikan dunia ke state tersimpan dan memvalidasi data sebelum simulation berjalan kembali.

**Acceptance criteria**
- Load tidak memicu world generation baru secara tidak disengaja.
- Kalender dan state lingkungan tidak reset ke default tanpa alasan.
- Stock dan atribut terrain tetap memenuhi invariant setelah load.
- Error pada data save ditangani dengan aman sesuai pola proyek.

#### FR-A7-03 — Round-trip test

Test menyimpan state yang mewakili sistem Pilar A, memuat kembali state itu, lalu membandingkan field yang relevan.

**Acceptance criteria**
- Terrain, resource, tanggal, weather, biome, dan active event dibandingkan sejauh field tersebut sudah diimplementasikan.
- Test mencakup nilai non-default sehingga reset ke default terdeteksi.
- Kompatibilitas save lama diuji jika format sebelumnya memang ada.

---

## 8. Aturan Bisnis dan Invariant Global

Aturan berikut berlaku lintas sistem:

- **BR-01:** Simulation core adalah sumber kebenaran state dunia.
- **BR-02:** Setiap resource stock harus berada dalam rentang valid sesuai kapasitas yang berlaku.
- **BR-03:** Terrain menentukan aturan dasar traversability, fertility, dan kapasitas; modifier biome/weather harus diterapkan dengan aturan yang jelas dan tidak saling bertentangan.
- **BR-04:** Perubahan terrain wajib menjalankan satu jalur pembaruan state yang konsisten.
- **BR-05:** Sistem berbasis simulation time hanya maju ketika tick terkait dieksekusi.
- **BR-06:** Pause menghentikan semua progres gameplay yang bergantung pada tick, termasuk kalender, regenerasi, transisi cuaca, pertumbuhan, dan durasi event.
- **BR-07:** Speed mengubah laju tick dalam waktu nyata, bukan definisi satu hari/bulan/tahun.
- **BR-08:** Render frame tidak boleh mengubah gameplay state.
- **BR-09:** Sistem deterministik harus menggunakan input dan sumber randomness yang dapat dikontrol; jangan bergantung pada urutan rendering.
- **BR-10:** Save/load harus mempertahankan state yang dibutuhkan untuk melanjutkan simulasi.
- **BR-11:** Event tidak boleh berulang tanpa batas akibat kondisi trigger yang terus benar; gunakan lifecycle dan cooldown/guard.
- **BR-12:** UI tidak boleh menyatakan suatu efek terjadi jika simulation state tidak berubah.
- **BR-13:** Error atau input invalid harus ditangani secara eksplisit dan tidak merusak seluruh dunia.
- **BR-14:** Sistem yang belum memiliki test atau verifikasi tidak boleh dilaporkan sebagai DONE.

### 8.1 Kebijakan perubahan terrain dan resource

Implementasi harus memeriksa kebijakan existing terlebih dahulu. Jika perubahan terrain mengurangi kapasitas di bawah stock saat ini, tentukan dan dokumentasikan satu perilaku konsisten, misalnya clamp stock ke kapasitas baru atau transformasi resource yang secara eksplisit didukung game. Jangan membiarkan stock melampaui kapasitas.

---

## 9. Kebutuhan Data dan State

Model berikut merupakan konsep kebutuhan, bukan instruksi untuk menambahkan class dengan nama persis ini. Sesuaikan dengan struktur repository.

| Konsep | Informasi minimum | Catatan |
|---|---|---|
| World configuration | Seed, dimensi, konfigurasi generasi | Input determinisme |
| Tile | Koordinat, terrain, atribut turunan | Harus valid dan konsisten |
| Resource state | Stock dan kapasitas per jenis resource | Stock tidak negatif/melebihi kapasitas |
| Biome state | Biome ID dan modifier relevan | Harus punya konsekuensi mekanis |
| Simulation clock | Tick count atau equivalent authoritative time | Sumber kalender |
| Calendar config | Tick/day, days/month, months/year, initial date | Terpusat dan dapat diuji |
| Weather state | Current weather, transition/counter state | Cukup untuk melanjutkan transisi |
| Ecology state | Growth/regeneration state yang diperlukan | Hindari state duplikat yang tidak perlu |
| Natural event | Type, active state, duration/progress, cooldown | Persist jika perlu melanjutkan event |
| Save metadata | Version atau metadata yang diperlukan | Ikuti pola persistence existing |

Jangan menyimpan field redundant tanpa kebutuhan. Bila state dapat dihitung ulang dengan aman dan deterministik, evaluasi apakah lebih baik dihitung ulang atau dipersistenkan berdasarkan arsitektur existing.

---

## 10. Kebutuhan UI/UX

UI Pilar A harus membantu pemain memahami kondisi dunia tanpa membangun dashboard besar.

### UI-01 — Toolbar waktu

- Menampilkan tanggal in-world dari calendar model.
- Memiliki format yang konsisten, misalnya `Year 1 · Month 1 · Day 1` atau format lain yang sesuai gaya game.
- Diperbarui dari state simulation, bukan timer UI independen.

### UI-02 — Kontrol simulasi

- Menampilkan state pause/play dan speed aktif dengan jelas.
- Interaksi meneruskan perintah ke simulation engine.
- Tampilan tidak mengklaim speed atau pause yang berbeda dari engine.

### UI-03 — Environment status

- Menampilkan weather state saat ini jika telah diimplementasikan.
- Menampilkan natural event aktif jika ada.
- Biome dan detail tile tersedia melalui inspector atau interaksi tile yang sudah ada.

### UI-04 — Feedback terrain tools

- Setelah edit, tampilan terrain dan atribut yang ditampilkan mengikuti state core.
- Jika edit gagal atau ditolak, jangan menampilkan perubahan seolah-olah berhasil.
- Hindari efek visual sementara yang tidak didukung oleh state simulation.

### UI-05 — Kesederhanaan MVP

- Gunakan komponen dan pola UI existing.
- Jangan menambahkan panel besar atau sistem navigasi baru kecuali dibutuhkan.
- Informasi debug boleh membantu pengujian, tetapi bedakan dengan jelas dari UI gameplay final bila perlu.

---

## 11. Kebutuhan Non-Fungsional

### NFR-01 — Konsistensi state

Invariant terrain/resource harus dapat diuji dan dijaga pada jalur generasi, update, terrain editing, dan load.

### NFR-02 — Determinisme

World generation harus dapat direproduksi dengan seed/configuration yang sama. Randomness pada weather/event harus mengikuti aturan yang dapat diuji, terutama untuk test.

### NFR-03 — Maintainability

- Aturan penting tidak disalin ke banyak tempat.
- Fungsi simulation core memiliki tanggung jawab yang jelas.
- Hindari coupling yang tidak perlu antara UI, renderer, dan simulation logic.
- Konfigurasi kalender dan parameter lingkungan dapat ditemukan serta diubah dengan mudah.

### NFR-04 — Compatibility

Perubahan harus mengikuti framework, TypeScript configuration, dan test runner yang sudah digunakan repository. Jangan menambahkan dependency tanpa kebutuhan yang jelas.

### NFR-05 — Robustness

Input invalid, koordinat di luar grid, data save tidak lengkap, dan perubahan terrain yang tidak kompatibel harus ditangani dengan aman.

### NFR-06 — Testability

Aturan waktu, resource, weather, event, dan persistence harus dapat diuji tanpa harus bergantung pada render frame atau interaksi manual dengan UI bila unit/integration test sudah memungkinkan.

### NFR-07 — Observability

Kegagalan test/build dan state penting harus bisa diperiksa melalui test, inspector, atau log yang sesuai pola proyek. Hindari logging berlebihan setiap tick.

### NFR-08 — Performance awareness

Hindari full-world scan pada setiap render frame atau pekerjaan berulang yang tidak diperlukan. Lakukan optimisasi hanya berdasarkan bukti atau bottleneck yang dapat diidentifikasi; jangan mengorbankan correctness untuk optimisasi prematur.

---

## 12. Prioritas Implementasi dan Rencana Delivery

Prioritas ditentukan oleh dependency antarsistem. Sistem baru tidak boleh dibangun di atas invariant yang belum stabil.

### P0 — Fondasi dan integritas

- Audit state repository dan existing PR terrain-integrity.
- Konsolidasikan aturan terrain.
- Validasi resource stock, kapasitas, harvesting, dan regenerasi.
- Pastikan terrain tools memperbarui atribut turunan.
- Audit save/load existing dan tambahkan regression tests.

**Gate P0:** Test terrain/resource yang relevan lulus; tidak ada regresi yang diketahui tanpa penjelasan.

### P1 — Calendar dan kontrol simulasi

- Implementasikan kalender berdasarkan tick aktual.
- Hubungkan tanggal ke toolbar.
- Verifikasi pause/speed.
- Verifikasi kalender dalam save/load.

**Gate P1:** Boundary test kalender lulus; render frame tidak memajukan waktu; pause menghentikan kalender.

### P2 — Biome dan lingkungan

- Implementasikan beberapa biome fungsional.
- Tambahkan state weather minimal.
- Hubungkan weather dengan variabel lingkungan.
- Tampilkan informasi environment di UI/inspector.

**Gate P2:** Test menunjukkan biome/weather memengaruhi simulation state secara nyata dan terkendali.

### P3 — Ecology dan natural event

- Implementasikan pertumbuhan/regenerasi ekologis yang dibatasi kondisi.
- Implementasikan minimal satu event dengan lifecycle lengkap.
- Integrasikan state event ke UI dan persistence jika diperlukan.

**Gate P3:** Test mencakup trigger, efek, resolusi/cooldown, dan state setelah load.

### P4 — Verification & delivery

- Jalankan seluruh test relevan.
- Jalankan type-check dan production build yang tersedia.
- Tinjau diff dan kompatibilitas.
- Perbarui status checklist dan catat sisa pekerjaan.

**Gate P4:** Hasil verifikasi aktual terdokumentasi; tidak ada klaim DONE tanpa bukti.

---

## 13. Strategi Pengujian dan Acceptance Test

Gunakan test runner dan script yang benar-benar tersedia di repository. Nama perintah di bawah adalah kategori, bukan asumsi nama script.

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| AT-01 | Generate dua dunia dengan seed/configuration sama | State generasi relevan ekuivalen |
| AT-02 | Lookup tile valid dan koordinat di luar batas | Tile benar atau hasil aman; tidak ada crash/mutasi salah |
| AT-03 | Harvest resource dari stock rendah | Stock tidak negatif |
| AT-04 | Regenerasi resource pada terrain yang cocok/tidak cocok | Hanya kondisi yang sesuai yang beregenerasi |
| AT-05 | Resource mendekati kapasitas lalu beregenerasi | Stock tidak melampaui kapasitas |
| AT-06 | Ubah terrain menjadi terrain dengan kapasitas lebih rendah | State mengikuti kebijakan terrain-editing yang terdokumentasi |
| AT-07 | Pause simulasi ketika kalender/resource/weather aktif | Semua progres berbasis tick berhenti |
| AT-08 | Jalankan tepat sejumlah tick per hari | Kalender berpindah hari tepat pada boundary |
| AT-09 | Jalankan hingga batas bulan dan tahun | Rollover bulan/tahun benar |
| AT-10 | Ubah speed simulasi | Laju waktu real meningkat/menurun tanpa mengubah rasio tick ke kalender |
| AT-11 | Transisi weather | State berubah sesuai aturan dan memengaruhi variabel lingkungan |
| AT-12 | Biome berbeda | Minimal satu aturan simulasi berbeda dan dapat diuji |
| AT-13 | Natural event dipicu | State event aktif dan efek dunia dapat diukur |
| AT-14 | Event mencapai kondisi akhir | Event selesai dan tidak memicu ulang tanpa guard/cooldown |
| AT-15 | Save lalu load dunia non-default | State penting dipulihkan, tidak kembali ke default |
| AT-16 | Load data lama/parsial bila relevan | Migrasi atau error handling mengikuti kebijakan yang aman |
| AT-17 | Jalankan test suite, type-check, dan production build | Hasil aktual dicatat; regresi yang diperkenalkan diperbaiki |

Test dapat dibagi menjadi unit test untuk aturan lokal dan integration test untuk interaksi lintas sistem. Jangan memaksa seluruh skenario menjadi end-to-end UI test jika test core yang lebih sederhana sudah memverifikasi aturan dengan kuat.

---

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Terrain rules terduplikasi | State berbeda antar sistem | Gunakan satu sumber aturan dan regression tests |
| PR terrain integrity belum diverifikasi | Perubahan baru bertumpuk atau menimpa | Audit branch, diff, dan test sebelum melanjutkan |
| Kalender dibuat di UI | Tanggal tidak sinkron dengan tick/pause | Jadikan simulation core sumber waktu |
| Weather hanya visual | Fitur terlihat selesai tetapi tidak memengaruhi dunia | Wajib ada state effect dan test |
| Scope terlalu besar untuk satu sesi | Banyak sistem setengah jadi | Prioritaskan P0–P4 dan kurangi breadth bila perlu |
| Save format berubah | Save lama rusak atau state hilang | Audit format existing dan buat migration/validation jika dibutuhkan |
| Randomness sulit diuji | Test flaky dan hasil sulit direproduksi | Gunakan seed/configuration dan batas transisi yang jelas |
| Refactor luas | Regresi dan waktu verifikasi membesar | Perubahan kecil dan terfokus |
| Klaim selesai tanpa verifikasi | Kualitas tidak dapat dipercaya | Wajib catat command dan output aktual |

---

## 15. Dependency dan Urutan Kerja

1. **Terrain/resource invariants** mendahului biome dan ekologi karena sistem tersebut menggunakan terrain/resource state.
2. **Calendar/tick integration** mendahului weather, seasons, dan event berbasis waktu.
3. **Biome dan weather state** harus tersedia sebelum aturan ecology/event yang bergantung padanya.
4. **Persistence** harus diperbarui ketika sistem state baru ditambahkan, bukan ditunda sampai semua sistem dibuat.
5. **UI/renderer** dihubungkan setelah sumber state dan aturan core jelas.
6. **Testing** berjalan sepanjang implementasi, bukan hanya pada akhir.

---

## 16. Kriteria Status DONE / PARTIAL / NOT DONE

Setiap area A1–A5 harus dilaporkan secara terpisah.

- **DONE:** Implementasi ada, terintegrasi dengan jalur runtime yang benar, acceptance criteria relevan tercakup oleh test, dan test yang diklaim lulus benar-benar dijalankan.
- **PARTIAL:** Implementasi sebagian ada tetapi satu atau lebih acceptance criteria belum dipenuhi atau belum diverifikasi.
- **NOT DONE:** Fitur belum ada, hanya placeholder/UI, atau belum ada bukti implementasi yang memadai.

Jangan menyamakan “file sudah dibuat”, “UI sudah muncul”, atau “type-check lulus” dengan bukti bahwa gameplay behavior sudah benar.

---

## 17. Instruksi Pelaksanaan untuk Coding Agent

Gunakan BRD ini sebagai kebutuhan produk. Sebelum menulis kode:

1. Audit branch, working tree, struktur proyek, `package.json`, test configuration, dan implementasi existing.
2. Periksa PR terrain-integrity yang ada, termasuk diff dan status verifikasinya. Jangan mengasumsikan patch sudah merged.
3. Cocokkan kebutuhan dokumen dengan kemampuan repository saat ini. Catat gap yang nyata, bukan asumsi.
4. Susun urutan kerja berdasarkan dependency dan mulai implementasi tanpa berhenti pada perencanaan.
5. Pertahankan perubahan tetap kecil, terfokus, dan kompatibel dengan arsitektur.
6. Jalankan test/type-check/build yang benar-benar tersedia; perbaiki regresi yang berasal dari perubahan.
7. Jangan menghapus test untuk memperoleh hasil hijau. Pisahkan kegagalan baseline dari regresi.
8. Jangan merge PR, rewrite history, atau menimpa perubahan user tanpa izin eksplisit.
9. Di akhir, laporkan:
   - Implementasi dan perilaku yang benar-benar selesai.
   - File yang berubah dan alasan perubahan.
   - Perintah test/type-check/build beserta hasil aktual.
   - Status A1–A5: DONE, PARTIAL, atau NOT DONE.
   - Known limitations dan alasan fitur yang belum selesai.
   - Satu tindakan prioritas berikutnya.

### Instruksi akhir

**Kerjakan berdasarkan bukti dari repository.** Prioritaskan correctness, integrasi, dan verifikasi daripada banyaknya fitur. Pilar A hanya boleh dinyatakan selesai apabila perilaku yang didefinisikan di BRD sudah terimplementasi dan bukti pengujiannya mendukung klaim tersebut.

---

## 18. Catatan Keputusan yang Masih Perlu Dikonfirmasi

Item berikut sengaja tidak dikunci secara berlebihan di dokumen ini. Coding agent harus memeriksa sistem existing dan memilih opsi yang paling kompatibel, lalu mendokumentasikan keputusan jika berdampak pada perilaku game:

- Format tanggal final dan initial date.
- Daftar serta nama biome awal.
- Daftar weather state awal dan parameter transisinya.
- Natural event pertama yang paling sesuai dengan arsitektur saat ini.
- Kebijakan final resource ketika terrain berubah dan kapasitas menurun.
- Format/versioning save dan strategi kompatibilitas save lama.
- Batas ukuran dunia dan target performa, setelah baseline terukur.

Keputusan tersebut tidak boleh menjadi alasan untuk berhenti pada tahap analisis. Pilih default sederhana yang aman, implementasikan secara konsisten, dan laporkan keputusan yang dibuat.
