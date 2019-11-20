import { Router } from "express";
import UserRouter from "./Users";
import AnimalRouter from "./Animals";

const router = Router();
router.use("/users", UserRouter);
router.use("/animals", AnimalRouter);

export default router;
