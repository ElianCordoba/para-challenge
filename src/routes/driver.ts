import { differenceInDays, subMonths } from "date-fns";
import { DeliveryRepository, DriverRepository } from "../services/collections";
import { RegisterHandlerFn } from "../types";

const deliveryRepository = new DeliveryRepository();
const driverRepository = new DriverRepository();

const driverRoutes: RegisterHandlerFn = (server, _, next) => {
  server.get<{
    Querystring: { summary?: string };
    Params: { driverId: string };
  }>("/:driverId/delivery", async (req) => {
    const isSummaryRequest = req.query?.summary === "1";

    const driverId = req.params.driverId;

    if (isSummaryRequest) {
      return handleGetDriverSummary(driverId);
    } else {
      return handleGetAllDelivery(driverId);
    }
  });

  server.patch<{ Params: { driverId: string }; Body: { is_active: boolean } }>(
    "/:driverId",
    async (req) => {
      return driverRepository.update(req.params.driverId, {
        is_active: req.body.is_active,
      });
    }
  );

  server.get<{
    Querystring: { summary?: string };
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

      if (!isSummaryRequest) {
        return res.callNotFound();
      }

      return res.send();
    }
  );

  next();
};

async function handleGetDriverSummary(driverId: string) {
  const dateTo = new Date();
  const dateFrom = subMonths(dateTo, 2);

  const deliveries = await deliveryRepository.getAllFromDateRange(
    driverId,
    dateFrom,
    dateTo
  );

  const numberOfDaysInRange = Math.abs(differenceInDays(dateFrom, dateTo));

  let totalEarnings = 0;
  let totalMilesTraveled = 0;

  for (const { order_subtotal, miles_traveled } of deliveries) {
    totalEarnings += order_subtotal;
    totalMilesTraveled += miles_traveled;
  }

  return {
    totalDeliveries: deliveries.length,
    totalEarnings,
    totalMilesTraveled,
    earnings: {
      daily: totalEarnings / numberOfDaysInRange,
      weekly: totalEarnings / (numberOfDaysInRange / 7),
      monthly: totalEarnings / (numberOfDaysInRange / 30),
    },
  };
}

async function handleGetAllDelivery(driverId: string) {
  return deliveryRepository.getAllFromDriver(driverId);
}

export { driverRoutes };
