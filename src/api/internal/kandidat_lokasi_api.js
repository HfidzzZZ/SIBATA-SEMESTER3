import * as db from "../../database/db";

/**
 * 1. Mengambil data Kandidat Lokasi (Get / Read) dengan Pagination
 * @param {Object} [page]
 * @param {Number} [page.ind] - Halaman keberapa (default 1)
 * @param {Number} [page.offset] - Jumlah baris per halaman (default 10)
 */
export async function getKandidatLokasi(page = {}) {
    const limit = page.offset || 10;
    const ind = page.ind || 1;
    const offset = (ind - 1) * limit;

    return await db.select({
        from: "kandidat_lokasi",
        limit: limit,
        offset: offset
    });
}

/**
 * 2. Menambah data kandidat lokasi baru (Create / Insert)
 * @param {Object} data 
 */
export async function addKandidatLokasi(data) {
    return await db.insert("kandidat_lokasi", data);
}

/**
 * 3. Mengubah/Mengedit data kandidat lokasi (Update)
 * @param {number} idKandidat
 * @param {Object} dataBaru
 */
export async function updateKandidatLokasi(idKandidat, dataBaru) {
    return await db.updateRows({
        table: "kandidat_lokasi",
        set: dataBaru,
        where: { idKandidat: idKandidat }
    });
}

/**
 * 4. Menghapus data kandidat lokasi (Delete)
 * @param {number} idKandidat
 *  */
export async function deleteKandidatLokasi(idKandidat) {
    return await db.deleteRows({
        from: "kandidat_lokasi",
        where: { idKandidat: idKandidat }
    });
}