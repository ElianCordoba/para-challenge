import {
  getAllDeliveries,
  getDriverStats,
  getDriverSummary,
  updateDriverStatus,
} from "../services/driver-service";

import { exec } from "../utils";

import { RegisterHandlerFn } from "../types";

const routes: RegisterHandlerFn = (server, _, next) => {
  server.get<{
    Querystring: { summary?: string };
    Params: { driverId: string };
  }>("/:driverId/delivery", async (req) => {
    const isSummaryRequest = req.query?.summary === "1";

    const driverId = req.params.driverId;

    if (isSummaryRequest) {
      return getDriverSummary(driverId);
    } else {
      return getAllDeliveries(driverId);
    }
  });

  server.patch<{
    Params: { driverId: string };
    Body: { is_active: boolean; timestamp: string };
  }>("/:driverId", async (req, res) => {
    const stoppedBeingActive = req.body.timestamp
      ? new Date(req.body.timestamp)
      : new Date();

    const result = updateDriverStatus(
      req.params.driverId,
      req.body.is_active,
      stoppedBeingActive
    );

    if (!result) {
      res.status(404).send({ error: "Driver not found" });
    }

    res.send(result);
  });

  server.get<{
    Querystring: { summary: string };
    Params: { driverId: string };
  }>(
    "/:driverId",
    {
      schema: {
        params: {
          driverId: { type: "string" },
        },
        querystring: {
          summary: { type: "string" },
        },
      },
    },
    async (req, res) => {
      const isSummaryRequest = req.query?.summary === "1";
      const driverId = req.params.driverId;

      if (!isSummaryRequest) {
        return res.callNotFound();
      }

      const [result, error] = await exec(getDriverStats(driverId));

      if (error) {
        return res.status(404).send({ error: error.message });
      }

      return result;
    }
  );

  next();
};

export { routes };
