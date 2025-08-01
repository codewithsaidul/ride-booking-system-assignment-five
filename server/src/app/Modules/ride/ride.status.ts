import { RideStatus } from "./ride.interface";

export const rideStatusFlow: Record<RideStatus, RideStatus[]> = {
  [RideStatus.REQUESTED]: [RideStatus.ACCEPTED, RideStatus.REJECTED],
  [RideStatus.ACCEPTED]: [RideStatus.PICKED_UP],
  [RideStatus.PICKED_UP]: [RideStatus.IN_TRANSIT],
  [RideStatus.IN_TRANSIT]: [RideStatus.COMPLETED],
  [RideStatus.COMPLETED]: [],
  [RideStatus.CANCELLED]: [],
  [RideStatus.REJECTED]: [],
};

export const ActiveRide = [
  RideStatus.ACCEPTED,
  RideStatus.PICKED_UP,
  RideStatus.IN_TRANSIT,
];
