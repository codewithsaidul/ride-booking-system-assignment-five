import { Types } from "mongoose";



export interface IRideLocation {
    type: "Point";
    coordinates: [number, number];
}



export interface IStatusLog {
  status: RideStatus;
  timestamp: Date;
}



export enum RideStatus {
    REQUESTED = "requested",
    CANCELLED = "cancelled",
    REJECTED = "rejected",
    ACCEPTED = "accepted",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    COMPLETED = "completed",
}



export interface IRides {
    rider: Types.ObjectId;
    driver: Types.ObjectId;
    riderName: string;
    driverName: string;
    pickupCoordinates: IRideLocation;
    destinationCoordinates: IRideLocation;
    pickupAddress: string;
    destinationAddress: string;
    fare: number;
    rideStatus: RideStatus;
    requestedAt: Date;
    cancelledAt: Date
    rejectedAt: Date;
    acceptedAt: Date;
    completedAt: Date;
    pickedupAt: Date;
    inTransitAt: Date;
    statusLogs?: IStatusLog[];
    commisionRate?: number;
    platformEarnings?: number;
    paymentMethod: 'cash' | 'card'
}