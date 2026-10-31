/**
*/
/**
 * @typedef {Object} DBValue
 * @property {string} Status
 * @property {boolean} is_err
 * @property {Object[]} data
 */
/**
 * @returns {DBValue}
 */
export function createSuccsesReturn(data){
    return {Status:"ok",is_err:false,data:data}
}
/**
 * @returns {DBValue}
 */
export function createFailedReturn(status,data=[]){
    return {Status:status,is_err:true,data:data}
}
