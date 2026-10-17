-- ==============================================================================

-- Buat database jika belum ada (opsional)
-- CREATE DATABASE IF NOT EXISTS sibata_db;
-- USE sibata_db;

-- Nonaktifkan pengecekan foreign key sementara agar pembuatan tabel berjalan mulus
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABEL kabupaten_kota
-- Menyimpan daftar kabupaten/kota tingkat II di Jawa Barat
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS kabupaten_kota;
CREATE TABLE kabupaten_kota (
    id VARCHAR(10) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    jenis ENUM('Kabupaten', 'Kota') NOT NULL DEFAULT 'Kabupaten',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 2. TABEL wilayah
-- Menyimpan data administratif desa/kecamatan beserta profil risiko bencana alam
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS wilayah;
CREATE TABLE wilayah (
    id VARCHAR(10) NOT NULL,
    kabupaten_kota_id VARCHAR(10) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    desa VARCHAR(100) NOT NULL,
    total_lahan_baku_ha DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    risiko_banjir ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL DEFAULT 'Rendah',
    risiko_gempa ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL DEFAULT 'Rendah',
    risiko_longsor ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL DEFAULT 'Rendah',
    PRIMARY KEY (id),
    CONSTRAINT fk_wilayah_kabupaten 
        FOREIGN KEY (kabupaten_kota_id) REFERENCES kabupaten_kota (id) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 3. TABEL pemilik
-- Menyimpan data petani perorangan atau kelompok tani pemilik lahan
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS pemilik;
CREATE TABLE pemilik (
    id VARCHAR(10) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    jenis ENUM('Perorangan', 'Kelompok Tani') NOT NULL DEFAULT 'Perorangan',
    kontak VARCHAR(30) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 4. TABEL status_lahan
-- Menyimpan status hukum lahan (penentu utama apakah lahan boleh dialihfungsikan)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS status_lahan;
CREATE TABLE status_lahan (
    id VARCHAR(10) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    boleh_alih_fungsi BOOLEAN NOT NULL DEFAULT FALSE,
    dasar_hukum TEXT DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 5. TABEL data_sawah
-- Tabel fakta fisik setiap petak lahan sawah
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS data_sawah;
CREATE TABLE data_sawah (
    id VARCHAR(10) NOT NULL,
    nomor_persil VARCHAR(50) NOT NULL,
    pemilik_id VARCHAR(10) NOT NULL,
    wilayah_id VARCHAR(10) NOT NULL,
    status_lahan_id VARCHAR(10) NOT NULL,
    luas_hektar DECIMAL(8, 2) NOT NULL,
    jenis_sawah ENUM('Tadah Hujan', 'Setengah Teknis', 'Irigasi Teknis') NOT NULL DEFAULT 'Tadah Hujan',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_nomor_persil (nomor_persil),
    CONSTRAINT fk_sawah_pemilik 
        FOREIGN KEY (pemilik_id) REFERENCES pemilik (id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sawah_wilayah 
        FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) 
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sawah_status 
        FOREIGN KEY (status_lahan_id) REFERENCES status_lahan (id) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 6. TABEL infrastruktur
-- Fasilitas penting di sekitar lahan (Gardu Listrik, Fiber Optik, Tol, Sumber Air)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS infrastruktur;
CREATE TABLE infrastruktur (
    id VARCHAR(10) NOT NULL,
    nama VARCHAR(150) NOT NULL,
    jenis ENUM('Listrik', 'Fiber Optik', 'Jalan Tol', 'Sumber Air', 'Irigasi', 'Akses Jalan') NOT NULL,
    kondisi ENUM('Baik', 'Rusak Ringan', 'Butuh Perbaikan') NOT NULL DEFAULT 'Baik',
    kapasitas DECIMAL(10, 2) DEFAULT NULL,
    satuan_kapasitas VARCHAR(30) DEFAULT NULL,
    wilayah_id VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_infrastruktur_wilayah 
        FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) 
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 7. TABEL sawah_infrastruktur (Junction Table Many-to-Many)
-- Menghubungkan petak sawah ke fasilitas infrastruktur beserta jaraknya
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS sawah_infrastruktur;
CREATE TABLE sawah_infrastruktur (
    sawah_id VARCHAR(10) NOT NULL,
    infrastruktur_id VARCHAR(10) NOT NULL,
    jarak_meter INT UNSIGNED NOT NULL,
    PRIMARY KEY (sawah_id, infrastruktur_id),
    CONSTRAINT fk_si_sawah 
        FOREIGN KEY (sawah_id) REFERENCES data_sawah (id) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_si_infra 
        FOREIGN KEY (infrastruktur_id) REFERENCES infrastruktur (id) 
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------------------------
-- 8. TABEL kandidat_lokasi
-- Hasil akhir evaluasi kelayakan lahan sebagai lokasi data center AI
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS kandidat_lokasi;
CREATE TABLE kandidat_lokasi (
    id VARCHAR(10) NOT NULL,
    sawah_id VARCHAR(10) NOT NULL,
    nama_blok VARCHAR(150) NOT NULL,
    skor_kelayakan TINYINT UNSIGNED NOT NULL DEFAULT 0,
    status_penilaian ENUM('Layak', 'Dipertimbangkan', 'Tidak Layak') NOT NULL DEFAULT 'Dipertimbangkan',
    catatan TEXT DEFAULT NULL,
    tanggal_penilaian DATE NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_kandidat_sawah (sawah_id),
    CONSTRAINT fk_kandidat_sawah 
        FOREIGN KEY (sawah_id) REFERENCES data_sawah (id) 
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Aktifkan kembali pengecekan foreign key
SET FOREIGN_KEY_CHECKS = 1;


-- ==============================================================================
-- DATA AWAL (INSERT DML)
-- Data realistis wilayah koridor Jawa Barat (Karawang, Subang, Bekasi)
-- ==============================================================================

-- 1. Insert kabupaten_kota
INSERT INTO kabupaten_kota (id, nama, jenis) VALUES
('KAB-01', 'Kabupaten Karawang', 'Kabupaten'),
('KAB-02', 'Kabupaten Subang', 'Kabupaten'),
('KAB-03', 'Kabupaten Bekasi', 'Kabupaten');

-- 2. Insert wilayah
INSERT INTO wilayah (id, kabupaten_kota_id, kecamatan, desa, total_lahan_baku_ha, risiko_banjir, risiko_gempa, risiko_longsor) VALUES
('WIL-01', 'KAB-01', 'Telukjambe Timur', 'Puseurjaya', 420.50, 'Rendah', 'Rendah', 'Rendah'),
('WIL-02', 'KAB-01', 'Klari', 'Duren', 510.00, 'Sedang', 'Rendah', 'Rendah'),
('WIL-03', 'KAB-02', 'Cipeundeuy', 'Sawangan', 680.00, 'Rendah', 'Rendah', 'Rendah'),
('WIL-04', 'KAB-02', 'Kalijati', 'Kalijati Timur', 390.20, 'Rendah', 'Rendah', 'Rendah'),
('WIL-05', 'KAB-03', 'Cikarang Pusat', 'Pasirranji', 310.80, 'Rendah', 'Rendah', 'Rendah');

-- 3. Insert pemilik
INSERT INTO pemilik (id, nama, jenis, kontak) VALUES
('PMK-001', 'H. Sukarna', 'Perorangan', '081234567890'),
('PMK-002', 'Kelompok Tani Makmur Jaya', 'Kelompok Tani', '081398765432'),
('PMK-003', 'Hj. Siti Rohmah', 'Perorangan', '082112345678'),
('PMK-004', 'Kelompok Tani Subur Barokah', 'Kelompok Tani', '085233445566'),
('PMK-005', 'Ahmad Junaedi', 'Perorangan', '087788990011'),
('PMK-006', 'Kelompok Tani Sri Asih', 'Kelompok Tani', '089611223344');

-- 4. Insert status_lahan
INSERT INTO status_lahan (id, kategori, boleh_alih_fungsi, dasar_hukum) VALUES
('ST-01', 'LP2B', FALSE, 'UU No. 41 Tahun 2009 (Perlindungan LP2B)'),
('ST-02', 'Aktif Produktif (Bukan LP2B)', TRUE, 'Perda RTRW Zona Pengembangan Industri / Non-Pangan'),
('ST-03', 'Terancam Alih Fungsi', TRUE, 'SK Bupati Penetapan Koridor Kawasan Industri Terpadu'),
('ST-04', 'Sengketa / Non-Aktif', FALSE, 'Putusan Perdata PN Karawang (Dalam Mediasi)');

-- 5. Insert data_sawah
INSERT INTO data_sawah (id, nomor_persil, pemilik_id, wilayah_id, status_lahan_id, luas_hektar, jenis_sawah, latitude, longitude) VALUES
('SW-001', 'PRS-1029', 'PMK-001', 'WIL-01', 'ST-02', 8.50, 'Tadah Hujan', -6.34580000, 107.31240000),
('SW-002', 'PRS-1030', 'PMK-002', 'WIL-01', 'ST-01', 12.00, 'Irigasi Teknis', -6.35120000, 107.32010000),
('SW-003', 'PRS-2041', 'PMK-003', 'WIL-02', 'ST-03', 6.20, 'Setengah Teknis', -6.38210000, 107.39120000),
('SW-004', 'PRS-2042', 'PMK-004', 'WIL-02', 'ST-04', 4.80, 'Tadah Hujan', -6.39050000, 107.40230000),
('SW-005', 'PRS-3011', 'PMK-005', 'WIL-03', 'ST-02', 15.40, 'Tadah Hujan', -6.49120000, 107.61890000),
('SW-006', 'PRS-3012', 'PMK-002', 'WIL-03', 'ST-01', 9.30, 'Irigasi Teknis', -6.50210000, 107.62540000),
('SW-007', 'PRS-4050', 'PMK-006', 'WIL-04', 'ST-03', 10.10, 'Tadah Hujan', -6.53100000, 107.68900000),
('SW-008', 'PRS-5088', 'PMK-001', 'WIL-05', 'ST-02', 7.80, 'Setengah Teknis', -6.36890000, 107.16540000);

-- 6. Insert infrastruktur
INSERT INTO infrastruktur (id, nama, jenis, kondisi, kapasitas, satuan_kapasitas, wilayah_id, latitude, longitude) VALUES
('INF-01', 'Gardu Induk PLN Cibatu 150/500 kV', 'Listrik', 'Baik', 500.00, 'MVA', 'WIL-05', -6.36210000, 107.16100000),
('INF-02', 'Jalur Backbone Fiber Optik Pantura Telkom', 'Fiber Optik', 'Baik', 400.00, 'Gbps', 'WIL-01', -6.34100000, 107.30900000),
('INF-03', 'Gerbang Tol Karawang Timur 1', 'Jalan Tol', 'Baik', NULL, '', 'WIL-02', -6.37500000, 107.38200000),
('INF-04', 'Gardu Induk Cipeundeuy 150 kV', 'Listrik', 'Baik', 120.00, 'MVA', 'WIL-03', -6.48500000, 107.61020000),
('INF-05', 'Kabel Fiber Optik Lintas Jawa Subang', 'Fiber Optik', 'Baik', 200.00, 'Gbps', 'WIL-03', -6.48800000, 107.61350000),
('INF-06', 'Saluran Induk Tarum Barat (Pasokan Pendingin)', 'Sumber Air', 'Baik', 1500.00, 'liter/detik', 'WIL-01', -6.34900000, 107.31500000);

-- 7. Insert sawah_infrastruktur
INSERT INTO sawah_infrastruktur (sawah_id, infrastruktur_id, jarak_meter) VALUES
('SW-001', 'INF-02', 650),
('SW-001', 'INF-06', 420),
('SW-002', 'INF-06', 210),
('SW-003', 'INF-03', 890),
('SW-005', 'INF-04', 780),
('SW-005', 'INF-05', 550),
('SW-007', 'INF-04', 4200),
('SW-008', 'INF-01', 820);

-- 8. Insert kandidat_lokasi
INSERT INTO kandidat_lokasi (id, sawah_id, nama_blok, skor_kelayakan, status_penilaian, catatan, tanggal_penilaian) VALUES
('KAN-01', 'SW-001', 'Blok Babakan Karawang', 88, 'Layak', 'Bukan LP2B. Dekat backbone fiber optik (650m) dan saluran air pendingin (420m). Risiko bencana rendah.', '2026-10-10'),
('KAN-02', 'SW-002', 'Blok Pasir Duren Subur', 0, 'Tidak Layak', 'Terikat status LP2B aktif (UU 41/2009). Dilarang dialihfungsikan untuk kegiatan non-pertanian.', '2026-10-10'),
('KAN-03', 'SW-003', 'Blok Klari Industri', 74, 'Dipertimbangkan', 'Boleh alih fungsi, dekat gerbang tol. Risiko banjir sedang sehingga perlu peninggian elevasi lantai data center.', '2026-10-12'),
('KAN-04', 'SW-004', 'Blok Sengon Bersengketa', 0, 'Tidak Layak', 'Lahan dalam status sengketa perdata di Pengadilan Negeri.', '2026-10-12'),
('KAN-05', 'SW-005', 'Blok Sawangan Megah Subang', 93, 'Layak', 'Sangat ideal. Luas 15.4 ha, dekat Gardu PLN (780m) dan fiber optik (550m). Wilayah aman banjir dan gempa.', '2026-10-14'),
('KAN-06', 'SW-006', 'Blok Cipeundeuy Asri', 0, 'Tidak Layak', 'Status LP2B dengan irigasi teknis aktif berproduksi.', '2026-10-14'),
('KAN-07', 'SW-007', 'Blok Kalijati Mandiri', 62, 'Dipertimbangkan', 'Lahan luas namun jarak ke gardu induk listrik cukup jauh (di atas 4 km).', '2026-10-15'),
('KAN-08', 'SW-008', 'Blok Delta Cikarang', 89, 'Layak', 'Sangat dekat dengan Gardu Induk 500 kV Cibatu (820m). Zona peruntukan industri.', '2026-10-16');


-- ==============================================================================
-- CONTOH QUERY RESMI TUGAS SISTEM BASIS DATA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- QUERY 1: JOIN 5 Tabel untuk Menampilkan Data Lengkap Sawah & Penilaian
-- ------------------------------------------------------------------------------
SELECT 
    ds.id AS id_sawah,
    ds.nomor_persil,
    p.nama AS pemilik,
    p.jenis AS jenis_pemilik,
    w.desa,
    w.kecamatan,
    kb.nama AS kabupaten_kota,
    ds.luas_hektar,
    ds.jenis_sawah,
    sl.kategori AS status_lahan,
    sl.boleh_alih_fungsi,
    kl.status_penilaian AS status_dc,
    kl.skor_kelayakan
FROM data_sawah ds
INNER JOIN pemilik p ON ds.pemilik_id = p.id
INNER JOIN wilayah w ON ds.wilayah_id = w.id
INNER JOIN kabupaten_kota kb ON w.kabupaten_kota_id = kb.id
INNER JOIN status_lahan sl ON ds.status_lahan_id = sl.id
LEFT JOIN kandidat_lokasi kl ON kl.sawah_id = ds.id
ORDER BY ds.id ASC;

-- ------------------------------------------------------------------------------
-- QUERY 2: Filter Khusus Sawah yang Boleh Dialihfungsikan (Non-LP2B)
-- Menjawab alur penyaringan hukum data center
-- ------------------------------------------------------------------------------
SELECT 
    ds.id AS id_sawah,
    ds.nomor_persil,
    p.nama AS pemilik,
    w.desa,
    ds.luas_hektar,
    sl.kategori,
    sl.dasar_hukum
FROM data_sawah ds
INNER JOIN status_lahan sl ON ds.status_lahan_id = sl.id
INNER JOIN pemilik p ON ds.pemilik_id = p.id
INNER JOIN wilayah w ON ds.wilayah_id = w.id
WHERE sl.boleh_alih_fungsi = TRUE
ORDER BY ds.luas_hektar DESC;

-- ------------------------------------------------------------------------------
-- QUERY 3: Agregasi COUNT & SUM Berdasarkan GROUP BY Kabupaten
-- Menghitung total petak sawah dan total luas hektar per kabupaten
-- ------------------------------------------------------------------------------
SELECT 
    kb.nama AS kabupaten,
    COUNT(ds.id) AS jumlah_petak_sawah,
    SUM(ds.luas_hektar) AS total_luas_hektar,
    AVG(ds.luas_hektar) AS rata_rata_luas_hektar
FROM kabupaten_kota kb
INNER JOIN wilayah w ON w.kabupaten_kota_id = kb.id
INNER JOIN data_sawah ds ON ds.wilayah_id = w.id
GROUP BY kb.id, kb.nama
ORDER BY total_luas_hektar DESC;

-- ------------------------------------------------------------------------------
-- QUERY 4: Rekapitulasi Sawah Berstatus "Layak" Data Center AI per Kabupaten
-- Kombinasi JOIN, WHERE, COUNT, SUM, dan GROUP BY
-- ------------------------------------------------------------------------------
SELECT 
    kb.nama AS kabupaten,
    COUNT(kl.id) AS jumlah_kandidat_layak,
    SUM(ds.luas_hektar) AS total_luas_layak_ha,
    AVG(kl.skor_kelayakan) AS rata_rata_skor
FROM kandidat_lokasi kl
INNER JOIN data_sawah ds ON kl.sawah_id = ds.id
INNER JOIN wilayah w ON ds.wilayah_id = w.id
INNER JOIN kabupaten_kota kb ON w.kabupaten_kota_id = kb.id
WHERE kl.status_penilaian = 'Layak'
GROUP BY kb.id, kb.nama
ORDER BY total_luas_layak_ha DESC;

-- ------------------------------------------------------------------------------
-- QUERY 5: Menampilkan Sawah Beserta Jarak ke Infrastruktur Kritis
-- Menggunakan Junction Table sawah_infrastruktur
-- ------------------------------------------------------------------------------
SELECT 
    ds.id AS id_sawah,
    ds.nomor_persil,
    inf.nama AS nama_infrastruktur,
    inf.jenis AS jenis_fasilitas,
    inf.kapasitas,
    inf.satuan_kapasitas,
    si.jarak_meter
FROM sawah_infrastruktur si
INNER JOIN data_sawah ds ON si.sawah_id = ds.id
INNER JOIN infrastruktur inf ON si.infrastruktur_id = inf.id
ORDER BY ds.id ASC, si.jarak_meter ASC;
