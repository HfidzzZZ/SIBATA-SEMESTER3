import * as db from "../database/db";
export * as wilayah from "./internal/wilayah_api";
export * as dataSawah from "./internal/data_sawah_api";
export * as infrastruktur from "./internal/infrastruktur_api";
export * as kandidatLokasi from "./internal/kandidat_lokasi_api";
export * as statudLahan from "./internal/status_lahan_api";
import * as commondata from "../common_data"
//param bebas di ubah sesuai kebutuhan
export async function init(){
  commondata.dbstatus=await db.init();
  //initial table if it isnt been made
}
export function joinAll(){
  //return alldata joined
}


