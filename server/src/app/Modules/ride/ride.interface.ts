import { Types } from "mongoose";



export interface IRideLocation {
    type: "Point";
    coordinates: [number, number];
}



export enum RideStatus {
    REQUESTED = "requested",
    ACCEPTED = "accepted",
    REJETED = "rejected",
    COMPLETED = "completed",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit"
}



export interface IRides {
    rider: Types.ObjectId;
    driver: Types.ObjectId;
    pickedupLocation: IRideLocation;
    destinationLocation: IRideLocation;
    fare: number;
    rideStatus: RideStatus;
    requestedAt: Date;
    rejectedAt: Date;
    acceptedAt: Date;
    completedAt: Date;
    pickedupAt: Date;
    inTransitAt: Date;
}