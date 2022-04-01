import { DeliveryRepository } from "../services/collections";
import { RegisterHandlerFn } from "../types";

const deliveryRepository = new DeliveryRepository();

const driverRoutes: RegisterHandlerFn = (server, _, next) => {
  server.get<{
    Querystring: { summary?: string };
    Params: { driverId: string };
  }>("/:driverId/delivery", async (req) => {
    const isSummaryRequest = req.query?.summary === "1";

    if (isSummaryRequest) {
      return handleGetDriverSummary();
    } else {
      return handleGetAllDelivery(req.params.driverId);
    }
  });

  server.patch("/:driverId", async (req, res) => {
    //?summary=1
    return { driverId: (req as any).params.driverId };
  });

  next();
};

async function handleGetDriverSummary() {
  return { endpoint: "summary" };
}

async function handleGetAllDelivery(driverId: string) {
  return deliveryRepository.getAllFromDriver(driverId);
}

export { driverRoutes };
