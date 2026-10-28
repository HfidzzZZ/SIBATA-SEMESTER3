import * as express from "express";
import * as api from "../../api/api.js";
import * as commondata from "../../common_data.js";
/**
* @param {express.Request} req 
* @param {express.Response} res
*/
 async function get(req,res){
  const pageInd=req.query.page;
  const pageSize=req.query.size;
  const searchKey=req.query.search;
  const result=[];
  if(commondata.dbstatus==null){
    res.status(503).json({
      status:"db isnt initialize yet",
      data:[]
    })
  }else
  if(commondata.dbstatus.results==false){
    res.status(503).json({
      status:"db isnt availabel",
      data:[]
    })
  }else{
    //result=api.dataSawah.getDataSawah({ind:pageInd,offset:pageSize});
  }
  
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
async function post(req,res){
  const data=req.body;
  if(!isArrayOfObject(data)){
    res.status(400).json({
      status:"bad format"
    });
    return;
  }
  
  const pconflictIDs=[];//unimplemented
  if(commondata.dbstatus==null){
    res.status(503).json({
      status:"db isnt initialize yet",
      data:[]
    })
  }else if(commondata.dbstatus.results==false){
    res.status(503).json({
      status:"db isnt availabel",
      data:[]
    })
  }else{
    
   pconflictIDs= api.dataSawah.addDataSawah(data);
  }
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
async function put(req,res){
  const data=req.body;
  if(!isArrayOfString(data)){
    res.status(400).json({
      status:"bad format"
    });
    return;
  }
  const pMissingIDs=[];//unimplemented
  if(commondata.dbstatus==null){
    res.status(503).json({
      status:"db isnt initialize yet",
      data:[]
    })
  }else
  if(commondata.dbstatus.results==false){
    res.status(503).json({
      status:"db isnt availabel",
      data:[]
    })
  }else{
   pMissingIDs= api.dataSawah.updateDataSawah(data);
  }
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
 async function del(req,res){
  const data=req.body;
  if(!isArrayOfObject(data)){
    res.status(400).json({
      status:"bad format"
    });
    return;
  }
  const pMissingIDs=[];//unimplemented
  if(commondata.dbstatus==null){
    res.status(503).json({
      status:"db isnt initialize yet",
      data:[]
    })
  }else
  if(commondata.dbstatus.results==false){
    res.status(503).json({
      status:"db isnt availabel",
      data:[]
    })
  }else{
   pMissingIDs= await api.dataSawah.deleteDataSawah(data);
  }
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
const router = express.Router();
router.get("/",get);
router.post("/",post);
router.put("/",put);
router.delete("/",del);
export {router};