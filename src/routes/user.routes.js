import { Router } from "express";
import { logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser } from "../controllers/user.controllers.js";
import { varifyJWt } from "../middlewares/auth.middlewares.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post( loginUser )

// secured routes
router.route("/logout").post( varifyJWt, logoutUser )
router.route("/refresh").post( refreshAccessToken )

export default router