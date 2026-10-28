import * as express from "express";
import * as api from "../../api/api.js";
import * as commondata from "../../common_data.js";
import * as db from "../../database/db.js";
import * as middleware from "../../middleware/middleware.js"
const router = express.Router();

/**
 * Memastikan database siap digunakan.
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

  if (commondata.dbstatus.valid === false || commondata.dbstatus.success === false) {
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
 * @param {unknown} data
 * @returns {boolean}
 */
function isDataObject(data) {
  return data !== null && typeof data === "object" && !Array.isArray(data);
}

/**
 * Memastikan nilai merupakan array string.
 * @param {unknown} data
 * @returns {data is string[]}
 */
function isArrayOfString(data) {
  return Array.isArray(data) && data.every((item) => typeof item === "string");
}

/**
 * GET /api/kandidat_lokasi
 * Mengambil daftar kandidat lokasi data center dengan pagination dan pencarian
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function get(req, res) {
  if (!checkDatabase(res)) return;

  const rawPage = req.query.page;
  const rawSize = req.query.size;
  const rawSearch = req.query.search;

  const pageInd = rawPage === undefined ? 0 : Number(rawPage);
  const pageSize = rawSize === undefined ? null : Number(rawSize);

  if (
    !Number.isSafeInteger(pageInd) ||
    pageInd < 0 ||
    (pageSize !== null && (!Number.isSafeInteger(pageSize) || pageSize < 0))
  ) {
    res.status(400).json({
      Status: "bad pagination",
      is_err: true,
      data: []
    });
    return;
  }

  try {
    const search =
      typeof rawSearch === "string" && rawSearch.trim() !== ""
        ? {
            columns: ["id", "nama_blok", "status_penilaian"],
            keyword: rawSearch.trim()
          }
        : undefined;

    const selectOptions = {
      from: "kandidat_lokasi",
      search,
      orderBy: [{ column: "id", direction: "ASC" }]
    };

    if (pageSize !== null) {
      selectOptions.limit = pageSize;
      selectOptions.offset = pageInd * pageSize;
    }

    const rows = await db.select(selectOptions);

    if (rows.length === 0) {
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
      data: rows
    });
  } catch (err) {
    res.status(500).json({
      Status: err.message || "Gagal mengambil data kandidat lokasi",
      is_err: true,
      data: []
    });
  }
}

/**
 * POST /api/kandidat_lokasi
 * Menambah kandidat lokasi baru
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function post(req, res) {
  if (!isDataObject(req.body) && !Array.isArray(req.body)) {
    res.status(400).json({
      Status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const conflictIDs = [];

    for (const item of items) {
      if (item.id) {
        const existing = await db.select({
          from: "kandidat_lokasi",
          where: { id: item.id }
        });
        if (existing.length > 0) {
          conflictIDs.push(item.id);
        }
      }
    }

    if (conflictIDs.length > 0) {
      res.status(409).json({
        Status: "conflict",
        is_err: false,
        data: conflictIDs
      });
      return;
    }

    await db.insert("kandidat_lokasi", items);

    res.status(201).json({
      Status: "ok",
      is_err: false,
      data: []
    });
  } catch (err) {
    res.status(500).json({
      Status: err.message || "Gagal menambah data kandidat lokasi",
      is_err: true,
      data: []
    });
  }
}

/**
 * PUT /api/kandidat_lokasi
 * Memperbarui data kandidat lokasi
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function put(req, res) {
  if (!isDataObject(req.body) && !Array.isArray(req.body)) {
    res.status(400).json({
      Status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const missingIDs = [];

    for (const item of items) {
      if (!item.id) {
        res.status(400).json({
          Status: "missing id in payload",
          is_err: true,
          data: []
        });
        return;
      }

      const existing = await db.select({
        from: "kandidat_lokasi",
        where: { id: item.id }
      });

      if (existing.length === 0) {
        missingIDs.push(item.id);
      }
    }

    if (missingIDs.length > 0) {
      res.status(404).json({
        Status: "not found",
        is_err: false,
        data: missingIDs
      });
      return;
    }

    for (const item of items) {
      const { id, ...dataBaru } = item;
      await db.updateRows({
        table: "kandidat_lokasi",
        set: dataBaru,
        where: { id }
      });
    }

    res.status(200).json({
      Status: "ok",
      is_err: false,
      data: []
    });
  } catch (err) {
    res.status(500).json({
      Status: err.message || "Gagal memperbarui data kandidat lokasi",
      is_err: true,
      data: []
    });
  }
}

/**
 * DELETE /api/kandidat_lokasi
 * Menghapus data kandidat lokasi berdasarkan ID
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function del(req, res) {
  let ids = [];
  if (isArrayOfString(req.body)) {
    ids = req.body;
  } else if (Array.isArray(req.body)) {
    ids = req.body
      .map((item) => (typeof item === "object" && item !== null ? item.id : item))
      .filter(Boolean);
  } else {
    res.status(400).json({
      Status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  try {
    const missingIDs = [];
    for (const id of ids) {
      const existing = await db.select({
        from: "kandidat_lokasi",
        where: { id }
      });
      if (existing.length === 0) {
        missingIDs.push(id);
      }
    }

    if (missingIDs.length > 0) {
      res.status(404).json({
        Status: "not found",
        is_err: false,
        data: missingIDs
      });
      return;
    }

    for (const id of ids) {
      await db.deleteRows({
        from: "kandidat_lokasi",
        where: { id }
      });
    }

    res.status(200).json({
      Status: "ok",
      is_err: false,
      data: []
    });
  } catch (err) {
    res.status(500).json({
      Status: err.message || "Gagal menghapus data kandidat lokasi",
      is_err: true,
      data: []
    });
  }
}

router.get("/", get);
router.post("/",middleware.extendSesion, post);
router.put("/",middleware.extendSesion, put);
router.delete("/",middleware.extendSesion, del);

export { router };
