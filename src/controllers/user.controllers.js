import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResposn } from "../utils/ApiResposn.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken  = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "something went wrong while generating access and refresh token")
  }

}



const registerUser = asyncHandler(async (req, res) => {
console.log("req", req.body)
  // get user details from frontend
  // validation - not empty 
  // check if user already exists : username , email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token filed from response
  // check for user creation 
  // return response

  // get user details from frontend
  const { fullName, email, username, password } = req.body
  console.log("password: ", password);
  console.log("fullName: ", fullName);
  console.log("email: ", email);
  console.log("username: ", username);
  

  // validation - not empty 
  if ([fullName, email, username, password].some((filed) => filed?.trim() === "")) {
    throw new ApiError(400, "all fields are requierd")
  };

  // check if user already exists : username , email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  };
  console.log(existedUser)

  // check for images, check for avatar
  console.log("req.files:", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
 // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.length > 0){
     coverImageLocalPath = req.files.coverImage[0].path;

  }

  
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is requierd")
  };

  // upload them to cloudinary, avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is requierdd")
  };
  



  // create user object - create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token filed from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while register the user")
  };

  // return response

  return res.status(201).json(new ApiResposn(200, createdUser, "user ragister successfully"))





})

const loginUser = asyncHandler( async (req, res) => {
  //req.body -> data
  // username or email
  // find user in db
  // password match check
  // access token and refresh token generation
  // sent cookie

  //req.body -> data
  const {email, username, password} = req.body
  console.log("login req.body", req.body)

  // username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }
   // find user in db
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "user dosen't exists")
  }
   // password match check
   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401, "invalid password")
   }
    // access token and refresh token generation
   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

   const loggedUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
    }
   // sent cookie
    return res.status(200).
    cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResposn(200, {accessToken, user: loggedUser}, "user logged in successfully"))

})

const logoutUser = asyncHandler( async (req, res) => {
  await User.findByIdAndUpdate(req.user._id,
     {
      $set: {
        refreshToken: undefined
      }
     },
     {
      new: true
     }
    )
    const options = {
      httpOnly: true,
      secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResposn(200, null, "user logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(400, "refresh token is required")
  }

   try {
    const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET,
   )
 
   const user = await User.findById(decodedToken._id)
 
   if(!user){
     throw new ApiError(401, "invalid refresh token")
   }
   
   if (user.refreshToken !== incomingRefreshToken) {
     throw new ApiError(401, " refresh token is expired or used")
   }
 
 
   const options ={
     httpOnly: true,
     secure: true
   }
 
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(new ApiResposn(200, {accessToken, refreshToken: newRefreshToken}, "access token refreshed successfully"))
   } catch (error) {
    throw new ApiError(401, error?.message ||"invalid refresh token")
   }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }