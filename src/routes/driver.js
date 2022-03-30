import express from "express";
import { getDriverDeliveries } from "../services/driver";

const router = express.Router();
export default router;
router.get("/:driverId/delivery", getDriverDeliveries);
router.patch("/:driverId", function (req, res, next) {});
router.get("/:driverId", function (req, res, next) {});
