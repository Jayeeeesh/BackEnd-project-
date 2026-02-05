import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userScheme = new Schema(
    {
        username: {
            type: String,
            required : true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            require : true,
            uniqued: true,
            Lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            require : true,
            trim: true,
            index: true
        },
        avtar: {
            type: String, //cloudinary url
            required: true
        },
        coverImage: {
            type: String, //cloudinary url
        },
        watchHistroy: [
            {
                type: Schema.Types.ObjectId,
                ref: "video"
            }
        ],
        password: {
            type: String,
            require: [true, 'password is required']
        },
        refreshToken: {
            type: String
        }  
    },
    {
        timestamps: true
    }
)
userScheme.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcr.hash(this.password, 10)
    next()
})

userScheme.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password)
}

userScheme.method.ganrateAccessToken = function(){
   return  jwt.sign(
        {
            _id: this._id,
            emaill: this.email,
            username: this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userScheme.method.ganrateRefreshToken = function(){
    return  jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User  = mongoose.model("User", userScheme)
