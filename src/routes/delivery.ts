import { Delivery, DeliveryRepository } from "../services/collections";
import { RegisterHandlerFn } from "../types";

// TODO: Make an injection service to only instantiate this once
const deliveryRepository = new DeliveryRepository();

const deliveryCreationSchema = {
  type: "object",
  properties: {
    driver_id: { type: "string" },
    order_accept_time: { type: "string" }, // Timestamp
    customer_name: { type: "string" },
    business_name: { type: "string" },
    base_pay: { type: "number" },
    order_subtotal: { type: "number" },
    driver_tip: { type: "number" },
    driver_platform: { type: "string" },
    pickup_time: { type: "string" }, // Timestamp
    dropoff_time: { type: "string" }, // Timestamp
  },
};

const deliveryRoutes: RegisterHandlerFn = (server, _, next) => {
  server.post<{ Body: Delivery }>(
    "/",
    { schema: { body: deliveryCreationSchema } },
    (req) => {
      // IMPROVE: Here I explicitly pick the properties to ignore additional data that may be sent in the request body
      // this could be avoided if I managed to make the `removeAdditional` option work in AJV
      const {
        driver_id,
        order_accept_time,
        customer_name,
        business_name,
        base_pay,
        order_subtotal,
        driver_tip,
        driver_platform,
        pickup_time,
        dropoff_time,
      } = req.body;

      return deliveryRepository.insert({
        driver_id,
        order_accept_time,
        customer_name,
        business_name,
        base_pay,
        order_subtotal,
        driver_tip,
        driver_platform,
        pickup_time,
        dropoff_time,
      });
    }
  );

  next();
};

export { deliveryRoutes };
