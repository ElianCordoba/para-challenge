import { firestore } from "firebase-admin";
import { BaseRepository } from "./db";

export type Timestamp = firestore.Timestamp;
type Nominal<brand = string> = string & { __brand: brand };

type DriverId = Nominal<"driver">;

export interface Delivery {
  id?: string;
  driver_id: DriverId;
  order_accept_time: Timestamp;
  customer_name: string;
  business_name: string;
  base_pay: number;
  order_subtotal: number;
  driver_tip: number;
  driver_platform: string;
  pickup_time: Timestamp;
  dropoff_time: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export class DeliveryRepository extends BaseRepository<Delivery> {
  constructor() {
    super("delivery", {
      timestampProperties: ["pickup_time", "dropoff_time", "order_accept_time"],
    });
  }

  // LOOKHERE: One of the nice things about the repository pattern is that add business logic specific methods
  // to the corresponding repository to encapsulate it and abstract it away from the API
  getAllFromDriver(driverId: string): Promise<Delivery[]> {
    return this.find((q) => q.where("driver_id", "==", driverId));
  }
}
