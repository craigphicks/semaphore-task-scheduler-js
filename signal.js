class SignalError extends Error {
  constructor (index,error){
    super(`SignalError idx=${index}, `+
      `errormsg=${error.message}`); 
    this.index=index;
    this.error=error;
  }
}
function select(...args){
  this.ap=[];
  args.forEach((p,i)=>{
    this.ap.push(
      p.then((r)=>{return{index:i,value:r};})
        .catch((e)=>{return new SignalError(i,e);}));
  });
  return Promise.race(this.ap);
}
