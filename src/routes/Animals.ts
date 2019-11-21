import { logger } from "@shared";
import { Request, Response, Router, Express } from "express";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import { readDir } from "../utils/fileUtils";
import path from "path";

const router = Router();
const source: { cat: string[]; dog: string[] } = { cat: [], dog: [] };
const remains: any = {};
const imagePath = path.join(__dirname, "../public/images/");
readDir(imagePath + "cat").then(files => (source.cat = files as string[]));
readDir(imagePath + "dog").then(files => (source.dog = files as string[]));

/**
 * 用户首次浏览页面时，生成id和对应的推荐池。
 * 后续请求都从id对应的推荐池中取，直到推荐池空为止。
 */
router.get("/", (req: Request, res: Response) => {
  // 处理参数不足
  const requiredQueries = ["limit", "type"];
  const missedQueries = requiredQueries.filter(key => !req.query[key]);
  if (missedQueries.length > 0) {
    return res.status(BAD_REQUEST).json({
      message: `These queries are required: ${missedQueries}`
    });
  }
  //初始化推荐池
  const { limit, type } = req.query;
  const isFirstRequest = !req.query.id;
  const id = req.query.id || Math.random();
  remains[id] = remains[id] || { cat: [], dog: [] };
  if (isFirstRequest) {
    remains[id].cat = [...source.cat];
    remains[id].dog = [...source.dog];
  }
  // 产生随机推荐
  const remainAnimal = remains[id][type];
  const recommends = [];
  let isRemainEmpty = false;
  // console.log("筛选前", "狗的长度", remains[id].dog.length);
  // console.log("筛选前", "猫的长度", remains[id].cat.length);
  while (recommends.length < limit && remainAnimal.length > 0) {
    const index = +(remainAnimal.length * Math.random()).toFixed(0);
    const recommend = `//${process.env.HOST}:${process.env.PORT}/images/${type}/${remainAnimal[index]}`;
    recommends.push(recommend);
    remainAnimal.splice(index, 1);
    isRemainEmpty = remainAnimal.length === 0;
  }
  // console.log("筛选前", "狗的长度", remains[id].dog.length);
  // console.log("筛选前", "猫的长度", remains[id].cat.length, "\n");
  return res.status(OK).json({
    id: id,
    urls: recommends,
    empty: isRemainEmpty
  });
});

export default router;
