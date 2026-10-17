// Data Dummy SIBATA - Studi Kasus: Sawah Jawa Barat untuk Data Center AI

export const kabupatenKota = [
  { id: "KAB-01", nama: "Kabupaten Karawang", jenis: "Kabupaten" },
  { id: "KAB-02", nama: "Kabupaten Subang", jenis: "Kabupaten" },
  { id: "KAB-03", nama: "Kabupaten Bekasi", jenis: "Kabupaten" }
];

export const wilayah = [
  {
    id: "WIL-01",
    kabupaten_kota_id: "KAB-01",
    kecamatan: "Telukjambe Timur",
    desa: "Puseurjaya",
    total_lahan_baku_ha: 420.5,
    risiko_banjir: "Rendah",
    risiko_gempa: "Rendah",
    risiko_longsor: "Rendah"
  },
  {
    id: "WIL-02",
    kabupaten_kota_id: "KAB-01",
    kecamatan: "Klari",
    desa: "Duren",
    total_lahan_baku_ha: 510.0,
    risiko_banjir: "Sedang",
    risiko_gempa: "Rendah",
    risiko_longsor: "Rendah"
  },
  {
    id: "WIL-03",
    kabupaten_kota_id: "KAB-02",
    kecamatan: "Cipeundeuy",
    desa: "Sawangan",
    total_lahan_baku_ha: 680.0,
    risiko_banjir: "Rendah",
    risiko_gempa: "Rendah",
    risiko_longsor: "Rendah"
  },
  {
    id: "WIL-04",
    kabupaten_kota_id: "KAB-02",
    kecamatan: "Kalijati",
    desa: "Kalijati Timur",
    total_lahan_baku_ha: 390.2,
    risiko_banjir: "Rendah",
    risiko_gempa: "Rendah",
    risiko_longsor: "Rendah"
  },
  {
    id: "WIL-05",
    kabupaten_kota_id: "KAB-03",
    kecamatan: "Cikarang Pusat",
    desa: "Pasirranji",
    total_lahan_baku_ha: 310.8,
    risiko_banjir: "Rendah",
    risiko_gempa: "Rendah",
    risiko_longsor: "Rendah"
  }
];

export const pemilik = [
  { id: "PMK-001", nama: "H. Sukarna", jenis: "Perorangan", kontak: "081234567890" },
  { id: "PMK-002", nama: "Kelompok Tani Makmur Jaya", jenis: "Kelompok Tani", kontak: "081398765432" },
  { id: "PMK-003", nama: "Hj. Siti Rohmah", jenis: "Perorangan", kontak: "082112345678" },
  { id: "PMK-004", nama: "Kelompok Tani Subur Barokah", jenis: "Kelompok Tani", kontak: "085233445566" },
  { id: "PMK-005", nama: "Ahmad Junaedi", jenis: "Perorangan", kontak: "087788990011" },
  { id: "PMK-006", nama: "Kelompok Tani Sri Asih", jenis: "Kelompok Tani", kontak: "089611223344" }
];

export const statusLahan = [
  {
    id: "ST-01",
    kategori: "LP2B",
    boleh_alih_fungsi: false,
    dasar_hukum: "UU No. 41 Tahun 2009 (Perlindungan LP2B)"
  },
  {
    id: "ST-02",
    kategori: "Aktif Produktif (Bukan LP2B)",
    boleh_alih_fungsi: true,
    dasar_hukum: "Perda RTRW Zona Pengembangan Industri / Non-Pangan"
  },
  {
    id: "ST-03",
    kategori: "Terancam Alih Fungsi",
    boleh_alih_fungsi: true,
    dasar_hukum: "SK Bupati Penetapan Koridor Kawasan Industri Terpadu"
  },
  {
    id: "ST-04",
    kategori: "Sengketa / Non-Aktif",
    boleh_alih_fungsi: false,
    dasar_hukum: "Putusan Perdata PN Karawang (Dalam Mediasi)"
  }
];

