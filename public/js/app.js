import {
  kabupatenKota,
  wilayah,
  pemilik,
  statusLahan,
  dataSawah,
  infrastruktur,
  sawahInfrastruktur,
  kandidatLokasi
} from "./mockData.js";

// State data lokal yang dapat dimanipulasi (Insert/Filter)
let localDataSawah = [...dataSawah];
let localPemilik = [...pemilik];
let localKandidat = [...kandidatLokasi];

// Fungsi Helper untuk menggabungkan relasi data
function getJoinedData() {
  return localDataSawah.map((sawah) => {
    const pmk = localPemilik.find((p) => p.id === sawah.pemilik_id) || {};
    const wil = wilayah.find((w) => w.id === sawah.wilayah_id) || {};
    const kab = kabupatenKota.find((k) => k.id === wil.kabupaten_kota_id) || {};
    const st = statusLahan.find((s) => s.id === sawah.status_lahan_id) || {};
    const kan = localKandidat.find((k) => k.sawah_id === sawah.id) || null;

    const infraLinks = sawahInfrastruktur
      .filter((si) => si.sawah_id === sawah.id)
      .map((si) => {
        const item = infrastruktur.find((inf) => inf.id === si.infrastruktur_id);
        return {
          ...item,
          jarak_meter: si.jarak_meter
        };
      });

    return {
      ...sawah,
      pemilikData: pmk,
      wilayahData: wil,
      kabupatenData: kab,
      statusData: st,
      kandidatData: kan,
      infrastrukturList: infraLinks
    };
  });
}

// Render Metrik Ringkasan
function renderMetrics(data) {
  const totalPetak = data.length;
  const totalLuasHa = data.reduce((acc, curr) => acc + curr.luas_hektar, 0).toFixed(1);

  const totalLP2B = data.filter((d) => d.statusData.kategori === "LP2B").length;
  const totalLayakDC = data.filter(
    (d) => d.kandidatData && d.kandidatData.status_penilaian === "Layak"
  ).length;
  const totalDipertimbangkan = data.filter(
    (d) => d.kandidatData && d.kandidatData.status_penilaian === "Dipertimbangkan"
  ).length;

  document.getElementById("metric-total-luas").textContent = `${totalLuasHa} Ha`;
  document.getElementById("metric-total-petak").textContent = `${totalPetak} Petak Sawah`;
  document.getElementById("metric-lp2b").textContent = `${totalLP2B} Petak`;
  document.getElementById("metric-layak-dc").textContent = `${totalLayakDC} Petak`;
  document.getElementById("metric-dipertimbangkan").textContent = `${totalDipertimbangkan} Petak`;
}

// Render Opsi Filter Wilayah di Dashboard
function populateWilayahFilter() {
  const select = document.getElementById("filter-wilayah");
  select.innerHTML = '<option value="">Semua Wilayah</option>';

  kabupatenKota.forEach((kab) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = kab.nama;

    const wilList = wilayah.filter((w) => w.kabupaten_kota_id === kab.id);
    wilList.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = `${w.desa}, Kec. ${w.kecamatan}`;
      optgroup.appendChild(opt);
    });

    select.appendChild(optgroup);
  });
}

