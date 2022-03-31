import { RegisterHandlerFn } from "../types";

const deliveryRoutes: RegisterHandlerFn = (server, _, next) => {
  server.get("/", async () => {
    return { ok: true };
  });

  next();
};

export { deliveryRoutes };
