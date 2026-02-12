import { asyncHandler } from "../utils/asyncHandler.js";
import JWT  from "jsonwebtoken";
import { User } from "../models/user.models.js";


 export const varifyJWt = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("authorization")?.replace("Bearer ", "")
    
        if (!token) {
           throw new ApiError(401, "Unauthorized: No token provided")
        }
    
       const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET )
    
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
       if (!user) {
        // todo: dissuss about frontend 
        throw new ApiError(401, "Invalid access token")
       }
       req.user = user;
       next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized: Invalid token")
        
    }
 })