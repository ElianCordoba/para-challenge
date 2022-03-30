import Datastore from "@seald-io/nedb";
export const DELIVERY_COLLECTION = new Datastore();

export async function collectDeliveryRecord(req, res) {
  console.log(
    `Received request to collect delivery for driver ${req.body.driverId}`
  );
  DELIVERY_COLLECTION.insert(req.body);
  res.status(200).end();
}
