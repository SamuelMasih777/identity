import express from "express";
import identifyController from "../controllers/identifyController";
import { Request, Response } from "express";
const router = express();

router.post("/identify", async function (req: Request, res: Response) {
  const data = await identifyController.identifyContact(req.body);
  res.status(data.status).send(data);
});

export default router;
