# Living World — MVP1 Inspector BRD

> **Jenis dokumen:** Business Requirements Document (BRD) + spesifikasi perilaku produk  
> **Proyek:** Living World  
> **Repository:** https://github.com/KeaganStephens/worldboxClone  
> **Stack saat ini:** Angular 17 + TypeScript (berdasarkan konteks proyek; wajib diverifikasi lewat audit repo)  
> **Status:** Usulan kebutuhan, belum berarti sudah diimplementasikan  
> **Versi:** 1.0  
> **Dokumen pendamping:** `LIVING_WORLD_MVP1_LOGIC.md`

## 1. Ringkasan eksekutif

MVP1 Living World membutuhkan antarmuka observasi yang membuat simulasi kehidupan dapat dipahami. Pemain harus bisa memeriksa individu, kebutuhan dan trait mereka, pasangan, orang tua, anak, saudara, clan, permukiman, statistik dunia, serta kejadian penting.

BRD ini mendefinisikan toolbar/menu dan panel **Population & Social Inspector**. UI menjadi lapisan baca (*read-only*) di atas state simulasi yang sebenarnya. UI tidak boleh menciptakan relasi palsu, menjalankan aturan simulasi sendiri, atau mengubah state hanya karena pemain membuka menu.

### Hasil yang diharapkan

Pemain dapat menjawab:
- Siapa saja yang tinggal di dunia dan siapa yang masih hidup?
- Berapa umur, health, hunger, energy, lokasi, dan aksi individu?
- Siapa orang tua, pasangan, anak, dan saudara mereka?
- Mereka tergabung dalam clan/kelompok dan permukiman mana?
- Siapa pemimpin clan, berapa anggota aktifnya, dan di mana mereka tinggal?
- Peristiwa apa yang menyebabkan populasi berubah?
- Mengapa suatu individu atau permukiman berkembang atau menurun?

**Prinsip utama:** data UI harus berasal dari simulation domain state. Jika fitur atau datanya belum tersedia, tampilkan “Belum tersedia” atau sembunyikan bagian tersebut; jangan membuat data contoh terlihat seperti data simulasi nyata.

## 2. Latar belakang dan masalah

Simulasi yang hanya menampilkan karakter bergerak sulit dievaluasi. Tanpa inspector, pemain tidak dapat memahami kebutuhan individu, garis keturunan, dinamika populasi, atau alasan perubahan jumlah penduduk. Inspector juga membantu pengujian dan diagnosis bug.

### Batasan proyek

- Pertahankan stack Angular/TypeScript yang ada kecuali audit membuktikan perubahan diperlukan.
- Audit komponen, model, services, renderer, state flow, dan test setup sebelum mengubah arsitektur.
- Persyaratan di dokumen ini adalah target perilaku, bukan klaim bahwa fitur sudah tersedia.
- Jangan melakukan redesign besar sebelum mengetahui layout dan pola aplikasi yang sekarang.

## 3. Tujuan

1. Menyediakan akses cepat ke People, Families, Clans, Settlements, History, dan World Stats.
2. Memberi setiap individu identitas stabil dan profil yang dapat diperiksa.
3. Memudahkan navigasi antarkerabat tanpa kehilangan konteks.
4. Mempertahankan riwayat keluarga setelah anggota meninggal, jika data historis disimpan.
5. Menampilkan keanggotaan clan dan permukiman secara konsisten.
6. Membuat statistik dapat ditelusuri ke state/event yang mendasarinya.
7. Menyediakan pencarian, filter, pengurutan, dan empty/error states.
8. Memisahkan UI dari aturan simulasi.
9. Menjaga performa untuk target populasi MVP1 yang disepakati.

## 4. Di luar cakupan

Tidak wajib untuk MVP1:
- Memberi perintah langsung kepada NPC atau mengedit relasi/trait melalui inspector.
- Politik, diplomasi, perang, kriminalitas, atau sistem sosial kompleks.
- Grafik jaringan sosial tanpa batas.
- Chat/biografi yang dihasilkan LLM.
- Multiplayer, akun, cloud save, atau berbagi sosial.
- Dashboard analytics kompleks.
- Menampilkan fitur yang belum memiliki data dan aturan domain.
- Migrasi framework atau penulisan ulang renderer hanya demi menambahkan menu.

## 5. Pengguna dan use case

Pengguna utama adalah pemain tunggal yang mengamati dan mengevaluasi dunia simulasi.

