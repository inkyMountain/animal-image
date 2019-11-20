import axios from "axios";
import * as fs from "fs";

type SearchParams = {
  mime_types?: string;
  limit?: number;
  page?: number;
  format?: "json" | "src";
  breed_id?: string;
  order?: "RANDOM" | "DESC" | "ASC";
  type?: "small" | "med" | "full";
};

type Cat = {
  id: string;
  url: string;
  width: string;
  height: string;
  categories: [Object];
  breeds: [Object];
};

type Cats = [Cat];

const suffixTransform = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif"
};

axios.defaults.headers["x-api-key"] = "90763e29-c851-4066-9dc7-97d223cf91f8";
axios.defaults.timeout = 30000;

let page = 550;
let imageDownloadErrorNumber = 0;
let urlGettingErrorNumber = 0;

async function writeImage(path: string, data: Buffer) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      err && reject(err);
      resolve();
    });
  });
}

async function entry() {
  const cats: Cats = await getCats();
  cats.forEach(async cat => {
    const response: any = await axios
      .get(cat.url, {
        responseType: "arraybuffer"
      })
      .catch(error => {
        console.log("获取链接报错总数: " + urlGettingErrorNumber++);
      });
    const headers = response.headers;
    const data = response.data;
    console.log("suffix: ", headers["content-type"]);
    const suffix = suffixTransform[headers["content-type"]];
    console.log(`fetching image ${cat.id}.${suffix}`);
    const fileName = `${cat.id}.${suffix}`;
    await writeImage(`./download/${fileName}`, data);
    console.log(`write image ${fileName} success`);
  });
}

const id = setInterval(() => {
  entry();
}, 20000);

async function getCats() {
  const config = {
    params: {
      page: page++,
      limit: 10,
      type: "full",
      // mime_types: "jpg,png",
      order: "DESC"
    } as SearchParams
  };
  const response = await axios
    .get("https://api.thecatapi.com/v1/images/search", config)
    .catch(error => {
      console.log("获取图片报错总数: " + imageDownloadErrorNumber++);
    });
  const data = (response as any).data;
  if (!data || data.length === 0) {
    console.log("图片全部下载完成~");
    console.log("获取图片报错总数: " + imageDownloadErrorNumber++);
    console.log("获取链接报错总数: " + urlGettingErrorNumber++);
    process.exit(0);
  }
  return data;
}
