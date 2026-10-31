import {
  kabupatenKota,
  wilayah,
  statusLahan,
  getLocalSawah,
  saveLocalSawah,
  getLocalPemilik,
  saveLocalPemilik,
  getLocalKandidat,
  saveLocalKandidat,
  postServerDataSawah
} from "./store.js";
import { protectAdminPage, initNavbarAuth } from "./auth.js";

// Lindungi akses halaman admin sejak awal skrip dieksekusi
protectAdminPage();

// Render Dropdown untuk Form Admin
function populateAdminFormDropdowns() {
  const localPemilik = getLocalPemilik();

  // 1. Dropdown Pemilik
  const pemilikSelect = document.getElementById("select-pemilik");
  if (pemilikSelect) {
    pemilikSelect.innerHTML = '<option value="">-- Pilih Pemilik Terdaftar --</option>';
    localPemilik.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nama} (${p.jenis})`;
      pemilikSelect.appendChild(opt);
    });
  }

  // 2. Dropdown Wilayah
  const wilayahSelect = document.getElementById("select-wilayah");
  if (wilayahSelect) {
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
  }

  // 3. Dropdown Status Hukum
  const statusSelect = document.getElementById("select-status-hukum");
  if (statusSelect) {
    statusSelect.innerHTML = "";
    statusLahan.forEach((st) => {
      const opt = document.createElement("option");
      opt.value = st.id;
      opt.textContent = `${st.kategori} - ${st.boleh_alih_fungsi ? "Boleh Alih Fungsi" : "Dilarang"}`;
      statusSelect.appendChild(opt);
    });
  }
}

// Logika Form Input Petak Sawah Baru (INSERT INTO data_sawah)
function initSawahForm() {
  const form = document.getElementById("form-add-sawah");
  if (!form) return;

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

    const localDataSawah = getLocalSawah();
    const localKandidat = getLocalKandidat();

    // Cek duplikasi nomor persil
    const persilExists = localDataSawah.some(
      (s) => s.nomor_persil.toLowerCase() === persil.toLowerCase()
    );
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
    saveLocalSawah(localDataSawah);

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
    saveLocalKandidat(localKandidat);

    // Kirim sinkronisasi data ke backend server melalui fetch POST /api/data_sawah
    postServerDataSawah([
      {
        id: null,
        nomor_persil: persil,
        pemilik_id: pemilikId,
        wilayah_id: wilayahId,
        status_lahan_id: statusHukumId,
        luas_hektar: luas,
        jenis_sawah: jenisSawah,
        latitude: lat,
        longitude: lng
      }
    ]).then((serverRes) => {
      console.log("Status sinkronisasi server data_sawah:", serverRes);
    }).catch((err) => {
      console.warn("Gagal sinkronisasi data sawah ke server:", err);
    });

    form.reset();

    const goToDashboard = confirm(
      `Berhasil menyimpan data sawah baru: ${newId} (${persil})!\n\nApakah Anda ingin membuka Dashboard Analisis untuk melihat data yang baru ditambahkan?`
    );
    if (goToDashboard) {
      window.location.href = "index.html";
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

  if (!modal || !form) return;

  const openModal = () => modal.classList.add("active");
  const closeModal = () => modal.classList.remove("active");

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (openBtnSide) openBtnSide.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

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

    const localPemilik = getLocalPemilik();

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
    saveLocalPemilik(localPemilik);

    // Perbarui dropdown pemilik di form sawah dan langsung pilih pemilik baru tersebut
    populateAdminFormDropdowns();
    const selectPemilik = document.getElementById("select-pemilik");
    if (selectPemilik) {
      selectPemilik.value = newPemilikId;
    }

    form.reset();
    closeModal();
    alert(`Berhasil menambahkan pemilik baru: ${nama} (${newPemilikId}).`);
  });
}

// Inisialisasi Halaman Admin
document.addEventListener("DOMContentLoaded", () => {
  protectAdminPage();
  initNavbarAuth();
  populateAdminFormDropdowns();
  initSawahForm();
  initPemilikModal();
});