export const dataSawah = [
  {
    id: "SW-001",
    nomor_persil: "PRS-1029",
    pemilik_id: "PMK-001",
    wilayah_id: "WIL-01",
    status_lahan_id: "ST-02",
    luas_hektar: 8.5,
    jenis_sawah: "Tadah Hujan",
    latitude: -6.3458,
    longitude: 107.3124
  },
  {
    id: "SW-002",
    nomor_persil: "PRS-1030",
    pemilik_id: "PMK-002",
    wilayah_id: "WIL-01",
    status_lahan_id: "ST-01",
    luas_hektar: 12.0,
    jenis_sawah: "Irigasi Teknis",
    latitude: -6.3512,
    longitude: 107.3201
  },
  {
    id: "SW-003",
    nomor_persil: "PRS-2041",
    pemilik_id: "PMK-003",
    wilayah_id: "WIL-02",
    status_lahan_id: "ST-03",
    luas_hektar: 6.2,
    jenis_sawah: "Setengah Teknis",
    latitude: -6.3821,
    longitude: 107.3912
  },
  {
    id: "SW-004",
    nomor_persil: "PRS-2042",
    pemilik_id: "PMK-004",
    wilayah_id: "WIL-02",
    status_lahan_id: "ST-04",
    luas_hektar: 4.8,
    jenis_sawah: "Tadah Hujan",
    latitude: -6.3905,
    longitude: 107.4023
  },
  {
    id: "SW-005",
    nomor_persil: "PRS-3011",
    pemilik_id: "PMK-005",
    wilayah_id: "WIL-03",
    status_lahan_id: "ST-02",
    luas_hektar: 15.4,
    jenis_sawah: "Tadah Hujan",
    latitude: -6.4912,
    longitude: 107.6189
  },
  {
    id: "SW-006",
    nomor_persil: "PRS-3012",
    pemilik_id: "PMK-002",
    wilayah_id: "WIL-03",
    status_lahan_id: "ST-01",
    luas_hektar: 9.3,
    jenis_sawah: "Irigasi Teknis",
    latitude: -6.5021,
    longitude: 107.6254
  },
  {
    id: "SW-007",
    nomor_persil: "PRS-4050",
    pemilik_id: "PMK-006",
    wilayah_id: "WIL-04",
    status_lahan_id: "ST-03",
    luas_hektar: 10.1,
    jenis_sawah: "Tadah Hujan",
    latitude: -6.5310,
    longitude: 107.6890
  },
  {
    id: "SW-008",
    nomor_persil: "PRS-5088",
    pemilik_id: "PMK-001",
    wilayah_id: "WIL-05",
    status_lahan_id: "ST-02",
    luas_hektar: 7.8,
    jenis_sawah: "Setengah Teknis",
    latitude: -6.3689,
    longitude: 107.1654
  }
];

export const infrastruktur = [
  {
    id: "INF-01",
    nama: "Gardu Induk PLN Cibatu 150/500 kV",
    jenis: "Listrik",
    kondisi: "Baik",
    kapasitas: 500,
    satuan_kapasitas: "MVA",
    wilayah_id: "WIL-05",
    latitude: -6.3621,
    longitude: 107.1610
  },
  {
    id: "INF-02",
    nama: "Jalur Backbone Fiber Optik Pantura Telkom",
    jenis: "Fiber Optik",
    kondisi: "Baik",
    kapasitas: 400,
    satuan_kapasitas: "Gbps",
    wilayah_id: "WIL-01",
    latitude: -6.3410,
    longitude: 107.3090
  },
  {
    id: "INF-03",
    nama: "Gerbang Tol Karawang Timur 1",
    jenis: "Jalan Tol",
    kondisi: "Baik",
    kapasitas: null,
    satuan_kapasitas: "",
    wilayah_id: "WIL-02",
    latitude: -6.3750,
    longitude: 107.3820
  },
  {
    id: "INF-04",
    nama: "Gardu Induk Cipeundeuy 150 kV",
    jenis: "Listrik",
    kondisi: "Baik",
    kapasitas: 120,
    satuan_kapasitas: "MVA",
    wilayah_id: "WIL-03",
    latitude: -6.4850,
    longitude: 107.6102
  },
  {
    id: "INF-05",
    nama: "Kabel Fiber Optik Lintas Jawa Subang",
    jenis: "Fiber Optik",
    kondisi: "Baik",
    kapasitas: 200,
    satuan_kapasitas: "Gbps",
    wilayah_id: "WIL-03",
    latitude: -6.4880,
    longitude: 107.6135
  },
  {
    id: "INF-06",
    nama: "Saluran Induk Tarum Barat (Pasokan Pendingin)",
    jenis: "Sumber Air",
    kondisi: "Baik",
    kapasitas: 1500,
    satuan_kapasitas: "liter/detik",
    wilayah_id: "WIL-01",
    latitude: -6.3490,
    longitude: 107.3150
  }
];

