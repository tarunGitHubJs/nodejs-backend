import { asyncHandler } from "../utils/asyncHandler.js"

const registerUser = asyncHandler((req,res,next)=>{
    res.status(201).json({message:"success"})
})
export {registerUser}