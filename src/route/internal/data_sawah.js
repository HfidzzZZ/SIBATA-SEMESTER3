import * as express from "express";
import * as api from "../../api/api.js";
import * as commondata from "../../common_data.js";
function isArrayOfObject(data) {
  return (
    Array.isArray(data) &&
    data.every(
      (item) => item !== null && typeof item === "object" && !Array.isArray(item)
    )
  );
}

function isArrayOfString(data) {
  return Array.isArray(data) && data.every((item) => typeof item === "string");
}

function checkDatabase(res) {
  if (commondata.dbstatus == null) {
    res.status(503).json({
      status: "db isnt initialize yet",
      is_err: true,
      data: []
    });
    return false;
  }

  if (commondata.dbstatus.valid === false || commondata.dbstatus.success === false) {
    res.status(503).json({
      status: "db isnt availabel",
      is_err: true,
      data: []
    });
    return false;
  }

  return true;
}

/**
* @param {express.Request} req 
* @param {express.Response} res
*/
async function get(req, res) {
  const pageInd = req.query.page;
  const pageSize = req.query.size;
  const searchKey = req.query.search;
  let result = [];
  
  if (!checkDatabase(res)) return;

  if (api.dataSawah && typeof api.dataSawah.getDataSawah === "function") {
    const resDb = await api.dataSawah.getDataSawah({ ind: pageInd, offset: pageSize });
    if (resDb && Array.isArray(resDb.data)) {
      result = resDb.data;
    }
  }
  
  if (result.length > 0) {
    res.status(200).json({
      status: "ok",
      is_err: false,
      data: result
    });
  } else {
    res.status(404).json({
      status: "not found",
      is_err: false,
      data: []
    });
  }
}

/**
* @param {express.Request} req 
* @param {express.Response} res
* menaruh data baru
*/
async function post(req, res) {
  const data = req.body;
  if (!isArrayOfObject(data)) {
    res.status(400).json({
      status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }
  
  if (!checkDatabase(res)) return;

  let pconflictIDs = [];
  if (api.dataSawah && typeof api.dataSawah.addDataSawah === "function") {
    const resDb = await api.dataSawah.addDataSawah(data);
    if (resDb && Array.isArray(resDb.data)) {
      pconflictIDs = resDb.data;
    }
  }

  if (pconflictIDs.length === 0) {
    res.status(200).json({
      status: "ok",
      is_err: false,
      data: []
    });
  } else {
    res.status(409).json({
      status: "conflict",
      is_err: false,
      conflictIDs: pconflictIDs
    });
  }
}

async function put(req, res) {
  const data = req.body;
  if (!isArrayOfString(data)) {
    res.status(400).json({
      status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  let pMissingIDs = [];
  if (api.dataSawah && typeof api.dataSawah.updateDataSawah === "function") {
    const resDb = await api.dataSawah.updateDataSawah(data);
    if (resDb && Array.isArray(resDb.data)) {
      pMissingIDs = resDb.data;
    }
  }

  if (pMissingIDs.length === 0) {
    res.status(200).json({
      status: "ok",
      is_err: false,
      data: []
    });
  } else {
    res.status(404).json({
      status: "not found",
      is_err: false,
      missingIDs: pMissingIDs
    });
  }
}

async function del(req, res) {
  const data = req.body;
  if (!isArrayOfObject(data)) {
    res.status(400).json({
      status: "bad format",
      is_err: true,
      data: []
    });
    return;
  }

  if (!checkDatabase(res)) return;

  let pMissingIDs = [];
  if (api.dataSawah && typeof api.dataSawah.deleteDataSawah === "function") {
    const resDb = await api.dataSawah.deleteDataSawah(data);
    if (resDb && Array.isArray(resDb.data)) {
      pMissingIDs = resDb.data;
    }
  }

  if (pMissingIDs.length === 0) {
    res.status(200).json({
      status: "ok",
      is_err: false,
      data: []
    });
  } else {
    res.status(404).json({
      status: "not found",
      is_err: false,
      missingIDs: pMissingIDs
    });
  }
}

const router = express.Router();
router.get("/", get);
router.post("/", post);
router.put("/", put);
router.delete("/", del);
export { router };