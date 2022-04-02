import { Delivery, DeliveryRepository } from "./collections";

// TODO: Make an injection service to only instantiate this once
const deliveryRepository = new DeliveryRepository();

export function createDelivery(data: Delivery) {
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