| ID | Use case | Hasil yang diharapkan |
|---|---|---|
| UC-01 | Memeriksa individu | Melihat identitas, status hidup, kebutuhan, trait, lokasi, dan relasi. |
| UC-02 | Mencari individu | Menyaring daftar berdasarkan nama, ID, status, umur, clan, atau permukiman. |
| UC-03 | Menelusuri keluarga | Membuka profil orang tua, pasangan, anak, dan saudara. |
| UC-04 | Memeriksa clan | Melihat anggota, pemimpin, populasi aktif, dan permukiman terkait. |
| UC-05 | Memeriksa permukiman | Melihat penduduk, kapasitas hunian, bangunan, dan resource. |
| UC-06 | Memahami perubahan populasi | Menelusuri kelahiran, kematian, migrasi, dan event lain. |
| UC-07 | Mengikuti NPC | Memusatkan kamera ke NPC jika renderer mendukungnya. |
| UC-08 | Memantau dunia | Melihat jumlah penduduk, usia, kelahiran, kematian, dan kebutuhan. |
| UC-09 | Memeriksa individu meninggal | Membuka profil historis tanpa menghitungnya sebagai populasi hidup. |
| UC-10 | Mendiagnosis data tidak konsisten | Menemukan relasi hilang, hitungan stale, atau data unavailable dengan aman. |

## 6. Arsitektur informasi

### 6.1 Toolbar utama

Enam entri yang direkomendasikan:

1. **People** — daftar seluruh individu.
2. **Families** — pencarian keluarga dan akses ke family tree.
3. **Clans** — daftar clan dan detail anggota.
4. **Settlements** — permukiman dan penduduknya.
5. **History** — timeline event simulasi.
6. **World Stats** — ringkasan statistik dunia.

Entri clan dan settlement hanya aktif jika konsep domain terkait benar-benar ada. Jika belum tersedia, UI dapat menyembunyikan menu atau menampilkannya dalam keadaan disabled dengan penjelasan yang jelas.

Toolbar harus mudah ditemukan, tidak menutupi kontrol dunia, dan boleh menggunakan panel samping yang dapat diciutkan bila viewport terbatas.

### 6.1.1 World Time — kalender dan waktu simulasi

Toolbar utama juga harus menampilkan **World Time** secara persisten agar pemain dapat memahami kapan kejadian berlangsung dan mengikuti perkembangan generasi. Ini adalah indikator waktu dunia simulasi, bukan tanggal/jam komputer.

Persyaratan: 
- Tampilkan nilai waktu dunia yang benar-benar disediakan oleh simulation state, sekurangnya **tahun dan hari**. Tampilkan **bulan** hanya jika kalender domain mendefinisikannya; tampilkan **musim** hanya jika sistem musim memang tersedia.
- Jika domain hanya menyediakan penghitung tick atau hari, tampilkan format yang sesuai dengan data yang tersedia. Jangan mengarang kalender, bulan, musim, atau tanggal Gregorian.
- Nilai harus berubah mengikuti simulasi dan berhenti berubah ketika simulasi di-pause. UI tidak boleh menjalankan kalender paralel atau memakai jam komputer sebagai sumber kebenaran.
- Kontrol **Pause/Play** dan **simulation speed** boleh ditampilkan berdekatan jika kontrol tersebut sudah ada. Jangan membuat kontrol duplikat atau mengubah perilaku pause/speed yang sudah berjalan.
- Timestamp event pada History, umur individu, kelahiran, kematian, dan kejadian sosial harus memakai sumber waktu simulasi yang konsisten jika data waktunya tersedia.
- Jika sistem waktu belum mendukung kalender yang dapat dibaca, tampilkan format waktu yang tersedia atau status “World calendar unavailable”; jangan menampilkan tanggal statis/palsu. Identifikasi kekurangan pada audit dan laporkan sebagai dependensi, bukan membangun ulang sistem simulasi tanpa kebutuhan.
- Pastikan tampilan tetap terbaca pada viewport sempit dan tidak menutupi world view atau kontrol penting.

Contoh visual konseptual (bukan format kalender yang wajib): `Year 12 · Day 108` atau `Year 12 · Spring · Day 18` jika bulan/musim benar-benar didukung domain.

### 6.2 Pola navigasi

- Membuka panel tidak mereset dunia atau mengubah kecepatan simulasi.
- Memilih baris membuka detail entitas berdasarkan ID stabil.
- Klik pada kerabat/anggota/penduduk membuka profil entitas tersebut.
- Tombol Back/breadcrumb mengembalikan pengguna ke konteks sebelumnya.
- Menutup inspector mengembalikan fokus ke world view.
- Memilih NPC di dunia dan memilih NPC yang sama dari People list harus membuka profil yang sama.
- Panel mengikuti kondisi pause/speed yang sudah ada; membuka menu tidak boleh diam-diam mengubahnya.

### 6.3 Layout konseptual

```text
┌───────────────────────────────────────────────────────────────────┐
│ People | Families | Clans | Settlements | History | World Stats   │
├────────────────────────────┬──────────────────────────────────────┤
│ Search / filters           │ Selected entity detail               │
│ NPC-0001  Ardan     Adult  │ Sprite / portrait   Ardan             │
│ NPC-0002  Mira      Adult  │ Life status / age / needs             │
│ NPC-0003  Raka      Child  │ Family / clan / settlement            │
│ ...                        │ Traits / current action / events       │
└────────────────────────────┴──────────────────────────────────────┘
```

Layout tersebut contoh konseptual, bukan kewajiban untuk meniru persis.

## 7. Persyaratan fungsional

### FR-WT — World Time (P0)
- **FR-WT-01:** Toolbar menampilkan waktu simulasi dunia dari source of truth yang sudah ada.
- **FR-WT-02:** Tampilan hanya menampilkan unit kalender yang didukung domain (misalnya tahun/hari; bulan atau musim bersifat kondisional).
- **FR-WT-03:** Waktu tidak maju saat simulasi pause dan mengikuti simulation speed yang sudah berjalan.
- **FR-WT-04:** History dan profil individu tidak boleh menggunakan sumber tanggal yang bertentangan dengan simulation state.
- **FR-WT-05:** Bila kalender atau timestamp belum tersedia, UI menampilkan fallback yang jujur dan agent mendokumentasikan dependensinya; dilarang menggunakan tanggal hardcoded atau waktu komputer sebagai pengganti.

Prioritas:
- **P0 — Must:** wajib untuk MVP1 yang berguna.
- **P1 — Should:** sangat disarankan jika sesuai arsitektur dan kapasitas milestone.
- **P2 — Later:** dapat ditunda.

### 7.1 Toolbar dan panel

- **FR-UI-001 (P0):** Sediakan akses ke People, Families, Clans, Settlements, History, dan World Stats, sesuai ketersediaan sistem simulasi.
- **FR-UI-002 (P0):** Membuka/menutup panel tidak mengubah state simulasi.
- **FR-UI-003 (P0):** Bagian aktif dan entitas terpilih terlihat jelas.
- **FR-UI-004 (P1):** Panel dapat diciutkan atau dibuat ringkas.
- **FR-UI-005 (P0):** Panel punya empty state dan status unavailable/error yang sesuai.
- **FR-UI-006 (P0):** Back/close mengembalikan pengguna ke konteks yang masuk akal.

### 7.2 People list

- **FR-PEOPLE-001 (P0):** Tampilkan ID, nama, status hidup, umur/tahap hidup, serta clan/settlement bila tersedia.
- **FR-PEOPLE-002 (P0):** Pencarian teks mendukung nama dan ID persis.
- **FR-PEOPLE-003 (P0):** Filter alive/deceased dan life stage; filter clan/settlement jika datanya tersedia.
- **FR-PEOPLE-004 (P1):** Pengurutan berdasarkan nama, umur, health, hunger, atau birth tick.
- **FR-PEOPLE-005 (P0):** Tampilkan pesan ketika filter tidak menghasilkan individu.
- **FR-PEOPLE-006 (P0):** Memilih individu membuka profil berdasarkan stable ID.
- **FR-PEOPLE-007 (P1):** Gunakan pagination/virtualization bila populasi membuat daftar penuh lambat.
- **FR-PEOPLE-008 (P0):** Individu meninggal dibedakan secara visual dan tidak dihitung sebagai populasi hidup.

### 7.3 Profil individu

- **FR-PROFILE-001 (P0):** Tampilkan stable ID dan nama.
- **FR-PROFILE-002 (P0):** Tampilkan alive/deceased; jika diketahui, tampilkan death tick dan cause of death.
- **FR-PROFILE-003 (P0):** Tampilkan umur dan life stage berdasarkan aturan simulasi, bukan tebakan UI.
- **FR-PROFILE-004 (P0):** Tampilkan health, hunger, dan energy memakai skala yang ditetapkan simulation config.
- **FR-PROFILE-005 (P0):** Tampilkan current action/goal dan koordinat jika tersedia.
- **FR-PROFILE-006 (P0):** Tampilkan expressed traits; genome dapat ditempatkan di bagian expandable.
- **FR-PROFILE-007 (P0):** Tampilkan orang tua, pasangan, anak, clan, dan settlement hanya jika ada data valid.
- **FR-PROFILE-008 (P1):** Tampilkan riwayat event individu.
- **FR-PROFILE-009 (P1):** Sediakan Follow/Locate jika renderer mendukung.
- **FR-PROFILE-010 (P0):** Field opsional yang hilang ditampilkan sebagai “Unknown”, “None”, atau “Not available” sesuai makna.
- **FR-PROFILE-011 (P0):** Profil individu meninggal tetap bisa dibuka selama data historisnya tersedia.
- **FR-PROFILE-012 (P0):** Label/tooltip menjelaskan arti kebutuhan dan trait; warna tidak boleh menjadi satu-satunya indikator.

### 7.4 Family dan relasi

- **FR-FAMILY-001 (P0):** Parent-child disimpan/dirujuk dengan stable IDs.
- **FR-FAMILY-002 (P0):** Family view menampilkan orang tua, pasangan sesuai model relasi, dan anak.
- **FR-FAMILY-003 (P0):** Pengguna dapat membuka profil orang tua, pasangan, anak, atau saudara.
- **FR-FAMILY-004 (P0):** Saudara diturunkan dari parent IDs yang sama, kecuali domain punya relasi saudara tervalidasi.
- **FR-FAMILY-005 (P0):** Relasi historis tetap tersedia setelah kematian jika data anggota dipertahankan.
- **FR-FAMILY-006 (P1):** Family tree minimal menampilkan orang tua → individu/pasangan → anak; generasi lain dapat dibuka melalui navigasi.
- **FR-FAMILY-007 (P0):** Anggota hidup dan meninggal dibedakan di family tree.
- **FR-FAMILY-008 (P0):** Missing IDs atau relasi siklik tidak boleh membuat UI crash atau render tanpa akhir.
- **FR-FAMILY-009 (P0):** Istilah “pasangan”, “partner”, atau “spouse” harus sesuai model domain. Jangan menyebut “menikah” jika status pernikahan belum disimulasikan.
- **FR-FAMILY-010 (P1):** Jika pernikahan/riwayat hubungan ditambahkan, pisahkan dari parentage biologis.

### 7.5 Clan

- **FR-CLAN-001 (P0, kondisional):** Jika sistem clan ada, tampilkan ID/nama clan, jumlah anggota hidup, dan settlement terkait bila tersedia.
- **FR-CLAN-002 (P0, kondisional):** Detail clan menampilkan leader, anggota hidup, dan anggota historis jika data mendukung.
- **FR-CLAN-003 (P0, kondisional):** Klik anggota membuka profil individu.
- **FR-CLAN-004 (P0, kondisional):** Anggota meninggal tidak dihitung sebagai anggota hidup, tetapi boleh tampil di daftar historis.
- **FR-CLAN-005 (P0, kondisional):** Jika clan belum menjadi konsep domain, jangan membuat clan palsu untuk memenuhi UI.
- **FR-CLAN-006 (P1):** Filter anggota berdasarkan life stage dan settlement jika tersedia.

### 7.6 Settlement / permukiman

- **FR-SETTLE-001 (P0, kondisional):** Jika settlement ada, tampilkan ID/nama, lokasi, populasi hidup, housing capacity, dan status.
- **FR-SETTLE-002 (P0, kondisional):** Detail menampilkan kelompok, bangunan, storage, dan penduduk jika tersedia.
- **FR-SETTLE-003 (P0, kondisional):** Klik penduduk membuka profil.
- **FR-SETTLE-004 (P0, kondisional):** Populasi dihitung dari penduduk hidup yang valid atau agregat otoritatif simulasi.
- **FR-SETTLE-005 (P0, kondisional):** Jika settlement belum diimplementasikan, jelaskan unavailable; jangan tampilkan data demo seolah nyata.

### 7.7 History / event timeline

- **FR-HISTORY-001 (P0):** Tampilkan event yang tercatat secara kronologis, terbaru di atas sebagai default.
- **FR-HISTORY-002 (P0):** Tiap event menampilkan tick/waktu simulasi, tipe, ringkasan, dan tautan entitas terkait bila tersedia.
- **FR-HISTORY-003 (P0):** Tampilkan birth, death, partnership/reproduction jika ada, pembentukan/join/keluar kelompok, pendirian settlement, migrasi, dan bangunan selesai jika event tersebut dipancarkan engine.
- **FR-HISTORY-004 (P0):** Klik entitas terkait membuka profil/detail.
- **FR-HISTORY-005 (P1):** Filter kategori dan entitas terkait.
- **FR-HISTORY-006 (P0):** Beri tahu pengguna jika event lama dipangkas karena log dibatasi.
- **FR-HISTORY-007 (P0):** Jangan mengarang sebab kematian atau event yang tidak tercatat.

### 7.8 World Stats

- **FR-STATS-001 (P0):** Tampilkan populasi hidup saat ini.
- **FR-STATS-002 (P0):** Tampilkan total kelahiran dan kematian jika data event/counter tersedia.
- **FR-STATS-003 (P0):** Tampilkan jumlah menurut life stage yang didukung.
- **FR-STATS-004 (P1):** Tampilkan rata-rata health, hunger, energy untuk individu hidup.
- **FR-STATS-005 (P0):** Tampilkan jumlah clan, kelompok, settlement hanya jika sistemnya ada.
- **FR-STATS-006 (P1):** Tampilkan tren populasi beberapa tick terakhir jika snapshot tersedia dengan biaya wajar.
- **FR-STATS-007 (P0):** Bedakan angka current, cumulative, dan historical.
- **FR-STATS-008 (P0):** Hindari NaN/Infinity pada dunia kosong; tampilkan “—” atau keterangan yang jelas.

