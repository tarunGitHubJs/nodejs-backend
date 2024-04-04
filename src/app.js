import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// const bodyParser = require("body-parser")
import bodyParser from "body-parser";
const app = express();
var allowlist = [
  // "http://localhost",
  "http://localhost:8100",
  // "http://localhost:4400",
  // "192.168.48.32:3000",
];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false, credentials: true };
  }
  callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate))
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );
// app.options('*', cors())
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// user routes
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js"
app.use("/app/user/v1", userRouter)
app.use("/app/category/v1",categoryRouter)

export { app };
