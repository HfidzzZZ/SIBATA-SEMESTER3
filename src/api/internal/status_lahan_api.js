import * as db from "../../database/db";

/**
 * 1. Mengambil data status lahan (Get / Read) dengan Pagination
 * @param {Object} [page]
 * @param {Number} [page.ind] - Halaman keberapa (default 1)
 * @param {Number} [page.offset] - Jumlah baris per halaman (default 10)
 */
export async function getStatusLahan(page = {}) {
    const limit = page.offset || 10;
    const ind = page.ind || 1;
    const offset = (ind - 1) * limit;

    return await db.select({
        from: "status_lahan",
        limit: limit,
        offset: offset
    });
}

/**
 * 2. Menambah data status lahan baru (Create / Insert)
 * @param {Object} data - { id_wilayah, luas_lsd_ha, tahun_data }
 */
export async function addStatusLahan(data) {
    return await db.insert("status_lahan", data);
}

/**
 * 3. Mengubah/Mengedit data status lahan (Update)
 * @param {number} idStatus
 * @param {Object} dataBaru
 */
export async function updateStatusLahan(idStatus, dataBaru) {
    return await db.updateRows({
        table: "status_lahan",
        set: dataBaru,
        where: { id_status: idStatus }
    });
}

/**
 * 4. Menghapus data status lahan (Delete)
 * @param {number} idStatus
 */
export async function deleteStatusLahan(idStatus) {
    return await db.deleteRows({
        from: "status_lahan",
        where: { id_status: idStatus }
    });
}