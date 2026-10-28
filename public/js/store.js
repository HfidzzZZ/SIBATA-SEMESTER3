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
import { getAuthHeaders } from "./auth.js";

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

// -------------------------------------------------------------
// Komunikasi Data Server (Fetch API Client-to-Server)
// -------------------------------------------------------------

/**
 * Mengambil data sawah dari endpoint /api/data_sawah
 * @param {{ page?: number, size?: number, search?: string }} params
 */
export async function fetchServerDataSawah(params = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined && params.page !== null) query.set("page", params.page);
  if (params.size !== undefined && params.size !== null) query.set("size", params.size);
  if (params.search) query.set("search", params.search);

  const qs = query.toString() ? `?${query.toString()}` : "";
  try {
    const res = await fetch(`/api/data_sawah${qs}`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        saveLocalSawah(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn("fetchServerDataSawah offline/fallback:", err);
  }
  return getLocalSawah();
}

/**
 * Mengambil data wilayah dari endpoint /api/wilayah
 * @param {{ page?: number, size?: number, search?: string }} params
 */
export async function fetchServerWilayah(params = {}) {
  const query = new URLSearchParams();
  if (params.page !== undefined && params.page !== null) query.set("page", params.page);
  if (params.size !== undefined && params.size !== null) query.set("size", params.size);
  if (params.search) query.set("search", params.search);

  const qs = query.toString() ? `?${query.toString()}` : "";
  try {
    const res = await fetch(`/api/wilayah${qs}`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("fetchServerWilayah offline/fallback:", err);
  }
  return wilayah;
}

/**
 * Mengirim penambahan data sawah baru ke server melalui POST /api/data_sawah
 * @param {Array<Object>|Object} dataSawah
 */
export async function postServerDataSawah(dataSawah) {
  const payload = Array.isArray(dataSawah) ? dataSawah : [dataSawah];
  try {
    const res = await fetch("/api/data_sawah", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn("postServerDataSawah offline:", err);
    return { status: "offline", is_err: true, error: err.message };
  }
}

/**
 * Menghapus data sawah di server melalui DELETE /api/data_sawah
 * @param {string|Array<string|Object>} ids
 */
export async function deleteServerDataSawah(ids) {
  const payload = (Array.isArray(ids) ? ids : [ids]).map((item) =>
    typeof item === "object" && item !== null ? item : { id: item }
  );
  try {
    const res = await fetch("/api/data_sawah", {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn("deleteServerDataSawah offline:", err);
    return { status: "offline", is_err: true, error: err.message };
  }
}

/**
 * Sinkronisasi data lokal dengan data server secara menyeluruh
 */
export async function syncDataWithServer() {
  const [sawahData, wilayahData] = await Promise.allSettled([
    fetchServerDataSawah(),
    fetchServerWilayah()
  ]);

  return {
    sawah: sawahData.status === "fulfilled" ? sawahData.value : getLocalSawah(),
    wilayah: wilayahData.status === "fulfilled" ? wilayahData.value : wilayah
  };
}

// Fungsi Helper untuk menggabungkan relasi data
export function getJoinedData(customSawahList = null) {
  const localDataSawah = customSawahList || getLocalSawah();
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
