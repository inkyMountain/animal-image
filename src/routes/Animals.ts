import { logger } from "@shared";
import { Request, Response, Router, Express } from "express";
import { BAD_REQUEST, CREATED, OK } from "http-status-codes";
import { readDir } from "../utils/fileUtils";
import path from "path";

const router = Router();
let fullCats: string[] = [];
let fullDogs: string[] = [];
const remains: any = {};
const imagePath = path.join(__dirname, "../public/images/");
readDir(imagePath + "cat").then(files => {
  fullCats = files as string[];
});
readDir(imagePath + "dog").then(files => {
  fullDogs = files as string[];
});

router.get("/", (req: Request, res: Response) => {
  const requiredQueries = ["limit", "type"];
  const missedQueries = requiredQueries.filter(key => !req.query[key]);
  if (missedQueries.length > 0) {
    return res.status(BAD_REQUEST).json({
      message: `These queries are required: ${missedQueries}`
    });
  }

  const { limit, type } = req.query;
  const id = req.query.id || Math.random();
  const { host } = req.headers;
  remains[id] = remains[id] || { remainCats: [], remainDogs: [] };

  if (
    req.query.first === true ||
    (remains[id].remainCats.length === 0 && remains[id].remainDogs.length === 0)
  ) {
    req.query.type === "cat" && (remains[id].remainCats = [...fullCats]);
    req.query.type === "dog" && (remains[id].remainDogs = [...fullDogs]);
  }
  const remainAnimal =
    req.query.type === "cat" ? remains[id].remainCats : remains[id].remainDogs;
  const urls = [];
  console.log("筛选前", remainAnimal.length);
  while (urls.length < limit && remainAnimal.length > 0) {
    const index = +(remainAnimal.length * Math.random()).toFixed(0);
    urls.push(`//${host}/public/images/${type}/${remainAnimal[index]}`);
    remainAnimal.splice(index, 1);
  }
  console.log("筛选后", remainAnimal.length);
  return res.status(OK).json({
    id: id,
    data: urls
  });
});

export default router;
