// require('dotenv').config({path:"./env"})
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();

// ;(async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.log("Error while connecting to the app: ",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is running on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log("ERROR: ",error)
//     }
// })()
dotenv.config({
  path: "./env",
});
connectDB()
  .then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is running on PORT: ${process.env.PORT}`);
      })
  })
  .catch((err) => {
    console.log("App is not connecetd: ", err);
  });