### 7.9 Follow/Locate

- **FR-FOLLOW-001 (P1):** Jika renderer mendukung camera movement, Follow/Locate memusatkan kamera ke individu hidup.
- **FR-FOLLOW-002 (P1):** Jika target meninggal/hilang, follow berhenti atau statusnya berubah dengan jelas.
- **FR-FOLLOW-003 (P0):** Jangan menampilkan tombol follow aktif jika belum ada implementasi.

### 7.10 Integritas data

- **FR-DATA-001 (P0):** Semua navigasi relasi menggunakan stable IDs.
- **FR-DATA-002 (P0):** Missing references ditangani tanpa crash.
- **FR-DATA-003 (P0):** Angka yang berlabel “living” mengecualikan individu meninggal.
- **FR-DATA-004 (P0):** Membuka, mengurutkan, mencari, atau memfilter tidak mengubah entity.
- **FR-DATA-005 (P0):** Derived data dihitung dari snapshot konsisten atau selector domain yang otoritatif.
- **FR-DATA-006 (P0):** Komponen Angular tidak menjalankan aturan reproduksi, aging, death, clan assignment, atau konsumsi resource.
- **FR-DATA-007 (P0):** Panel tetap stabil ketika simulasi berjalan; individu terpilih tetap terpilih jika memungkinkan.

## 8. Kebutuhan data dan kontrak konseptual

Contoh berikut bersifat konseptual. Adaptasikan dengan model repo yang sebenarnya; jangan menduplikasi state yang sudah tersedia.

### 8.1 Individual summary

```ts
interface IndividualSummary {
  id: string;
  name: string;
  lifeStatus: "alive" | "deceased";
  ageTicks: number;
  lifeStage: "child" | "adult" | "elderly" | "unknown";
  health?: number;
  hunger?: number;
  energy?: number;
  position?: { x: number; y: number };
  clanId?: string;
  groupId?: string;
  settlementId?: string;
}
```

### 8.2 Individual detail

```ts
interface IndividualDetail extends IndividualSummary {
  birthTick: number;
  deathTick?: number;
  causeOfDeath?: string;
  parentIds: string[];
  partnerIds?: string[]; // Gunakan partnerId jika model hanya mendukung satu pasangan aktif.
  childIds: string[];
  expressedTraits?: Record<string, number | string | boolean>;
  currentAction?: string;
  currentGoal?: string;
}
```

### 8.3 Clan, settlement, dan event

```ts
interface ClanSummary {
  id: string;
  name: string;
  leaderId?: string;
  livingMemberCount: number;
  memberIds?: string[];
  settlementIds?: string[];
}

interface SettlementSummary {
  id: string;
  name: string;
  position: { x: number; y: number };
  livingPopulation: number;
  housingCapacity?: number;
  groupIds?: string[];
  buildingCount?: number;
  storage?: Record<string, number>;
}

interface SimulationEvent {
  id: string;
  tick: number;
  type: string;
  summary: string;
  individualIds?: string[];
  clanId?: string;
  settlementId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}
```

### Aturan kontrak

- ID unik dan stabil sepanjang umur entitas/save.
- UI boleh menyimpan cache untuk rendering, tetapi bukan sumber kebenaran.
- Field opsional tidak boleh diam-diam diubah menjadi informasi yang tidak benar.
- Jika relasi disimpan dua arah, konsistensinya divalidasi oleh simulation layer.
- Utamakan snapshot/selector domain daripada mengekspos objek mutable langsung ke komponen.
- Jika repo memakai pola berbeda, sesuaikan contoh ini; jangan menyalin mentah.

## 9. Business rules

- **BR-001 — Source of truth:** simulation domain state adalah sumber kebenaran; inspector hanya proyeksi read-only.
- **BR-002 — Populasi hidup:** hanya individu dengan status alive yang dihitung sebagai populasi saat ini.
- **BR-003 — Data historis:** individu meninggal tetap dapat diperiksa jika data historisnya dipertahankan.
- **BR-004 — Keluarga:** parent-child memakai stable IDs; sibling diturunkan dari parent yang sama kecuali dimodelkan eksplisit.
- **BR-005 — Terminologi pasangan:** UI harus sesuai definisi domain. Jangan menyatakan menikah jika status nikah tidak disimulasikan.
- **BR-006 — Clan:** clan hanya ditampilkan sebagai entitas nyata jika ada sistem domain clan.
- **BR-007 — Populasi settlement:** jangan double-count individu yang muncul melalui beberapa referensi.
- **BR-008 — Akurasi event:** ringkasan hanya mencerminkan data event yang benar-benar dipancarkan.
- **BR-009 — Waktu:** umur/event menggunakan simulation tick, bukan jam komputer.
- **BR-010 — Determinisme:** interaksi inspector tidak boleh mengonsumsi RNG atau mengubah hasil simulasi.
- **BR-011 — Empty vs unavailable:** tidak ada data berbeda dari fitur belum diimplementasikan.
- **BR-012 — Navigasi stabil:** gunakan ID, bukan indeks array atau nama saja.

