import {
  kabupatenKota,
  wilayah,
  getJoinedData
} from "./store.js";

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

  const totalLuasEl = document.getElementById("metric-total-luas");
  const totalPetakEl = document.getElementById("metric-total-petak");
  const lp2bEl = document.getElementById("metric-lp2b");
  const layakEl = document.getElementById("metric-layak-dc");
  const dipertimbangkanEl = document.getElementById("metric-dipertimbangkan");

  if (totalLuasEl) totalLuasEl.textContent = `${totalLuasHa} Ha`;
  if (totalPetakEl) totalPetakEl.textContent = `${totalPetak} Petak Sawah`;
  if (lp2bEl) lp2bEl.textContent = `${totalLP2B} Petak`;
  if (layakEl) layakEl.textContent = `${totalLayakDC} Petak`;
  if (dipertimbangkanEl) dipertimbangkanEl.textContent = `${totalDipertimbangkan} Petak`;
}

// Render Opsi Filter Wilayah di Dashboard
function populateWilayahFilter() {
  const select = document.getElementById("filter-wilayah");
  if (!select) return;
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

// Render Baris Tabel & Grid Kartu
function renderTable(data) {
  const tbody = document.getElementById("table-body");
  const countLabel = document.getElementById("table-count");
  const gridContainer = document.getElementById("wrapper-grid-view");

  if (!tbody || !countLabel || !gridContainer) return;

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

    // 1. Render Baris Tabel
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

    // 2. Render Kartu Grid Responsif
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

  // Pasang event listener ke seluruh tombol detail
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
  if (!modal || !body) return;

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

// Logika Filter & Pencarian
function filterData() {
  const searchInput = document.getElementById("search-input");
  const filterWilayah = document.getElementById("filter-wilayah");
  const filterHukum = document.getElementById("filter-hukum");
  const filterDC = document.getElementById("filter-dc");

  const searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedWilayah = filterWilayah ? filterWilayah.value : "";
  const selectedHukum = filterHukum ? filterHukum.value : "";
  const selectedDC = filterDC ? filterDC.value : "";

  const joined = getJoinedData();

  const filtered = joined.filter((item) => {
    if (searchKeyword) {
      const matchId = item.id.toLowerCase().includes(searchKeyword);
      const matchPersil = item.nomor_persil.toLowerCase().includes(searchKeyword);
      const matchPemilik = item.pemilikData.nama ? item.pemilikData.nama.toLowerCase().includes(searchKeyword) : false;
      const matchDesa = item.wilayahData.desa ? item.wilayahData.desa.toLowerCase().includes(searchKeyword) : false;
      const matchKecamatan = item.wilayahData.kecamatan ? item.wilayahData.kecamatan.toLowerCase().includes(searchKeyword) : false;

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

// Modal Detail Close
function initDetailModal() {
  const modal = document.getElementById("detail-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  if (!modal || !closeBtn) return;

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

  // Otomatis aktifkan Grid Kartu pada layar ponsel (HP) agar langsung responsif
  if (window.innerWidth <= 768) {
    setView("grid");
  } else {
    setView("table");
  }
}

// Inisialisasi Halaman Dashboard
document.addEventListener("DOMContentLoaded", () => {
  const initialJoined = getJoinedData();

  renderMetrics(initialJoined);
  populateWilayahFilter();
  renderTable(initialJoined);

  initDetailModal();
  initViewToggle();

  // Filter Dashboard Events
  const searchInput = document.getElementById("search-input");
  const filterWilayah = document.getElementById("filter-wilayah");
  const filterHukum = document.getElementById("filter-hukum");
  const filterDC = document.getElementById("filter-dc");
  const btnReset = document.getElementById("btn-reset-filter");

  if (searchInput) searchInput.addEventListener("input", filterData);
  if (filterWilayah) filterWilayah.addEventListener("change", filterData);
  if (filterHukum) filterHukum.addEventListener("change", filterData);
  if (filterDC) filterDC.addEventListener("change", filterData);
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (filterWilayah) filterWilayah.value = "";
      if (filterHukum) filterHukum.value = "";
      if (filterDC) filterDC.value = "";
      renderTable(getJoinedData());
    });
  }
});
