import express from "express";
import { collectDeliveryRecord } from "../services/delivery";

const router = express.Router();
export default router;
router.post("/", async function (req, res, next) {
  await collectDeliveryRecord(req, res);
});