## 10. UX dan aksesibilitas

- Gunakan label singkat dan konsisten.
- Jangan hanya mengandalkan warna untuk status hidup, hunger, atau health.
- Sediakan teks/tooltips yang menjelaskan kebutuhan dan trait.
- Tandai baris terpilih dan tab aktif dengan jelas.
- Tangani nama panjang dan daftar besar tanpa merusak layout.
- Bedakan status saat ini, status historis, dan statistik kumulatif.
- Hindari modal bertumpuk; gunakan satu inspector dengan navigasi internal yang konsisten.
- Panel tetap usable saat simulasi berjalan.
- Pertahankan keyboard navigation yang sudah ada.
- Pada viewport kecil, gunakan panel yang dapat diciutkan atau overlay.

## 11. Non-functional requirements

### Performance
- Pencarian/filter pada populasi target MVP1 harus responsif.
- Update panel tidak boleh memaksa redraw seluruh canvas jika tidak diperlukan.
- Jangan menghitung ulang seluruh family tree/event pada setiap render.
- Gunakan selector/memoization/virtualization jika terbukti perlu.
- **Target awal yang diusulkan:** 1.000 individu dapat dilihat dan dicari tanpa UI freeze pada mesin development. Target ini perlu divalidasi; bukan klaim performa yang sudah ada.

### Reliability
- Missing ID, selection stale, dan metadata event rusak tidak boleh membuat aplikasi crash.
- Jika individu meninggal saat profil terbuka, profil berubah menjadi status deceased tanpa kehilangan identitas.
- Nilai kosong tidak boleh menghasilkan NaN/Infinity.

### Maintainability
- Aturan domain tidak berada di komponen presentasi Angular.
- Gunakan komponen kecil dan typed selectors/services yang sesuai pola repo.
- Jangan menambah dependency state management tanpa kebutuhan yang terbukti.
- Tambahkan unit test untuk derived data dan component/integration test untuk alur utama.

### Determinism
- Membuka panel, filter, dan melihat family tree tidak mengubah RNG/state simulasi.
- Statistik UI tidak boleh memengaruhi perilaku simulasi.

## 12. Acceptance criteria

### Toolbar dan navigasi
- [ ] Semua panel yang diimplementasikan dapat dibuka/ditutup.
- [ ] Membuka panel tidak mereset, mem-pause, atau mempercepat dunia secara tidak sengaja.
- [ ] Back/close mengembalikan konteks sebelumnya dengan masuk akal.
- [ ] Tab aktif dan entitas terpilih terlihat jelas.

### People dan profil
- [ ] Daftar menampilkan ID, nama, status hidup, dan field ringkasan yang tersedia.
- [ ] Pencarian mendukung nama dan ID persis.
- [ ] Filter untuk field yang didukung berfungsi.
- [ ] Pemilihan baris membuka profil berdasarkan ID yang benar.
- [ ] Profil menampilkan umur, life stage, health, hunger, energy, dan lokasi jika tersedia.
- [ ] Field yang tidak ada ditampilkan dengan jelas, bukan difabrikasi.
- [ ] Individu meninggal masih dapat diperiksa jika dipertahankan dalam data historis.

### Keluarga
- [ ] Tautan orang tua, pasangan, dan anak membuka individu yang benar.
- [ ] Sibling diturunkan dengan benar dari parent IDs.
- [ ] Family tree membedakan anggota hidup dan meninggal.
- [ ] Missing reference dan relasi siklik tidak membuat UI crash.
- [ ] UI tidak mengklaim pernikahan tanpa state pernikahan yang nyata.

### Clan dan settlement
- [ ] Jika sistem domain ada, detail dan jumlah sesuai data aktual.
- [ ] Jumlah hidup mengecualikan individu meninggal.
- [ ] Klik anggota/penduduk membuka profil yang benar.
- [ ] Jika sistem belum ada, UI menjelaskan unavailable atau menyembunyikan menu; tidak menampilkan data palsu.

### History dan statistik
- [ ] Event terurut dan menampilkan tick, jenis, ringkasan.
- [ ] Link event membuka entitas terkait jika tersedia.
- [ ] Statistik current dan cumulative diberi label.
- [ ] Dunia dengan nol populasi tidak menampilkan NaN/Infinity.
- [ ] Batas retensi event dijelaskan jika log dipangkas.

