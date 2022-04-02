import { Delivery } from "../modules/collections";
import { Ok, respondWithError } from "../modules/responses";
import { exec } from "../utils";
import { createDelivery } from "../services/delivery-service";
import { RegisterHandlerFn } from "../types";

// LOOKHERE: Not particularly happy with this I tried to use a project called typebox to both create the validation and use that
// schema definition as an interface but I din't managed to make it work :S
// As mentioned in the readme this is just a simple validation, I would totally add stronger constrains, for example for
// for driver_platform I would check the value to be part of an enum, or miles_traveled to be more that 0
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
    async (req, res) => {
      const [, error] = await exec(createDelivery(req.body));

      if (error) {
        return respondWithError(res, error);
      }

      return Ok;
    }
  );

  next();
};

export { routes };
