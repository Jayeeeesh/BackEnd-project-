import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
       console.log(`/n mongoDB connection !! DB HOST: ${connectionInstance.connection.host}`)
       //rsconsole.log(connectionInstance)
    } catch (error) {
        console.log("mongoose connection error", error )
        process.exit(1)
    }
}

export default connectDB