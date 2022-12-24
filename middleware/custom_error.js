class CustomError extends Error{
  constructor(...arg){
    super(...arg)
    this.name = "CustomError";
    Error.captureStackTrace(this,CustomError);
  }
}

module.exports = CustomError;