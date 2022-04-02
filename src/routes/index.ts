import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { routes as deliveryRoutes } from "./delivery";
import { routes as driverRoutes } from "./driver";

export function registerEndpoints(
  instance: FastifyInstance,
  options: FastifyPluginOptions,
  next: () => void
) {
  instance.register(deliveryRoutes, { prefix: "/delivery" });
  instance.register(driverRoutes, { prefix: "/driver" });

  next();
}