### Engineering
- [ ] UI tidak mengubah state domain melalui operasi read-only.
- [ ] Interaksi inspector tidak mengubah hasil simulasi seeded.
- [ ] Unit test mencakup selector, count, relationship derivation, missing reference.
- [ ] Integration test mencakup list → profile → relative → back.
- [ ] Build/lint/typecheck/test yang tersedia dijalankan dan hasil aktual dilaporkan.
- [ ] Jangan mengklaim tes lolos jika belum dijalankan.

## 13. Skenario pengujian

1. **World kosong:** seluruh panel menampilkan empty state tanpa crash.
2. **Satu individu:** profil terbuka meskipun tidak punya orang tua, pasangan, anak, clan, atau settlement.
3. **Keluarga empat orang:** dua orang tua dan dua anak muncul dengan benar.
4. **Shared parent:** dua individu dengan satu parent yang sama teridentifikasi sebagai saudara.
5. **Orang tua meninggal:** tetap terlihat di family tree tetapi tidak dihitung sebagai populasi hidup.
6. **Parent ID hilang:** tampilkan referensi unavailable secara aman.
7. **Relasi siklik rusak:** UI tidak masuk loop rendering.
8. **Nama duplikat:** profil tetap tepat karena navigasi memakai ID.
9. **Individu meninggal saat profil terbuka:** profil berubah menjadi deceased.
10. **Anggota clan meninggal:** living count turun tepat sekali; histori bisa tetap menampilkan anggota.
11. **Migrasi settlement:** jumlah penduduk diperbarui konsisten.
12. **Event tanpa entitas terkait:** event tetap dapat dibaca tanpa broken link.
13. **Populasi nol:** rata-rata menunjukkan “—” atau “Tidak ada individu hidup”.
14. **Filter:** tidak mengubah state atau mengonsumsi RNG.
15. **Daftar besar:** pencarian tetap responsif pada target populasi yang disepakati.
16. **Save/load:** inspector menunjukkan state dan relasi hasil restore.
17. **Determinisme:** seed yang sama pada tick yang sama menghasilkan state ekuivalen dengan atau tanpa interaksi inspector.

## 14. Dependensi dan keputusan terbuka

Keputusan ini perlu diperiksa saat audit repo, bukan ditebak dalam UI:

1. Apakah individu meninggal tetap di entity store atau dipindah ke arsip?
2. Apakah MVP1 mendukung satu pasangan aktif, beberapa pasangan, pernikahan eksplisit, atau hanya parentage?
3. Apakah “family” entitas domain atau tampilan turunan dari parent/partner/child?
4. Apa perbedaan **clan** dan **group**? Jangan gunakan istilah secara bergantian tanpa definisi.
5. Apakah individu hanya bisa tinggal di satu settlement? Bisakah group bermigrasi sendiri?
6. Berapa batas umur untuk child/adult/elderly?
7. Apa skala dan threshold health/hunger/energy?
8. Berapa banyak event yang disimpan dan apakah ikut save/load?
9. Apakah renderer punya API camera-follow yang tidak mengikat simulation core ke DOM?
10. Apa source of truth dan mekanisme update UI yang sekarang?
11. Berapa target populasi yang realistis untuk renderer saat ini?
12. Apakah target platform hanya desktop atau juga viewport sempit/mobile?

## 15. Rencana implementasi

### Milestone A — Audit dan desain
- Audit komponen Angular, world canvas, model individu, services, state flow, dan test setup.
- Cari apakah snapshot/selector API sudah tersedia.
- Dokumentasikan ID dan field yang ada.
- Petakan requirement ke file existing atau perubahan minimal.
- **Jangan menulis kode dulu.**

**Exit criteria:** arsitektur dan rencana implementasi terdokumentasi; keputusan terbuka teridentifikasi.

### Milestone B — Fondasi inspector read-only
- Tambah/gunakan panel dan toolbar.
- Buat People list, pencarian, filter, dan state individu terpilih.
- Buat profil untuk field yang sudah ada.
- Tambahkan empty/unavailable states dan tes stable-ID navigation.

**Exit criteria:** pemain dapat menemukan dan memeriksa individu tanpa mengubah simulasi.

### Milestone C — Relasi keluarga
- Hubungkan profil dengan parent/partner/child IDs.
- Turunkan sibling secara aman.
- Buat family tree dasar dan navigasi.
- Pertahankan kerabat meninggal jika data mendukung.
- Tambah tes integritas relasi.

**Exit criteria:** navigasi keluarga benar dan tahan missing references.