export const sawahInfrastruktur = [
  { sawah_id: "SW-001", infrastruktur_id: "INF-02", jarak_meter: 650 },
  { sawah_id: "SW-001", infrastruktur_id: "INF-06", jarak_meter: 420 },
  { sawah_id: "SW-002", infrastruktur_id: "INF-06", jarak_meter: 210 },
  { sawah_id: "SW-003", infrastruktur_id: "INF-03", jarak_meter: 890 },
  { sawah_id: "SW-005", infrastruktur_id: "INF-04", jarak_meter: 780 },
  { sawah_id: "SW-005", infrastruktur_id: "INF-05", jarak_meter: 550 },
  { sawah_id: "SW-007", infrastruktur_id: "INF-04", jarak_meter: 4200 },
  { sawah_id: "SW-008", infrastruktur_id: "INF-01", jarak_meter: 820 }
];

export const kandidatLokasi = [
  {
    id: "KAN-01",
    sawah_id: "SW-001",
    nama_blok: "Blok Babakan Karawang",
    skor_kelayakan: 88,
    status_penilaian: "Layak",
    catatan: "Bukan LP2B. Dekat backbone fiber optik (650m) dan saluran air pendingin (420m). Risiko bencana rendah.",
    tanggal_penilaian: "2026-10-10"
  },
  {
    id: "KAN-02",
    sawah_id: "SW-002",
    nama_blok: "Blok Pasir Duren Subur",
    skor_kelayakan: 0,
    status_penilaian: "Tidak Layak",
    catatan: "Terikat status LP2B aktif (UU 41/2009). Dilarang dialihfungsikan untuk kegiatan non-pertanian.",
    tanggal_penilaian: "2026-10-10"
  },
  {
    id: "KAN-03",
    sawah_id: "SW-003",
    nama_blok: "Blok Klari Industri",
    skor_kelayakan: 74,
    status_penilaian: "Dipertimbangkan",
    catatan: "Boleh alih fungsi, dekat gerbang tol. Risiko banjir sedang sehingga perlu peninggian elevasi lantai data center.",
    tanggal_penilaian: "2026-10-12"
  },
  {
    id: "KAN-04",
    sawah_id: "SW-004",
    nama_blok: "Blok Sengon Bersengketa",
    skor_kelayakan: 0,
    status_penilaian: "Tidak Layak",
    catatan: "Lahan dalam status sengketa perdata di Pengadilan Negeri.",
    tanggal_penilaian: "2026-10-12"
  },
  {
    id: "KAN-05",
    sawah_id: "SW-005",
    nama_blok: "Blok Sawangan Megah Subang",
    skor_kelayakan: 93,
    status_penilaian: "Layak",
    catatan: "Sangat ideal. Luas 15.4 ha, dekat Gardu PLN (780m) dan fiber optik (550m). Wilayah aman banjir dan gempa.",
    tanggal_penilaian: "2026-10-14"
  },
  {
    id: "KAN-06",
    sawah_id: "SW-006",
    nama_blok: "Blok Cipeundeuy Asri",
    skor_kelayakan: 0,
    status_penilaian: "Tidak Layak",
    catatan: "Status LP2B dengan irigasi teknis aktif berproduksi.",
    tanggal_penilaian: "2026-10-14"
  },
  {
    id: "KAN-07",
    sawah_id: "SW-007",
    nama_blok: "Blok Kalijati Mandiri",
    skor_kelayakan: 62,
    status_penilaian: "Dipertimbangkan",
    catatan: "Lahan luas namun jarak ke gardu induk listrik cukup jauh (di atas 4 km).",
    tanggal_penilaian: "2026-10-15"
  },
  {
    id: "KAN-08",
    sawah_id: "SW-008",
    nama_blok: "Blok Delta Cikarang",
    skor_kelayakan: 89,
    status_penilaian: "Layak",
    catatan: "Sangat dekat dengan Gardu Induk 500 kV Cibatu (820m). Zona peruntukan industri.",
    tanggal_penilaian: "2026-10-16"
  }
];
