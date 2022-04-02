import {
  differenceInDays,
  differenceInSeconds,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { exec } from "../utils";

import {
  Delivery,
  DeliveryRepository,
  Driver,
  DriverRepository,
} from "../modules/collections";
import { NotFound } from "../modules/responses";

const deliveryRepository = new DeliveryRepository();
const driverRepository = new DriverRepository();

export function createDriver(firstName: string, lastName: string) {
  return driverRepository.insert({
    first_name: firstName,
    last_name: lastName,
    active_at: new Date(),
    is_active: true,
    active_hours: 0,
  });
}

export async function getDriverSummary(driverId: string) {
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

export async function getAllDeliveries(driverId: string) {
  return deliveryRepository.getAllFromDriver(driverId);
}

export async function updateDriverStatus(
  driverId: string,
  isActive: boolean,
  stoppedBeingActive: Date
) {
  const update: Partial<Driver> = { is_active: isActive };

  // If the driver from active to inactive, we need to calculate the amount of time they were active and store that result
  // if the driver is going active we set the `active_at` property to later calculate the above mentioned
  if (!isActive) {
    const [driver, error] = await exec(driverRepository.findById(driverId));

    if (error) {
      throw NotFound(`Driver with Id ${driverId} was not found`);
    }

    const hoursDone =
      differenceInSeconds(stoppedBeingActive, driver!.active_at) / 3600;

    update["active_hours"] = driver!.active_hours + hoursDone;
  } else {
    update["active_at"] = stoppedBeingActive;
  }

  await driverRepository.update(driverId, update);
}

interface DriverStatsResult {
  daysActive: Record<string, Stats>;
  weeksActive: Record<string, Stats>;
  monthsActive: Record<string, Stats>;
}

export async function getDriverStats(
  driverId: string
): Promise<DriverStatsResult> {
  const [driver, error] = await exec(driverRepository.findById(driverId));

  if (error) {
    throw NotFound(`Driver ${driverId} was not found `, 444, { holis: true });
  }

  const deliveries = await deliveryRepository.getAllFromDriver(driverId);

  // React hooks vibes :)
  // I didn't want to iterate multiple times, thats why I did everything in one loop
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

interface Stats {
  activeHours: number;
  hourlyRate: number;
  utilizationRate: number;
}

type PartialResult = Map<
  string,
  {
    utilizationHours: number;
    earned: number;
  }
>;

function addStatsResults(activeHours: number, partialStats: PartialResult) {
  const result: Record<string, Stats> = {};

  for (const [date, information] of partialStats.entries()) {
    result[date] = {
      activeHours,
      hourlyRate: information.earned / activeHours,
      utilizationRate: (activeHours * 100) / information.utilizationHours,
    };
  }

  return result;
}

function calculateStats(dateFn: (date: Date) => Date) {
  const result: PartialResult = new Map();

  return [
    result,
    (delivery: Delivery) => {
      const key = dateFn(delivery.created_at!).toISOString();
      const item = result.get(key) || { utilizationHours: 0, earned: 0 };

      // I use the difference in seconds instead of in hours to get a more precise number, using the hours version
      // of the function wouldn't take consideration of seconds and minutes
      const utilizationHours =
        Math.abs(
          differenceInSeconds(delivery.dropoff_time, delivery.pickup_time)
        ) / 3600;

      result.set(key, {
        utilizationHours: item.utilizationHours + utilizationHours,
        earned: item.earned + delivery.order_subtotal,
      });
    },
  ] as const;
}
