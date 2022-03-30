import { DELIVERY_COLLECTION } from "./delivery";

export function getDriverDeliveries(req, res) {
  console.log(
    `Received request for deliveries for driver ${req.params.driverId}`
  );
  DELIVERY_COLLECTION.find(
    { driverId: req.params.driverId },
    (err, deliveries) => {
      if (err) {
        console.error(err);
      }
      res.json({ deliveries });
    }
  );
}