// Render Dropdown untuk Form Admin
function populateAdminFormDropdowns() {
  // 1. Dropdown Pemilik
  const pemilikSelect = document.getElementById("select-pemilik");
  pemilikSelect.innerHTML = '<option value="">-- Pilih Pemilik Terdaftar --</option>';
  localPemilik.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.nama} (${p.jenis})`;
    pemilikSelect.appendChild(opt);
  });

  // 2. Dropdown Wilayah
  const wilayahSelect = document.getElementById("select-wilayah");
  wilayahSelect.innerHTML = '<option value="">-- Pilih Desa / Kecamatan --</option>';
  kabupatenKota.forEach((kab) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = kab.nama;

    const wilList = wilayah.filter((w) => w.kabupaten_kota_id === kab.id);
    wilList.forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = `${w.desa}, Kec. ${w.kecamatan} (${kab.nama})`;
      optgroup.appendChild(opt);
    });

    wilayahSelect.appendChild(optgroup);
  });

  // 3. Dropdown Status Hukum
  const statusSelect = document.getElementById("select-status-hukum");
  statusSelect.innerHTML = "";
  statusLahan.forEach((st) => {
    const opt = document.createElement("option");
    opt.value = st.id;
    opt.textContent = `${st.kategori} - ${st.boleh_alih_fungsi ? "Boleh Alih Fungsi" : "Dilarang"}`;
    statusSelect.appendChild(opt);
  });
}

// Render Baris Tabel & Grid Kartu
function renderTable(data) {
  const tbody = document.getElementById("table-body");
  const countLabel = document.getElementById("table-count");
  const gridContainer = document.getElementById("wrapper-grid-view");

  tbody.innerHTML = "";
  gridContainer.innerHTML = "";
  countLabel.textContent = `Menampilkan ${data.length} petak sawah`;

  if (data.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="7" class="table-empty">
        Tidak ada data sawah yang sesuai dengan kriteria penyaringan.
      </td>
    `;
    tbody.appendChild(tr);

    const emptyGrid = document.createElement("div");
    emptyGrid.className = "grid-empty-state";
    emptyGrid.textContent = "Tidak ada data sawah yang sesuai dengan kriteria penyaringan.";
    gridContainer.appendChild(emptyGrid);
    return;
  }

  data.forEach((item) => {
    // Tentukan badge status hukum
    let legalBadgeClass = "badge-neutral";
    if (item.statusData.kategori === "LP2B") {
      legalBadgeClass = "badge-danger";
    } else if (item.statusData.boleh_alih_fungsi) {
      legalBadgeClass = "badge-success";
    } else {
      legalBadgeClass = "badge-warning";
    }

    // Tentukan badge kelayakan data center
    let dcBadgeClass = "badge-neutral";
    const statusDC = item.kandidatData ? item.kandidatData.status_penilaian : "Belum Dinilai";
    const skorDC = item.kandidatData ? item.kandidatData.skor_kelayakan : "-";

    if (statusDC === "Layak") {
      dcBadgeClass = "badge-primary";
    } else if (statusDC === "Dipertimbangkan") {
      dcBadgeClass = "badge-gold";
    } else if (statusDC === "Tidak Layak") {
      dcBadgeClass = "badge-danger-muted";
    }

    let scoreBarColor = "var(--color-primary-green)";
    if (statusDC === "Dipertimbangkan") scoreBarColor = "var(--color-gold-brown)";
    if (statusDC === "Tidak Layak") scoreBarColor = "#a83232";

    const scoreNum = typeof skorDC === "number" ? Math.min(100, Math.max(0, skorDC)) : 0;

    // 1. Render Baris Tabel (Untuk Tampilan Tabel)
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <span class="cell-primary">${item.id}</span>
        <span class="cell-sub">${item.nomor_persil}</span>
      </td>
      <td>
        <span class="cell-primary">${item.pemilikData.nama || "-"}</span>
        <span class="cell-sub">${item.pemilikData.jenis || "-"}</span>
      </td>
      <td>
        <span class="cell-primary">Ds. ${item.wilayahData.desa || "-"}</span>
        <span class="cell-sub">Kec. ${item.wilayahData.kecamatan}, ${item.kabupatenData.nama}</span>
      </td>
      <td>
        <span class="cell-primary">${item.luas_hektar} Ha</span>
        <span class="cell-sub">${item.jenis_sawah}</span>
      </td>
      <td>
        <span class="badge ${legalBadgeClass}">${item.statusData.kategori}</span>
        <span class="cell-sub">${item.statusData.boleh_alih_fungsi ? "Boleh Dialihfungsikan" : "Dilarang Alih Fungsi"}</span>
      </td>
      <td>
        <div class="dc-eval-wrapper">
          <span class="badge ${dcBadgeClass}">${statusDC}</span>
          <div class="score-progress" aria-hidden="true">
            <div class="score-progress-bar" style="width: ${scoreNum}%; background-color: ${scoreBarColor};"></div>
          </div>
          <span class="cell-sub">Indeks Kelayakan: ${skorDC}/100</span>
        </div>
      </td>
      <td>
        <button type="button" class="btn-action" data-id="${item.id}">Detail Laporan</button>
      </td>
    `;
    tbody.appendChild(tr);

    // 2. Render Kartu Grid Responsif (Sangat optimal di Layar HP & Laptop)
    const card = document.createElement("article");
    card.className = "sawah-card";
    card.innerHTML = `
      <div class="sawah-card-header">
        <div class="sawah-card-id-group">
          <span class="sawah-badge-id">${item.id}</span>
          <span class="sawah-persil-code">${item.nomor_persil}</span>
        </div>
        <span class="badge ${legalBadgeClass}">${item.statusData.kategori}</span>
      </div>

      <div class="sawah-card-body">
        <div class="card-info-row">
          <span class="info-label">Pemilik</span>
          <span class="info-val"><strong>${item.pemilikData.nama || "-"}</strong> (${item.pemilikData.jenis || "-"})</span>
        </div>

        <div class="card-info-row">
          <span class="info-label">Lokasi</span>
          <span class="info-val">Ds. ${item.wilayahData.desa}, Kec. ${item.wilayahData.kecamatan}</span>
        </div>

        <div class="card-info-row">
          <span class="info-label">Luas & Pengairan</span>
          <span class="info-val"><strong>${item.luas_hektar} Hektar</strong> | ${item.jenis_sawah}</span>
        </div>

        <div class="card-eval-section">
          <div class="card-eval-header">
            <span>Evaluasi Data Center AI</span>
            <span class="badge ${dcBadgeClass}">${statusDC}</span>
          </div>
          <div class="score-progress" aria-hidden="true">
            <div class="score-progress-bar" style="width: ${scoreNum}%; background-color: ${scoreBarColor};"></div>
          </div>
          <div class="score-numeric-label">Skor Kelayakan: ${skorDC}/100</div>
        </div>
      </div>

      <div class="sawah-card-footer">
        <button type="button" class="btn-action full-width" data-id="${item.id}">Detail Analisis Lengkap</button>
      </div>
    `;
    gridContainer.appendChild(card);
  });

  // Pasang event listener ke seluruh tombol detail (baik di tabel maupun kartu grid)
  document.querySelectorAll(".btn-action").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const currentJoined = getJoinedData();
      const target = currentJoined.find((d) => d.id === id);
      if (target) {
        showDetailModal(target);
      }
    });
  });
}

// Modal Detail Lahan
function showDetailModal(item) {
  const modal = document.getElementById("detail-modal");
  const body = document.getElementById("modal-content-body");

  const infraHtml = item.infrastrukturList.length
    ? item.infrastrukturList
        .map(
          (inf) => `
            <div class="modal-list-item">
              <div>
                <strong>${inf.nama}</strong> (${inf.jenis})
                <div class="cell-sub">Kapasitas: ${inf.kapasitas || "-"} ${inf.satuan_kapasitas || ""} | Kondisi: ${inf.kondisi}</div>
              </div>
              <span class="badge badge-gold">${inf.jarak_meter} meter</span>
            </div>
          `
        )
        .join("")
    : '<div class="cell-sub">Tidak ada fasilitas tercatat di radius terdekat.</div>';

  body.innerHTML = `
    <div class="modal-grid">
      <div class="modal-section">
        <h3>Informasi Petak & Kepemilikan</h3>
        <p><strong>Nomor Persil:</strong> ${item.nomor_persil} (${item.id})</p>
        <p><strong>Pemilik:</strong> ${item.pemilikData.nama} (${item.pemilikData.jenis})</p>
        <p><strong>Kontak:</strong> ${item.pemilikData.kontak}</p>
        <p><strong>Luas Area:</strong> ${item.luas_hektar} Hektar</p>
        <p><strong>Tipe Lahan:</strong> ${item.jenis_sawah}</p>
        <p><strong>Koordinat:</strong> ${item.latitude}, ${item.longitude}</p>
      </div>

      <div class="modal-section">
        <h3>Status Hukum & Kebijakan</h3>
        <p><strong>Kategori Lahan:</strong> ${item.statusData.kategori}</p>
        <p><strong>Izin Alih Fungsi:</strong> ${item.statusData.boleh_alih_fungsi ? "Boleh untuk kegiatan non-pertanian" : "Dilarang (Perlindungan LP2B / Sengketa)"}</p>
        <p><strong>Dasar Hukum:</strong> ${item.statusData.dasar_hukum}</p>
      </div>
    </div>

    <div class="modal-section">
      <h3>Profil Risiko Bencana Wilayah</h3>
      <div class="modal-risk-grid">
        <div class="risk-card">
          <span>Risiko Banjir</span>
          <strong>${item.wilayahData.risiko_banjir}</strong>
        </div>
        <div class="risk-card">
          <span>Risiko Gempa</span>
          <strong>${item.wilayahData.risiko_gempa}</strong>
        </div>
        <div class="risk-card">
          <span>Risiko Longsor</span>
          <strong>${item.wilayahData.risiko_longsor}</strong>
        </div>
      </div>
    </div>

    <div class="modal-section">
      <h3>Kedekatan Infrastruktur Penunjang Data Center</h3>
      <div class="modal-list">
        ${infraHtml}
      </div>
    </div>

    <div class="modal-section evaluation-box">
      <h3>Hasil Penilaian Kelayakan Data Center AI</h3>
      <p><strong>Status:</strong> ${item.kandidatData ? item.kandidatData.status_penilaian : "Belum Dinilai"}</p>
      <p><strong>Skor Gabungan:</strong> ${item.kandidatData ? item.kandidatData.skor_kelayakan : "-"} / 100</p>
      <p><strong>Catatan Teknis:</strong> ${item.kandidatData ? item.kandidatData.catatan : "-"}</p>
      <p><strong>Tanggal Penilaian:</strong> ${item.kandidatData ? item.kandidatData.tanggal_penilaian : "-"}</p>
    </div>
  `;

  modal.classList.add("active");
}

// Logika Tab Navigasi
function initTabs() {
  const navLinks = document.querySelectorAll(".nav-link[data-tab]");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTabId = link.getAttribute("data-tab");

      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active");
      });

      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });
}

// Logika Filter & Pencarian
function filterData() {
  const searchKeyword = document.getElementById("search-input").value.toLowerCase().trim();
  const selectedWilayah = document.getElementById("filter-wilayah").value;
  const selectedHukum = document.getElementById("filter-hukum").value;
  const selectedDC = document.getElementById("filter-dc").value;

  const joined = getJoinedData();

  const filtered = joined.filter((item) => {
    if (searchKeyword) {
      const matchId = item.id.toLowerCase().includes(searchKeyword);
      const matchPersil = item.nomor_persil.toLowerCase().includes(searchKeyword);
      const matchPemilik = item.pemilikData.nama.toLowerCase().includes(searchKeyword);
      const matchDesa = item.wilayahData.desa.toLowerCase().includes(searchKeyword);
      const matchKecamatan = item.wilayahData.kecamatan.toLowerCase().includes(searchKeyword);

      if (!matchId && !matchPersil && !matchPemilik && !matchDesa && !matchKecamatan) {
        return false;
      }
    }

    if (selectedWilayah && item.wilayah_id !== selectedWilayah) {
      return false;
    }

    if (selectedHukum === "boleh" && !item.statusData.boleh_alih_fungsi) {
      return false;
    }
    if (selectedHukum === "dilarang" && item.statusData.boleh_alih_fungsi) {
      return false;
    }
    if (selectedHukum === "lp2b" && item.statusData.kategori !== "LP2B") {
      return false;
    }

    if (selectedDC && (!item.kandidatData || item.kandidatData.status_penilaian !== selectedDC)) {
      return false;
    }

    return true;
  });

  renderTable(filtered);
}

// Logika Form Input Petak Sawah Baru (INSERT INTO data_sawah)
function initSawahForm() {
  const form = document.getElementById("form-add-sawah");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const persil = document.getElementById("input-persil").value.trim();
    const luas = parseFloat(document.getElementById("input-luas").value);
    const pemilikId = document.getElementById("select-pemilik").value;
    const wilayahId = document.getElementById("select-wilayah").value;
    const jenisSawah = document.getElementById("select-jenis-sawah").value;
    const statusHukumId = document.getElementById("select-status-hukum").value;
    const lat = parseFloat(document.getElementById("input-lat").value);
    const lng = parseFloat(document.getElementById("input-lng").value);

    // Cek duplikasi nomor persil
    const persilExists = localDataSawah.some((s) => s.nomor_persil.toLowerCase() === persil.toLowerCase());
    if (persilExists) {
      alert(`Gagal: Nomor persil "${persil}" sudah terdaftar di basis data.`);
      return;
    }

    // Auto-generate Primary Key (SW-009, dst.)
    const currentMaxId = localDataSawah.reduce((max, s) => {
      const num = parseInt(s.id.replace("SW-", ""), 10);
      return num > max ? num : max;
    }, 0);
    const newId = `SW-${String(currentMaxId + 1).padStart(3, "0")}`;

    const newSawah = {
      id: newId,
      nomor_persil: persil,
      pemilik_id: pemilikId,
      wilayah_id: wilayahId,
      status_lahan_id: statusHukumId,
      luas_hektar: luas,
      jenis_sawah: jenisSawah,
      latitude: lat,
      longitude: lng
    };

    localDataSawah.push(newSawah);

    // Auto-evaluasi kelayakan awal data center
    const stData = statusLahan.find((s) => s.id === statusHukumId);
    let evalStatus = "Dipertimbangkan";
    let evalSkor = 50;
    let evalCatatan = "Data baru disimpan. Menunggu verifikasi jarak fasilitas terdekat.";

    if (stData && !stData.boleh_alih_fungsi) {
      evalStatus = "Tidak Layak";
      evalSkor = 0;
      evalCatatan = `Dilarang secara hukum: ${stData.dasar_hukum}`;
    } else if (luas >= 10.0) {
      evalStatus = "Layak";
      evalSkor = 85;
      evalCatatan = "Luas lahan sangat memadai (>10 Ha) dan bukan zona terlarang LP2B.";
    } else if (luas >= 5.0) {
      evalStatus = "Dipertimbangkan";
      evalSkor = 70;
      evalCatatan = "Luas memenuhi kriteria minimal (5-10 Ha). Bukan LP2B.";
    }

    const newKandidat = {
      id: `KAN-${String(localKandidat.length + 1).padStart(2, "0")}`,
      sawah_id: newId,
      nama_blok: `Blok Persil ${persil}`,
      skor_kelayakan: evalSkor,
      status_penilaian: evalStatus,
      catatan: evalCatatan,
      tanggal_penilaian: new Date().toISOString().split("T")[0]
    };
    localKandidat.push(newKandidat);

    // Refresh Tampilan
    const updatedJoined = getJoinedData();
    renderMetrics(updatedJoined);
    renderTable(updatedJoined);

    form.reset();
    alert(`Berhasil menyimpan data sawah baru: ${newId} (${persil}).`);

    // Pindah kembali ke tab Dashboard untuk melihat hasilnya
    const dashboardLink = document.querySelector('.nav-link[data-tab="tab-dashboard"]');
    if (dashboardLink) {
      dashboardLink.click();
    }
  });
}

// Logika Modal Pemilik Baru (INSERT INTO pemilik)
function initPemilikModal() {
  const modal = document.getElementById("pemilik-modal");
  const openBtn = document.getElementById("btn-open-pemilik-modal");
  const openBtnSide = document.getElementById("btn-open-pemilik-modal-side");
  const closeBtn = document.getElementById("pemilik-modal-close-btn");
  const form = document.getElementById("form-add-pemilik");

  const openModal = () => modal.classList.add("active");
  const closeModal = () => modal.classList.remove("active");

  openBtn.addEventListener("click", openModal);
  openBtnSide.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("input-pemilik-nama").value.trim();
    const jenis = document.getElementById("select-pemilik-jenis").value;
    const kontak = document.getElementById("input-pemilik-kontak").value.trim();

    // Auto-generate Primary Key pemilik (PMK-007, dst.)
    const currentMaxId = localPemilik.reduce((max, p) => {
      const num = parseInt(p.id.replace("PMK-", ""), 10);
      return num > max ? num : max;
    }, 0);
    const newPemilikId = `PMK-${String(currentMaxId + 1).padStart(3, "0")}`;

    const newOwner = {
      id: newPemilikId,
      nama: nama,
      jenis: jenis,
      kontak: kontak
    };

    localPemilik.push(newOwner);

    // Perbarui dropdown pemilik di form sawah dan langsung pilih pemilik baru tersebut
    populateAdminFormDropdowns();
    document.getElementById("select-pemilik").value = newPemilikId;

    form.reset();
    closeModal();
    alert(`Berhasil menambahkan pemilik baru: ${nama} (${newPemilikId}).`);
  });
}

// Modal Detail Close
function initDetailModal() {
  const modal = document.getElementById("detail-modal");
  const closeBtn = document.getElementById("modal-close-btn");

  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });
}

// Logika Pengalih Tampilan (Tabel vs Grid Kartu)
function initViewToggle() {
  const btnTable = document.getElementById("btn-view-table");
  const btnGrid = document.getElementById("btn-view-grid");
  const wrapperTable = document.getElementById("wrapper-table-view");
  const wrapperGrid = document.getElementById("wrapper-grid-view");

  if (!btnTable || !btnGrid || !wrapperTable || !wrapperGrid) return;

  function setView(mode) {
    if (mode === "grid") {
      btnGrid.classList.add("active");
      btnTable.classList.remove("active");
      wrapperGrid.style.display = "grid";
      wrapperTable.style.display = "none";
    } else {
      btnTable.classList.add("active");
      btnGrid.classList.remove("active");
      wrapperTable.style.display = "block";
      wrapperGrid.style.display = "none";
    }
  }

  btnTable.addEventListener("click", () => setView("table"));
  btnGrid.addEventListener("click", () => setView("grid"));

  // Otomatis aktifkan Grid Kartu pada layar ponsel (HP) agar langsung responsif dan rapi tanpa scroll horizontal
  if (window.innerWidth <= 768) {
    setView("grid");
  } else {
    setView("table");
  }
}

// Inisialisasi Utama
document.addEventListener("DOMContentLoaded", () => {
  const initialJoined = getJoinedData();

  renderMetrics(initialJoined);
  populateWilayahFilter();
  populateAdminFormDropdowns();
  renderTable(initialJoined);

  initTabs();
  initDetailModal();
  initViewToggle();
  initSawahForm();
  initPemilikModal();

  // Filter Dashboard Events
  document.getElementById("search-input").addEventListener("input", filterData);
  document.getElementById("filter-wilayah").addEventListener("change", filterData);
  document.getElementById("filter-hukum").addEventListener("change", filterData);
  document.getElementById("filter-dc").addEventListener("change", filterData);
  document.getElementById("btn-reset-filter").addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    document.getElementById("filter-wilayah").value = "";
    document.getElementById("filter-hukum").value = "";
    document.getElementById("filter-dc").value = "";
    renderTable(getJoinedData());
  });
});
