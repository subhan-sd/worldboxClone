Living World — MVP 1 Logic Specification

1. Tujuan
   Mengembangkan fondasi simulasi kehidupan (life simulation) di atas repository:

- Repository: https://github.com/KeaganStephens/worldboxClone
- Stack yang ada: Angular 17 + TypeScript
- Fokus MVP 1: simulation logic, state, rules, determinism, observability, dan tests
- Bukan fokus MVP 1: redesign UI, visual polish, renderer baru, migrasi framework, multiplayer, atau fitur perang/teknologi kompleks.
  MVP 1 dianggap berhasil ketika dunia yang dibuat dengan seed tertentu bisa disimulasikan berulang kali, individu mencari makan dan bertahan hidup, individu mewariskan sifat kepada anak, keluarga/kelompok terbentuk, kelompok memilih lokasi, permukiman menggunakan resource, dan populasi bisa tumbuh atau punah karena kondisi simulasi.

2. Instruksi utama untuk AI coding agent
   Kamu adalah senior gameplay/simulation engineer yang bekerja di repository yang sudah ada.
   Jangan langsung menulis kode sebelum mengaudit repository.
1. Periksa package.json, angular.json, tsconfig\*.json, source tree, model/interface yang sudah ada, services, components, dan test setup.
1. Identifikasi entry point simulasi dan hubungan logic dengan Angular/UI yang ada.
1. Catat bagian yang dapat digunakan kembali. Jangan menghapus atau mengganti implementasi yang ada tanpa alasan teknis.
1. Buat rencana perubahan berdasarkan file yang benar-benar ada di repository.
1. Implementasikan secara bertahap, dalam perubahan kecil yang bisa dites.
1. Jalankan test dan build/typecheck yang tersedia. Jangan mengklaim lolos jika perintah belum dijalankan.
1. Jika ada konflik antara spesifikasi ini dan struktur nyata repo, utamakan kompatibilitas dengan repo; jelaskan keputusan sebelum melakukan perubahan besar.
   Batasan teknis

- Gunakan TypeScript dan dependency yang sudah ada jika memungkinkan.
- Jangan migrasikan proyek ke Godot, C++, React, atau framework lain.
- Jangan menambahkan dependency baru kecuali benar-benar dibutuhkan; jelaskan alasannya.
- Pisahkan simulation/domain logic dari Angular components dan rendering.
- Hindari document, window, DOM, browser APIs, dan Angular services di dalam core simulation.
- Jangan membuat satu class/service raksasa untuk seluruh simulasi.
- Jangan memperkenalkan ECS, behavior tree, utility-AI framework, pathfinding kompleks, atau arsitektur generik besar kecuali dibutuhkan oleh bukti teknis.
- Jangan memakai Math.random() langsung di simulation logic. Gunakan seeded random number generator yang dapat diinjeksi.
- Hindari angka magic: simpan parameter gameplay di konfigurasi terpusat dengan default yang terdokumentasi.
- Semua entitas memiliki ID stabil. Jangan menjadikan indeks array sebagai identitas.
- Gunakan unit waktu simulasi yang konsisten, misalnya satu tick sebagai satu langkah waktu abstrak. Jangan mengasumsikan tick = satu detik tanpa keputusan desain eksplisit.
- Pastikan logic dapat dijalankan dan diuji tanpa merender UI.

3. Scope MVP 1
   3.1 World grid dan resource
   Dunia berupa grid 2D. Tiap tile menyimpan data yang dibutuhkan oleh simulasi, misalnya:

- koordinat dan jenis terrain;
- aksesibilitas/walkability;
- kesuburan;
- ketersediaan air;
- resource lokal;
- kondisi yang memengaruhi kelayakan tempat tinggal.
  Jenis terrain awal cukup sederhana, misalnya grassland, fertile ground, sand, shallow water, dan rock. Gunakan enum/union type yang konsisten dengan konvensi proyek.
  Resource minimum:
- food: makanan yang bisa dikonsumsi;
- wood: bahan bangunan dasar;
- stone: bahan bangunan dasar;
- waterAccess: ketersediaan akses air, dapat berupa properti tile jika tidak perlu dikumpulkan sebagai inventory.
  Resource harus punya aturan jumlah minimum/maksimum dan regenerasi yang terukur. Contohnya, buah dapat tumbuh kembali pada tile yang sesuai setelah cooldown; pohon tidak boleh langsung menghasilkan kayu tanpa batas. Jangan membuat resource yang tidak dapat diakses atau dikonsumsi oleh sistem lain.
  Aturan wajib:
- Resource tidak pernah menjadi negatif.
- Pengambilan resource mengurangi stok aktual.
- Regenerasi mengikuti konfigurasi dan batas maksimum.
- Tile yang tidak dapat dilalui tidak boleh menjadi tujuan gerak normal.
- Aturan pathfinding MVP boleh sederhana (misalnya BFS pada grid), tetapi harus benar dan memiliki batas pencarian.
  3.2 Individu dan kebutuhan
  Satu individu mewakili anggota dari satu ras humanoid untuk MVP 1.
  Data konseptual minimum:
- id
- name atau label yang dihasilkan secara deterministik
- birthTick
- age atau umur yang dapat diturunkan dari tick lahir
- health
- hunger
- energy
- position
- parentIds
- partnerId opsional
- groupId opsional
- settlementId opsional
- genome
- expressedTraits
- currentAction / currentGoal
- status hidup/mati dan penyebab kematian bila relevan
  Tentukan konvensi skala yang jelas. Contoh: hunger 0..100 dengan 100 berarti sangat lapar; health dan energy 0..100. Dokumentasikan arti setiap nilai dan ambang perilakunya.
  Kebutuhan berubah setiap tick. Individu yang lapar harus mencari makanan, mengambilnya jika tersedia, lalu memakannya. Individu harus bisa bergerak menuju target yang dapat dicapai. Jika tidak ada makanan, hunger meningkat dan health dapat menurun setelah ambang tertentu.
  Hindari perilaku yang berputar tanpa hasil: jika target gagal dicapai atau resource habis, individu harus mengevaluasi ulang target setelah cooldown atau saat kondisi target berubah.
  3.3 Genetik dan trait
  Pisahkan tiga konsep:

1. Genome — data yang diwariskan.
2. Expressed traits — trait hasil ekspresi genome yang memengaruhi perilaku.
3. Current state — kondisi sementara seperti lapar, lelah, sakit, dan tujuan saat ini.
   Trait awal sebaiknya sedikit dan punya efek nyata:

- strength: memengaruhi kecepatan kerja atau kapasitas mengangkut resource;
- sociability: memengaruhi kecenderungan bergabung/berinteraksi;
- exploration: memengaruhi kecenderungan menjelajah;
- fertility atau reproductiveDrive: memengaruhi kecenderungan mencari pasangan, tetap tunduk pada aturan reproduksi.
  Pilih representasi genome yang sederhana dan konsisten. Untuk MVP, trait numerik yang diwariskan dari dua induk sudah cukup; tidak perlu simulasi kromosom biologis yang rumit.
  Aturan pewarisan:
- Anak harus memiliki dua parent ID valid, kecuali aturan khusus yang memang disepakati.
- Nilai trait anak diturunkan dari kedua induk, misalnya rata-rata berbobot atau pemilihan alel sederhana.
- Mutasi kecil memiliki peluang terkonfigurasi dan tidak boleh menghasilkan nilai di luar rentang valid.
- RNG harus seeded.
- Trait memengaruhi probabilitas/biaya/efektivitas tindakan, bukan menetapkan pekerjaan secara mutlak.
- Trait yang diwariskan harus dapat diperiksa lewat data individu dan event log/test.
  3.4 Keluarga dan reproduksi
  Reproduksi harus memiliki prasyarat yang jelas dan dapat dites:
- kedua calon pasangan hidup dan sudah dewasa;
- pasangan kompatibel menurut aturan MVP;
- belum berada dalam cooldown reproduksi;
- kondisi kebutuhan dan ketersediaan resource cukup;
- tidak ada kelahiran duplikat akibat pemrosesan tick yang sama.
  Untuk MVP 1, aturan pasangan boleh sederhana dan tidak perlu memodelkan seluruh kompleksitas sosial/biologi. Tetapkan aturan secara eksplisit dan konsisten.
  Saat kelahiran:
- buat ID unik dan stabil;
- simpan kedua parent ID;
- turunkan genome dari kedua induk dan jalankan mutasi;
- letakkan anak pada tile yang valid, idealnya dekat orang tua atau settlement;
- set umur dan kebutuhan awal;
- catat event kelahiran;
- cegah anak langsung menjalankan perilaku dewasa sebelum mencapai usia dewasa.
  Umur, tahap hidup, dan kematian harus ditangani konsisten. Individu mati tidak boleh makan, bergerak, bereproduksi, bekerja, atau dihitung sebagai populasi hidup. Hindari menghapus data terlalu cepat jika family history/event log masih memerlukan referensinya.
  3.5 Perilaku dan prioritas tindakan
  Buat pemilihan tindakan yang mudah dijelaskan dan dites. Tidak perlu LLM atau behavior tree.
  Urutan prioritas awal yang disarankan:

1. Jika mati: tidak bertindak.
2. Jika health berada pada ambang kritis: cari tindakan penyelamatan yang tersedia.
3. Jika sangat lapar: cari dan konsumsi makanan.
4. Jika sangat lelah: istirahat.
5. Jika anak: tumbuh/berada dekat pengasuh atau kelompok, sesuai model sederhana.
6. Jika ada kebutuhan reproduksi dan kondisi memadai: cari pasangan yang memenuhi syarat.
7. Jika tergabung dalam kelompok: ikuti tugas atau tujuan kelompok.
8. Jika tidak ada prioritas lain: kumpulkan resource, jelajah, atau berinteraksi.
   Prioritas harus dikonfigurasi atau dikodekan secara eksplisit. Hindari dua sistem mengubah currentAction secara saling menimpa dalam tick yang sama. Gunakan urutan fase tick yang terdokumentasi.
   3.6 Kelompok sosial
   Individu dapat bergabung dengan kelompok, keluar dari kelompok, dan berinteraksi sederhana.
   Data kelompok minimum:

- id
- memberIds
- leaderId opsional
- sharedResourceInventory
- homeTile atau lokasi target
- settlementId opsional
- tujuan/goal kelompok
- status kelompok
  Aturan:
- Keanggotaan dua arah harus konsisten: jika individu memiliki groupId, ID itu harus merujuk ke kelompok yang memuat individu tersebut.
- Anggota yang mati dikeluarkan dari daftar anggota aktif.
- Individu tidak boleh menjadi anggota dua kelompok sekaligus kecuali sistem secara eksplisit mendukungnya.
- Resource bersama hanya bertambah/berkurang melalui operasi yang tervalidasi.
- Kelompok dapat dibentuk dari individu yang berdekatan atau memiliki relasi sosial yang memadai.
- MVP tidak perlu simulasi politik, diplomasi, atau perang.
  3.7 Pemilihan lokasi dan permukiman
  Kelompok dapat mengevaluasi lokasi berdasarkan skor sederhana:
- ketersediaan makanan;
- akses air;
- kesuburan;
- ruang untuk anggota;
- ketersediaan bahan bangunan;
- jarak perjalanan;
- bahaya atau ketidaklayakan terrain.
  Buat satu fungsi penilaian lokasi yang deterministik untuk input dan seed yang sama. Bobot skor harus dapat dikonfigurasi.
  Permukiman minimum:
- id
- tilePosition
- memberGroupIds atau referensi kelompok yang konsisten
- population
- storage
- buildings
- housingCapacity
- status dan usia permukiman
  Bangunan MVP:
- house: menambah kapasitas hunian dengan biaya resource;
- storage: menyimpan resource bersama jika dibutuhkan.
  Aturan:
- Membangun bangunan membutuhkan resource dan kapasitas lokasi yang memadai.
- Tidak boleh menciptakan resource dari nol untuk biaya bangunan.
- Populasi permukiman harus konsisten dengan anggota hidup yang terasosiasi.
- Kelompok boleh bermigrasi jika lokasi tidak lagi layak; jangan memindahkan mereka setiap tick karena perubahan skor kecil. Gunakan ambang, cooldown, atau hysteresis.
- Jika makanan menipis, permukiman harus mengalami konsekuensi yang masuk akal: eksplorasi, pengumpulan resource, migrasi, kelaparan, atau penurunan populasi.
  3.8 Observabilitas
  Tambahkan mekanisme untuk memahami mengapa simulasi bertindak seperti itu.
  Statistik minimum:
- jumlah individu hidup;
- jumlah kelahiran dan kematian;
- jumlah individu dewasa/anak;
- rata-rata hunger, health, dan energy;
- total resource di dunia dan storage;
- jumlah kelompok;
- jumlah permukiman;
- populasi per kelompok/permukiman.
  Event log minimum:
- individu dibuat;
- kelahiran;
- kematian beserta penyebab;
- resource dikumpulkan/dikonsumsi;
- individu bergabung/keluar kelompok;
- kelompok dibentuk;
- lokasi dipilih;
- permukiman didirikan;
- bangunan dibangun;
- kelompok bermigrasi.
  Event perlu memiliki tick, jenis event, dan ID entitas terkait. Jangan menyimpan log tanpa batas; gunakan batas kapasitas atau mekanisme yang dapat dikonfigurasi.
  3.9 Determinisme, save/load, dan test
  Determinisme:
- Semua randomness dalam core simulation berasal dari seeded RNG.
- Urutan iterasi yang dapat memengaruhi hasil harus stabil.
- Untuk seed dan rangkaian command yang sama, state/event hasil harus sama pada implementasi dan runtime yang sama.
- Hindari bergantung pada waktu sistem atau urutan properti object yang tidak disengaja.
  Save/load MVP:
- Simpan versi format, seed/RNG state, tick, world tiles/resource, individu, genome, kelompok, permukiman, dan data lain yang diperlukan untuk melanjutkan simulasi.
- Validasi data saat load.
- Hindari menyimpan referensi runtime yang tidak dapat diserialisasi.
- Uji bahwa state setelah load dapat melanjutkan simulasi dengan hasil yang konsisten.
  Test minimum:

1. Resource tidak negatif.
2. Regenerasi resource tidak melewati maksimum.
3. Individu bergerak hanya ke tile valid.
4. Individu lapar dapat menemukan dan mengonsumsi makanan.
5. Individu tidak makan jika stok makanan kosong.
6. Anak memiliki dua parent ID valid.
7. Pewarisan trait menggunakan kedua induk dan mutasi berada dalam batas.
8. Individu di bawah umur tidak bereproduksi.
9. Individu mati tidak menjalankan aksi.
10. Keanggotaan kelompok dua arah tetap konsisten.
11. Biaya bangunan mengurangi resource yang benar.
12. Permukiman tidak melampaui kapasitas hunian tanpa aturan eksplisit.
13. Seed sama menghasilkan hasil simulasi yang sama.
14. Save/load mempertahankan state yang diperlukan.
15. Simulasi beberapa ratus/ribu tick tidak menghasilkan NaN, nilai di luar rentang, ID duplikat, atau referensi entitas yatim.
16. Arsitektur logic yang disarankan
    Sesuaikan dengan struktur nyata repo. Ini target konseptual, bukan instruksi untuk membuat semua file tanpa audit:

- simulation/models/ — tipe data domain: World, Tile, Individual, Genome, Traits, Group, Settlement, Resource.
- simulation/config/ — nilai default dan parameter gameplay.
- simulation/random/ — seeded RNG.
- simulation/systems/ — kebutuhan, gerak, resource, reproduksi, sosial, permukiman.
- simulation/engine/ — state simulasi dan urutan tick.
- simulation/events/ — typed event log.
- simulation/serialization/ — save/load dan validasi.
- simulation/tests/ — unit test dan integration test.
  Core simulation harus dapat dipanggil lewat API sederhana seperti:
- membuat world dari config dan seed;
- menjalankan satu tick atau sejumlah tick;
- membaca snapshot/statistik;
- mengirim command yang divalidasi;
- serialize/deserialize state.
  Jangan memaksa nama API ini jika repo sudah punya pola yang lebih baik; pertahankan konsep pemisahan logic dan UI.

5. Urutan fase tick
   Tetapkan urutan tick secara eksplisit. Contoh awal:
1. Validasi dan proses command yang masuk.
1. Regenerasi resource.
1. Perbarui umur dan kebutuhan individu yang hidup.
1. Hitung niat/aksi individu berdasarkan state saat fase dimulai.
1. Jalankan gerak dan interaksi dengan aturan konflik yang konsisten.
1. Konsumsi/kumpulkan resource.
1. Jalankan pembentukan kelompok dan perubahan keanggotaan.
1. Jalankan reproduksi dan buat anak baru.
1. Jalankan pekerjaan kelompok, pembangunan, dan evaluasi permukiman.
1. Proses kematian dan bersihkan referensi aktif.
1. Perbarui statistik dan event log.
1. Naikkan tick counter dan hasilkan snapshot.
   Ini urutan awal, bukan dogma. Agent harus memeriksa ketergantungan sistem dan mendokumentasikan urutan final. Tentukan apakah individu baru bertindak pada tick kelahirannya atau tick berikutnya; rekomendasi: mulai bertindak pada tick berikutnya.
