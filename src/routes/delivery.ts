import { Delivery } from "../services/collections";
import { createDelivery } from "../services/delivery-service";
import { RegisterHandlerFn } from "../types";

const deliveryCreationSchema = {
  type: "object",
  properties: {
    driver_id: { type: "string" },
    driver_platform: { type: "string" },

    customer_name: { type: "string" },
    business_name: { type: "string" },

    order_accept_time: { type: "number" },
    pickup_time: { type: "number" },
    dropoff_time: { type: "number" },

    base_pay: { type: "number" },
    driver_tip: { type: "number" },
    order_subtotal: { type: "number" },

    miles_traveled: { type: "number" },
  },
};

const routes: RegisterHandlerFn = (server, _, next) => {
  server.post<{ Body: Delivery }>(
    "/",
    { schema: { body: deliveryCreationSchema } },
    (req) => {
      return createDelivery(req.body);
    }
  );

  next();
};

export { routes };
