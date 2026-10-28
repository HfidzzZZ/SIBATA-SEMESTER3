
import * as db from "../../database/db.js";
import * as helper from "./common_type.js";

/**
 * Mengambil data wilayah.
 *
 * @param {{
 *   ind?: number|null,
 *   offset?: number|null,
 *   search?: db.Search
 * }} page
 * ind = indeks halaman, dimulai dari 0
 * offset = jumlah data per halaman (size)
 */
export async function getWilayah(page = {}) {
  try {
    const ind = page.ind ?? 0;
    const size = page.offset ?? null;

    if (!Number.isInteger(ind) || ind < 0) {
      return helper.createFailedReturn("Indeks halaman tidak valid");
    }

    if (
      size !== null &&
      (!Number.isInteger(size) || size < 0)
    ) {
      return helper.createFailedReturn("Ukuran halaman tidak valid");
    }

    const options = {
      from: "wilayah",
      search: page.search,
      orderBy: [{ column: "id", direction: "ASC" }]
    };

    // Size null berarti mengambil seluruh data.
    if (size !== null) {
      options.limit = size;
      options.offset = ind * size;
    }

    const data = await db.select(options);

    return helper.createSuccsesReturn(data);
  } catch (error) {
    return helper.createFailedReturn(
      error.message || "Gagal mengambil data wilayah"
    );
  }
}

/**
 * Menambahkan wilayah baru.
 *
 * @param {Object} data
 * @returns {Promise<import("./common_type.js").DBValue>}
 */
export async function postWilayah(data) {
  try {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return helper.createFailedReturn("Data wilayah tidak valid");
    }

    const newData = { ...data };
    const id = newData.id;

    // ID kosong berarti ID dibuat oleh database.
    if (id === undefined || id === null) {
      delete newData.id;
    } else {
      // Periksa apakah ID sudah digunakan.
      const existing = await db.select({
        from: "wilayah",
        columns: ["id"],
        where: { id }
      });

      if (existing.length > 0) {
        return helper.createSuccsesReturn([String(id)]);
      }
    }

    await db.insert("wilayah", newData);

    return helper.createSuccsesReturn([]);
  } catch (error) {
    return helper.createFailedReturn(
      error.message || "Gagal menambahkan wilayah"
    );
  }
}

/**
 * Memperbarui data wilayah.
 *
 * @param {Object} data
 * @returns {Promise<import("./common_type.js").DBValue>}
 */
export async function putWilayah(data) {
  try {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return helper.createFailedReturn("Data wilayah tidak valid");
    }

    const { id, ...changes } = data;

    // Data tanpa ID tidak digunakan.
    if (id === undefined || id === null) {
      return helper.createSuccsesReturn([]);
    }

    const existing = await db.select({
      from: "wilayah",
      columns: ["id"],
      where: { id }
    });

    // ID yang tidak ditemukan dikembalikan.
    if (existing.length === 0) {
      return helper.createSuccsesReturn([String(id)]);
    }

    if (Object.keys(changes).length === 0) {
      return helper.createSuccsesReturn([]);
    }

    await db.updateRows({
      table: "wilayah",
      set: changes,
      where: { id }
    });

    return helper.createSuccsesReturn([]);
  } catch (error) {
    return helper.createFailedReturn(
      error.message || "Gagal memperbarui wilayah"
    );
  }
}

/**
 * Menghapus data wilayah berdasarkan kumpulan ID.
 *
 * @param {string[]} ids
 * @returns {Promise<import("./common_type.js").DBValue>}
 */
export async function delWilayah(ids) {
  try {
    if (!Array.isArray(ids)) {
      return helper.createFailedReturn("Parameter IDs harus berupa array");
    }

    if (ids.length === 0) {
      return helper.createSuccsesReturn([]);
    }

    // Ambil ID unik agar tidak memeriksa ID yang sama berulang kali.
    const uniqueIds = [...new Set(ids.map(String))];

    const existing = await db.select({
      from: "wilayah",
      columns: ["id"],
      where: { id: uniqueIds }
    });

    const foundIds = existing.map(row => String(row.id));
    const foundSet = new Set(foundIds);

    const missingIds = uniqueIds.filter(id => !foundSet.has(id));

    // Hapus ID yang ditemukan.
    if (foundIds.length > 0) {
      await db.deleteRows({
        from: "wilayah",
        where: { id: foundIds }
      });
    }

    // Mengembalikan ID yang tidak ditemukan.
    return helper.createSuccsesReturn(missingIds);
  } catch (error) {
    return helper.createFailedReturn(
      error.message || "Gagal menghapus wilayah"
    );
  }
}
