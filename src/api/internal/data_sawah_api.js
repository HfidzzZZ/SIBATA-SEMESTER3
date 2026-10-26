import * as db from "../../database/db.js";

/**
 * 1. Mengambil data sawah (Get / Read) dengan Pagination
 * @param {Object} [page]
 * @param {Number} [page.ind] - Halaman keberapa (default 1)
 * @param {Number} [page.offset] - Jumlah baris per halaman (default 10)
 */
export async function getDataSawah(page = {}) {
    const limit = page.offset || 10;
    const ind = page.ind || 1;
    const offset = (ind - 1) * limit;

    return await db.select({
        from: "data_sawah",
        limit: limit,
        offset: offset
    });
}

/**
 * 2. Menambah data sawah baru (Create / Insert)
 * @param {Object} data - { id_wilayah, tahun, luas_sawah_ha }
 */
export async function addDataSawah(data) {
    return await db.insert("data_sawah", data);
}

/**
 * 3. Mengubah/Mengedit data sawah (Update)
 * @param {number} idSawah
 * @param {Object} dataBaru
 */
export async function updateDataSawah(idSawah, dataBaru) {
    return await db.updateRows({
        table: "data_sawah",
        set: dataBaru,
        where: { id_sawah: idSawah }
    });
}

/**
 * 4. Menghapus data sawah (Delete)
 * @param {number} idSawah
 */
export async function deleteDataSawah(idSawah) {
    return await db.deleteRows({
        from: "data_sawah",
        where: { id_sawah: idSawah }
    });
}