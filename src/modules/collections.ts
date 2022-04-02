import { firestore } from "firebase-admin";
import { BaseRepository } from "../modules/db";
import { Timestamp as TimestampClass } from "@google-cloud/firestore";

export type Timestamp = firestore.Timestamp;

export interface Delivery {
  id?: string;
  created_at?: Date;
  updated_at?: Date;

  driver_id: string;
  driver_platform: string;

  customer_name: string;
  business_name: string;

  order_accept_time: Date;
  pickup_time: Date;
  dropoff_time: Date;

  base_pay: number;
  driver_tip: number;
  order_subtotal: number;

  miles_traveled: number;
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

  getAllFromDateRange(
    driverId: string,
    from: Date,
    to: Date
  ): Promise<Delivery[]> {
    const fromDate = TimestampClass.fromDate(from);
    const toDate = TimestampClass.fromDate(to);

    return this.find((q) =>
      q
        .where("driver_id", "==", driverId)
        .where("created_at", ">=", fromDate)
        .where("created_at", "<=", toDate)
    );
  }
}

export interface Driver {
  id?: string;
  created_at?: Date;
  updated_at?: Date;

  first_name: string;
  last_name: string;

  is_active: boolean;
  active_hours: number;
  active_at: Date;
}

export class DriverRepository extends BaseRepository<Driver> {
  constructor() {
    super("driver", { timestampProperties: ["active_at"] });
  }
}
