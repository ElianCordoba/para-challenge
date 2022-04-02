import { Delivery, DeliveryRepository } from "../services/collections";
import { RegisterHandlerFn } from "../types";

// TODO: Make an injection service to only instantiate this once
const deliveryRepository = new DeliveryRepository();

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
      // IMPROVE: Here I explicitly pick the properties to ignore additional data that may be sent in the request body
      // this could be avoided if I managed to make the `removeAdditional` option work in AJV
      const {
        driver_id,
        driver_platform,
        customer_name,
        business_name,
        order_accept_time,
        pickup_time,
        dropoff_time,
        base_pay,
        driver_tip,
        order_subtotal,
        miles_traveled,
      } = req.body;

      return deliveryRepository.insert({
        driver_id,
        driver_platform,
        customer_name,
        business_name,
        order_accept_time,
        pickup_time,
        dropoff_time,
        base_pay,
        driver_tip,
        order_subtotal,
        miles_traveled,
      });
    }
  );

  next();
};

export { routes };
