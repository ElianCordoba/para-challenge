import {
  differenceInDays,
  differenceInSeconds,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Delivery,
  DeliveryRepository,
  Driver,
  DriverRepository,
} from "../services/collections";
import { exec } from "../utils";
import { RegisterHandlerFn } from "../types";

const deliveryRepository = new DeliveryRepository();
const driverRepository = new DriverRepository();

interface Stats {
  activeHours: number;
  hourlyRate: number;
  utilizationRate: number;
}

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

  server.patch<{
    Params: { driverId: string };
    Body: { is_active: boolean; timestamp: string };
  }>("/:driverId", async (req, res) => {
    const driverId = req.params.driverId;
    const isActive = req.body.is_active;
    const timestamp = req.body.timestamp;

    const dateTo = timestamp ? new Date(timestamp) : new Date();

    let update: Partial<Driver> = { is_active: isActive };

    // If the driver from active to inactive, we need to calculate the amount of time they were active and store that result
    // if it's the other way around we set the `active_at` property to later calculate the above mentioned
    if (!isActive) {
      const [driver, error] = await exec(driverRepository.findById(driverId));

      if (error) {
        res.status(404).send({ error: "Driver not found" });
      }

      const hoursDone = differenceInSeconds(driver!.active_at, dateTo) / 3600;

      update["active_hours"] = driver!.active_hours + hoursDone;
    } else {
      update["active_at"] = dateTo;
    }

    return driverRepository.update(req.params.driverId, update);
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

      const [driver, error] = await exec(driverRepository.findById(driverId));

      if (error) {
        return res
          .status(404)
          .send({ error: `Driver ${driverId} was not found ` });
      }

      const deliveries = await deliveryRepository.getAllFromDriver(
        req.params.driverId
      );

      const [daysActive, countDayFn] = calculateStats(startOfDay);
      const [weeksActive, countWeeksFn] = calculateStats(startOfWeek);
      const [monthsActive, countMonth] = calculateStats(startOfMonth);

      for (const delivery of deliveries) {
        countDayFn(delivery);
        countWeeksFn(delivery);
        countMonth(delivery);
      }

      const activeHours = driver?.active_hours as number;

      return {
        daysActive: addStatsResults(activeHours, daysActive),
        weeksActive: addStatsResults(activeHours, weeksActive),
        monthsActive: addStatsResults(activeHours, monthsActive),
      };
    }
  );

  next();
};

function addStatsResults(
  activeHours: number,
  partialStats: Map<string, { utilizationHours: number; earned: number }>
) {
  const result: Record<string, Stats> = {};

  for (const [date, information] of partialStats.entries()) {
    result[date] = {
      activeHours,
      hourlyRate: information.earned / activeHours,
      utilizationRate: (activeHours * 100) / activeHours,
    };
  }

  return result;
}

function calculateStats(dateFn: (date: Date) => Date) {
  const result: Map<string, { utilizationHours: number; earned: number }> =
    new Map();

  return [
    result,
    (delivery: Delivery) => {
      const key = dateFn(delivery.created_at!).toISOString();
      const item = result.get(key) || { utilizationHours: 0, earned: 0 };

      const utilizationHours =
        Math.abs(
          differenceInSeconds(delivery.pickup_time, delivery.dropoff_time)
        ) / 3600;

      result.set(key, {
        utilizationHours: item.utilizationHours + utilizationHours,
        earned: item.earned + delivery.order_subtotal,
      });
    },
  ] as const;
}

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
