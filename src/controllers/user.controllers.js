import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResposn } from "../utils/ApiResposn.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

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

export { registerUser }