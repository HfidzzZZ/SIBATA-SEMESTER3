import {
  kabupatenKota,
  wilayah,
  pemilik as defaultPemilik,
  statusLahan,
  dataSawah as defaultDataSawah,
  infrastruktur,
  sawahInfrastruktur,
  kandidatLokasi as defaultKandidat
} from "./mockData.js";

const STORAGE_KEYS = {
  SAWAH: "sibata_data_sawah",
  PEMILIK: "sibata_pemilik",
  KANDIDAT: "sibata_kandidat"
};

export function getLocalSawah() {
  const stored = localStorage.getItem(STORAGE_KEYS.SAWAH);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Gagal membaca localDataSawah dari storage:", e);
    }
  }
  return [...defaultDataSawah];
}

export function saveLocalSawah(data) {
  localStorage.setItem(STORAGE_KEYS.SAWAH, JSON.stringify(data));
}

export function getLocalPemilik() {
  const stored = localStorage.getItem(STORAGE_KEYS.PEMILIK);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Gagal membaca localPemilik dari storage:", e);
    }
  }
  return [...defaultPemilik];
}

export function saveLocalPemilik(data) {
  localStorage.setItem(STORAGE_KEYS.PEMILIK, JSON.stringify(data));
}

export function getLocalKandidat() {
  const stored = localStorage.getItem(STORAGE_KEYS.KANDIDAT);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Gagal membaca localKandidat dari storage:", e);
    }
  }
  return [...defaultKandidat];
}

export function saveLocalKandidat(data) {
  localStorage.setItem(STORAGE_KEYS.KANDIDAT, JSON.stringify(data));
}

// Fungsi Helper untuk menggabungkan relasi data
export function getJoinedData() {
  const localDataSawah = getLocalSawah();
  const localPemilik = getLocalPemilik();
  const localKandidat = getLocalKandidat();

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

export {
  kabupatenKota,
  wilayah,
  statusLahan,
  infrastruktur,
  sawahInfrastruktur
};
