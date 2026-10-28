import express from "express";
import * as api from "../api/api";
export * as data_sawah from "./internal//data_sawah"
//import db later
function isArrayOfObject(data) {
    return Array.isArray(data) &&
        data.every(item =>
            item !== null &&
            typeof item === "object" &&
            !Array.isArray(item)
        );
}
/**
 * @param {unknown} data
 * @returns {data is string[]}
 */
function isArrayOfString(data) {
  return Array.isArray(data) &&
    data.every(item => typeof item === "string");
}
/**
* @param {express.Request} req 
* @param {express.Response} res
*/
export async function get(req,res){
  const pageInd=req.query.page;
  const pageSize=req.query.size;
  const searchKey=req.query.search;
  const result=[{
    id:"12",
    some:"arum"
  }]//unimplemented
  if(result.length>0){
    res.status(200).json({
      status:"ok",
      data:result
    })
  }else{
    res.status(404).json({
      status:"not found",
      data:[]
    })
  }
  
}
/**
* @param {express.Request} req 
* @param {express.Response} res
* menaruh data baru
*/
export async function post(req,res){
  const data=req.body;
  if(!isArrayOfObject(data)){
    res.status(400).json({
      status:"bad format"
    });
    return;
  }
  const pconflictIDs=[];//unimplemented
  if(pconflictIDs.length==0){
    res.status(200).json({
      status:"ok"
    })
  }else{
    res.status(409).json({
      status:"conflict",
      conflictIDs:pconflictIDs
    })
  }
}
export async function put(req,res){
  const data=req.body;
  if(!isArrayOfString(data)){
    res.status(400).json({
      status:"bad format"
    });
    return;
  }
  const pMissingIDs=[];//unimplemented
  if(pMissingIDs.length==0){
    res.status(200).json({
      status:"ok"
    })
  }else{
    res.status(404).json({
      status:"not found",
      missingIDs:pMissingIDs
    })
  }
}
export async function del(req,res){
  const data=req.body;
  if(!isArrayOfObject(data)){
    res.status(400).json({
      status:"bad format"
    });
    return;
  }
  const pMissingIDs=[];//unimplemented
  if(pMissingIDs.length==0){
    res.status(200).json({
      status:"ok"
    })
  }else{
    res.status(404).json({
      status:"not found",
      missingIDs:pMissingIDs
    })
  }
}