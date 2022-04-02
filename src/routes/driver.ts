import {
  createDriver,
  getAllDeliveries,
  getDriverStats,
  getDriverSummary,
  updateDriverStatus,
} from "../services/driver-service";

import { exec } from "../utils";

import { RegisterHandlerFn } from "../types";

const routes: RegisterHandlerFn = (server, _, next) => {
  server.post<{ Body: { first_name: string; last_name: string } }>(
    "/",
    async function (req) {
      const { first_name, last_name } = req.body;
      await createDriver(first_name, last_name);

      return { ok: true };
    }
  );

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

  server.patch<{
    Params: { driverId: string };
    Body: { is_active: boolean; timestamp: string };
  }>("/:driverId", async (req, res) => {
    const stoppedBeingActive = req.body.timestamp
      ? new Date(req.body.timestamp)
      : new Date();

    const [, error] = await exec(
      updateDriverStatus(
        req.params.driverId,
        req.body.is_active,
        stoppedBeingActive
      )
    );

    if (error) {
      return res.status(404).send({ error: error.message });
    }

    return res.send({ ok: true });
  });

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

  next();
};

export { routes };