### Milestone D — Clan dan settlement
- Implementasikan hanya setelah definisi domain dan sumber datanya jelas.
- Tampilkan anggota/penduduk dan living count yang akurat.
- Hubungkan navigasi antarentitas.
- Tes kematian, perubahan membership, dan migrasi.

**Exit criteria:** view mencerminkan state domain yang otoritatif.

### Milestone E — History dan World Stats
- Hubungkan event log ke timeline.
- Tambahkan filter dan tautan entitas.
- Tampilkan current/cumulative statistics dengan zero-data handling.
- Jelaskan bounded history jika berlaku.

**Exit criteria:** perubahan utama dunia dapat dipahami dari event yang tercatat.

### Milestone F — Follow, performa, dan polish
- Integrasikan camera follow jika didukung renderer.
- Tes target populasi.
- Optimalkan bottleneck yang benar-benar terukur.
- Pastikan inspector tidak mengubah determinisme.
- Periksa keyboard navigation, label, dan layout ringkas.

**Exit criteria:** inspector usable dan tidak mengganggu stabilitas simulasi.

## 16. Guardrails untuk AI coding agent

1. Baca dokumen ini dan `LIVING_WORLD_MVP1_LOGIC.md`.
2. Mulai dari Milestone A: audit/desain saja.
3. Periksa repo yang nyata; jangan mengasumsikan path/API.
4. Pertahankan Angular/TypeScript dan pola UI yang ada.
5. Jangan menulis ulang renderer/simulation engine hanya untuk menambah panel.
6. Jangan mengarang field, clan, pernikahan, atau settlement.
7. Jangan meletakkan aturan simulasi di komponen Angular.
8. Jangan menggunakan browser APIs dalam core simulation.
9. Inspector MVP1 bersifat read-only.
10. Semua navigasi menggunakan stable IDs.
11. Tambahkan tes untuk derived relationships dan counts.
12. Jalankan checks yang tersedia dan laporkan hasil sebenarnya.
13. Kerjakan per milestone; berhenti jika fondasi atau tes gagal.
14. Jika kebutuhan UI belum didukung domain model, dokumentasikan dependency dan usulkan perubahan minimal.

### Prompt awal yang disarankan

> Baca `LIVING_WORLD_MVP1_LOGIC.md` dan `LIVING_WORLD_MVP1_INSPECTOR_BRD.md`. Mulai dari Milestone A saja. Audit arsitektur repository yang nyata, world renderer, model individu, state flow, dan test setup. Jangan menulis kode dulu. Petakan setiap requirement P0 ke file yang sudah ada atau perubahan minimal yang diusulkan, identifikasi data simulasi yang belum tersedia, jawab keputusan terbuka pada bagian 14, dan buat rencana implementasi yang mempertahankan Angular/TypeScript. Jangan mengklaim memeriksa file atau menjalankan command jika belum dilakukan.

## 17. Checklist rilis MVP1

- [ ] Navigasi inspector dapat diakses.
- [ ] People list dan profil individu berfungsi.
- [ ] Relasi keluarga dan family tree dasar berfungsi.
- [ ] Clan view hanya ditampilkan jika clan benar-benar ada di domain.
- [ ] Settlement view hanya ditampilkan jika settlement benar-benar ada.
- [ ] Timeline mencerminkan event yang benar-benar dipancarkan.
- [ ] World Stats membedakan nilai current dan cumulative.
- [ ] Missing/corrupt references tidak membuat UI crash.
- [ ] Individu meninggal tetap dapat diperiksa jika data historis dipertahankan.
- [ ] Inspector read-only dan tidak mengubah RNG/state simulasi.
- [ ] Unit/integration tests lulus.
- [ ] Build/typecheck/lint dijalankan dan hasilnya dicatat.
- [ ] Keputusan terbuka dan keterbatasan terdokumentasi.

## 18. Hubungan dengan dokumen logic MVP1

BRD ini menjelaskan **apa yang bisa diperiksa pemain dan bagaimana UI berperilaku**. `LIVING_WORLD_MVP1_LOGIC.md` menjelaskan **bagaimana simulasi menghasilkan dan memelihara state tersebut**.

Keduanya harus tetap selaras:
- Simulation logic adalah sumber kebenaran untuk individu, kebutuhan, relasi, clan/group, settlement, event, dan status hidup.
- Inspector membaca snapshot/selector dari sumber tersebut.
- Jika fitur ditampilkan, data dan lifecycle rule yang mendasarinya harus ada; jika belum ada, tampilkan unavailable secara eksplisit.
- BRD tidak menjadi alasan untuk menambah sistem kompleks di luar scope MVP1.
- Jika ditemukan dependency domain yang hilang, perbarui rencana dan tes sebelum membuat workaround visual.

**Prinsip penutup:** inspector harus membuat simulasi lebih mudah dipahami, bukan membuatnya tampak lebih lengkap daripada kondisi sebenarnya.
