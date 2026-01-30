class ApiError extends Error{
    constructor(
        status,
        message= "something went wrong",
        error = [],
        statck = ""
        

    ){
        super(message)
        this.statuscode = statusCode
        this.data = null,
        this.message = message,
        this.success = false,
        this.errors = errors

        if(statck){
            this.stack = statck
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export {ApiError}
