import * as db from "../database/db.js";
export * as wilayah from "./internal/wilayah_api.js";
export * as dataSawah from "./internal/data_sawah_api.js";
export * as infrastruktur from "./internal/infrastruktur_api.js";
export * as kandidatLokasi from "./internal/kandidat_lokasi_api.js";
export * as statusLahan from "./internal/status_lahan_api.js";
export * as statudLahan from "./internal/status_lahan_api.js";
import * as commondata from "../common_data.js";
//param bebas di ubah sesuai kebutuhan
export async function init(){
  try {
    commondata.setDbStatus(await db.init());
    console.log(JSON.stringify(commondata.dbstatus));
  } catch (err) {
    console.error("Database init error:", err.message);
  }
}
export function joinAll(){
  //return alldata joined
}


