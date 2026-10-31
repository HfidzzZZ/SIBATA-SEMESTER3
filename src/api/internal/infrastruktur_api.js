import * as db from "../../database/db.js";

/**
 * 1. Mengambil data infrastruktur (Get / Read) dengan Pagination
 * @param {Object} [page]
 * @param {Number} [page.ind] - Halaman keberapa (default 1)
 * @param {Number} [page.offset] - Jumlah baris per halaman (default 10)
 */
export async function getDataInfrastruktur(page = {}) {
    const limit = page.offset || 10;
    const ind = page.ind || 1;
    const offset = (ind - 1) * limit;

    return await db.select({
        from: "infrastruktur",
        limit: limit,
        offset: offset
    });
}

/**
 * 2. Menambah data infrastruktur baru (Create / Insert)
 * @param {Object} data 
 */
export async function addDataInfrastruktur(data) {
    return await db.insert("infrastruktur", data);
}

/**
 * 3. Mengubah/Mengedit data infrastruktur (Update)
 * @param {number} idInfrastruktur
 * @param {Object} dataBaru
 */
export async function updateDataInfrastruktur(idInfrastruktur, dataBaru) {
    return await db.updateRows({
        table: "infrastruktur",
        set: dataBaru,
        where: { id_infrastruktur: idInfrastruktur }
    });
}

/**
 * 4. Menghapus data infrastruktur (Delete)
 * @param {number} idInfrastruktur
 */
export async function deleteDataInfrastruktur(idInfrastruktur) {
    return await db.deleteRows({
        from: "infrastruktur",
        where: { idInfrastruktur: idInfrastruktur }
    });
}