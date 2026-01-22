
export function controllErr(msg,status){

    const err = new Error(msg); 
    err.status = status; 
    throw err; 

}