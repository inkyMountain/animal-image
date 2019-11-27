import cookieParser from "cookie-parser";
import express from "express";
import logger from "morgan";
import path from "path";
import BaseRouter from "./routes";
import cors, { CorsOptions } from "cors";

const app = express();

const whiteList = [
  "http://localhost",
  "http://172.31.11.117",
  "chenyitao.cn",
  "http://cat.chenyitao.cn",
  "http://118.25.185.172"
];
const corsOptions: CorsOptions = {
  origin: (origin: any, callback: Function) => {
    const isInWhiteList =
      !origin || whiteList.some(url => origin.startsWith(url) || origin.endsWith(url));
    callback(null, isInWhiteList);
  },
  optionsSuccessStatus: 200
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", BaseRouter);

const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

export default app;
