
import * as express from "express";
import * as api from "../../api/api.js";
import * as commondata from "../../common_data.js";

const router = express.Router();

/**
 * @typedef {import("../../api/internal/common_type.js").DBValue} DBValue
 */

/**
 * Memastikan database siap digunakan.
 *
 * @param {express.Response} res
 * @returns {boolean}
 */
function checkDatabase(res) {
  if (commondata.dbstatus == null) {
    res.status(503).json({
      Status: "db isnt initialize yet",
      is_err: true,
      data: []
    });
    return false;
  }

  if (commondata.dbstatus.valid === false) {
    res.status(503).json({
      Status: "db isnt availabel",
      is_err: true,
      data: []
    });
    return false;
  }

  return true;
}

/**
 * Memastikan nilai merupakan objek data tunggal.
 *
 * @param {unknown} data
 * @returns {boolean}
 */
function isDataObject(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data)
  );
}

/**
 * Memastikan nilai merupakan array string.
 *
 * @param {unknown} data
 * @returns {data is string[]}
 */
function isArrayOfString(data) {
  return (
    Array.isArray(data) &&
    data.every(item => typeof item === "string")
  );
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function get(req, res) {
  if (!checkDatabase(res)) return;

  const rawPage = req.query.page;
  const rawSize = req.query.size;
  const rawSearch = req.query.search;

  // Default halaman adalah 0.
  const pageInd =
    rawPage === undefined ? 0 : Number(rawPage);

  // Size yang tidak dikirim berarti mengambil seluruh data.
  const pageSize =
    rawSize === undefined ? null : Number(rawSize);

  if (
    !Number.isSafeInteger(pageInd) ||
    pageInd < 0 ||
    (
      pageSize !== null &&
      (!Number.isSafeInteger(pageSize) || pageSize < 0)
    )
  ) {
    res.status(400).json({
      Status: "bad pagination",
      is_err: true,
      data: []
    });
    return;
  }

  // Sesuaikan nama kolom pencarian dengan tabel wilayah.
  const search =
    typeof rawSearch === "string" && rawSearch.trim() !== ""
      ? {
          columns: ["id", "nama"],
          keyword: rawSearch.trim()
        }
      : undefined;

  /** @type {DBValue} */
  const result = await api.wilayah.getWilayah({
    ind: pageInd,
    offset: pageSize,
    search
  });

  if (result.is_err) {
    res.status(500).json(result);
    return;
  }

  if (!Array.isArray(result.data)) {
    res.status(500).json({
      Status: "invalid API response",
      is_err: true,
      data: []
    });
    return;
  }

  if (result.data.length === 0) {
    res.status(404).json({
      Status: "not found",
      is_err: false,
      data: []
    });
    return;
  }

  res.status(200).json({
    Status: "ok",
    is_err: false,
    data: result.data
  });
}

/**
 * Menambahkan wilayah baru.
 *
 * Body: { id?: string|null, ... }
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function post(req, res) {
  if (!isDataObject(req.body)) {
    res.status(400).json({
      Status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  /** @type {DBValue} */
  const result = await api.wilayah.postWilayah(req.body);

  if (result.is_err) {
    res.status(500).json(result);
    return;
  }

  // data berisi ID yang konflik.
  if (result.data.length > 0) {
    res.status(409).json({
      Status: "conflict",
      is_err: false,
      data: result.data
    });
    return;
  }

  res.status(201).json({
    Status: "ok",
    is_err: false,
    data: []
  });
}

/**
 * Memperbarui wilayah.
 *
 * Body: { id: string, ... }
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function put(req, res) {
  if (!isDataObject(req.body)) {
    res.status(400).json({
      Status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  /** @type {DBValue} */
  const result = await api.wilayah.putWilayah(req.body);

  if (result.is_err) {
    res.status(500).json(result);
    return;
  }

  // data berisi ID yang tidak ditemukan.
  if (result.data.length > 0) {
    res.status(404).json({
      Status: "not found",
      is_err: false,
      data: result.data
    });
    return;
  }

  res.status(200).json({
    Status: "ok",
    is_err: false,
    data: []
  });
}

/**
 * Menghapus wilayah.
 *
 * Body: ["id1", "id2", ...]
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function del(req, res) {
  if (!isArrayOfString(req.body)) {
    res.status(400).json({
      Status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  /** @type {DBValue} */
  const result = await api.wilayah.delWilayah(req.body);

  if (result.is_err) {
    res.status(500).json(result);
    return;
  }

  // data berisi ID yang tidak ditemukan.
  if (result.data.length > 0) {
    res.status(404).json({
      Status: "not found",
      is_err: false,
      data: result.data
    });
    return;
  }

  res.status(200).json({
    Status: "ok",
    is_err: false,
    data: []
  });
}

router.get("/", get);
router.post("/", post);
router.put("/", put);
router.delete("/", del);

export { router };