1. Di luar scope MVP 1
   Jangan implementasikan dulu:

- perang dan sistem tempur;
- banyak ras;
- teknologi, skill tree, atau ekonomi kompleks;
- mata uang dan perdagangan;
- agama, kerajaan, politik, diplomasi;
- sistem crafting yang luas;
- cuaca/iklim kompleks;
- simulasi DNA biologis tingkat lanjut;
- multiplayer;
- renderer baru atau redesign UI besar.
  Jangan menambah fitur ini hanya karena mudah dibuat. Stabilitas simulasi dasar lebih penting.

7. Definition of Done
   MVP 1 logic selesai jika:

- [ ] Repo dan test setup sudah diaudit; perubahan kompatibel dengan Angular/TypeScript yang ada.
- [ ] World grid, terrain, dan resource dapat dibuat dari seed.
- [ ] Resource dapat dikumpulkan, dikonsumsi, dan beregenerasi.
- [ ] Individu memenuhi kebutuhan dan mencari makanan secara otomatis.
- [ ] Gerak memakai target/path yang valid.
- [ ] Genome, trait, pewarisan dua induk, dan mutasi berfungsi.
- [ ] Keluarga, reproduksi, pertumbuhan, dan kematian berfungsi.
- [ ] Kelompok terbentuk dan keanggotaan konsisten.
- [ ] Kelompok memilih lokasi dan dapat mendirikan permukiman.
- [ ] Resource digunakan untuk membangun dan menyimpan persediaan.
- [ ] Statistik dan event log menjelaskan apa yang terjadi.
- [ ] Seed yang sama menghasilkan hasil yang sama.
- [ ] Save/load dapat melanjutkan simulasi.
- [ ] Unit/integration tests lulus.
- [ ] Build/typecheck yang tersedia lulus.
- [ ] Dokumentasi menjelaskan aturan, konfigurasi, batasan, dan cara menjalankan simulasi.

8. Cara bekerja yang diwajibkan
   Kerjakan per milestone, jangan semua sekaligus:
   Milestone A — Audit dan desain

- Petakan struktur repo.
- Laporkan komponen/service/model yang ada dan risiko teknis.
- Usulkan struktur minimal yang sesuai dengan repo.
- Tentukan model data, aturan tick, skala kebutuhan, umur dewasa, dan konfigurasi awal.
- Jangan melakukan refactor besar sebelum desain disetujui.
  Milestone B — Core world dan deterministic simulation
- World grid, terrain, resource, seeded RNG, tick engine.
- Tests untuk resource, movement, dan determinisme.
- Core logic berjalan tanpa UI.
  Milestone C — Individual survival
- Individu, kebutuhan, gerak, mencari/makan makanan, energi, health, aging, death.
- Tests dan event log.
  Milestone D — Genetics and family
- Genome, traits, reproduction, parent IDs, mutation, growth.
- Tests pewarisan dan validasi reproduksi.
  Milestone E — Social groups and settlements
- Kelompok, resource bersama, evaluasi lokasi, permukiman, rumah/storage, migrasi.
- Tests invariant kelompok dan resource/building costs.
  Milestone F — Observability and persistence
- Statistik, event log bounded, save/load, determinism integration test, long-run test.
  Setelah tiap milestone:

1. Sebutkan file yang dibuat/diubah.
2. Jelaskan keputusan desain dan aturan gameplay.
3. Jalankan test/build yang relevan dan laporkan output aktual.
4. Catat bug, risiko, dan hal yang belum selesai.
5. Jangan lanjut ke milestone berikutnya jika fondasi atau tes milestone saat ini gagal.
6. Prompt singkat untuk memulai sesi coding
   Baca seluruh spesifikasi LIVING_WORLD_MVP1_LOGIC.md. Mulai dari Milestone A — Audit dan desain saja. Audit repository yang sedang terbuka, bukan berdasarkan asumsi. Identifikasi arsitektur Angular/TypeScript yang ada, entry point, models, services, state flow, dan test setup. Jangan menulis atau mengubah kode dulu. Laporkan: (1) ringkasan struktur repo, (2) logic yang dapat digunakan ulang, (3) risiko dan batasan, (4) rancangan core simulation yang terpisah dari UI, (5) daftar file minimal yang akan dibuat/diubah, (6) urutan milestone, dan (7) keputusan desain yang perlu dikonfirmasi. Jangan mengklaim telah memeriksa file atau menjalankan command jika belum dilakukan.
