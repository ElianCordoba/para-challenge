import {
  Delivery,
  DeliveryRepository,
  DriverRepository,
} from "../modules/collections";
import { NotFound } from "../modules/responses";

// TODO: Make an injection service to only instantiate this once
const deliveryRepository = new DeliveryRepository();
const driverRepository = new DriverRepository();

export async function createDelivery(data: Delivery) {
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
  } = data;

  const validDriverId = await driverRepository.exists(driver_id);

  if (!validDriverId) {
    // LOOKHERE: An example of throwing more information about the error that happened
    throw NotFound(`There is no driver with id ${driver_id}`, 404, {
      moreMetadataExample: "foo bar",
    });
  }

  return deliveryRepository.insert({
    driver_id,
    driver_platform,
    customer_name,
    business_name,
    order_accept_time: new Date(order_accept_time),
    pickup_time: new Date(pickup_time),
    dropoff_time: new Date(dropoff_time),
    base_pay,
    driver_tip,
    order_subtotal,
    miles_traveled,
  });
}
