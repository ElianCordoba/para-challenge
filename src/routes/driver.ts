import { RegisterHandlerFn } from "../types";

const driverRoutes: RegisterHandlerFn = (server, _, next) => {
  server.get("/:driverId/delivery", async (req, res) => {
    // ?summary=1
    return { driverId: (req as any).params.driverId, delivery: true };
  });

  server.patch("/:driverId", async (req, res) => {
    //?summary=1
    return { driverId: (req as any).params.driverId };
  });

  next();
};

export { driverRoutes };
